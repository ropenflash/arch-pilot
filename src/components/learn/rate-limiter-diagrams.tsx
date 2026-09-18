"use client";

import { useState } from "react";
import { ArrowDown, ArrowRight, Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RateLimiterDiagram } from "@/lib/learn/rate-limiter-course";
import { cn } from "@/lib/utils";

export function RateLimiterLessonDiagram({
  kind,
}: {
  kind: RateLimiterDiagram;
}) {
  if (kind === "contract") return <ContractDiagram />;
  if (kind === "placement") return <PlacementDiagram />;
  if (kind === "algorithms") return <AlgorithmLab />;
  if (kind === "single-node") return <SingleNodeDiagram />;
  if (kind === "distributed") return <DistributedDiagram />;
  return <OperationsDiagram />;
}

function Frame({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-card">
      <figcaption className="border-b border-border px-5 py-4">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{caption}</p>
      </figcaption>
      <div className="p-5 sm:p-6">{children}</div>
    </figure>
  );
}

function Box({
  title,
  detail,
  tone = "plain",
}: {
  title: string;
  detail?: string;
  tone?: "plain" | "primary" | "data" | "danger";
}) {
  return (
    <div
      className={cn(
        "min-w-28 rounded-xl border px-3 py-3 text-center shadow-sm",
        tone === "plain" && "border-border bg-background",
        tone === "primary" && "border-primary/50 bg-primary/10",
        tone === "data" && "border-sky-500/35 bg-sky-500/10",
        tone === "danger" && "border-red-500/35 bg-red-500/10",
      )}
    >
      <p className="text-sm font-semibold">{title}</p>
      {detail ? <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{detail}</p> : null}
    </div>
  );
}

function FlowArrow({ label }: { label?: string }) {
  return (
    <div className="flex min-w-12 flex-col items-center text-primary">
      {label ? <span className="mb-1 text-[10px] text-muted-foreground">{label}</span> : null}
      <ArrowRight className="h-5 w-5" />
    </div>
  );
}

