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
import { ArchitectureNode, NODE_ICONS } from "@/components/diagrams/architecture-node";
import { Button } from "@/components/ui/button";
import {
  hasStoredPositions,
  layoutGraph,
  toReactFlowGraph,
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
  GripVertical,
  Map as MapIcon,
  MoveHorizontal,
  MoveVertical,
  Trash2,
} from "lucide-react";

const PALETTE_MIME = "application/archpilot-node";
const nodeTypes = { architecture: ArchitectureNode };

function decorateEdges(edges: Edge[]): Edge[] {
  return edges.map((edge) => ({
    ...edge,
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 18,
      height: 18,
      color: "#71717a",
    },
    style: { stroke: "#52525b", strokeWidth: 1.6 },
    labelStyle: { fill: "#a1a1aa", fontSize: 11, fontWeight: 500 },
    labelBgStyle: { fill: "#09090b", fillOpacity: 0.92 },
    labelBgPadding: [4, 6] as [number, number],
    labelBgBorderRadius: 4,
    interactionWidth: 24,
  }));
}

function graphFromDesign(design: SystemDesign, layout: boolean) {
  const graph = toReactFlowGraph(design, { layout });
  return { nodes: graph.nodes, edges: decorateEdges(graph.edges) };
}

function DiagramInner({
  design,
  onSelect,
  onDesignChange,
  readOnly,
}: {
  design: SystemDesign;
  onSelect: (selection: CanvasSelection | null) => void;
  onDesignChange?: (design: SystemDesign) => void;
  readOnly: boolean;
}) {
  const designRef = useRef(design);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const seededLayout = useRef(false);
  const initial = useMemo(
    () => graphFromDesign(design, !hasStoredPositions(design)),
    // Mount-only; parent remounts via canvasKey after regenerate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initial.edges);
  const [showMinimap, setShowMinimap] = useState(true);
  const { fitView, getNodes, screenToFlowPosition } = useReactFlow();
  const editable = !readOnly && Boolean(onDesignChange);

  const emit = useCallback(
    (next: SystemDesign) => {
      designRef.current = next;
      onDesignChange?.(next);
      const graph = graphFromDesign(next, false);
      setNodes(graph.nodes);
      setEdges(graph.edges);
    },
    [onDesignChange, setEdges, setNodes],
  );

  useEffect(() => {
    if (design === designRef.current) return;
    designRef.current = design;
    const graph = graphFromDesign(design, !hasStoredPositions(design));
    setNodes(graph.nodes);
    setEdges(graph.edges);
  }, [design, setEdges, setNodes]);

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
      const fallback = screenToFlowPosition({
        x: (wrapperRef.current?.clientWidth ?? 480) / 2 + 40,
        y: (wrapperRef.current?.clientHeight ?? 360) / 2,
      });
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
      setEdges(decorateEdges(next.edges));
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
      backgroundColor: "#09090b",
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
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <Button size="sm" variant="secondary" onClick={() => fitView({ padding: 0.18 })}>
          <Focus className="h-3.5 w-3.5" />
          Fit
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
          PNG
        </Button>
        <p className="ml-auto hidden text-[11px] text-zinc-500 sm:block">
          {editable
            ? "Drag from the palette. Connect handles. Click a node to edit."
            : "Read-only diagram. Pan, zoom, and export."}
        </p>
      </div>
      <div className="flex min-h-0 flex-1">
        {editable ? (
          <aside className="flex w-[132px] shrink-0 flex-col gap-1 overflow-y-auto border-r border-border p-2">
            <p className="px-1 pb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Add
            </p>
            {COMPONENT_PALETTE.map((item) => {
              const Icon = NODE_ICONS[item.type];
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
                  className="flex items-center gap-1.5 rounded-md border border-transparent px-1.5 py-1 text-left text-[11px] text-zinc-300 hover:border-border hover:bg-zinc-900"
                >
                  <GripVertical className="h-3 w-3 shrink-0 text-zinc-600" />
                  <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                  <span className="truncate">{item.label}</span>
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
            onInit={(instance) => instance.fitView({ padding: 0.18 })}
            nodesDraggable={editable}
            nodesConnectable={editable}
            edgesReconnectable={false}
            elementsSelectable
            deleteKeyCode={editable ? ["Backspace", "Delete"] : null}
            connectionMode={ConnectionMode.Loose}
            defaultEdgeOptions={{
              type: "smoothstep",
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: "#71717a",
                width: 18,
                height: 18,
              },
            }}
            fitView
            minZoom={0.2}
            maxZoom={1.8}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={22} color="#1f1f23" />
            <Controls />
            {showMinimap ? (
              <MiniMap
                pannable
                zoomable
                maskColor="rgba(9,9,11,0.7)"
                nodeColor="#3f3f46"
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
}: {
  design: SystemDesign;
  onSelect: (selection: CanvasSelection | null) => void;
  onDesignChange?: (design: SystemDesign) => void;
  readOnly?: boolean;
  canvasKey?: string | number;
}) {
  return (
    <div
      className={cn(
        "h-[min(720px,calc(100vh-220px))] min-h-[560px] overflow-hidden rounded-xl border border-border bg-zinc-950",
      )}
    >
      <ReactFlowProvider>
        <DiagramInner
          key={canvasKey ?? "canvas"}
          design={design}
          onSelect={onSelect}
          onDesignChange={onDesignChange}
          readOnly={readOnly}
        />
      </ReactFlowProvider>
    </div>
  );
}
