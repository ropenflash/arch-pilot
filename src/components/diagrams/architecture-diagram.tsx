"use client";

import {
  Background,
  ConnectionMode,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import { toPng } from "html-to-image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { ArchitectureNode, NODE_ICONS } from "@/components/diagrams/architecture-node";
import { Button } from "@/components/ui/button";
import {
  hasStoredPositions,
  layoutGraph,
  toReactFlowGraph,
  collectComponents,
  type ArchitectureFlowNode,
} from "@/lib/architecture/graph";
import {
  COMPONENT_PALETTE,
  addComponent,
  applyNodePositions,
  connectComponents,
  disconnectComponents,
  layoutDesign,
  removeComponent,
} from "@/lib/architecture/mutations";
import type { ArchitectureNodeType, SystemDesign } from "@/lib/architecture/validation";
import type { CanvasSelection } from "@/components/architecture/canvas-selection";
import { cn } from "@/lib/utils";
import {
  Download,
  Focus,
  Map as MapIcon,
  MoveHorizontal,
  MoveVertical,
  Trash2,
} from "lucide-react";

const PALETTE_MIME = "application/archpilot-node";
const nodeTypes = { architecture: ArchitectureNode };

function canvasColors(isDark: boolean) {
  return {
    stroke: isDark ? "#a8a29e" : "#78716c",
    label: isDark ? "#fafafa" : "#1c1917",
    labelBg: isDark ? "#121214" : "#ffffff",
    png: isDark ? "#121214" : "#fafaf9",
    dots: isDark ? "#3f3f46" : "#d6d3d1",
  };
}

function decorateEdges(edges: Edge[], isDark: boolean): Edge[] {
  const colors = canvasColors(isDark);
  return edges.map((edge) => ({
    ...edge,
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: colors.stroke,
    },
    style: { stroke: colors.stroke, strokeWidth: 2 },
    labelStyle: { fill: colors.label, fontSize: 12, fontWeight: 600 },
    labelBgStyle: { fill: colors.labelBg, fillOpacity: 0.95 },
    labelBgPadding: [4, 6] as [number, number],
    labelBgBorderRadius: 4,
    interactionWidth: 24,
  }));
}

function graphFromDesign(design: SystemDesign, layout: boolean, isDark: boolean) {
  const graph = toReactFlowGraph(design, { layout });
  return { nodes: graph.nodes, edges: decorateEdges(graph.edges, isDark) };
}

