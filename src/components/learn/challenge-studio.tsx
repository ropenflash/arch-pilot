"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Lightbulb,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { ArchitectureStudio } from "@/components/architecture/architecture-studio";
import { LearnPathHeader } from "@/components/learn/learn-chrome";
import { Button } from "@/components/ui/button";
import {
  FROM_ZERO_STEPS,
  getStep,
  gradeCanvasStep,
  stepIndexById,
  type CanvasStep,
  type LearnStep,
  type QuizStep,
} from "@/lib/learn/campaign";
import { lessonForPractice } from "@/lib/learn/syllabus";
import {
  defaultLearnProgress,
  parseLearnProgress,
  readLearnProgressSnapshot,
  saveLearnProgress,
  subscribeLearnProgress,
  type LearnProgress,
} from "@/lib/learn/progress";
import { cn } from "@/lib/utils";
import type { SystemDesign } from "@/lib/architecture/validation";

function isCanvas(step: LearnStep): step is CanvasStep {
  return step.kind === "canvas";
}

function isQuiz(step: LearnStep): step is QuizStep {
  return step.kind === "quiz";
}

function designFor(step: LearnStep, stored: SystemDesign | null) {
  if (stored) return stored;
  if (isCanvas(step)) return step.starter();
  const first = FROM_ZERO_STEPS.find(isCanvas);
  return first ? first.starter() : stored;
}

