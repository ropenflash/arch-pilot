"use client";

import {
  Cloud,
  Database,
  Globe,
  HardDrive,
  KeyRound,
  Layers,
  Monitor,
  Search,
  Server,
  Shield,
  Spline,
  Zap,
} from "lucide-react";
import type { ComponentType } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { ArchitectureNodeData } from "@/lib/architecture/graph";
import type { ArchitectureNodeType } from "@/lib/architecture/validation";
import { cn } from "@/lib/utils";

type ArchNode = Node<ArchitectureNodeData, "architecture">;

export const NODE_ICONS: Record<
  ArchitectureNodeType,
  ComponentType<{ className?: string }>
> = {
  client: Monitor,
  cdn: Globe,
  load_balancer: Spline,
  gateway: Shield,
  auth: KeyRound,
  service: Server,
  database: Database,
  cache: Zap,
  queue: Layers,
  storage: HardDrive,
  search: Search,
  external: Cloud,
  other: Server,
};

const TONES: Record<string, string> = {
  client: "border-zinc-500 bg-zinc-950",
  cdn: "border-sky-700/80 bg-sky-950/30",
  load_balancer: "border-indigo-700/80 bg-indigo-950/20",
  gateway: "border-violet-700/80 bg-violet-950/20",
  auth: "border-amber-700/80 bg-amber-950/20",
  service: "border-zinc-500 bg-zinc-900/80",
  database: "border-emerald-700/80 bg-emerald-950/25",
  cache: "border-orange-700/80 bg-orange-950/25",
  queue: "border-fuchsia-800/80 bg-fuchsia-950/20",
  storage: "border-teal-800/80 bg-teal-950/20",
  search: "border-cyan-800/80 bg-cyan-950/20",
  external: "border-slate-500 bg-slate-950/40",
  other: "border-zinc-600 bg-zinc-950",
};

export function ArchitectureNode({ data, selected }: NodeProps<ArchNode>) {
  const Icon = NODE_ICONS[data.nodeType] ?? Server;
  return (
    <div
      className={cn(
        "w-[220px] rounded-lg border px-3 py-2.5 shadow-sm",
        TONES[data.nodeType],
        selected && "ring-2 ring-zinc-100/80",
      )}
    >
      <Handle
        type="target"
        id="top"
        position={Position.Top}
        className="architecture-handle"
      />
      <Handle
        type="target"
        id="left"
        position={Position.Left}
        className="architecture-handle"
      />
      <div className="flex items-start gap-2">
        <span className="mt-0.5 rounded-md border border-white/10 bg-black/30 p-1 text-zinc-200">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-100">{data.label}</p>
          <p className="truncate text-[11px] capitalize text-zinc-500">
            {data.technology || data.nodeType.replaceAll("_", " ")}
          </p>
        </div>
      </div>
      <Handle
        type="source"
        id="bottom"
        position={Position.Bottom}
        className="architecture-handle"
      />
      <Handle
        type="source"
        id="right"
        position={Position.Right}
        className="architecture-handle"
      />
    </div>
  );
}
