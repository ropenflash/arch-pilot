"use client";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Node,
} from "@xyflow/react";
import { toPng } from "html-to-image";
import { useCallback, useMemo, useRef, useState } from "react";
import { ArchitectureNode } from "@/components/diagrams/architecture-node";
import { Button } from "@/components/ui/button";
import { layoutGraph, toReactFlowGraph } from "@/lib/architecture/graph";
import type { SystemDesign } from "@/lib/architecture/validation";
import { Download, Focus, Map as MapIcon, RotateCcw } from "lucide-react";

const nodeTypes = { architecture: ArchitectureNode };

function DiagramInner({
  design,
  onSelect,
}: {
  design: SystemDesign;
  onSelect: (id: string | null) => void;
}) {
  const graph = useMemo(() => toReactFlowGraph(design), [design]);
  const [nodes, setNodes, onNodesChange] = useNodesState(graph.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graph.edges);
  const [showMinimap, setShowMinimap] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();

  const onNodeClick = useCallback(
    (_: unknown, node: Node) => onSelect(node.id),
    [onSelect],
  );

  const resetLayout = () => {
    const next = layoutGraph(nodes, edges);
    setNodes(next.nodes);
    setEdges(next.edges);
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
    link.download = `${design.title.replace(/\s+/g, "-").toLowerCase()}-architecture.png`;
    link.click();
  };

  return (
    <div className="flex h-full min-h-[520px] flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <Button size="sm" variant="secondary" onClick={() => fitView({ padding: 0.18 })}>
          <Focus className="h-3.5 w-3.5" />
          Fit view
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setShowMinimap((v) => !v)}>
          <MapIcon className="h-3.5 w-3.5" />
          {showMinimap ? "Hide minimap" : "Show minimap"}
        </Button>
        <Button size="sm" variant="secondary" onClick={resetLayout}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset layout
        </Button>
        <Button size="sm" variant="secondary" onClick={downloadPng}>
          <Download className="h-3.5 w-3.5" />
          Download PNG
        </Button>
      </div>
      <div ref={wrapperRef} className="min-h-0 flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          onPaneClick={() => onSelect(null)}
          onInit={(instance) => instance.fitView({ padding: 0.18 })}
          fitView
          minZoom={0.2}
          maxZoom={1.6}
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
  );
}

export function ArchitectureDiagram({
  design,
  onSelect,
}: {
  design: SystemDesign;
  onSelect: (id: string | null) => void;
}) {
  const identity = `${design.title}:${design.services.map((item) => item.id).join(",")}`;
  return (
    <div className="h-[640px] overflow-hidden rounded-xl border border-border bg-zinc-950">
      <ReactFlowProvider>
        <DiagramInner key={identity} design={design} onSelect={onSelect} />
      </ReactFlowProvider>
    </div>
  );
}
