"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { recordExercise } from "@/lib/learn/platform-progress";
import { cn } from "@/lib/utils";

const TABS = [
  ["token", "Token bucket"],
  ["leaky", "Leaky bucket"],
  ["fixed", "Fixed window"],
  ["log", "Sliding log"],
  ["counter", "Sliding counter"],
] as const;

type AlgorithmId = (typeof TABS)[number][0];

export function RateLimiterAlgorithmPlayground() {
  const [algorithm, setAlgorithm] = useState<AlgorithmId>("token");
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Algorithm simulator
        </p>
        <h2 className="mt-1 text-lg font-semibold">Change the traffic. Watch the consequence.</h2>
      </div>
      <div className="overflow-x-auto border-b border-border bg-muted/40 p-1.5">
        <div className="flex min-w-max gap-1">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setAlgorithm(id)}
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-medium",
                algorithm === id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-5 sm:p-6">
        {algorithm === "token" ? <TokenSimulation /> : null}
        {algorithm === "leaky" ? <LeakySimulation /> : null}
        {algorithm === "fixed" ? <FixedWindowSimulation /> : null}
        {algorithm === "log" ? <SlidingLogSimulation /> : null}
        {algorithm === "counter" ? <SlidingCounterSimulation /> : null}
      </div>
    </section>
  );
}

function TokenSimulation() {
  const [capacity, setCapacity] = useState(5);
  const [refillRate, setRefillRate] = useState(2);
  const [requestRate, setRequestRate] = useState(3);
  const [tokens, setTokens] = useState(5);
  const [allowed, setAllowed] = useState(0);
  const [rejected, setRejected] = useState(0);
  const [running, setRunning] = useState(false);
  const tokensRef = useRef(tokens);
  const creditRef = useRef(0);

  useEffect(() => {
    tokensRef.current = Math.min(tokensRef.current, capacity);
    setTokens(tokensRef.current);
  }, [capacity]);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      const seconds = 0.25;
      tokensRef.current = Math.min(
        capacity,
        tokensRef.current + refillRate * seconds,
      );
      creditRef.current += requestRate * seconds;
      const requests = Math.floor(creditRef.current);
      creditRef.current -= requests;
      let nextAllowed = 0;
      let nextRejected = 0;
      for (let index = 0; index < requests; index += 1) {
        if (tokensRef.current >= 1) {
          tokensRef.current -= 1;
          nextAllowed += 1;
        } else {
          nextRejected += 1;
        }
      }
      setTokens(tokensRef.current);
      if (nextAllowed) setAllowed((value) => value + nextAllowed);
      if (nextRejected) setRejected((value) => value + nextRejected);
    }, 250);
    return () => window.clearInterval(interval);
  }, [capacity, refillRate, requestRate, running]);

  function reset() {
    setRunning(false);
    tokensRef.current = capacity;
    creditRef.current = 0;
    setTokens(capacity);
    setAllowed(0);
    setRejected(0);
  }

  return (
    <div>
      <AlgorithmIntro
        title="Token bucket"
        body="Tokens arrive continuously up to a cap. Requests spend tokens immediately, so saved capacity becomes a bounded burst."
      />
      <div className="mt-5 grid gap-5 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <Range
            label="Bucket capacity"
            value={capacity}
            min={1}
            max={10}
            suffix="tokens"
            onChange={setCapacity}
          />
          <Range
            label="Refill rate"
            value={refillRate}
            min={1}
            max={8}
            suffix="tokens/s"
            onChange={setRefillRate}
          />
          <Range
            label="Request rate"
            value={requestRate}
            min={1}
            max={12}
            suffix="requests/s"
            onChange={setRequestRate}
          />
          <Controls
            running={running}
            onToggle={() => {
              setRunning((value) => !value);
              recordExercise("rate-limit-token");
            }}
            onReset={reset}
          />
        </div>
        <div className="rounded-xl border border-border bg-muted/30 p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Tokens now
              </p>
              <p className="mt-1 font-mono text-3xl font-semibold">
                {tokens.toFixed(1)} / {capacity}
              </p>
            </div>
            <Outcome allowed={allowed} rejected={rejected} />
          </div>
          <div className="mt-6 flex min-h-20 flex-wrap content-start gap-2">
            {Array.from({ length: capacity }, (_, index) => (
              <span
                key={index}
                className={cn(
                  "h-10 w-10 rounded-full border transition-all duration-200",
                  index < Math.floor(tokens)
                    ? "scale-100 border-primary bg-primary"
                    : "scale-90 border-dashed border-border bg-background",
                )}
              />
            ))}
          </div>
          <p className="mt-5 rounded-lg bg-background px-3 py-2 text-sm leading-6 text-muted-foreground">
            {requestRate > refillRate
              ? `Demand exceeds refill by ${requestRate - refillRate}/s. Saved tokens absorb the burst, then rejects begin.`
              : "Refill meets the current request rate. The bucket recovers toward capacity."}
          </p>
        </div>
      </div>
    </div>
  );
}

