"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { Check, Lightbulb } from "lucide-react";
import { ArchitectureStudio } from "@/components/architecture/architecture-studio";
import { LearnPathHeader } from "@/components/learn/learn-chrome";
import { Button } from "@/components/ui/button";
import { evaluateChecks } from "@/lib/learn/grade";
import {
  PRACTICE_PROBLEMS,
  getProblem,
  problemHref,
  starterForProblem,
} from "@/lib/learn/problems";
import {
  defaultProblemProgress,
  parseProblemProgress,
  readProblemProgressSnapshot,
  saveProblemProgress,
  subscribeProblemProgress,
} from "@/lib/learn/problem-progress";
import { cn } from "@/lib/utils";
import type { SystemDesign } from "@/lib/architecture/validation";

export function ProblemStudio({ problemId }: { problemId: string }) {
  const problem = getProblem(problemId) ?? PRACTICE_PROBLEMS[0]!;
  const index = PRACTICE_PROBLEMS.findIndex((item) => item.id === problem.id);
  const next = PRACTICE_PROBLEMS[index + 1];
  const prev = PRACTICE_PROBLEMS[index - 1];

  const snapshot = useSyncExternalStore(
    subscribeProblemProgress,
    readProblemProgressSnapshot,
    () => "",
  );
  const progress = useMemo(() => {
    if (!snapshot) return defaultProblemProgress();
    try {
      return parseProblemProgress(JSON.parse(snapshot));
    } catch {
      return defaultProblemProgress();
    }
  }, [snapshot]);

  const [design, setDesign] = useState<SystemDesign>(() => starterForProblem(problem));
  const [checked, setChecked] = useState(false);
  const [hint, setHint] = useState(false);
  const grade = useMemo(() => evaluateChecks(design, problem.checks), [design, problem]);
  const done = progress.completed.includes(problem.id);

  function markDone() {
    if (done) return;
    saveProblemProgress({ completed: [...progress.completed, problem.id] });
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
      <LearnPathHeader
        stageId="designs"
        detail={`${index + 1} of ${PRACTICE_PROBLEMS.length}`}
      />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(300px,380px)_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {problem.product} · ~{problem.minutes} min
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{problem.title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{problem.prompt}</p>

          <h2 className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            v1 — only this
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            {problem.v1.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <p className="mt-4 text-sm leading-6">
            <span className="font-medium">Scale to say out loud. </span>
            <span className="text-muted-foreground">{problem.scale}</span>
          </p>
          <p className="mt-2 text-sm leading-6">
            <span className="font-medium">Go deep on. </span>
            <span className="text-muted-foreground">{problem.deepDive}</span>
          </p>
          <p className="mt-2 text-sm leading-6">
            <span className="font-medium">Skip. </span>
            <span className="text-muted-foreground">{problem.skip}</span>
          </p>

          <ul className="mt-5 space-y-2">
            {grade.results.map((result) => (
              <li key={result.id} className="flex items-start gap-2.5 text-sm leading-5">
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                    result.ok
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground",
                  )}
                >
                  {result.ok ? <Check className="h-3 w-3" /> : null}
                </span>
                {result.label}
              </li>
            ))}
          </ul>

          {hint ? (
            <p className="mt-4 rounded-xl border border-dashed border-primary/40 px-3 py-2 text-sm leading-6 text-muted-foreground">
              <Lightbulb className="mr-1 inline h-4 w-4 text-primary" />
              Use the hour: scope v1, draw boxes, napkin-check QPS, then zoom the
              risky path. Do not invent extra products.
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="button" variant={grade.passed ? "secondary" : "default"} onClick={() => setChecked(true)}>
              Check my board
            </Button>
            {grade.passed ? (
              <Button type="button" onClick={markDone}>
                {done ? "Saved" : "Mark done"}
                <Check className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => setHint(true)}>
                Need a hint?
              </Button>
            )}
          </div>
          {checked && !grade.passed ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Fill the empty rows. Start from the client and the v1 list.
            </p>
          ) : null}

          <div className="mt-6 flex justify-between text-sm">
            {prev ? (
              <Link href={problemHref(prev.id)} className="text-muted-foreground hover:text-foreground">
                ← {prev.title}
              </Link>
            ) : (
              <Link href="/learn#designs" className="text-muted-foreground hover:text-foreground">
                ← Path
              </Link>
            )}
            {next ? (
              <Link href={problemHref(next.id)} className="font-medium text-primary hover:underline">
                {next.title} →
              </Link>
            ) : (
              <Link href="/learn#designs" className="font-medium text-primary hover:underline">
                Back to the path →
              </Link>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          <ArchitectureStudio
            design={design}
            onDesignChange={(nextDesign) => {
              setDesign(nextDesign);
              setChecked(false);
            }}
            showInspector={false}
            compact
            canvasKey={problem.id}
          />
        </div>
      </div>
    </div>
  );
}
