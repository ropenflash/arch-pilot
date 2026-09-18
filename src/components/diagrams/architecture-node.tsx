"use client";

import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
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

export function ArchitectureNode({ data, selected }: NodeProps<ArchNode>) {
  const Icon = NODE_ICONS[data.nodeType] ?? Server;
  const subtitle = data.technology || data.nodeType.replaceAll("_", " ");
  return (
    <div
      className={cn(
        "arch-node w-[248px] rounded-xl px-3.5 py-3",
        `arch-node-${data.nodeType}`,
        selected && "arch-node-selected",
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
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background/60">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-5">
            {data.label}
          </p>
          <p className="mt-0.5 truncate text-xs capitalize leading-4 opacity-80">
            {subtitle}
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
