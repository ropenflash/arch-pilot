"use client";

import { useState } from "react";
import { ArrowDown, ArrowRight, Check, X } from "lucide-react";
import { RateLimiterAlgorithmPlayground } from "@/components/learn/rate-limiter-algorithm-playground";
import type { RateLimiterDiagram, RateLimiterInterviewTurn } from "@/lib/learn/rate-limiter-course";
import { cn } from "@/lib/utils";

export function RateLimiterLessonDiagram({
  kind,
  interview,
  decided,
}: {
  kind: RateLimiterDiagram;
  interview?: RateLimiterInterviewTurn[];
  decided?: { title: string; body: string }[];
}) {
  if (kind === "why") return <WhyDiagram />;
  if (kind === "scope") return <ScopeDiagram interview={interview ?? []} decided={decided ?? []} />;
  if (kind === "requirements") return <RequirementsDiagram />;
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

function WhyDiagram() {
  const [mode, setMode] = useState<"open" | "limited">("open");

  return (
    <Frame
      title="Watch the doorway"
      caption="Toggle the limiter on. Extra requests stop here instead of landing on the API."
    >
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["open", "No limiter"],
            ["limited", "Limiter on"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            aria-pressed={mode === id}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium",
              mode === id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary/40",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-center overflow-x-auto py-4">
        <Box title="Caller" detail="10 requests" />
        <FlowArrow label="arrives" />
        {mode === "limited" ? (
          <>
            <Box title="Rate limiter" detail="rule: 3 / second" tone="primary" />
            <FlowArrow label="3 allowed" />
          </>
        ) : null}
        <Box
          title="API"
          detail={mode === "limited" ? "does useful work" : "handles all 10"}
          tone={mode === "open" ? "danger" : "plain"}
        />
      </div>
      <div
        className={cn(
          "rounded-xl p-4",
          mode === "open" ? "bg-red-500/10" : "bg-emerald-500/10",
        )}
      >
        <p className="text-sm font-semibold">
          {mode === "open" ? "Every request reaches the API" : "The extra 7 are asked to wait"}
        </p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {mode === "open"
            ? "A stuck retry loop, a bot, or a popular endpoint can spend the same CPU and vendor budget as real users."
            : "Three requests continue. Seven receive a clear “try later.” The API only sees traffic that is still inside the rule."}
        </p>
      </div>
    </Frame>
  );
}

function ScopeDiagram({
  interview,
  decided,
}: {
  interview: RateLimiterInterviewTurn[];
  decided: { title: string; body: string }[];
}) {
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const current = interview[step];
  const done = step >= interview.length;

  function next() {
    setRevealed(false);
    setStep((value) => value + 1);
  }

  return (
    <Frame
      title="Walk the interview"
      caption="Ask first. Then reveal a solid answer. This is the same habit you should use on a real design prompt."
    >
      {!done && current ? (
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Question {step + 1} of {interview.length}
          </p>
          <p className="text-lg font-semibold leading-7">{current.ask}</p>
          {revealed ? (
            <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm leading-6">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                A solid answer
              </p>
              <p className="mt-2">{current.answer}</p>
              <p className="mt-2 text-xs text-muted-foreground">{current.takeaway}</p>
              <button
                type="button"
                onClick={next}
                className="mt-3 text-xs font-medium text-primary hover:underline"
              >
                {step + 1 === interview.length ? "Lock the brief →" : "Next question →"}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm font-medium hover:border-primary/40 hover:bg-accent"
            >
              Reveal a solid answer
            </button>
          )}
        </div>
      ) : (
        <div>
          <p className="text-sm font-semibold">The brief is now locked</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {decided.map((item) => (
              <div key={item.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  {item.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setStep(0);
              setRevealed(false);
            }}
            className="mt-4 text-xs font-medium text-primary hover:underline"
          >
            Walk through the questions again
          </button>
        </div>
      )}
    </Frame>
  );
}

const REQUIREMENT_CARDS = [
  ["Accurate", "The 21st request does not sneak through."],
  ["Fast", "The check barely adds wait time."],
  ["Small memory", "Do not store the whole internet."],
  ["Shared", "Many servers, one quota."],
  ["Clear error", "Rejected callers know when to retry."],
  ["Fault tolerant", "A sick store does not sink the product."],
] as const;

function RequirementsDiagram() {
  const [active, setActive] = useState(0);

  return (
    <Frame
      title="Six bars you can point to"
      caption="Click a requirement. If a design misses it, say that out loud before you add more boxes."
    >
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {REQUIREMENT_CARDS.map(([title, detail], index) => (
          <button
            key={title}
            type="button"
            onClick={() => setActive(index)}
            aria-pressed={active === index}
            className={cn(
              "rounded-xl border px-3 py-3 text-left",
              active === index
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/40",
            )}
          >
            <p className="text-sm font-semibold">{title}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
          </button>
        ))}
      </div>
    </Frame>
  );
}

function PlacementDiagram() {
  const [stage, setStage] = useState<"simple" | "client" | "api" | "gateway">("simple");
  const notes = {
    simple: {
      verdict: "Start here",
      body: "Client talks to a server. That is enough to ask the next question: where does the check go?",
    },
    client: {
      verdict: "Helpful, but not a lock",
      body: "A local throttle can make the app feel polite. A changed or hostile client can skip it.",
    },
    api: {
      verdict: "Trusted and close to the product",
      body: "The service can use the logged-in account. Every team must keep the same logic.",
    },
    gateway: {
      verdict: "One shared doorway",
      body: "Rejects early and protects many services. Deeper business rules can still live in the API.",
    },
  };

  return (
    <Frame
      title="Grow the picture one box at a time"
      caption="First the basic path. Then click a place to put the limiter. The orange box is the decision."
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
          title={stage === "simple" ? "Server" : "API service"}
          detail={stage === "api" ? "limiter here" : "does the work"}
          tone={stage === "api" ? "primary" : "plain"}
        />
      </div>
      <div className="rounded-xl bg-muted p-4">
        <p className="text-sm font-semibold">{notes[stage].verdict}</p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{notes[stage].body}</p>
      </div>
    </Frame>
  );
}

const ALGORITHMS = [
  {
    name: "Token bucket",
    burst: "Short burst, then steady",
    memory: "Tiny",
    accuracy: "Exact tokens",
    best: "Public APIs that can allow a burst",
  },
  {
    name: "Leaky bucket",
    burst: "Lined up and smoothed",
    memory: "The queue",
    accuracy: "Fixed outflow",
    best: "Downstream work needs a calm pace",
  },
  {
    name: "Fixed window",
    burst: "Spike at the clock flip",
    memory: "Tiny",
    accuracy: "Coarse",
    best: "Simple “N per minute” rules",
  },
  {
    name: "Sliding log",
    burst: "Strict rolling cap",
    memory: "High",
    accuracy: "Exact times",
    best: "Low volume, strict rules",
  },
  {
    name: "Sliding counter",
    burst: "Smoothed estimate",
    memory: "Low",
    accuracy: "Approximate",
    best: "High volume rolling limits",
  },
];

function AlgorithmLab() {
  return (
    <div className="space-y-5">
      <RateLimiterAlgorithmPlayground />
      <Frame
        title="Choose by the feeling, not the name"
        caption="No algorithm is always best. Match the burst, the memory, and the promise you made."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Algorithm</th>
                <th className="pb-3 pr-4 font-medium">What a burst does</th>
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

function SingleNodeDiagram() {
  return (
    <Frame
      title="The smallest complete path"
      caption="Rules change slowly. Counts change on every request. Give them different homes."
    >
      <div className="flex items-center justify-center overflow-x-auto py-3">
        <Box title="Client" detail="sends a request" />
        <FlowArrow label="request" />
        <Box title="Limiter" detail="load rule, then decide" tone="primary" />
        <FlowArrow label="allowed" />
        <Box title="API" detail="does the work" />
      </div>
      <div className="mx-auto mt-2 flex max-w-lg justify-center gap-12">
        <div className="flex flex-col items-center">
          <ArrowDown className="h-5 w-5 text-sky-600" />
          <Box title="Rule cache" detail="20 logins / 10 min" tone="data" />
        </div>
        <div className="flex flex-col items-center">
          <ArrowDown className="h-5 w-5 text-sky-600" />
          <Box title="Counter store" detail="account 42 = 7" tone="data" />
        </div>
      </div>
      <ol className="mt-5 grid gap-2 sm:grid-cols-4">
        {[
          "Find the rule",
          "Read the count",
          "Add one atomically",
          "Allow or return 429",
        ].map((step, index) => (
          <li key={step} className="rounded-xl border border-border bg-muted/40 px-3 py-3">
            <p className="text-[11px] font-semibold text-primary">Step {index + 1}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{step}</p>
          </li>
        ))}
      </ol>
    </Frame>
  );
}

function DistributedDiagram() {
  return (
    <div className="space-y-5">
      <Frame
        title="Problem: each server has its own memory"
        caption="The same account hits two healthy limiters. Each one only sees half the traffic."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {["A", "B"].map((id) => (
            <div key={id} className="flex items-center justify-center">
              <Box title={`Caller ${id}`} />
              <FlowArrow />
              <Box title={`Limiter ${id}`} detail="local count = 3" tone="danger" />
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-center text-xs text-red-700 dark:text-red-300">
          Each allows 3. The intended shared limit of 5 is already broken.
        </p>
      </Frame>
      <Frame
        title="Fix: stateless limiters, one shared count"
        caption="Any limiter can serve any caller. The full key chooses the counter."
      >
        <div className="flex items-center justify-center overflow-x-auto py-3">
          <div className="space-y-3">
            <Box title="Limiter A" detail="no local count" tone="primary" />
            <Box title="Limiter B" detail="no local count" tone="primary" />
          </div>
          <FlowArrow label="same key" />
          <Box title="Shared counter" detail="account 42 = 5" tone="data" />
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <MiniNote title="Agree" body="One atomic increment, so two servers cannot both invent a +1." />
          <MiniNote title="Scale" body="Split keys across shards when one store is not enough." />
          <MiniNote title="Later" body="A hard worldwide cap costs extra coordination." />
        </div>
      </Frame>
    </div>
  );
}

function OperationsDiagram() {
  return (
    <Frame
      title="The caller and the bad day"
      caption="The hot path stays short. The response and the fallback are part of the design."
    >
      <div className="flex items-center justify-center overflow-x-auto py-3">
        <Box title="Client" detail="waits, then retries" />
        <FlowArrow label="request" />
        <Box title="Limiter" detail="allow or 429" tone="primary" />
        <FlowArrow label="allowed" />
        <Box title="API" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <X className="h-4 w-4 text-red-600" />
            Blocked response
          </p>
          <pre className="mt-2 overflow-x-auto text-xs leading-5 text-muted-foreground">
{`HTTP 429
Retry-After: 8
Limit: 20
Remaining: 0`}
          </pre>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Check className="h-4 w-4 text-primary" />
            If the store is sick
          </p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Browse may keep working. Password reset or a paid vendor call may refuse
            traffic or use a small local cap. Write the choice on the rule.
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
