"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import {
  ArrowRight,
  BarChart3,
  Blocks,
  Brain,
  Calculator,
  Check,
  Network,
  PencilRuler,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  COURSE_STAGES,
  continueLesson,
  firstLessonOfStage,
  lessonHref,
  lessonsForStage,
  modulesForStage,
  practiceFor,
} from "@/lib/learn/course";
import {
  defaultSyllabusProgress,
  parseSyllabusProgress,
  readSyllabusProgressSnapshot,
  subscribeSyllabusProgress,
} from "@/lib/learn/syllabus-progress";
import {
  defaultProblemProgress,
  parseProblemProgress,
  readProblemProgressSnapshot,
  subscribeProblemProgress,
} from "@/lib/learn/problem-progress";
import { PRACTICE_PROBLEMS, problemHref } from "@/lib/learn/problems";
import { rateLimiterLessonHref } from "@/lib/learn/rate-limiter-course";
import { allLessons } from "@/lib/learn/syllabus";
import { cn } from "@/lib/utils";

const SKILL_AREAS = [
  {
    title: "Think before drawing",
    detail: "Requirements, scope, assumptions, and trade-offs",
    href: "/learn/mindset",
    icon: Brain,
  },
  {
    title: "Estimate the load",
    detail: "QPS, storage, bandwidth, latency, availability",
    href: "/learn/estimate/lumen",
    icon: Calculator,
  },
  {
    title: "Evolve the system",
    detail: "One box → replicas, cache, queues, shards",
    href: "/learn/from-zero",
    icon: Network,
  },
  {
    title: "Understand components",
    detail: "Problem → building block → trade-off",
    href: "/learn/concepts/dns",
    icon: Blocks,
  },
  {
    title: "Run the interview",
    detail: "Scope, blueprint, deep dive, wrap",
    href: "/learn/approach/scope",
    icon: Timer,
  },
  {
    title: "Design real systems",
    detail: "Written prompts, canvas, coaching, evaluation",
    href: "/learn#designs",
    icon: PencilRuler,
  },
] as const;

