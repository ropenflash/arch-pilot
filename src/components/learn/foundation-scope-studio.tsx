"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  CircleHelp,
  Gauge,
  Network,
  Users,
} from "lucide-react";
import { LearnPathHeader } from "@/components/learn/learn-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recordExercise, recordQuiz } from "@/lib/learn/platform-progress";
import { cn } from "@/lib/utils";

type ScopeState = {
  clients: string;
  features: string[];
  newUrlsPerDay: number;
  readsPerWrite: number;
  latency: string;
  retentionYears: number;
};

const STEPS = [
  {
    title: "Users",
    question: "Who will create and open short links?",
    why: "Clients determine authentication, API shape, and where redirects happen.",
  },
  {
    title: "Features",
    question: "What belongs in the first useful version?",
    why: "Scope protects the design from solving analytics, billing, and abuse all at once.",
  },
  {
    title: "Volume",
    question: "How many new links and redirects should we expect?",
    why: "Traffic shape tells us which path deserves the most attention.",
  },
  {
    title: "Quality",
    question: "What latency and retention promise do users need?",
    why: "A promise becomes an architecture constraint only after it is explicit.",
  },
] as const;

const FEATURE_OPTIONS = [
  "Create a short link",
  "Redirect to the original URL",
  "Custom aliases",
  "Expiration",
  "Click analytics",
];

