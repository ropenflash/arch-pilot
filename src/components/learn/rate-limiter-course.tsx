"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Circle, PencilLine } from "lucide-react";
import { LearnPathHeader } from "@/components/learn/learn-chrome";
import { RateLimiterLessonDiagram } from "@/components/learn/rate-limiter-diagrams";
import { Button } from "@/components/ui/button";
import {
  RATE_LIMITER_SECTIONS,
  rateLimiterLessonHref,
  type RateLimiterSection,
} from "@/lib/learn/rate-limiter-course";
import { recordConcept, recordQuiz } from "@/lib/learn/platform-progress";
import { cn } from "@/lib/utils";

export function RateLimiterCourse({
  section,
}: {
  section: RateLimiterSection;
}) {
  const index = RATE_LIMITER_SECTIONS.findIndex((item) => item.id === section.id);
  const previous = RATE_LIMITER_SECTIONS[index - 1];
  const next = RATE_LIMITER_SECTIONS[index + 1];
  const [choice, setChoice] = useState<string | null>(null);

  function chooseAnswer(id: string) {
    const answer = section.checkpoint.choices.find((item) => item.id === id);
    setChoice(id);
    if (!answer) return;
    recordQuiz(`rate-limiter-${section.id}`, {
      correct: answer.correct,
      area: section.id === "distributed" ? "distributed" : "scalability",
    });
    if (answer.correct) recordConcept(`rate-limiter-${section.id}`);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid items-start gap-8 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-20">
          <LearnPathHeader stageId="designs" detail="Rate limiter course" />
          <p className="text-sm font-semibold">Design a rate limiter</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Understand the rule, write the bar, then grow the design one picture at a time.
          </p>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              role="progressbar"
              aria-label="Rate limiter course progress"
              aria-valuemin={1}
              aria-valuemax={RATE_LIMITER_SECTIONS.length}
              aria-valuenow={index + 1}
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${((index + 1) / RATE_LIMITER_SECTIONS.length) * 100}%` }}
            />
          </div>
          <ol className="mt-5 space-y-1">
            {RATE_LIMITER_SECTIONS.map((item, itemIndex) => {
              const active = item.id === section.id;
              return (
                <li key={item.id}>
                  <Link
                    href={rateLimiterLessonHref(item.id)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-start gap-2.5 rounded-lg px-2 py-2 text-sm",
                      active
                        ? "bg-primary/10 font-medium text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : itemIndex < index
                            ? "border-primary/50 text-primary"
                            : "border-border",
                      )}
                    >
                      {itemIndex < index ? <Check className="h-3 w-3" /> : item.number}
                    </span>
                    <span>
                      {item.shortTitle}
                      <span className="block text-[11px] font-normal text-muted-foreground">
                        {item.minutes} min
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
          <Link
            href="/learn/problems/rate-limiter"
            className="mt-5 inline-flex text-xs font-medium text-primary hover:underline"
          >
            Skip to the design challenge →
          </Link>
        </aside>

        <main className="min-w-0">
          <header>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Part {section.number} of {RATE_LIMITER_SECTIONS.length} · {section.minutes} min ·{" "}
              {section.kicker}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {section.title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
              {section.summary}
            </p>
          </header>

          <div className="mt-8 space-y-4 text-[15px] leading-7 text-muted-foreground">
            {section.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {section.examples ? (
            <section className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Rules you already know
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {section.examples.map((example) => (
                  <article
                    key={example.title}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <h2 className="text-sm font-semibold">{example.title}</h2>
                    <p className="mt-2 font-mono text-xs text-primary">{example.rule}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {example.meaning}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {section.benefits ? (
            <section className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Why build one at all
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {section.benefits.map((benefit) => (
                  <article
                    key={benefit.title}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <h2 className="text-sm font-semibold">{benefit.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {benefit.body}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <div className="mt-8">
            <RateLimiterLessonDiagram
              kind={section.diagram}
              interview={section.interview}
            />
          </div>

          {section.decided ? (
            <section className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                What we locked
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {section.decided.map((item) => (
                  <div key={item.title}>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {section.requirements ? (
            <section className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                If you skip a bar
              </p>
              <div className="mt-3 space-y-3">
                {section.requirements.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-xl border border-border bg-card p-4 sm:p-5"
                  >
                    <h2 className="text-sm font-semibold">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.meaning}
                    </p>
                    <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">
                      If you skip it: {item.ifSkipped}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Keep these in mind
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {section.keyPoints.map((point) => (
                <article
                  key={point.title}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <h2 className="text-sm font-semibold">{point.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {point.body}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-2xl border border-border bg-card p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Quick checkpoint
            </p>
            <h2 className="mt-2 text-base font-semibold">{section.checkpoint.question}</h2>
            <div className="mt-4 space-y-2">
              {section.checkpoint.choices.map((item) => {
                const picked = choice === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => chooseAnswer(item.id)}
                    aria-pressed={picked}
                    className={cn(
                      "w-full rounded-xl border px-4 py-3 text-left text-sm leading-6",
                      !picked && "border-border hover:border-primary/40 hover:bg-accent",
                      picked && item.correct && "border-emerald-500/40 bg-emerald-500/10",
                      picked && !item.correct && "border-red-500/40 bg-red-500/10",
                    )}
                  >
                    <span className="flex items-start gap-2">
                      {picked ? (
                        item.correct ? (
                          <Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                        ) : (
                          <Circle className="mt-1 h-4 w-4 shrink-0 text-red-600" />
                        )
                      ) : (
                        <Circle className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span>
                        {item.label}
                        {picked ? (
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {item.why}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mt-6 flex gap-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
            <PencilLine className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-sm font-semibold">Explain it back</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Say this section back in two short sentences. If you cannot, stay
                here before you add another box.
              </p>
            </div>
          </section>

          <nav className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6 text-sm">
            {previous ? (
              <Link
                href={rateLimiterLessonHref(previous.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                ← {previous.shortTitle}
              </Link>
            ) : (
              <Link href="/learn#designs" className="text-muted-foreground hover:text-foreground">
                ← All systems
              </Link>
            )}
            {next ? (
              <Button asChild>
                <Link href={rateLimiterLessonHref(next.id)}>
                  Next: {next.shortTitle}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/learn/problems/rate-limiter">
                  Design it yourself
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
