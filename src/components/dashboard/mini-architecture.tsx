"use client";

import { useState } from "react";
import {
  Database,
  Globe,
  Network,
  Server,
  Spline,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NODES = [
  {
    id: "user",
    label: "User",
    icon: Globe,
    purpose: "Starts the request",
    question: "Which clients and geographies matter?",
  },
  {
    id: "dns",
    label: "DNS",
    icon: Network,
    purpose: "Finds the entry point",
    question: "How quickly must traffic move after a regional failure?",
  },
  {
    id: "load-balancer",
    label: "Load balancer",
    icon: Spline,
    purpose: "Chooses healthy compute",
    question: "Are application instances stateless?",
  },
  {
    id: "app",
    label: "App servers",
    icon: Server,
    purpose: "Run trusted product logic",
    question: "What is the compute bottleneck at peak?",
  },
  {
    id: "cache",
    label: "Cache?",
    icon: Zap,
    purpose: "Reuses hot reads",
    question: "Is data repeated, and may it be stale?",
  },
  {
    id: "database",
    label: "Database",
    icon: Database,
    purpose: "Keeps durable truth",
    question: "Which consistency and query guarantees matter?",
  },
] as const;

export function MiniArchitecture() {
  const [active, setActive] = useState("cache");
  const selected = NODES.find((node) => node.id === active) ?? NODES[0];
  return (
    <div className="mx-auto mt-14 max-w-5xl text-left">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
          <p className="font-mono text-xs text-muted-foreground">
            FROM REQUIREMENTS → ARCHITECTURE → TRADE-OFFS
          </p>
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>
        <div className="grid lg:grid-cols-[1fr_270px]">
          <div className="overflow-x-auto p-5 sm:p-8">
            <div className="flex min-w-[760px] items-center gap-2">
              {NODES.map((node, index) => (
                <div key={node.id} className="contents">
                  <button
                    type="button"
                    onClick={() => setActive(node.id)}
                    className={cn(
                      "min-w-28 rounded-lg border px-3 py-4 text-center transition-colors",
                      active === node.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:border-primary/40",
                    )}
                  >
                    <node.icon className="mx-auto h-5 w-5 text-primary" />
                    <span className="mt-2 block text-xs font-semibold">{node.label}</span>
                  </button>
                  {index < NODES.length - 1 ? (
                    <span className="font-mono text-sm text-primary">→</span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          <aside className="border-t border-border bg-muted/40 p-5 lg:border-l lg:border-t-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              Why this box?
            </p>
            <h2 className="mt-2 text-sm font-semibold">{selected?.label}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {selected?.purpose}
            </p>
            <p className="mt-4 text-xs font-semibold">Question to ask</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {selected?.question}
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
