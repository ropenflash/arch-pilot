"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Plus, RotateCcw, Server, X } from "lucide-react";
import { LearnPathHeader } from "@/components/learn/learn-chrome";
import { Button } from "@/components/ui/button";
import { recordConcept, recordExercise } from "@/lib/learn/platform-progress";
import {
  assignments,
  consistentHashOwner,
  hashPosition,
  moduloShard,
  movedKeys,
  ringNodes,
} from "@/lib/learn/sharding";
import { cn } from "@/lib/utils";

const USER_IDS = Array.from({ length: 20 }, (_, index) => index + 1);
const RING_KEYS = Array.from({ length: 28 }, (_, index) => `key-${index + 1}`);
const COLORS = ["#f97316", "#0ea5e9", "#10b981", "#a855f7", "#eab308", "#ec4899"];

export function ShardingPlayground() {
  const [mode, setMode] = useState<"modulo" | "ring">("modulo");
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <LearnPathHeader stageId="grow" detail="Interactive lab" />
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Sharding and consistent hashing
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        Move keys, not definitions
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
        A shard key decides where data lives. Change the number of shards and
        watch ordinary modulo routing move almost everything. Then switch to a
        hash ring and compare.
      </p>

      <div className="mt-6 inline-flex rounded-lg border border-border bg-muted p-1">
        <button
          type="button"
          onClick={() => setMode("modulo")}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium",
            mode === "modulo" ? "bg-background shadow-sm" : "text-muted-foreground",
          )}
        >
          1. Modulo sharding
        </button>
        <button
          type="button"
          onClick={() => setMode("ring")}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium",
            mode === "ring" ? "bg-background shadow-sm" : "text-muted-foreground",
          )}
        >
          2. Consistent hash ring
        </button>
      </div>

      <div className="mt-6">{mode === "modulo" ? <ModuloLab /> : <RingLab />}</div>
    </div>
  );
}

