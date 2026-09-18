"use client";

import { useMemo, useState } from "react";
import { Check, Plus, Server, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordExercise } from "@/lib/learn/platform-progress";
import { cn } from "@/lib/utils";

const PATH_STEPS = [
  { id: "edge", label: "Client → edge", ms: 35, note: "Public network and TLS" },
  { id: "app", label: "Application work", ms: 2, note: "Validation and compute" },
  { id: "cache", label: "Cache lookup", ms: 0.3, note: "Same-region memory service" },
  { id: "database", label: "Database query", ms: 8, note: "Indexed query in-region" },
  { id: "disk", label: "Cold disk work", ms: 20, note: "Large or random storage read" },
  { id: "vendor", label: "External API", ms: 90, note: "Another provider over WAN" },
];

export function LatencyPathLab() {
  const [selected, setSelected] = useState(["edge", "app", "cache", "database"]);
  const total = useMemo(
    () =>
      PATH_STEPS.filter((item) => selected.includes(item.id)).reduce(
        (sum, item) => sum + item.ms,
        0,
      ),
    [selected],
  );

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
    recordExercise("latency-path");
  }

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        Latency playground
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Build a sequential request path</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Toggle work on the path. Sequential waits add; the slowest hop often dominates.
          </p>
        </div>
        <p className="font-mono text-3xl font-semibold">
          {total.toFixed(total < 10 ? 1 : 0)} ms
        </p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {PATH_STEPS.map((item) => {
          const active = selected.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className={cn(
                "rounded-xl border px-3 py-2 text-left",
                active
                  ? "border-primary/50 bg-primary/10"
                  : "border-border bg-muted/40 text-muted-foreground",
              )}
            >
              <span className="block text-xs font-semibold">{item.label}</span>
              <span className="mt-0.5 block font-mono text-[11px]">
                {item.ms} ms · {item.note}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-5 overflow-x-auto">
        <div className="flex min-w-max items-center gap-1">
          {PATH_STEPS.filter((item) => selected.includes(item.id)).map((item, index) => (
            <div key={item.id} className="contents">
              <div className="rounded-lg border border-border bg-background px-3 py-2">
                <p className="text-xs font-medium">{item.label}</p>
                <div
                  className="mt-1.5 h-1.5 rounded-full bg-primary"
                  style={{ width: `${Math.max(12, Math.min(120, item.ms * 2))}px` }}
                />
              </div>
              {index <
              PATH_STEPS.filter((step) => selected.includes(step.id)).length - 1 ? (
                <span className="text-primary">→</span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-5 rounded-xl bg-muted px-4 py-3 text-sm leading-6 text-muted-foreground">
        {total > 150
          ? "This path is visibly slow. Remove a sequential dependency, move work asynchronous, or bring data closer."
          : total > 60
            ? "Acceptable for many actions, but tight for autocomplete or chat typing. Investigate the WAN and external calls first."
            : "A healthy interactive budget. Do not add cache complexity unless repeated database work is actually the pressure."}
      </p>
    </section>
  );
}

export function AvailabilityReliabilityLab() {
  const [failed, setFailed] = useState<string[]>([]);
  const servers = ["App A", "App B"];
  const databaseFailed = failed.includes("Database");
  const healthyApps = servers.filter((server) => !failed.includes(server));
  const available = healthyApps.length > 0 && !databaseFailed;

  function toggle(name: string) {
    setFailed((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
    recordExercise("availability-failure");
  }

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        Failure playground
      </p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Remove a component</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Redundancy only helps if health checks stop sending traffic to failed nodes.
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium",
            available
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
          )}
        >
          {available ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {available ? "Request can complete" : "Request path is down"}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <ReliabilityNode name="Load balancer" failed={false} onClick={() => {}} fixed />
        <span className="text-primary">→</span>
        <div className="space-y-2">
          {servers.map((server) => (
            <ReliabilityNode
              key={server}
              name={server}
              failed={failed.includes(server)}
              onClick={() => toggle(server)}
            />
          ))}
        </div>
        <span className="text-primary">→</span>
        <ReliabilityNode
          name="Database"
          failed={databaseFailed}
          onClick={() => toggle("Database")}
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <ReliabilityNote
          title="Redundancy"
          body="Two app instances remove one compute single point of failure."
        />
        <ReliabilityNote
          title="Health checks"
          body="The balancer needs a trustworthy signal before routing around a failure."
        />
        <ReliabilityNote
          title="Remaining SPOF"
          body="The database still stops the whole path. Add a tested failover design, not just a copy."
        />
      </div>
      {failed.length ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="mt-4"
          onClick={() => setFailed([])}
        >
          <Plus className="h-4 w-4" />
          Restore all
        </Button>
      ) : null}
    </section>
  );
}

function ReliabilityNode({
  name,
  failed,
  onClick,
  fixed = false,
}: {
  name: string;
  failed: boolean;
  onClick: () => void;
  fixed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={fixed}
      className={cn(
        "min-w-36 rounded-xl border px-4 py-3 text-sm font-medium",
        failed
          ? "border-red-500/40 bg-red-500/10 text-red-700 line-through dark:text-red-300"
          : "border-border bg-background",
        !fixed && "hover:border-primary/50",
      )}
    >
      <Server className="mx-auto mb-1.5 h-4 w-4" />
      {name}
      {!fixed ? (
        <span className="mt-1 block text-[10px] font-normal text-muted-foreground">
          click to fail
        </span>
      ) : null}
    </button>
  );
}

function ReliabilityNote({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-xl border border-border bg-muted/40 p-3">
      <h3 className="text-xs font-semibold">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p>
    </article>
  );
}
