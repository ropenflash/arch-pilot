"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Circle,
  MessageSquare,
  PencilLine,
} from "lucide-react";
import { LearnPathHeader } from "@/components/learn/learn-chrome";
import { Button } from "@/components/ui/button";
import {
  MINDSET_LESSONS,
  mindsetLessonHref,
  type MindsetLesson,
} from "@/lib/learn/mindset";
import { recordConcept, recordQuiz } from "@/lib/learn/platform-progress";
import { cn } from "@/lib/utils";

export function MindsetStudio({ lesson }: { lesson: MindsetLesson }) {
  const index = MINDSET_LESSONS.findIndex((item) => item.id === lesson.id);
  const previous = MINDSET_LESSONS[index - 1];
  const next = MINDSET_LESSONS[index + 1];
  const [answer, setAnswer] = useState<string | null>(null);
  const selected = lesson.quiz.choices.find((item) => item.id === answer);

  function choose(id: string) {
    const choice = lesson.quiz.choices.find((item) => item.id === id);
    setAnswer(id);
    if (!choice) return;
    recordQuiz(`mindset-${lesson.id}`, {
      correct: choice.correct,
      area: "foundations",
    });
    if (choice.correct) recordConcept(`mindset-${lesson.id}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid items-start gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-20">
          <LearnPathHeader stageId="grow" detail="Design mindset" />
          <p className="text-xs leading-5 text-muted-foreground">
            Eight habits to practice before memorizing architecture components.
          </p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${((index + 1) / MINDSET_LESSONS.length) * 100}%` }}
            />
          </div>
          <ol className="mt-4 space-y-1">
            {MINDSET_LESSONS.map((item, itemIndex) => (
              <li key={item.id}>
                <Link
                  href={mindsetLessonHref(item.id)}
                  className={cn(
                    "flex gap-2 rounded-lg px-2 py-2 text-sm",
                    item.id === lesson.id
                      ? "bg-primary/10 font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <span className="font-mono text-[10px]">{String(itemIndex + 1).padStart(2, "0")}</span>
                  <span>{item.title}</span>
                </Link>
              </li>
            ))}
          </ol>
        </aside>

        <main className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Foundation {index + 1} of {MINDSET_LESSONS.length} · {lesson.minutes} min
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {lesson.title}
          </h1>

          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            <article className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Concept
              </p>
              <p className="mt-3 text-base leading-7">{lesson.concept}</p>
            </article>
            <article className="rounded-xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Why it matters
              </p>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{lesson.why}</p>
            </article>
          </section>

          <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Visual
            </p>
            <div className="mt-5 flex min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              {lesson.visual.map((item, itemIndex) => (
                <div key={item.label} className="contents">
                  <div className="flex-1 rounded-xl border border-border bg-muted/40 p-4 text-center">
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  {itemIndex < lesson.visual.length - 1 ? (
                    <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-primary sm:rotate-0" />
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-red-500/25 bg-red-500/5 p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                Common mistake
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {lesson.commonMistake}
              </p>
            </article>
            <article className="rounded-xl border border-primary/25 bg-primary/5 p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <MessageSquare className="h-4 w-4 text-primary" />
                Interview question
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {lesson.interviewQuestion}
              </p>
            </article>
          </div>

          <section className="mt-6 flex gap-3 rounded-xl border border-dashed border-primary/40 p-5">
            <PencilLine className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-sm font-semibold">Try it</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{lesson.tryIt}</p>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Scenario check
            </p>
            <h2 className="mt-2 text-lg font-semibold">{lesson.quiz.question}</h2>
            <div className="mt-4 space-y-2">
              {lesson.quiz.choices.map((choice) => {
                const active = answer === choice.id;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => choose(choice.id)}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 text-left text-sm",
                      !active && "border-border hover:border-primary/40",
                      active && choice.correct && "border-emerald-500/40 bg-emerald-500/10",
                      active && !choice.correct && "border-red-500/40 bg-red-500/10",
                    )}
                  >
                    <span className="flex gap-2">
                      {active && choice.correct ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      {choice.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {selected ? (
              <div className="mt-4 rounded-xl bg-muted p-4">
                <p className="text-sm font-semibold">Why</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{selected.why}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                  Assumption that changes it
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {selected.assumption}
                </p>
              </div>
            ) : null}
          </section>

          <section className="mt-6 rounded-xl border border-border bg-muted/40 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Key takeaways
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-3">
              {lesson.takeaways.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-6">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <nav className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6 text-sm">
            {previous ? (
              <Link
                href={mindsetLessonHref(previous.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                ← {previous.title}
              </Link>
            ) : (
              <Link href="/learn" className="text-muted-foreground hover:text-foreground">
                ← Learning map
              </Link>
            )}
            {next ? (
              <Link
                href={mindsetLessonHref(next.id)}
                className="font-medium text-primary hover:underline"
              >
                Next: {next.title} →
              </Link>
            ) : (
              <Button asChild>
                <Link href="/learn/foundations/url-shortener">
                  Apply it: scope a system
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </nav>
        </main>
      </div>
    </div>
  );
}
