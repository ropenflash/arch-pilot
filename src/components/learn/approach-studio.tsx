"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Check, Clock } from "lucide-react";
import { LearnPathHeader } from "@/components/learn/learn-chrome";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  APPROACH_CLARIFY,
  APPROACH_DO,
  APPROACH_DONT,
  APPROACH_DRILLS,
  APPROACH_SESSION_MINUTES,
  APPROACH_STEPS,
  APPROACH_WRAP_PROMPTS,
  getApproachStep,
  getDrill,
  scoreChoices,
  type ApproachStepId,
} from "@/lib/learn/approach";
import { recordExercise } from "@/lib/learn/platform-progress";

const STEP_IDS: ApproachStepId[] = ["scope", "blueprint", "deep-dive", "wrap"];

export function ApproachStudio({ stepId }: { stepId: string }) {
  const step = getApproachStep(stepId);
  const index = Math.max(0, STEP_IDS.indexOf(step.id));
  const next = APPROACH_STEPS[index + 1];
  const prev = APPROACH_STEPS[index - 1];
  const [drillId, setDrillId] = useState(APPROACH_DRILLS[0]!.id);
  const drill = getDrill(drillId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <LearnPathHeader stageId="hour" detail={`Step ${step.number} of ${APPROACH_STEPS.length}`} />
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        Interview approach
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        How to run the hour
      </h1>
      <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground">
        A system-design session is pairing on an ambiguous problem, not a trivia
        contest and not a production build. The process is the signal: scope,
        sketch, go deep on what hurts, then close. The final boxes matter less
        than how you got there.
      </p>

      <TimeBar activeId={step.id} />

      <nav className="mt-6 flex flex-wrap gap-1 rounded-xl border border-border bg-muted/60 p-1">
        {APPROACH_STEPS.map((item) => (
          <Link
            key={item.id}
            href={`/learn/approach/${item.id}`}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium",
              item.id === step.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.number}. {item.title}
          </Link>
        ))}
      </nav>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]">
        <article className="min-w-0 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Step {step.number} · {step.minutes} · {step.kicker}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">{step.title}</h2>
          <p className="mt-3 text-[15px] leading-7 text-muted-foreground">{step.goal}</p>
          <h3 className="mt-6 text-sm font-semibold">What you do</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] leading-7 text-muted-foreground">
            {step.youDo.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3 className="mt-6 text-sm font-semibold">Watch for</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] leading-7 text-muted-foreground">
            {step.watchFor.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-6 rounded-xl bg-primary/10 px-4 py-3 text-sm leading-6">
            <span className="font-medium">Done when: </span>
            {step.doneWhen}
          </p>

          {step.id === "scope" ? <ClarifyBank /> : null}
          {step.id === "blueprint" ? (
            <p className="mt-6 text-sm leading-6 text-muted-foreground">
              After the boxes exist, size them.{" "}
              <Link href="/learn/estimate/lumen" className="font-medium text-primary hover:underline">
                Open napkin math
              </Link>{" "}
              and run QPS plus storage on the same product you just scoped.
            </p>
          ) : null}
          {step.id === "wrap" ? (
            <ul className="mt-6 space-y-2">
              {APPROACH_WRAP_PROMPTS.map((item) => (
                <li
                  key={item}
                  className="rounded-xl border border-border px-3 py-2 text-sm leading-6"
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </article>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Practice prompt
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {APPROACH_DRILLS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDrillId(item.id)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs",
                    item.id === drillId
                      ? "border-primary bg-primary/10"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {item.title.split("—")[0]}
                </button>
              ))}
            </div>
            <h3 className="mt-3 text-base font-semibold">{drill.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{drill.prompt}</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{drill.setup}</p>
          </div>
          {step.id === "scope" ? (
            <QuestionDrill key={`${drill.id}-q`} drillId={drill.id} kind="questions" />
          ) : null}
          {step.id === "blueprint" ? <BlueprintCard drillId={drill.id} /> : null}
          {step.id === "deep-dive" ? (
            <QuestionDrill key={`${drill.id}-d`} drillId={drill.id} kind="deepDives" />
          ) : null}
          {step.id === "wrap" ? (
            <p className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
              Recap Pulse or Relay in four sentences: v1, the diagram, the risky
              flow, and what 10× users would break. Then ask what they still want.
            </p>
          ) : null}
        </aside>
      </div>

      {step.id === "wrap" ? (
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">Do</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              {APPROACH_DO.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
              Don&apos;t
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground">
              {APPROACH_DONT.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>
      ) : null}

      <div className="mt-8 flex justify-between text-sm">
        {prev ? (
          <Link href={`/learn/approach/${prev.id}`} className="text-muted-foreground hover:text-foreground">
            ← {prev.title}
          </Link>
        ) : (
          <Link href="/learn/estimate" className="text-muted-foreground hover:text-foreground">
            ← Napkin math
          </Link>
        )}
        {next ? (
          <Link href={`/learn/approach/${next.id}`} className="font-medium text-primary hover:underline">
            {next.title} →
          </Link>
        ) : (
          <Link href="/learn#designs" className="font-medium text-primary hover:underline">
            Design a real system →
          </Link>
        )}
      </div>
    </div>
  );
}

function TimeBar({ activeId }: { activeId: ApproachStepId }) {
  const total = APPROACH_STEPS.reduce((sum, step) => sum + (step.minutesLow + step.minutesHigh) / 2, 0);
  return (
    <div className="mt-6 rounded-2xl border border-border bg-card p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        A {APPROACH_SESSION_MINUTES}-minute session (rough split)
      </p>
      <div className="mt-3 flex h-3 overflow-hidden rounded-full">
        {APPROACH_STEPS.map((step) => {
          const share = ((step.minutesLow + step.minutesHigh) / 2 / total) * 100;
          return (
            <div
              key={step.id}
              title={`${step.title} ${step.minutes}`}
              className={cn(
                "h-full",
                step.id === activeId ? "bg-primary" : "bg-primary/25",
              )}
              style={{ width: `${share}%` }}
            />
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {APPROACH_STEPS.map((step) => (
          <span key={step.id} className={cn(step.id === activeId && "font-medium text-foreground")}>
            {step.number}. {step.minutes}
          </span>
        ))}
      </div>
    </div>
  );
}

function ClarifyBank() {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {APPROACH_CLARIFY.map((item) => (
        <div key={item.id} className="rounded-xl border border-border px-3 py-3">
          <p className="text-sm font-medium">{item.prompt}</p>
          <ul className="mt-1 list-disc pl-4 text-xs leading-5 text-muted-foreground">
            {item.examples.map((example) => (
              <li key={example}>{example}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function BlueprintCard({ drillId }: { drillId: string }) {
  const drill = getDrill(drillId);
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        High-level flows
      </p>
      <p className="mt-3 text-sm leading-6">
        <span className="font-medium">Write: </span>
        {drill.blueprint.writePath}
      </p>
      <p className="mt-2 text-sm leading-6">
        <span className="font-medium">Read: </span>
        {drill.blueprint.readPath}
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {drill.blueprint.boxes.map((box) => (
          <li
            key={box}
            className="rounded-md border border-primary/30 bg-primary/5 px-2 py-1 text-xs"
          >
            {box}
          </li>
        ))}
      </ul>
      <Button asChild variant="outline" className="mt-4">
        <Link href="/learn/estimate/lumen">
          Size it
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

function QuestionDrill({
  drillId,
  kind,
}: {
  drillId: string;
  kind: "questions" | "deepDives";
}) {
  const drill = getDrill(drillId);
  const choices = drill[kind];
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const result = useMemo(() => scoreChoices(choices, picked), [choices, picked]);

  function toggle(id: string) {
    setChecked(false);
    setPicked((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        {kind === "questions" ? "Which questions first?" : "Where do you go deep?"}
      </p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Pick the useful ones. Premature rabbit holes count against you.
      </p>
      <ul className="mt-3 space-y-2">
        {choices.map((choice) => {
          const on = picked.includes(choice.id);
          const show = checked && on;
          return (
            <li key={choice.id}>
              <button
                type="button"
                onClick={() => toggle(choice.id)}
                className={cn(
                  "w-full rounded-xl border px-3 py-2 text-left text-sm leading-6",
                  on ? "border-primary bg-primary/10" : "border-border hover:border-primary/40",
                  show && choice.good && "border-primary",
                  show && !choice.good && "border-destructive bg-destructive/10",
                )}
              >
                {choice.label}
                {show ? (
                  <span className="mt-1 block text-xs text-muted-foreground">{choice.why}</span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
      <Button
        type="button"
        className="mt-3"
        onClick={() => {
          setChecked(true);
          recordExercise(`approach-${kind}-${drillId}`);
        }}
      >
        Check my picks
      </Button>
      {checked ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {result.goodPicked} solid, {result.badPicked} premature, {result.missedGood} missed.
          Aim for the solid column only.
        </p>
      ) : null}
    </div>
  );
}