function LeakySimulation() {
  const [capacity, setCapacity] = useState(8);
  const [incoming, setIncoming] = useState(5);
  const [outflow, setOutflow] = useState(2);
  const [queued, setQueued] = useState(0);
  const [processed, setProcessed] = useState(0);
  const [dropped, setDropped] = useState(0);
  const [running, setRunning] = useState(false);
  const queueRef = useRef(0);
  const inCredit = useRef(0);
  const outCredit = useRef(0);

  useEffect(() => {
    queueRef.current = Math.min(queueRef.current, capacity);
    setQueued(queueRef.current);
  }, [capacity]);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      const seconds = 0.25;
      inCredit.current += incoming * seconds;
      outCredit.current += outflow * seconds;
      const arrivals = Math.floor(inCredit.current);
      const departures = Math.floor(outCredit.current);
      inCredit.current -= arrivals;
      outCredit.current -= departures;
      const accepted = Math.min(arrivals, capacity - queueRef.current);
      const overflow = arrivals - accepted;
      queueRef.current += accepted;
      const completed = Math.min(departures, queueRef.current);
      queueRef.current -= completed;
      setQueued(queueRef.current);
      if (overflow) setDropped((value) => value + overflow);
      if (completed) setProcessed((value) => value + completed);
    }, 250);
    return () => window.clearInterval(interval);
  }, [capacity, incoming, outflow, running]);

  function reset() {
    setRunning(false);
    queueRef.current = 0;
    inCredit.current = 0;
    outCredit.current = 0;
    setQueued(0);
    setProcessed(0);
    setDropped(0);
  }

  return (
    <div>
      <AlgorithmIntro
        title="Leaky bucket"
        body="Requests enter a bounded FIFO queue and leave at a fixed rate. This smooths downstream load, but fresh work waits behind old work."
      />
      <div className="mt-5 grid gap-5 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <Range label="Queue capacity" value={capacity} min={2} max={12} suffix="requests" onChange={setCapacity} />
          <Range label="Incoming rate" value={incoming} min={1} max={12} suffix="requests/s" onChange={setIncoming} />
          <Range label="Processing rate" value={outflow} min={1} max={8} suffix="requests/s" onChange={setOutflow} />
          <Controls
            running={running}
            onToggle={() => {
              setRunning((value) => !value);
              recordExercise("rate-limit-leaky");
            }}
            onReset={reset}
          />
        </div>
        <div className="rounded-xl border border-border bg-muted/30 p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Queue</p>
              <p className="mt-1 font-mono text-3xl font-semibold">{queued} / {capacity}</p>
            </div>
            <Outcome allowed={processed} rejected={dropped} allowedLabel="processed" rejectedLabel="dropped" />
          </div>
          <div className="mt-6 flex h-16 items-center gap-1 overflow-hidden rounded-lg border border-border bg-background p-2">
            {Array.from({ length: capacity }, (_, index) => (
              <span
                key={index}
                className={cn(
                  "h-10 flex-1 rounded transition-colors",
                  index < queued ? "bg-primary" : "border border-dashed border-border",
                )}
              />
            ))}
          </div>
          <p className="mt-5 rounded-lg bg-background px-3 py-2 text-sm leading-6 text-muted-foreground">
            {incoming > outflow
              ? "The queue grows because arrival exceeds processing. Once full, new requests are dropped."
              : "The processor can keep up. The queue drains instead of preserving a burst."}
          </p>
        </div>
      </div>
    </div>
  );
}