export function FoundationScopeStudio() {
  const [step, setStep] = useState(0);
  const [scope, setScope] = useState<ScopeState>({
    clients: "",
    features: ["Create a short link", "Redirect to the original URL"],
    newUrlsPerDay: 1_000_000,
    readsPerWrite: 100,
    latency: "",
    retentionYears: 5,
  });
  const [submitted, setSubmitted] = useState(false);

  const dailyReads = scope.newUrlsPerDay * scope.readsPerWrite;
  const averageReadQps = dailyReads / 86_400;
  const peakReadQps = averageReadQps * 5;
  const storedMappings = scope.newUrlsPerDay * 365 * scope.retentionYears;

  const canContinue =
    (step === 0 && Boolean(scope.clients)) ||
    (step === 1 && scope.features.length >= 2) ||
    step === 2 ||
    (step === 3 && Boolean(scope.latency));

  const implications = useMemo(
    () => [
      {
        icon: Users,
        title: "Read path dominates",
        body: `${scope.readsPerWrite}:1 reads to writes means redirect latency matters more than link creation latency.`,
      },
      {
        icon: Gauge,
        title: "Design for the peak",
        body: `About ${Math.round(peakReadQps).toLocaleString()} redirects/s at a 5× peak. Start simple, but remove a single hot read bottleneck.`,
      },
      {
        icon: Network,
        title: "Separate bytes from behavior",
        body: `${Math.round(storedMappings / 1_000_000).toLocaleString()}M mappings over ${scope.retentionYears} years. The mapping is small; a viral key is the harder case.`,
      },
    ],
    [peakReadQps, scope.readsPerWrite, scope.retentionYears, storedMappings],
  );

  function toggleFeature(feature: string) {
    setScope((current) => ({
      ...current,
      features: current.features.includes(feature)
        ? current.features.filter((item) => item !== feature)
        : [...current.features, feature],
    }));
  }

  function finish() {
    setSubmitted(true);
    recordExercise("foundation-url-shortener-scope");
    recordQuiz("foundation-scope-first", {
      correct: scope.features.length <= 4,
      area: "foundations",
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <LearnPathHeader stageId="grow" detail="Foundation exercise" />
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(360px,1.15fr)]">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Understand before architecture
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Design a URL shortener
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Resist the urge to draw a cache. First turn the sentence into an
            agreed product, workload, and quality bar. Your answers will create
            the design brief automatically.
          </p>

          <ol className="mt-8 space-y-2">
            {STEPS.map((item, index) => (
              <li key={item.title}>
                <button
                  type="button"
                  onClick={() => setStep(index)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left",
                    index === step
                      ? "border-primary/50 bg-primary/5"
                      : "border-border hover:bg-accent/50",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                      index < step
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border",
                    )}
                  >
                    {index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{item.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                      {item.why}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <div className="mt-6 rounded-xl border border-dashed border-primary/35 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <CircleHelp className="h-4 w-4 text-primary" />
              Interview habit
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              State a reasonable assumption when the interviewer will not give
              a number. The signal is that you notice the unknown and understand
              which decision it affects.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          {!submitted ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Question {step + 1} of {STEPS.length}
              </p>
              <h2 className="mt-2 text-xl font-semibold">{STEPS[step]!.question}</h2>

              {step === 0 ? (
                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  {["Web", "Mobile", "Web + mobile"].map((client) => (
                    <Choice
                      key={client}
                      active={scope.clients === client}
                      onClick={() => setScope((current) => ({ ...current, clients: client }))}
                    >
                      {client}
                    </Choice>
                  ))}
                </div>
              ) : null}

              {step === 1 ? (
                <div className="mt-5 space-y-2">
                  {FEATURE_OPTIONS.map((feature, index) => {
                    const required = index < 2;
                    const active = scope.features.includes(feature);
                    return (
                      <button
                        key={feature}
                        type="button"
                        disabled={required}
                        onClick={() => toggleFeature(feature)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm",
                          active ? "border-primary/40 bg-primary/5" : "border-border",
                          required && "cursor-default",
                        )}
                      >
                        <span>{feature}</span>
                        <span className="text-xs text-muted-foreground">
                          {required ? "core v1" : active ? "included" : "later"}
                        </span>
                      </button>
                    );
                  })}
                  <p className="pt-2 text-xs leading-5 text-muted-foreground">
                    Fewer features create a clearer first design. You can name
                    later work without designing it now.
                  </p>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="mt-5 space-y-5">
                  <NumberField
                    label="New short links per day"
                    value={scope.newUrlsPerDay}
                    min={1_000}
                    max={100_000_000}
                    onChange={(value) =>
                      setScope((current) => ({ ...current, newUrlsPerDay: value }))
                    }
                  />
                  <div>
                    <Label htmlFor="read-ratio">Redirects per new link</Label>
                    <input
                      id="read-ratio"
                      type="range"
                      min={1}
                      max={1000}
                      step={1}
                      value={scope.readsPerWrite}
                      onChange={(event) =>
                        setScope((current) => ({
                          ...current,
                          readsPerWrite: Number(event.target.value),
                        }))
                      }
                      className="mt-3 w-full accent-orange-600"
                    />
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>write-heavy</span>
                      <span className="font-mono text-foreground">
                        {scope.readsPerWrite}:1
                      </span>
                      <span>read-heavy</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-muted p-4 text-sm leading-6">
                    <p>
                      {dailyReads.toLocaleString()} redirects/day
                      <span className="text-muted-foreground"> ≈ </span>
                      {Math.round(averageReadQps).toLocaleString()} average QPS
                    </p>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="mt-5 space-y-5">
                  <div>
                    <Label>Redirect latency target</Label>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      {["< 50 ms", "< 200 ms", "< 1 sec"].map((latency) => (
                        <Choice
                          key={latency}
                          active={scope.latency === latency}
                          onClick={() =>
                            setScope((current) => ({ ...current, latency }))
                          }
                        >
                          {latency}
                        </Choice>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="retention">Keep links for</Label>
                    <div className="mt-2 flex items-center gap-3">
                      <Input
                        id="retention"
                        type="number"
                        min={1}
                        max={20}
                        value={scope.retentionYears}
                        onChange={(event) =>
                          setScope((current) => ({
                            ...current,
                            retentionYears: Math.max(1, Number(event.target.value) || 1),
                          }))
                        }
                        className="max-w-28"
                      />
                      <span className="text-sm text-muted-foreground">years</span>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={step === 0}
                  onClick={() => setStep((current) => Math.max(0, current - 1))}
                >
                  Back
                </Button>
                {step < STEPS.length - 1 ? (
                  <Button
                    type="button"
                    disabled={!canContinue}
                    onClick={() => setStep((current) => current + 1)}
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="button" disabled={!canContinue} onClick={finish}>
                    Build my brief
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </>
          ) : (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Your agreed design scope
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Now architecture has a job</h2>
              <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <Summary label="Clients" value={scope.clients} />
                  <Summary label="v1 features" value={scope.features.join(", ")} />
                  <Summary
                    label="Traffic"
                    value={`${scope.newUrlsPerDay.toLocaleString()} writes/day · ${scope.readsPerWrite}:1 reads`}
                  />
                  <Summary
                    label="Quality"
                    value={`${scope.latency} redirects · ${scope.retentionYears} year retention`}
                  />
                </dl>
              </div>

              <div className="mt-5 space-y-3">
                {implications.map((item) => (
                  <article key={item.title} className="flex gap-3 rounded-xl border border-border p-4">
                    <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <h3 className="text-sm font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {item.body}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Button asChild>
                  <Link href="/learn/estimate/tinypath">
                    Estimate it
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/learn/problems/url-shortener">
                    Design on the canvas
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs text-muted-foreground hover:text-foreground"
              >
                Edit assumptions
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-3 py-3 text-sm font-medium",
        active
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) =>
          onChange(Math.min(max, Math.max(min, Number(event.target.value) || min)))
        }
        className="mt-2"
      />
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 leading-6">{value}</dd>
    </div>
  );
}