export function ChallengeStudio({ stepId: routeStepId }: { stepId: string }) {
  const router = useRouter();
  const snapshot = useSyncExternalStore(
    subscribeLearnProgress,
    readLearnProgressSnapshot,
    () => "",
  );
  const stored = useMemo(() => {
    if (!snapshot) return defaultLearnProgress();
    try {
      return parseLearnProgress(JSON.parse(snapshot));
    } catch {
      return defaultLearnProgress();
    }
  }, [snapshot]);
  const [checked, setChecked] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);

  const stepId = stepIndexById(routeStepId) >= 0 ? routeStepId : stored.stepId;
  const progress: LearnProgress = useMemo(
    () => ({ ...stored, stepId }),
    [stored, stepId],
  );
  const step = getStep(progress.stepId);
  const relatedLesson = lessonForPractice(step.id);
  const design = useMemo(
    () => designFor(step, progress.design),
    [progress.design, step],
  );
  const index = Math.max(0, stepIndexById(step.id));
  const total = FROM_ZERO_STEPS.length;
  const isLast = index === total - 1;
  const nextStep = FROM_ZERO_STEPS[index + 1];
  const prevStep = FROM_ZERO_STEPS[index - 1];
  const revealed = progress.hints[step.id] ?? 0;

  const canvasGrade = useMemo(() => {
    if (!design || !isCanvas(step)) return null;
    return gradeCanvasStep(step, design);
  }, [design, step]);

  const quizChoiceId = progress.quizAnswers[step.id];
  const quizChoice = isQuiz(step)
    ? step.choices.find((choice) => choice.id === quizChoiceId)
    : undefined;
  const quizPassed = Boolean(quizChoice?.correct);
  const canvasPassed = canvasGrade?.passed ?? false;
  const passed = isQuiz(step) ? quizPassed : canvasPassed;
  const completedAll = total > 0 && progress.completed.length >= total;

  function goTo(id: string, nextDesign?: SystemDesign | null) {
    setChecked(false);
    saveLearnProgress({
      ...progress,
      stepId: id,
      design: nextDesign === undefined ? progress.design ?? design : nextDesign,
    });
    router.push(`/learn/from-zero/${id}`);
  }

  function onDesignChange(next: SystemDesign) {
    saveLearnProgress({
      ...progress,
      design: next,
    });
  }

  function revealHint() {
    saveLearnProgress({
      ...progress,
      design: progress.design ?? design,
      hints: {
        ...progress.hints,
        [step.id]: Math.min((progress.hints[step.id] ?? 0) + 1, step.hints.length),
      },
    });
  }

  function resetBoard() {
    if (!isCanvas(step)) return;
    setCanvasKey((value) => value + 1);
    setChecked(false);
    saveLearnProgress({ ...progress, design: step.starter() });
  }

  function markCompleteAndAdvance() {
    const completed = progress.completed.includes(step.id)
      ? progress.completed
      : [...progress.completed, step.id];
    saveLearnProgress({
      ...progress,
      stepId: nextStep?.id ?? progress.stepId,
      completed,
      design: progress.design ?? design,
    });
    if (nextStep) {
      router.push(`/learn/from-zero/${nextStep.id}`);
    }
  }

  function pickChoice(id: string) {
    setChecked(true);
    saveLearnProgress({
      ...progress,
      design: progress.design ?? design,
      quizAnswers: { ...progress.quizAnswers, [step.id]: id },
    });
  }

  if (!design) {
    return (
      <p className="px-6 py-16 text-sm text-muted-foreground">
        Loading the round…
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <LearnPathHeader
          stageId="grow"
          detail={`Round ${index + 1} of ${total}`}
          className="mb-0"
        />
        {relatedLesson ? (
          <Link
            href={`/learn/lessons/${relatedLesson.slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <BookOpen className="h-4 w-4" />
            Read the lesson
          </Link>
        ) : null}
      </div>

      <div className="mb-6">
        <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="rounded-full bg-primary transition-all"
            style={{ width: `${((index + (passed ? 1 : 0)) / total) * 100}%` }}
          />
        </div>
        <div className="mt-3 flex gap-1 overflow-x-auto">
          {FROM_ZERO_STEPS.map((item, itemIndex) => {
            const done = progress.completed.includes(item.id);
            const active = item.id === step.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(item.id)}
                className={cn(
                  "h-2 w-8 shrink-0 rounded-full",
                  active && "bg-primary",
                  !active && done && "bg-primary/50",
                  !active && !done && "bg-muted-foreground/25",
                )}
                aria-label={`Round ${itemIndex + 1}: ${item.title}`}
              />
            );
          })}
        </div>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(320px,400px)_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            {step.kicker}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            {step.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.story}</p>
          <div className="mt-4 rounded-xl bg-primary/10 px-4 py-3 text-sm leading-6 text-foreground">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Your move
            </p>
            <p className="mt-1">{step.prompt}</p>
          </div>

          {isCanvas(step) && canvasGrade ? (
            <ul className="mt-5 space-y-2">
              {canvasGrade.results.map((result) => (
                <li
                  key={result.id}
                  className="flex items-start gap-2.5 text-sm leading-5"
                >
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
                  <span className={result.ok ? "text-foreground" : "text-muted-foreground"}>
                    {result.label}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {isQuiz(step) ? (
            <div className="mt-5 space-y-2">
              <p className="text-sm font-medium">{step.question}</p>
              {step.choices.map((choice) => {
                const selected = quizChoiceId === choice.id;
                const show = selected && checked;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => pickChoice(choice.id)}
                    className={cn(
                      "w-full rounded-xl border px-3 py-3 text-left text-sm leading-6 transition-colors",
                      selected
                        ? choice.correct
                          ? "border-primary bg-primary/10"
                          : "border-destructive bg-destructive/10"
                        : "border-border hover:border-primary/50 hover:bg-accent",
                    )}
                  >
                    {choice.label}
                    {show ? (
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {choice.feedback}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}

          {passed ? (
            <div className="mt-5 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm leading-6">
              <p className="font-semibold text-foreground">
                {isLast ? "You shipped the board." : "Nice. Traffic just grew."}
              </p>
              <p className="mt-1 text-muted-foreground">{step.why}</p>
            </div>
          ) : null}

          {revealed > 0 ? (
            <ol className="mt-5 space-y-2">
              {step.hints.slice(0, revealed).map((hint) => (
                <li
                  key={hint}
                  className="rounded-xl border border-dashed border-primary/40 bg-background px-3 py-2 text-sm leading-6 text-muted-foreground"
                >
                  <span className="font-medium text-primary">Hint. </span>
                  {hint}
                </li>
              ))}
            </ol>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            {isCanvas(step) ? (
              <Button
                type="button"
                variant={passed ? "secondary" : "default"}
                onClick={() => setChecked(true)}
              >
                Check my design
              </Button>
            ) : null}
            {passed ? (
              <Button type="button" onClick={markCompleteAndAdvance}>
                {isLast ? (
                  <>
                    <Trophy className="h-4 w-4" />
                    Finish
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={revealHint}
                disabled={revealed >= step.hints.length}
              >
                <Lightbulb className="h-4 w-4" />
                {revealed >= step.hints.length ? "All hints shown" : "Need a hint?"}
              </Button>
            )}
            {isCanvas(step) ? (
              <Button type="button" variant="ghost" onClick={resetBoard}>
                <RotateCcw className="h-4 w-4" />
                Reset board
              </Button>
            ) : null}
          </div>

          {checked && isCanvas(step) && !passed ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Not yet. Fill the red rows, or take a hint. Start from the simplest
              missing piece.
            </p>
          ) : null}

          <div className="mt-6 flex justify-between text-sm">
            {prevStep ? (
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => goTo(prevStep.id)}
              >
                Previous
              </button>
            ) : (
              <span />
            )}
            {nextStep && progress.completed.includes(step.id) ? (
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => goTo(nextStep.id)}
              >
                Skip ahead
              </button>
            ) : null}
          </div>
        </aside>

        <div className="min-w-0">
          <ArchitectureStudio
            design={design}
            onDesignChange={isQuiz(step) ? undefined : onDesignChange}
            readOnly={isQuiz(step)}
            canvasKey={`${step.id}-${canvasKey}`}
            showInspector={false}
            highlightTypes={isCanvas(step) ? step.highlight : []}
            compact
          />
          {completedAll ? (
            <p className="mt-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
              Stage 1 complete.{" "}
              <Link href="/learn#designs" className="font-medium text-primary">
                Design a real system
              </Link>{" "}
              from the path — the prompt is already written.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