function FixedWindowSimulation() {
  const limit = 5;
  const [windowId, setWindowId] = useState(1);
  const [count, setCount] = useState(0);
  const [previousAccepted, setPreviousAccepted] = useState(0);
  const [rejected, setRejected] = useState(0);

  function send() {
    if (count < limit) setCount((value) => value + 1);
    else setRejected((value) => value + 1);
    recordExercise("rate-limit-fixed-window");
  }

  function nextWindow() {
    setPreviousAccepted(count);
    setCount(0);
    setRejected(0);
    setWindowId((value) => value + 1);
  }

  return (
    <div>
      <AlgorithmIntro
        title="Fixed window"
        body="One counter belongs to one wall-clock interval. The reset is simple; the boundary creates the surprise."
      />
      <div className="mt-5 grid gap-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <WindowCard title={`Window ${windowId - 1}`} count={previousAccepted} limit={limit} muted />
        <div className="text-center">
          <p className="font-mono text-xs text-muted-foreground">boundary</p>
          <div className="mx-auto mt-1 h-12 w-px bg-primary" />
        </div>
        <WindowCard title={`Window ${windowId}`} count={count} limit={limit} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={send}>
          <Send className="h-3.5 w-3.5" />
          Send request
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={nextWindow}>
          Cross boundary
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setCount(0);
            setPreviousAccepted(0);
            setRejected(0);
            setWindowId(1);
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>
      <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm leading-6 text-muted-foreground">
        {previousAccepted === limit && count === limit
          ? `Boundary burst: ${previousAccepted + count} requests passed in two adjacent short periods even though the nominal limit is ${limit} per window.`
          : rejected
            ? `${rejected} request${rejected === 1 ? "" : "s"} rejected until the counter resets.`
            : "Fill the current window, cross the boundary, then fill the next to expose double-dipping."}
      </p>
    </div>
  );
}

function SlidingLogSimulation() {
  const limit = 5;
  const windowSeconds = 60;
  const [now, setNow] = useState(0);
  const [timestamps, setTimestamps] = useState<number[]>([]);
  const [lastRejected, setLastRejected] = useState(false);
  const valid = timestamps.filter((time) => time > now - windowSeconds);

  function send() {
    const current = timestamps.filter((time) => time > now - windowSeconds);
    if (current.length < limit) {
      setTimestamps([...current, now]);
      setLastRejected(false);
    } else {
      setTimestamps(current);
      setLastRejected(true);
    }
    recordExercise("rate-limit-sliding-log");
  }

  function advance() {
    const next = now + 10;
    setNow(next);
    setTimestamps((current) => current.filter((time) => time > next - windowSeconds));
    setLastRejected(false);
  }

  return (
    <div>
      <AlgorithmIntro
        title="Sliding window log"
        body="Keep accepted request timestamps inside the last rolling interval. It is accurate because the history is explicit."
      />
      <div className="mt-5 rounded-xl border border-border bg-muted/30 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Current time</p>
            <p className="font-mono text-2xl font-semibold">t = {now}s</p>
          </div>
          <p className="font-mono text-sm">
            {valid.length} / {limit} accepted in ({now - windowSeconds}, {now}]
          </p>
        </div>
        <div className="mt-5 min-h-24 rounded-lg border border-border bg-background p-3">
          <div className="flex flex-wrap gap-2">
            {valid.map((time, index) => (
              <span key={`${time}-${index}`} className="rounded-md bg-primary px-2 py-1 font-mono text-xs text-primary-foreground">
                {time}s
              </span>
            ))}
            {!valid.length ? <span className="text-sm text-muted-foreground">No valid timestamps</span> : null}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={send}>Send at {now}s</Button>
          <Button type="button" size="sm" variant="outline" onClick={advance}>Advance +10s</Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => { setNow(0); setTimestamps([]); setLastRejected(false); }}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
        </div>
        <p className={cn("mt-4 rounded-lg px-3 py-2 text-sm", lastRejected ? "bg-red-500/10 text-red-700 dark:text-red-300" : "bg-muted text-muted-foreground")}>
          {lastRejected
            ? "Rejected: five accepted timestamps still fall inside the rolling minute."
            : "Advance time. Timestamps disappear only when they leave the rolling window."}
        </p>
      </div>
    </div>
  );
}

