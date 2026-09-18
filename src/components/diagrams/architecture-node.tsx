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
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { ArchitectureNodeData } from "@/lib/architecture/graph";
import { cn } from "@/lib/utils";

type ArchNode = Node<ArchitectureNodeData, "architecture">;

const ICONS = {
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
  client: "border-zinc-600",
  cdn: "border-sky-700/70",
  load_balancer: "border-indigo-700/70",
  gateway: "border-violet-700/70",
  auth: "border-amber-700/70",
  service: "border-zinc-500",
  database: "border-emerald-700/70",
  cache: "border-orange-700/70",
  queue: "border-fuchsia-800/70",
  storage: "border-teal-800/70",
  search: "border-cyan-800/70",
  external: "border-slate-600",
  other: "border-zinc-600",
};

export function ArchitectureNode({
  data,
  selected,
}: NodeProps<ArchNode>) {
  const Icon = ICONS[data.nodeType] ?? Server;
  return (
    <div
      className={cn(
        "w-[220px] rounded-lg border bg-zinc-950 px-3 py-2.5 shadow-none",
        TONES[data.nodeType],
        selected && "ring-1 ring-zinc-200",
      )}
    >
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !bg-zinc-500" />
      <div className="flex items-start gap-2">
        <span className="mt-0.5 rounded-md border border-border p-1 text-zinc-300">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-100">{data.label}</p>
          <p className="truncate text-[11px] text-zinc-500">
            {data.technology || data.nodeType.replaceAll("_", " ")}
          </p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !bg-zinc-500" />
    </div>
  );
}