export function LearnHub() {
  const lessonSnap = useSyncExternalStore(
    subscribeSyllabusProgress,
    readSyllabusProgressSnapshot,
    () => "",
  );
  const problemSnap = useSyncExternalStore(
    subscribeProblemProgress,
    readProblemProgressSnapshot,
    () => "",
  );
  const progress = useMemo(() => {
    if (!lessonSnap) return defaultSyllabusProgress();
    try {
      return parseSyllabusProgress(JSON.parse(lessonSnap));
    } catch {
      return defaultSyllabusProgress();
    }
  }, [lessonSnap]);
  const problemsDone = useMemo(() => {
    if (!problemSnap) return defaultProblemProgress();
    try {
      return parseProblemProgress(JSON.parse(problemSnap));
    } catch {
      return defaultProblemProgress();
    }
  }, [problemSnap]);

  const lessons = allLessons();
  const doneCount = lessons.filter((lesson) =>
    progress.completed.includes(lesson.slug),
  ).length;
  const nextLesson = continueLesson(progress.completed);
  const nextProblem = PRACTICE_PROBLEMS.find(
    (item) => !problemsDone.completed.includes(item.id),
  );
  const started = doneCount > 0 || problemsDone.completed.length > 0;
  const lessonsDone = doneCount >= lessons.length;
  const continueHref = !lessonsDone
    ? lessonHref(nextLesson.slug)
    : nextProblem
      ? problemHref(nextProblem.id)
      : "/learn#designs";
  const continueLabel = !started ? "Start" : lessonsDone && !nextProblem ? "Review" : "Continue";
  const continueHint = !started
    ? `${lessons.length} lessons, then ${PRACTICE_PROBLEMS.length} systems to design`
    : !lessonsDone
      ? nextLesson.title
      : nextProblem
        ? `Design ${nextProblem.title}`
        : "You have designed every system on the path.";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        System design path
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Get better at system design
      </h1>
      <p className="mt-4 text-base leading-7 text-muted-foreground">
        One path. Grow a product from a single box, learn to size it, learn to
        run the hour — then design the systems you will actually be asked:
        rate limiter, short links, feed, chat, video, files, and the rest.
        The brief is written. You draw.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button asChild>
          <Link href={continueHref}>
            {continueLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">{continueHint}</p>
        <Button asChild variant="ghost">
          <Link href="/learn/progress">
            <BarChart3 className="h-4 w-4" />
            My progress
          </Link>
        </Button>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{
            width: `${Math.min(
              100,
              ((doneCount + problemsDone.completed.length) /
                Math.max(lessons.length + PRACTICE_PROBLEMS.length, 1)) *
                100,
            )}%`,
          }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {doneCount}/{lessons.length} lessons · {problemsDone.completed.length}/
        {PRACTICE_PROBLEMS.length} systems
      </p>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Learning map
            </p>
            <h2 className="mt-1 text-xl font-semibold">Choose the skill that is blocking you</h2>
          </div>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Understand → estimate → design → question → simulate → iterate
          </p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SKILL_AREAS.map((area) => (
            <Link
              key={area.title}
              href={area.href}
              className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <area.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 text-sm font-semibold">{area.title}</h3>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{area.detail}</p>
              <span className="mt-3 inline-flex text-xs font-medium text-primary group-hover:underline">
                Open module →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <ol className="mt-12 space-y-12">
        {COURSE_STAGES.map((stage) =>
          stage.id === "designs" ? (
            <ProblemsStage
              key={stage.id}
              completed={problemsDone.completed}
            />
          ) : (
            <LessonStage
              key={stage.id}
              stage={stage}
              completed={progress.completed}
            />
          ),
        )}
      </ol>
    </div>
  );
}

function LessonStage({
  stage,
  completed,
}: {
  stage: (typeof COURSE_STAGES)[number];
  completed: string[];
}) {
  const stageLessons = lessonsForStage(stage);
  const stageDone = stageLessons.filter((lesson) => completed.includes(lesson.slug)).length;
  const first = firstLessonOfStage(stage);
  return (
    <li id={stage.id}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Stage {stage.number} of {COURSE_STAGES.length}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">{stage.title}</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          {stageDone}/{stageLessons.length}
        </p>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{stage.blurb}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{stage.cue}</p>
      <div className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card">
        {modulesForStage(stage).map((module) => (
          <div key={module.id}>
            {stage.moduleIds.length > 1 ? (
              <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {module.title}
              </p>
            ) : null}
            <ul>
              {module.lessons.map((lesson) => {
                const complete = completed.includes(lesson.slug);
                const action = practiceFor(lesson);
                return (
                  <li key={lesson.slug}>
                    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                      <Link
                        href={lessonHref(lesson.slug)}
                        className="flex min-w-0 items-center gap-3 hover:text-foreground"
                      >
                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                            complete
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border",
                          )}
                        >
                          {complete ? <Check className="h-3 w-3" /> : null}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">
                            {lesson.title}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {lesson.minutes} min
                          </span>
                        </span>
                      </Link>
                      {action ? (
                        <Link
                          href={action.href}
                          className="shrink-0 text-xs font-medium text-primary hover:underline"
                        >
                          {action.label}
                        </Link>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      {first ? (
        <Link
          href={lessonHref(first.slug)}
          className="mt-3 inline-block text-sm text-primary hover:underline"
        >
          Open stage {stage.number}
        </Link>
      ) : null}
    </li>
  );
}

function ProblemsStage({ completed }: { completed: string[] }) {
  const stage = COURSE_STAGES.find((item) => item.id === "designs")!;
  return (
    <li id="designs">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Stage {stage.number} of {COURSE_STAGES.length}
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">{stage.title}</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          {completed.length}/{PRACTICE_PROBLEMS.length}
        </p>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{stage.blurb}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{stage.cue}</p>
      <div className="mt-4 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm leading-6">
        <span className="font-medium">New here? </span>
        <span className="text-muted-foreground">
          Follow the order below. Each studio starts with only a client, so you
          build the design yourself. “Coach me” breaks it into four small moves.
        </span>
      </div>
      <ul className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card">
        {PRACTICE_PROBLEMS.map((problem, index) => {
          const complete = completed.includes(problem.id);
          return (
            <li key={problem.id}>
              <Link
                href={
                  problem.id === "rate-limiter"
                    ? rateLimiterLessonHref()
                    : problemHref(problem.id)
                }
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-accent/50"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
                      complete
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {complete ? <Check className="h-3 w-3" /> : index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{problem.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {problem.product} · {problem.minutes} min · 4 guided moves
                    </span>
                  </span>
                </span>
                <span className="text-xs font-medium text-primary">
                  {problem.id === "rate-limiter" ? "Learn step by step" : "Design this"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </li>
  );
}