function ContractDiagram() {
  return (
    <Frame
      title="A rate-limit rule is a four-part sentence"
      caption="If any part is missing, two engineers can build different behavior and both think they are correct."
    >
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          ["Action", "login attempt"],
          ["Identity", "per account"],
          ["Allowance", "20 requests"],
          ["Time behavior", "every 10 min"],
        ].map(([title, detail], index) => (
          <div key={title} className="relative">
            <Box title={title} detail={detail} tone={index === 3 ? "primary" : "plain"} />
            {index < 3 ? (
              <span className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 text-primary sm:block">
                +
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Check className="h-4 w-4 text-emerald-600" />
            Under quota
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Forward the request and report remaining capacity.</p>
        </div>
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <X className="h-4 w-4 text-red-600" />
            Over quota
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Return 429 with a safe time to retry.</p>
        </div>
      </div>
    </Frame>
  );
}

function PlacementDiagram() {
  const [placement, setPlacement] = useState<"client" | "api" | "gateway">("gateway");
  const notes = {
    client: {
      verdict: "Helpful, but not enforcement",
      body: "A local throttle improves UX. A modified or outdated client can skip it.",
    },
    api: {
      verdict: "Trusted and application-aware",
      body: "Each service can use rich business context, but logic may be repeated across the fleet.",
    },
    gateway: {
      verdict: "Strong shared doorway",
      body: "Rejects early and centralizes common rules. Deeper business rules may still live in the API.",
    },
  };

  return (
    <Frame
      title="Explore three placements"
      caption="Click a location. The orange box is the authoritative decision point."
    >
      <div className="flex flex-wrap gap-2">
        {(["client", "api", "gateway"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setPlacement(item)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium capitalize",
              placement === item
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary/40",
            )}
          >
            {item === "api" ? "Inside API" : item}
          </button>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-center overflow-x-auto py-4">
        <Box title="Client" detail={placement === "client" ? "limiter here" : "untrusted"} tone={placement === "client" ? "primary" : "plain"} />
        <FlowArrow label="HTTPS" />
        <Box title="Gateway" detail={placement === "gateway" ? "limiter here" : "routing"} tone={placement === "gateway" ? "primary" : "plain"} />
        <FlowArrow label="allowed" />
        <Box title="API service" detail={placement === "api" ? "limiter here" : "protected work"} tone={placement === "api" ? "primary" : "plain"} />
      </div>
      <div className="rounded-xl bg-muted p-4">
        <p className="text-sm font-semibold">{notes[placement].verdict}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{notes[placement].body}</p>
      </div>
    </Frame>
  );
}

const ALGORITHMS = [
  {
    name: "Token bucket",
    burst: "Bounded burst",
    memory: "Very low",
    accuracy: "Exact token state",
    best: "Public APIs with useful short bursts",
  },
  {
    name: "Leaky bucket",
    burst: "Smoothed into queue",
    memory: "Queue-sized",
    accuracy: "Fixed outflow",
    best: "Downstream work needs a steady pace",
  },
  {
    name: "Fixed window",
    burst: "Boundary spike",
    memory: "Very low",
    accuracy: "Coarse boundary",
    best: "Simple reset-style quotas",
  },
  {
    name: "Sliding log",
    burst: "Strict rolling cap",
    memory: "High",
    accuracy: "Exact rolling window",
    best: "Low-volume, strict rules",
  },
  {
    name: "Sliding counter",
    burst: "Smoothed estimate",
    memory: "Low",
    accuracy: "Approximate",
    best: "High-volume rolling limits",
  },
];

function AlgorithmLab() {
  return (
    <div className="space-y-5">
      <TokenBucketLab />
      <Frame
        title="Choose by behavior"
        caption="There is no universal winner. Match the algorithm to the traffic shape and product promise."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Algorithm</th>
                <th className="pb-3 pr-4 font-medium">Burst behavior</th>
                <th className="pb-3 pr-4 font-medium">Memory</th>
                <th className="pb-3 pr-4 font-medium">Accuracy</th>
                <th className="pb-3 font-medium">Good fit</th>
              </tr>
            </thead>
            <tbody>
              {ALGORITHMS.map((item) => (
                <tr key={item.name} className="border-b border-border/70 last:border-0">
                  <td className="py-3 pr-4 font-semibold">{item.name}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{item.burst}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{item.memory}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{item.accuracy}</td>
                  <td className="py-3 text-muted-foreground">{item.best}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Frame>
    </div>
  );
}

function TokenBucketLab() {
  const capacity = 5;
  const [tokens, setTokens] = useState(3);
  const [last, setLast] = useState<"idle" | "allowed" | "rejected">("idle");

  function request() {
    if (tokens > 0) {
      setTokens((value) => value - 1);
      setLast("allowed");
    } else {
      setLast("rejected");
    }
  }

  function refill() {
    setTokens((value) => Math.min(capacity, value + 1));
    setLast("idle");
  }

  return (
    <Frame
      title="Try a token bucket"
      caption="Capacity = 5. A request spends one token; refill adds one without overflowing the bucket."
    >
      <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Available tokens
          </p>
          <div className="mt-3 flex min-h-12 flex-wrap gap-2">
            {Array.from({ length: capacity }, (_, index) => (
              <span
                key={index}
                className={cn(
                  "h-9 w-9 rounded-full border transition-all",
                  index < tokens
                    ? "border-primary bg-primary shadow-sm"
                    : "border-dashed border-border bg-muted/40",
                )}
                aria-label={index < tokens ? "available token" : "empty slot"}
              />
            ))}
          </div>
          <p className="mt-3 font-mono text-sm">
            {tokens} / {capacity} tokens
          </p>
        </div>
        <ArrowRight className="hidden h-6 w-6 text-primary md:block" />
        <div
          className={cn(
            "rounded-xl border p-4",
            last === "allowed" && "border-emerald-500/30 bg-emerald-500/10",
            last === "rejected" && "border-red-500/30 bg-red-500/10",
            last === "idle" && "border-border bg-muted/40",
          )}
        >
          <p className="text-sm font-semibold">
            {last === "allowed"
              ? "Allowed → API"
              : last === "rejected"
                ? "Rejected → 429"
                : "Send a request"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {last === "rejected"
              ? "No token was available. The protected service sees no work."
              : "A short burst is possible only while saved tokens remain."}
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={request}>
          Send request
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={refill}>
          Refill +1
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setTokens(3);
            setLast("idle");
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>
    </Frame>
  );
}

function SingleNodeDiagram() {
  return (
    <Frame
      title="The first complete architecture"
      caption="Rules are read-mostly. Counter state changes for every request. Give them different paths."
    >
      <div className="flex items-center justify-center overflow-x-auto py-3">
        <Box title="Client" />
        <FlowArrow label="request" />
        <Box title="Limiter" detail="load rule + atomic decision" tone="primary" />
        <FlowArrow label="allowed" />
        <Box title="API" detail="protected work" />
      </div>
      <div className="mx-auto mt-2 flex max-w-lg justify-center gap-12">
        <div className="flex flex-col items-center">
          <ArrowDown className="h-5 w-5 text-sky-600" />
          <Box title="Rule cache" detail="versioned configuration" tone="data" />
        </div>
        <div className="flex flex-col items-center">
          <ArrowDown className="h-5 w-5 text-sky-600" />
          <Box title="Counter store" detail="atomic update + expiry" tone="data" />
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-dashed border-primary/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
          Critical section
        </p>
        <p className="mt-2 font-mono text-xs leading-6 text-muted-foreground">
          load state → refill / expire → spend or reject → save state
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Run this as one atomic operation in the counter store.
        </p>
      </div>
    </Frame>
  );
}

function DistributedDiagram() {
  return (
    <div className="space-y-5">
      <Frame
        title="Evolution: local counters fail"
        caption="The same account reaches two healthy limiter instances. Each local counter sees only half the traffic."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {["A", "B"].map((id) => (
            <div key={id} className="flex items-center justify-center">
              <Box title={`Client ${id}`} />
              <FlowArrow />
              <Box title={`Limiter ${id}`} detail="local count = 3" tone="danger" />
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-center text-xs text-red-700 dark:text-red-300">
          Each allows 3. The intended global limit of 5 has already been exceeded.
        </p>
      </Frame>
      <Frame
        title="Evolution: stateless limiters, shared keyed state"
        caption="Any limiter can serve any client. The complete key chooses a counter shard."
      >
        <div className="grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]">
          <div className="space-y-3">
            <Box title="Limiter A" detail="stateless" tone="primary" />
            <Box title="Limiter B" detail="stateless" tone="primary" />
          </div>
          <FlowArrow label="atomic script" />
          <div className="space-y-3">
            <Box title="Counter shard 1" detail="hash(key)" tone="data" />
            <Box title="Counter shard 2" detail="hash(key)" tone="data" />
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <MiniNote title="Correctness" body="Atomic state transition prevents lost updates." />
          <MiniNote title="Scale" body="Partition complete counter keys across shards." />
          <MiniNote title="Region" body="Strict global truth costs a cross-region decision." />
        </div>
      </Frame>
    </div>
  );
}

function OperationsDiagram() {
  return (
    <Frame
      title="Detailed request and control paths"
      caption="The hot path stays short. Rule publication, analytics, and support workflows stay outside it."
    >
      <div className="flex items-center justify-center overflow-x-auto py-3">
        <Box title="Client" detail="backoff + jitter" />
        <FlowArrow label="request" />
        <Box title="Limiter fleet" detail="rule + counter decision" tone="primary" />
        <FlowArrow label="allow" />
        <Box title="API fleet" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Box title="Rule publisher" detail="validate → version → canary" tone="data" />
        <Box title="Counter cluster" detail="shards + atomic state" tone="data" />
        <Box title="Metrics stream" detail="allow, reject, error, latency" tone="data" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm font-semibold">Rejected response</p>
          <pre className="mt-2 overflow-x-auto text-xs leading-5 text-muted-foreground">
{`HTTP 429
Retry-After: 8
RateLimit-Limit: 20
RateLimit-Remaining: 0`}
          </pre>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-semibold">Failure policy</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Browse may fail open. Login or paid vendor calls may fail closed or
            use a conservative local fallback. Record every fallback.
          </p>
        </div>
      </div>
    </Frame>
  );
}

function MiniNote({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-3">
      <p className="text-xs font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p>
    </div>
  );
}
