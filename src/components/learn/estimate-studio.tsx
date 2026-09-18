"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";
import { LearnPathHeader } from "@/components/learn/learn-chrome";
import {
  AvailabilityReliabilityLab,
  LatencyPathLab,
} from "@/components/learn/reliability-labs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  AVAILABILITY_LEVELS,
  BYTE_UNITS,
  ESTIMATE_SCENARIOS,
  INTERVIEW_SECONDS_PER_DAY,
  LATENCY_LESSONS,
  LATENCY_OPS,
  NAPKIN_TIPS,
  PERIODS,
  SECONDS_PER_DAY,
  computeNapkin,
  downtimeSeconds,
  formatDuration,
  fmtBytes,
  fmtQps,
  getScenario,
  gradeQpsGuess,
  humanTimeFromNs,
  isEstimateScenario,
  pct,
  scaledToHuman,
  type EstimateFields,
  type ScenarioId,
} from "@/lib/learn/estimate";

const SECTION_TABS = [
  { id: "units", label: "Units" },
  { id: "latency", label: "What's slow" },
  { id: "uptime", label: "Uptime" },
  { id: "play", label: "Playground" },
] as const;

export function EstimateStudio({ slug }: { slug: string }) {
  const router = useRouter();
  const section = slug === "units" || slug === "latency" || slug === "uptime" ? slug : "play";
  const scenarioId = isEstimateScenario(slug) ? slug : "lumen";

  function go(id: string) {
    router.push(`/learn/estimate/${id}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <LearnPathHeader stageId="size" />
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        Napkin math
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        Estimate it on the back of an envelope
      </h1>
      <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
        Rough numbers decide the architecture: how many boxes, whether a cache
        earns its keep, whether the pipe fits. Round on purpose, label every
        unit, and aim for the right order of magnitude — not three decimal places.
      </p>

      <div className="mt-6 flex flex-wrap gap-1 rounded-xl border border-border bg-muted/60 p-1">
        {SECTION_TABS.map((tab) => {
          const href = tab.id === "play" ? `/learn/estimate/${scenarioId}` : `/learn/estimate/${tab.id}`;
          const active = tab.id === section;
          return (
            <Link
              key={tab.id}
              href={href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {section === "units" ? <UnitsPanel /> : null}
      {section === "latency" ? <LatencyPanel /> : null}
      {section === "uptime" ? <UptimePanel /> : null}
      {section === "play" ? (
        <Playground
          scenarioId={scenarioId}
          onScenario={(id) => go(id)}
        />
      ) : null}

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {NAPKIN_TIPS.map((tip) => (
          <article key={tip.title} className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">{tip.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{tip.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function UnitsPanel() {
  const [bytes, setBytes] = useState(2 * 1024 * 1024);
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
      <div>
        <h2 className="text-xl font-semibold">Count in powers of two</h2>
        <p className="mt-2 text-[15px] leading-7 text-muted-foreground">
          A byte is eight bits. Interviews treat 2<sup>10</sup> (1,024) as “about a
          thousand,” 2<sup>20</sup> as a million, and so on. That shortcut is
          close enough to pick RAM vs disk. Write the unit every time — “5” is
          not a size.
        </p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">2<sup>n</sup></th>
                <th className="px-4 py-3">About</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Everyday picture</th>
              </tr>
            </thead>
            <tbody>
              {BYTE_UNITS.map((unit) => (
                <tr key={unit.powerOfTwo} className="border-t border-border">
                  <td className="px-4 py-3 font-mono">2^{unit.powerOfTwo}</td>
                  <td className="px-4 py-3">1 {unit.approxCount}</td>
                  <td className="px-4 py-3">
                    {unit.name} ({unit.short})
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{unit.everyday}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 text-[15px] leading-7 text-muted-foreground">
          A real day has {SECONDS_PER_DAY.toLocaleString()} seconds. For mental
          math, {INTERVIEW_SECONDS_PER_DAY.toLocaleString()} (10<sup>5</sup>) is
          easier. Dividing by the larger number slightly underestimates QPS —
          usually within 20%, which is the point of napkin math.
        </p>
      </div>
      <aside className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Convert a size
        </p>
        <Label htmlFor="bytes" className="mt-3 block">
          Bytes
        </Label>
        <Input
          id="bytes"
          type="number"
          min={0}
          value={bytes}
          onChange={(event) => setBytes(Number(event.target.value) || 0)}
          className="mt-1"
        />
        <p className="mt-3 text-2xl font-semibold">{fmtBytes(bytes)}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Try 140 (a short caption), 2,000,000 (a photo), or 6,000,000 (a clip).
        </p>
      </aside>
    </div>
  );
}

function LatencyPanel() {
  const maxLog = Math.log10(LATENCY_OPS[LATENCY_OPS.length - 1]!.ns);
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold">What is actually slow</h2>
      <p className="mt-2 max-w-3xl text-[15px] leading-7 text-muted-foreground">
        These are order-of-magnitude teaching figures, not a lab benchmark. If a
        CPU cache hit is one nanosecond, picture that as one second of human
        time — then RAM is a couple of minutes and an ocean hop is years.
      </p>
      <ul className="mt-6 space-y-3">
        {LATENCY_OPS.map((op) => {
          const width = Math.max(4, (Math.log10(op.ns) / maxLog) * 100);
          return (
            <li key={op.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">{op.label}</p>
                <p className="font-mono text-sm text-primary">
                  {humanTimeFromNs(op.ns)}
                  <span className="ml-2 text-xs text-muted-foreground">
                    ≈ {scaledToHuman(op.ns)} if 1 ns were 1 s
                  </span>
                </p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{op.takeaway}</p>
            </li>
          );
        })}
      </ul>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {LATENCY_LESSONS.map((item) => (
          <li key={item} className="rounded-xl border border-border bg-card px-4 py-3 text-sm leading-6">
            {item}
          </li>
        ))}
      </ul>
      <LatencyPathLab />
    </div>
  );
}

function UptimePanel() {
  const [ratio, setRatio] = useState(0.999);
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold">How much downtime is a “nine”</h2>
      <p className="mt-2 max-w-3xl text-[15px] leading-7 text-muted-foreground">
        Availability is the fraction of time the service is up. Cloud contracts
        often live at 99.9% or more. Each extra nine is not a cosmetic zero —
        it is a much smaller outage budget, and usually a harder architecture.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {AVAILABILITY_LEVELS.map((level) => (
          <button
            key={level.label}
            type="button"
            onClick={() => setRatio(level.ratio)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              ratio === level.ratio
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:border-primary/40",
            )}
          >
            {level.label}
          </button>
        ))}
      </div>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Window</th>
              <th className="px-4 py-3">Allowed downtime at {pct(ratio)}</th>
            </tr>
          </thead>
          <tbody>
            {PERIODS.map((period) => (
              <tr key={period.id} className="border-t border-border">
                <td className="px-4 py-3">{period.label}</td>
                <td className="px-4 py-3 font-medium">
                  {formatDuration(downtimeSeconds(ratio, period.seconds))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
        99% is almost fifteen minutes every day — a long coffee break, every
        day, for the whole product. 99.99% is under an hour across a year. That
        gap is replicas, failover drills, and multi-region — not a prettier SLA
        slide.
      </p>
      <AvailabilityReliabilityLab />
    </div>
  );
}

function Playground({
  scenarioId,
  onScenario,
}: {
  scenarioId: ScenarioId;
  onScenario: (id: ScenarioId) => void;
}) {
  const scenario = getScenario(scenarioId);
  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-2">
        {ESTIMATE_SCENARIOS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onScenario(item.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              item.id === scenarioId
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:border-primary/40",
            )}
          >
            {item.name}
            <span className="ml-1 text-xs text-muted-foreground">{item.product}</span>
          </button>
        ))}
      </div>
      <ScenarioCalc key={scenario.id} scenarioId={scenario.id} />
    </div>
  );
}

function ScenarioCalc({ scenarioId }: { scenarioId: ScenarioId }) {
  const scenario = getScenario(scenarioId);
  const [fields, setFields] = useState<EstimateFields>(scenario.fields);
  const [guess, setGuess] = useState("");
  const [revealed, setRevealed] = useState(false);
  const result = useMemo(() => computeNapkin(fields), [fields]);
  const guessNumber = Number(guess);
  const grade = revealed ? gradeQpsGuess(guessNumber, result.avgQps) : null;

  function patch(partial: Partial<EstimateFields>) {
    setFields((current) => ({ ...current, ...partial }));
    setRevealed(false);
  }

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
      <aside className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          {scenario.product} · ~{scenario.minutes} min
        </p>
        <h2 className="text-xl font-semibold">{scenario.name}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{scenario.story}</p>
        <p className="rounded-xl bg-primary/10 px-3 py-2 text-sm leading-6">{scenario.why}</p>
        <div className="grid gap-3">
          <NumField
            label="Starting count (accounts or yearly events)"
            value={fields.mau}
            onChange={(value) => patch({ mau: value })}
          />
          <NumField
            label="Fraction active today"
            hint="0.25 means one in four. For yearly events use 1/365 ≈ 0.0027."
            value={fields.dailyActiveRate}
            step="0.01"
            onChange={(value) => patch({ dailyActiveRate: value })}
          />
          <NumField
            label="Reads per active user / day"
            value={fields.readsPerUserPerDay}
            step="0.1"
            onChange={(value) => patch({ readsPerUserPerDay: value })}
          />
          <NumField
            label="Writes per active user / day"
            value={fields.writesPerUserPerDay}
            step="0.1"
            onChange={(value) => patch({ writesPerUserPerDay: value })}
          />
          <NumField
            label="Peak multiplier"
            value={fields.peakMultiplier}
            step="0.5"
            onChange={(value) => patch({ peakMultiplier: value })}
          />
          <NumField
            label="Metadata bytes per write"
            value={fields.writeBytes}
            onChange={(value) => patch({ writeBytes: value })}
          />
          <NumField
            label="Media bytes (when present)"
            value={fields.mediaBytes}
            onChange={(value) => patch({ mediaBytes: value })}
          />
          <NumField
            label="Fraction of writes with media"
            value={fields.mediaFraction}
            step="0.05"
            onChange={(value) => patch({ mediaFraction: value })}
          />
          <NumField
            label="Bytes per read (wire)"
            value={fields.readBytes}
            onChange={(value) => patch({ readBytes: value })}
          />
          <NumField
            label="Years kept"
            value={fields.retentionYears}
            step="0.25"
            onChange={(value) => patch({ retentionYears: value })}
          />
          <NumField
            label="QPS one app box can handle"
            value={fields.qpsPerServer}
            onChange={(value) => patch({ qpsPerServer: value })}
          />
        </div>
      </aside>

      <div className="min-w-0 space-y-5">
        <section className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Try it yourself
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            About how many <span className="font-medium text-foreground">average QPS</span> is
            this? Ignore peak. Daily actives × (reads + writes) ÷ 86,400.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Input
              inputMode="decimal"
              placeholder="Your QPS guess"
              value={guess}
              onChange={(event) => {
                setGuess(event.target.value);
                setRevealed(false);
              }}
              className="max-w-[12rem]"
              aria-label="Guess average QPS"
            />
            <Button type="button" onClick={() => setRevealed(true)}>
              Check my guess
            </Button>
          </div>
          {grade ? (
            <p className="mt-3 text-sm leading-6">
              Actual average is <span className="font-medium">{fmtQps(result.avgQps)} QPS</span>.{" "}
              {grade.blurb}
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            In plain English
          </h3>
          <ul className="mt-3 space-y-2 text-sm leading-6">
            {result.english.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            Show the work
          </h3>
          <ol className="mt-3 space-y-3">
            {result.steps.map((step, index) => (
              <li key={step.title} className="flex gap-3 text-sm leading-6">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <span>
                  <span className="font-medium">{step.title}: </span>
                  <span className="font-mono text-foreground">{step.value}</span>
                  <span className="mt-0.5 block text-muted-foreground">{step.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            <Lightbulb className="h-4 w-4" />
            How to think about this one
          </h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            {scenario.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/learn/approach" className="font-medium text-primary hover:underline">
            Use this in the interview approach →
          </Link>
          <Link href="/learn#designs" className="font-medium text-primary hover:underline">
            Design a system →
          </Link>
          <Link href="/learn/lessons/napkin-qps" className="text-muted-foreground hover:text-foreground">
            Read the lesson
          </Link>
        </div>
      </div>
    </div>
  );
}

function NumField({
  label,
  hint,
  value,
  step,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  step?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium">{label}</span>
      <Input
        type="number"
        min={0}
        step={step ?? "1"}
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="mt-1"
      />
      {hint ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}
