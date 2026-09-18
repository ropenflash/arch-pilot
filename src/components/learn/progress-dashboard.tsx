"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { ArrowRight, BarChart3, CheckCircle2, Target } from "lucide-react";
import { LearnPathHeader } from "@/components/learn/learn-chrome";
import { FROM_ZERO_STEPS } from "@/lib/learn/campaign";
import {
  defaultLearnProgress,
  parseLearnProgress,
  readLearnProgressSnapshot,
  subscribeLearnProgress,
} from "@/lib/learn/progress";
import {
  defaultPlatformProgress,
  parsePlatformProgress,
  readPlatformProgressSnapshot,
  subscribePlatformProgress,
} from "@/lib/learn/platform-progress";
import {
  defaultProblemProgress,
  parseProblemProgress,
  readProblemProgressSnapshot,
  subscribeProblemProgress,
} from "@/lib/learn/problem-progress";
import { PRACTICE_PROBLEMS } from "@/lib/learn/problems";
import {
  defaultSyllabusProgress,
  parseSyllabusProgress,
  readSyllabusProgressSnapshot,
  subscribeSyllabusProgress,
} from "@/lib/learn/syllabus-progress";

function parse<T>(snapshot: string, parser: (value: unknown) => T, fallback: () => T) {
  if (!snapshot) return fallback();
  try {
    return parser(JSON.parse(snapshot));
  } catch {
    return fallback();
  }
}

export function ProgressDashboard() {
  const syllabusSnapshot = useSyncExternalStore(
    subscribeSyllabusProgress,
    readSyllabusProgressSnapshot,
    () => "",
  );
  const campaignSnapshot = useSyncExternalStore(
    subscribeLearnProgress,
    readLearnProgressSnapshot,
    () => "",
  );
  const problemsSnapshot = useSyncExternalStore(
    subscribeProblemProgress,
    readProblemProgressSnapshot,
    () => "",
  );
  const platformSnapshot = useSyncExternalStore(
    subscribePlatformProgress,
    readPlatformProgressSnapshot,
    () => "",
  );

  const data = useMemo(() => {
    const syllabus = parse(
      syllabusSnapshot,
      parseSyllabusProgress,
      defaultSyllabusProgress,
    );
    const campaign = parse(campaignSnapshot, parseLearnProgress, defaultLearnProgress);
    const problems = parse(
      problemsSnapshot,
      parseProblemProgress,
      defaultProblemProgress,
    );
    const platform = parse(
      platformSnapshot,
      parsePlatformProgress,
      defaultPlatformProgress,
    );
    return { syllabus, campaign, problems, platform };
  }, [campaignSnapshot, platformSnapshot, problemsSnapshot, syllabusSnapshot]);

  const distributedSlugs = [
    "replicas",
    "stateless-web",
    "multi-dc",
    "queues",
    "sharding",
  ];
  const interviewSlugs = [
    "scope-the-hour",
    "blueprint-and-buy-in",
    "deep-dive-choices",
    "wrap-the-session",
  ];

  const quizzes = Object.values(data.platform.quizAttempts);
  const quizCorrect = quizzes.filter((item) => item.correct).length;
  const tracks = [
    {
      id: "foundations",
      title: "System design foundations",
      done:
        data.platform.concepts.filter((id) => id.startsWith("mindset-")).length +
        (data.platform.exercises.includes("foundation-url-shortener-scope") ? 1 : 0),
      total: 9,
      href: "/learn/mindset",
    },
    {
      id: "scalability",
      title: "Scalability",
      done: data.campaign.completed.length,
      total: FROM_ZERO_STEPS.length,
      href: "/learn/from-zero",
    },
    {
      id: "distributed",
      title: "Distributed systems",
      done:
        distributedSlugs.filter((slug) => data.syllabus.completed.includes(slug)).length +
        data.platform.concepts.filter((id) =>
          ["sharding", "consistent-hashing", "replication"].includes(id),
        ).length,
      total: distributedSlugs.length + 3,
      href: "/learn#grow",
    },
    {
      id: "interview",
      title: "Interview practice",
      done:
        interviewSlugs.filter((slug) => data.syllabus.completed.includes(slug)).length +
        data.problems.completed.length,
      total: interviewSlugs.length + PRACTICE_PROBLEMS.length,
      href: "/learn#designs",
    },
  ];

  const weakAreas = (["foundations", "scalability", "distributed", "interview"] as const)
    .map((area) => {
      const attempts = quizzes.filter((item) => item.area === area);
      const wrong = attempts.filter((item) => !item.correct).length;
      return { area, attempts: attempts.length, wrong };
    })
    .filter((item) => item.wrong > 0)
    .sort((a, b) => b.wrong - a.wrong);

  const totalDone =
    data.syllabus.completed.length +
    data.campaign.completed.length +
    data.problems.completed.length +
    data.platform.exercises.length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <LearnPathHeader stageId="grow" detail="Progress" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Learning dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Know what to practice next</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Progress reflects concepts understood, architecture exercises, and
            scenario questions. It is a diagnostic—not a points system.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <p className="text-2xl font-semibold">{totalDone}</p>
          <p className="text-xs text-muted-foreground">learning steps completed</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {tracks.map((track) => {
          const percent = Math.min(100, Math.round((track.done / track.total) * 100));
          return (
            <article key={track.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.1em]">
                  {track.title}
                </h2>
                <span className="font-mono text-xs text-muted-foreground">{percent}%</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {track.done} of {track.total}
                </span>
                <Link href={track.href} className="font-medium text-primary hover:underline">
                  Continue →
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <BarChart3 className="h-4 w-4 text-primary" />
            Quiz reasoning
          </h2>
          {quizzes.length ? (
            <div className="mt-4">
              <p className="text-3xl font-semibold">
                {Math.round((quizCorrect / quizzes.length) * 100)}%
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {quizCorrect} of {quizzes.length} latest attempts
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-dashed border-border p-4">
              <p className="text-sm font-medium">No scenario answers yet</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Complete the requirements exercise or a concept module. Only
                your latest answer is counted.
              </p>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Target className="h-4 w-4 text-primary" />
            Areas to revisit
          </h2>
          {weakAreas.length ? (
            <ul className="mt-4 space-y-2">
              {weakAreas.map((item) => (
                <li
                  key={item.area}
                  className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm"
                >
                  <span className="capitalize">{item.area}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.wrong} assumption{item.wrong === 1 ? "" : "s"} to revisit
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 flex gap-3 rounded-lg border border-dashed border-border p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">No weak signal yet</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  This will become useful after a few scenario questions.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

      <Link
        href="/learn"
        className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        Return to learning map
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