function SlidingCounterSimulation() {
  const limit = 10;
  const [previous, setPrevious] = useState(8);
  const [current, setCurrent] = useState(2);
  const [progress, setProgress] = useState(25);
  const estimated = previous * (1 - progress / 100) + current;
  const canAllow = estimated + 1 <= limit;

  function send() {
    if (canAllow) setCurrent((value) => value + 1);
    recordExercise("rate-limit-sliding-counter");
  }

  return (
    <div>
      <AlgorithmIntro
        title="Sliding window counter"
        body="Estimate the rolling count by weighting the previous fixed window according to how much still overlaps."
      />
      <div className="mt-5 grid gap-5 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <Range label="Previous window count" value={previous} min={0} max={10} suffix="requests" onChange={setPrevious} />
          <Range label="Current window count" value={current} min={0} max={10} suffix="requests" onChange={setCurrent} />
          <Range label="Current window elapsed" value={progress} min={0} max={100} suffix="%" onChange={setProgress} />
          <Button type="button" size="sm" onClick={send} disabled={!canAllow}>
            Send request
          </Button>
        </div>
        <div className="rounded-xl border border-border bg-muted/30 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Weighted estimate
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold">
            {previous} × {(1 - progress / 100).toFixed(2)} + {current} = {estimated.toFixed(2)}
          </p>
          <div className="mt-5 h-4 overflow-hidden rounded-full bg-background">
            <div
              className={cn("h-full", estimated > limit ? "bg-red-500" : "bg-primary")}
              style={{ width: `${Math.min(100, (estimated / limit) * 100)}%` }}
            />
          </div>
          <p className="mt-4 rounded-lg bg-background px-3 py-2 text-sm leading-6 text-muted-foreground">
            {canAllow
              ? `A new request is allowed because the estimate stays at or below ${limit}.`
              : `A new request is rejected. This saves timestamp memory, but the rolling count is an approximation.`}
          </p>
        </div>
      </div>
    </div>
  );
}

function AlgorithmIntro({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}

function Range({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <span className="font-mono text-xs text-muted-foreground">
          {value} {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full accent-orange-600"
      />
    </div>
  );
}

function Controls({
  running,
  onToggle,
  onReset,
}: {
  running: boolean;
  onToggle: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex gap-2">
      <Button type="button" size="sm" onClick={onToggle}>
        {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        {running ? "Pause" : "Run simulation"}
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onReset}>
        <RotateCcw className="h-3.5 w-3.5" />
        Reset
      </Button>
    </div>
  );
}

function Outcome({
  allowed,
  rejected,
  allowedLabel = "allowed",
  rejectedLabel = "rejected",
}: {
  allowed: number;
  rejected: number;
  allowedLabel?: string;
  rejectedLabel?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 text-center">
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
        <p className="font-mono text-lg font-semibold">{allowed}</p>
        <p className="text-[10px] text-muted-foreground">{allowedLabel}</p>
      </div>
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
        <p className="font-mono text-lg font-semibold">{rejected}</p>
        <p className="text-[10px] text-muted-foreground">{rejectedLabel}</p>
      </div>
    </div>
  );
}

function WindowCard({
  title,
  count,
  limit,
  muted = false,
}: {
  title: string;
  count: number;
  limit: number;
  muted?: boolean;
}) {
  return (
    <div className={cn("rounded-xl border border-border p-4", muted ? "bg-muted/40" : "bg-primary/5")}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <p className="font-mono text-xs">{count} / {limit}</p>
      </div>
      <div className="mt-3 flex gap-1">
        {Array.from({ length: limit }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-9 flex-1 rounded",
              index < count ? "bg-primary" : "border border-dashed border-border",
            )}
          />
        ))}
      </div>
    </div>
  );
}
