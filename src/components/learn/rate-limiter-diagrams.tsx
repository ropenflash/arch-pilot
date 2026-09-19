"use client";

import { useState } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { RateLimiterAlgorithmPlayground } from "@/components/learn/rate-limiter-algorithm-playground";
import type { RateLimiterDiagram } from "@/lib/learn/rate-limiter-course";
import { cn } from "@/lib/utils";

export function RateLimiterLessonDiagram({ kind }: { kind: RateLimiterDiagram }) {
  if (kind === "why") return <WhyDiagram />;
  if (kind === "brief") return <BriefDiagram />;
  if (kind === "placement") return <PlacementDiagram />;
  if (kind === "algorithms") return <AlgorithmLab />;
  return <DesignDiagram />;
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

function WhyDiagram() {
  const [on, setOn] = useState(false);

  return (
    <Frame
      title="Watch one request path"
      caption="Turn the limiter on. Seven of the ten requests are asked to wait."
    >
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOn(false)}
          aria-pressed={!on}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium",
            !on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40",
          )}
        >
          No limiter
        </button>
        <button
          type="button"
          onClick={() => setOn(true)}
          aria-pressed={on}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium",
            on ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/40",
          )}
        >
          Limiter on
        </button>
      </div>
      <div className="mt-6 flex items-center justify-center overflow-x-auto py-4">
        <Box title="Caller" detail="10 requests" />
        <FlowArrow label="arrives" />
        {on ? (
          <>
            <Box title="Rate limiter" detail="3 / second" tone="primary" />
            <FlowArrow label="3 allowed" />
          </>
        ) : null}
        <Box
          title="API"
          detail={on ? "does the work" : "handles all 10"}
          tone={on ? "plain" : "danger"}
        />
      </div>
      <p className="text-sm leading-6 text-muted-foreground">
        {on
          ? "Three requests continue. Seven get a clear “try later.” The API only sees traffic inside the rule."
          : "Every request reaches the API — including retries, bots, and a stuck loop."}
      </p>
    </Frame>
  );
}

function BriefDiagram() {
  return (
    <Frame
      title="The brief we just locked"
      caption="Read this once. The later pictures all follow it."
    >
      <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
        <li>
          <span className="font-semibold text-foreground">Server-side.</span> The lock lives on machines we control.
        </li>
        <li>
          <span className="font-semibold text-foreground">Flexible identity.</span> One route may count by user, another by IP or key.
        </li>
        <li>
          <span className="font-semibold text-foreground">Fast and small.</span> The check is on every request, so it cannot be heavy.
        </li>
        <li>
          <span className="font-semibold text-foreground">Shared across servers.</span> The same caller can land on any machine.
        </li>
        <li>
          <span className="font-semibold text-foreground">A clear wait.</span> Blocked callers are told when to retry.
        </li>
        <li>
          <span className="font-semibold text-foreground">A planned failure.</span> If the counter store is sick, the product still has an answer.
        </li>
      </ul>
    </Frame>
  );
}

function PlacementDiagram() {
  const [stage, setStage] = useState<"simple" | "client" | "api" | "gateway">("simple");
  const notes = {
    simple: "Start here. Client talks to a server. Now we choose the doorway.",
    client: "This can make the app feel polite. It cannot be the lock — the user controls the client.",
    api: "Trusted, and it can see the logged-in account. Every team must keep the same logic.",
    gateway: "One shared doorway. It rejects early. Deeper rules can still live in the API.",
  };

  return (
    <Frame
      title="Grow the picture"
      caption="Four clicks. The orange box is the decision."
    >
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["simple", "1. Client and server"],
            ["client", "2. On the client"],
            ["api", "3. Inside the API"],
            ["gateway", "4. In a gateway"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setStage(id)}
            aria-pressed={stage === id}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium",
              stage === id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary/40",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-center overflow-x-auto py-4">
        <Box
          title="Client"
          detail={stage === "client" ? "limiter here" : "sends the request"}
          tone={stage === "client" ? "primary" : "plain"}
        />
        <FlowArrow label="HTTPS" />
        {stage !== "simple" && stage !== "client" ? (
          <>
            <Box
              title="Gateway"
              detail={stage === "gateway" ? "limiter here" : "routing"}
              tone={stage === "gateway" ? "primary" : "plain"}
            />
            <FlowArrow label="allowed" />
          </>
        ) : null}
        <Box
          title={stage === "simple" ? "Server" : "API"}
          detail={stage === "api" ? "limiter here" : "does the work"}
          tone={stage === "api" ? "primary" : "plain"}
        />
      </div>
      <p className="text-sm leading-6 text-muted-foreground">{notes[stage]}</p>
    </Frame>
  );
}

function AlgorithmLab() {
  return <RateLimiterAlgorithmPlayground />;
}

function DesignDiagram() {
  const [stage, setStage] = useState<"one" | "many" | "wait">("one");

  return (
    <Frame
      title="The same design, three moments"
      caption="One machine. Then two servers. Then a blocked caller."
    >
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["one", "1. One machine"],
            ["many", "2. Many servers"],
            ["wait", "3. A blocked caller"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setStage(id)}
            aria-pressed={stage === id}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium",
              stage === id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary/40",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {stage === "one" ? (
        <div className="mt-6">
          <div className="flex items-center justify-center overflow-x-auto py-3">
            <Box title="Client" />
            <FlowArrow label="request" />
            <Box title="Limiter" detail="load rule, then decide" tone="primary" />
            <FlowArrow label="allowed" />
            <Box title="API" />
          </div>
          <div className="mx-auto mt-2 flex max-w-md justify-center gap-10">
            <div className="flex flex-col items-center">
              <ArrowDown className="h-5 w-5 text-sky-600" />
              <Box title="Rules" detail="20 logins / 10 min" tone="data" />
            </div>
            <div className="flex flex-col items-center">
              <ArrowDown className="h-5 w-5 text-sky-600" />
              <Box title="Counters" detail="account 42 = 7" tone="data" />
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Find the rule, add one to the count in a single step, then allow or wait.
          </p>
        </div>
      ) : null}

      {stage === "many" ? (
        <div className="mt-6 space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {["A", "B"].map((id) => (
              <div key={id} className="flex items-center justify-center">
                <Box title={`Caller ${id}`} />
                <FlowArrow />
                <Box title={`Limiter ${id}`} detail="local count = 3" tone="danger" />
              </div>
            ))}
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Each server allows 3. The intended shared limit of 5 is already broken.
          </p>
          <div className="flex items-center justify-center overflow-x-auto py-3">
            <Box title="Limiter A" detail="no local count" tone="primary" />
            <FlowArrow label="same key" />
            <Box title="Shared count" detail="account 42 = 5" tone="data" />
            <FlowArrow />
            <Box title="Limiter B" detail="no local count" tone="primary" />
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Any server can decide, because they all update the same key.
          </p>
        </div>
      ) : null}

      {stage === "wait" ? (
        <div className="mt-6">
          <div className="flex items-center justify-center overflow-x-auto py-3">
            <Box title="Client" detail="waits, then retries" />
            <FlowArrow />
            <Box title="Limiter" detail="allow or 429" tone="primary" />
            <FlowArrow label="allowed" />
            <Box title="API" />
          </div>
          <pre className="mt-5 overflow-x-auto rounded-xl bg-muted px-4 py-3 text-xs leading-5 text-muted-foreground">
{`HTTP 429
Retry-After: 8
Remaining: 0`}
          </pre>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            If the counter store is down, browse may stay open. Password reset may stay closed. Write that on the rule.
          </p>
        </div>
      ) : null}
    </Frame>
  );
}