function DiagramInner({
  design,
  onSelect,
  onDesignChange,
  readOnly,
  highlightTypes = [],
}: {
  design: SystemDesign;
  onSelect: (selection: CanvasSelection | null) => void;
  onDesignChange?: (design: SystemDesign) => void;
  readOnly: boolean;
  highlightTypes?: ArchitectureNodeType[];
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const designRef = useRef(design);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const seededLayout = useRef(false);
  const initial = useMemo(
    () => graphFromDesign(design, !hasStoredPositions(design), isDark),
    // Mount-only; parent remounts via canvasKey after regenerate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [showMinimap, setShowMinimap] = useState(false);
  const { fitView, getNodes, screenToFlowPosition } = useReactFlow();
  const editable = !readOnly && Boolean(onDesignChange);

  const emit = useCallback(
    (next: SystemDesign) => {
      designRef.current = next;
      onDesignChange?.(next);
      const graph = graphFromDesign(next, false, isDark);
      setNodes(graph.nodes);
      setEdges(graph.edges);
    },
    [isDark, onDesignChange, setEdges, setNodes],
  );

  useEffect(() => {
    if (design === designRef.current) {
      setEdges((current) => decorateEdges(current, isDark));
      return;
    }
    designRef.current = design;
    const graph = graphFromDesign(design, !hasStoredPositions(design), isDark);
    setNodes(graph.nodes);
    setEdges(graph.edges);
  }, [design, isDark, setEdges, setNodes]);

  useEffect(() => {
    if (!editable || seededLayout.current) return;
    if (hasStoredPositions(designRef.current)) {
      seededLayout.current = true;
      return;
    }
    seededLayout.current = true;
    const graph = toReactFlowGraph(designRef.current, { layout: true });
    const positions = Object.fromEntries(
      graph.nodes.map((node) => [node.id, node.position]),
    );
    emit(applyNodePositions(designRef.current, positions));
  }, [editable, emit]);

  const persistPositions = useCallback(() => {
    if (!editable) return;
    const positions = Object.fromEntries(
      getNodes().map((node) => [node.id, node.position]),
    );
    emit(applyNodePositions(designRef.current, positions));
  }, [editable, emit, getNodes]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!editable || !connection.source || !connection.target) return;
      setEdges((current) => addEdge(connection, current));
      emit(
        connectComponents(designRef.current, connection.source, connection.target, undefined, {
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
        }),
      );
    },
    [editable, emit, setEdges],
  );

  const onNodesDelete = useCallback(
    (deleted: ArchitectureFlowNode[]) => {
      if (!editable) return;
      let next = designRef.current;
      const restored: ArchitectureFlowNode[] = [];
      for (const node of deleted) {
        const result = removeComponent(next, node.id);
        if (result.ok) {
          next = result.design;
        } else {
          toast.error(result.error);
          restored.push(node);
        }
      }
      if (restored.length) {
        setNodes((current) => [...current, ...restored]);
      }
      if (next !== designRef.current) emit(next);
    },
    [editable, emit, setNodes],
  );

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      if (!editable) return;
      let next = designRef.current;
      for (const edge of deleted) {
        next = disconnectComponents(next, edge.source, edge.target);
      }
      emit(next);
    },
    [editable, emit],
  );

  const onBeforeDelete = useCallback(
    async ({ nodes: deleting }: { nodes: Node[] }) => {
      if (!editable) return false;
      const current = designRef.current;
      if (
        deleting.some(
          (node) =>
            current.services.length === 1 && current.services[0]?.id === node.id,
        )
      ) {
        toast.error("Keep at least one service on the canvas.");
        return false;
      }
      return true;
    },
    [editable],
  );

  const addAt = useCallback(
    (type: ArchitectureNodeType, position?: { x: number; y: number }) => {
      if (!editable) return;
      const count = collectComponents(designRef.current).length;
      const origin = screenToFlowPosition({ x: 200, y: 96 });
      const fallback = {
        x: origin.x + (count % 3) * 250,
        y: origin.y + Math.floor(count / 3) * 140,
      };
      emit(addComponent(designRef.current, type, position ?? fallback));
    },
    [editable, emit, screenToFlowPosition],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!editable) return;
      const type = event.dataTransfer.getData(PALETTE_MIME) as ArchitectureNodeType;
      if (!type) return;
      addAt(type, screenToFlowPosition({ x: event.clientX, y: event.clientY }));
    },
    [addAt, editable, screenToFlowPosition],
  );

  const applyLayout = (direction: "TB" | "LR") => {
    if (!editable) {
      const next = layoutGraph(nodes, edges, direction);
      setNodes(next.nodes);
      setEdges(decorateEdges(next.edges, isDark));
      window.setTimeout(() => fitView({ padding: 0.18 }), 20);
      return;
    }
    emit(layoutDesign(designRef.current, direction));
    window.setTimeout(() => fitView({ padding: 0.18 }), 20);
  };

  const downloadPng = async () => {
    const viewport = wrapperRef.current?.querySelector(
      ".react-flow__viewport",
    ) as HTMLElement | null;
    if (!viewport) return;
    const dataUrl = await toPng(viewport, {
      backgroundColor: canvasColors(isDark).png,
      pixelRatio: 2,
    });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${designRef.current.title.replace(/\s+/g, "-").toLowerCase()}-architecture.png`;
    link.click();
  };

  const deleteSelected = () => {
    if (!editable) return;
    const selectedNodes = nodes.filter((node) => node.selected);
    const selectedEdges = edges.filter((edge) => edge.selected);
    if (selectedNodes.length) onNodesDelete(selectedNodes);
    if (selectedEdges.length) onEdgesDelete(selectedEdges);
  };

  return (
    <div className="flex h-full min-h-[560px] flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/60 px-3 py-2.5">
        <Button size="sm" variant="secondary" onClick={() => fitView({ padding: 0.18 })}>
          <Focus className="h-3.5 w-3.5" />
          Fit view
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setShowMinimap((value) => !value)}
        >
          <MapIcon className="h-3.5 w-3.5" />
          {showMinimap ? "Hide map" : "Show map"}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => applyLayout("TB")}>
          <MoveVertical className="h-3.5 w-3.5" />
          Stack
        </Button>
        <Button size="sm" variant="secondary" onClick={() => applyLayout("LR")}>
          <MoveHorizontal className="h-3.5 w-3.5" />
          Row
        </Button>
        {editable ? (
          <Button size="sm" variant="secondary" onClick={deleteSelected}>
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        ) : null}
        <Button size="sm" variant="secondary" onClick={downloadPng}>
          <Download className="h-3.5 w-3.5" />
          Export PNG
        </Button>
        <p className="ml-auto hidden max-w-sm text-[13px] leading-5 text-muted-foreground lg:block">
          {editable
            ? "Add from the left. Drag to place. Connect the dots. Click a box to edit."
            : "Read-only diagram. Pan, zoom, and export."}
        </p>
      </div>
      <div className="flex min-h-0 flex-1">
        {editable ? (
          <aside className="flex w-[176px] shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-border bg-muted/40 p-2">
            <p className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Add component
            </p>
            {COMPONENT_PALETTE.map((item) => {
              const Icon = NODE_ICONS[item.type];
              const highlighted = highlightTypes.includes(item.type);
              return (
                <button
                  key={item.type}
                  type="button"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData(PALETTE_MIME, item.type);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onClick={() => addAt(item.type)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] font-medium hover:bg-accent",
                    highlighted
                      ? "bg-primary/10 text-foreground ring-1 ring-primary/40"
                      : "text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </aside>
        ) : null}
        <div ref={wrapperRef} className="min-h-0 min-w-0 flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
            onBeforeDelete={onBeforeDelete}
            onNodeDragStop={persistPositions}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => onSelect({ kind: "node", id: node.id })}
            onEdgeClick={(_, edge) =>
              onSelect({ kind: "edge", from: edge.source, to: edge.target })
            }
            onPaneClick={() => onSelect(null)}
            onInit={(instance) => instance.fitView({ padding: 0.2 })}
            nodesDraggable={editable}
            nodesConnectable={editable}
            edgesReconnectable={false}
            elementsSelectable
            deleteKeyCode={editable ? ["Backspace", "Delete"] : null}
            connectionMode={ConnectionMode.Loose}
            colorMode={isDark ? "dark" : "light"}
            defaultEdgeOptions={{
              type: "smoothstep",
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: canvasColors(isDark).stroke,
                width: 18,
                height: 18,
              },
            }}
            fitView
            minZoom={0.2}
            maxZoom={1.8}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={24} color={canvasColors(isDark).dots} />
            <Controls showInteractive={false} />
            {showMinimap ? (
              <MiniMap
                pannable
                zoomable
                maskColor={isDark ? "rgba(18,18,22,0.75)" : "rgba(250,250,249,0.75)"}
                nodeColor={isDark ? "#71717a" : "#d6d3d1"}
              />
            ) : null}
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export function ArchitectureDiagram({
  design,
  onSelect,
  onDesignChange,
  readOnly = false,
  canvasKey,
  highlightTypes,
  compact = false,
}: {
  design: SystemDesign;
  onSelect: (selection: CanvasSelection | null) => void;
  onDesignChange?: (design: SystemDesign) => void;
  readOnly?: boolean;
  canvasKey?: string | number;
  highlightTypes?: ArchitectureNodeType[];
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-background",
        compact
          ? "h-[min(720px,calc(100vh-140px))] min-h-[520px]"
          : "h-[min(760px,calc(100vh-200px))] min-h-[580px]",
      )}
    >
      <ReactFlowProvider>
        <DiagramInner
          key={canvasKey ?? "canvas"}
          design={design}
          onSelect={onSelect}
          onDesignChange={onDesignChange}
          readOnly={readOnly}
          highlightTypes={highlightTypes}
        />
      </ReactFlowProvider>
    </div>
  );
}