function ModuloLab() {
  const [shardCount, setShardCount] = useState(4);
  const [comparisonCount, setComparisonCount] = useState(4);
  const [hotUser, setHotUser] = useState(7);
  const moved = USER_IDS.filter(
    (id) => moduloShard(id, comparisonCount) !== moduloShard(id, shardCount),
  );

  const buckets = Array.from({ length: shardCount }, (_, shard) => ({
    shard,
    users: USER_IDS.filter((id) => moduloShard(id, shardCount) === shard),
  }));

  function change(count: number) {
    setComparisonCount(shardCount);
    setShardCount(count);
    recordExercise("sharding-modulo");
    recordConcept("sharding");
  }

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Routing rule
            </p>
            <p className="mt-2 font-mono text-lg">shard = user_id % {shardCount}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Great when N stays fixed. Painful when N changes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={shardCount <= 2}
              onClick={() => change(shardCount - 1)}
            >
              Remove shard
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={shardCount >= 6}
              onClick={() => change(shardCount + 1)}
            >
              <Plus className="h-4 w-4" />
              Add shard
            </Button>
          </div>
        </div>

        {comparisonCount !== shardCount ? (
          <div className="mt-5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3">
            <p className="text-sm font-semibold">
              {moved.length} of {USER_IDS.length} sample users moved
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Every moved record needs copying or dual-routing during a safe reshard.
            </p>
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {buckets.map((bucket) => (
            <article key={bucket.shard} className="rounded-xl border border-border bg-muted/40 p-3">
              <p className="flex items-center justify-between text-sm font-semibold">
                Shard {bucket.shard}
                <span className="font-mono text-xs text-muted-foreground">
                  {bucket.users.length} users
                </span>
              </p>
              <div className="mt-3 flex min-h-20 flex-wrap content-start gap-1.5">
                {bucket.users.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setHotUser(id)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md border text-xs",
                      id === hotUser
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card",
                    )}
                    aria-label={`user ${id}`}
                  >
                    {id}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Even keys can still mean uneven work</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            User {hotUser} owns 50,000 requests/s; every other user owns 10.
            Hashing distributes identities, not popularity.
          </p>
          <div className="mt-4 flex items-end gap-2">
            {buckets.map((bucket) => {
              const hot = bucket.users.includes(hotUser);
              return (
                <div key={bucket.shard} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className={cn(
                      "w-full rounded-t-md",
                      hot ? "bg-red-500" : "bg-primary/35",
                    )}
                    style={{ height: hot ? 100 : 18 + bucket.users.length * 4 }}
                  />
                  <span className="text-[10px] text-muted-foreground">S{bucket.shard}</span>
                </div>
              );
            })}
          </div>
        </article>
        <article className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Questions before choosing the key</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            <li>• Do the most common reads know this key?</li>
            <li>• Will one value become much hotter or larger than the rest?</li>
            <li>• Which operations would need several shards?</li>
            <li>• How will a shard split while traffic continues?</li>
          </ul>
          <Button asChild variant="secondary" className="mt-4">
            <Link href="/learn/concepts/sharding">
              Learn the trade-offs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </article>
      </section>
    </div>
  );
}

function RingLab() {
  const [serverCount, setServerCount] = useState(3);
  const [beforeCount, setBeforeCount] = useState(3);
  const nodes = useMemo(() => ringNodes(serverCount), [serverCount]);
  const beforeNodes = useMemo(() => ringNodes(beforeCount), [beforeCount]);
  const currentAssignments = useMemo(() => assignments(RING_KEYS, nodes), [nodes]);
  const beforeAssignments = useMemo(
    () => assignments(RING_KEYS, beforeNodes),
    [beforeNodes],
  );
  const moved = movedKeys(beforeAssignments, currentAssignments);

  function change(count: number) {
    setBeforeCount(serverCount);
    setServerCount(count);
    recordExercise("consistent-hash-ring");
    recordConcept("consistent-hashing");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Ring membership
            </p>
            <h2 className="mt-1 text-xl font-semibold">{serverCount} servers</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              A key walks clockwise to the next server.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={serverCount <= 2}
              onClick={() => change(serverCount - 1)}
            >
              <X className="h-4 w-4" />
              Remove server
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={serverCount >= 6}
              onClick={() => change(serverCount + 1)}
            >
              <Plus className="h-4 w-4" />
              Add server
            </Button>
          </div>
        </div>
        <HashRing nodes={nodes} moved={new Set(moved)} />
      </section>

      <aside className="space-y-4">
        <article className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Movement
          </p>
          <p className="mt-2 text-3xl font-semibold">
            {beforeCount === serverCount ? 0 : moved.length}
            <span className="text-base font-normal text-muted-foreground">
              {" "}
              / {RING_KEYS.length} keys
            </span>
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Only keys in the new or removed server’s neighboring range move.
            Orange key dots changed owner.
          </p>
          <button
            type="button"
            onClick={() => setBeforeCount(serverCount)}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear comparison
          </button>
        </article>

        <article className="rounded-xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 text-primary" />
            What the ring does not solve
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            <li>• A single celebrity key is still hot.</li>
            <li>• Physical nodes need many virtual positions for balance.</li>
            <li>• Clients need a consistent membership view.</li>
            <li>• Replicas still need a consistency policy.</li>
          </ul>
        </article>

        <Button asChild variant="secondary" className="w-full">
          <Link href="/learn/concepts/consistent-hashing">
            Understand consistent hashing
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </aside>
    </div>
  );
}

function HashRing({
  nodes,
  moved,
}: {
  nodes: ReturnType<typeof ringNodes>;
  moved: Set<string>;
}) {
  const center = 210;
  const radius = 145;
  const point = (degrees: number, r = radius) => {
    const angle = ((degrees - 90) * Math.PI) / 180;
    return {
      x: center + Math.cos(angle) * r,
      y: center + Math.sin(angle) * r,
    };
  };

  return (
    <div className="mx-auto mt-5 max-w-[440px]">
      <svg viewBox="0 0 420 420" role="img" aria-label="Consistent hashing ring">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-border"
        />
        {RING_KEYS.map((key) => {
          const position = hashPosition(key);
          const owner = consistentHashOwner(key, nodes);
          const nodeIndex = nodes.findIndex((node) => node.id === owner?.id);
          const p = point(position, radius - 20);
          return (
            <circle
              key={key}
              cx={p.x}
              cy={p.y}
              r={moved.has(key) ? 5 : 3}
              fill={moved.has(key) ? "#f97316" : COLORS[nodeIndex] ?? "#a8a29e"}
              opacity={moved.has(key) ? 1 : 0.65}
            >
              <title>{`${key} → ${owner?.id}`}</title>
            </circle>
          );
        })}
        {nodes.map((node, index) => {
          const p = point(node.position);
          return (
            <g key={node.id}>
              <circle cx={p.x} cy={p.y} r="21" fill={COLORS[index]} />
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="700"
              >
                {node.id.replace("Server ", "")}
              </text>
            </g>
          );
        })}
        <text x={center} y={center - 8} textAnchor="middle" fontSize="15" fontWeight="700" fill="currentColor">
          Hash space
        </text>
        <text x={center} y={center + 16} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.6">
          keys choose next server →
        </text>
      </svg>
      <div className="flex flex-wrap justify-center gap-3">
        {nodes.map((node, index) => (
          <span key={node.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[index] }} />
            {node.id}
          </span>
        ))}
      </div>
    </div>
  );
}
