"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { LearnPathHeader } from "@/components/learn/learn-chrome";
import { RateLimiterLessonDiagram } from "@/components/learn/rate-limiter-diagrams";
import { Button } from "@/components/ui/button";
import {
  RATE_LIMITER_SECTIONS,
  rateLimiterLessonHref,
  type RateLimiterSection,
} from "@/lib/learn/rate-limiter-course";
import { recordConcept } from "@/lib/learn/platform-progress";
import { cn } from "@/lib/utils";

export function RateLimiterCourse({
  section,
}: {
  section: RateLimiterSection;
}) {
  const index = RATE_LIMITER_SECTIONS.findIndex((item) => item.id === section.id);
  const previous = RATE_LIMITER_SECTIONS[index - 1];
  const next = RATE_LIMITER_SECTIONS[index + 1];

  function continueOn() {
    recordConcept(`rate-limiter-${section.id}`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <LearnPathHeader stageId="designs" detail="Rate limiter" />
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Step {section.number} of {RATE_LIMITER_SECTIONS.length}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
        {section.title}
      </h1>
      <ol className="mt-5 flex flex-wrap gap-2">
        {RATE_LIMITER_SECTIONS.map((item, itemIndex) => {
          const active = item.id === section.id;
          return (
            <li key={item.id}>
              <Link
                href={rateLimiterLessonHref(item.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : itemIndex < index
                      ? "border-border text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {itemIndex < index ? <Check className="h-3 w-3 text-primary" /> : null}
                {item.shortTitle}
              </Link>
            </li>
          );
        })}
      </ol>
      <div
        role="progressbar"
        aria-label="Rate limiter lesson progress"
        aria-valuemin={1}
        aria-valuemax={RATE_LIMITER_SECTIONS.length}
        aria-valuenow={index + 1}
        className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${((index + 1) / RATE_LIMITER_SECTIONS.length) * 100}%` }}
        />
      </div>

      <div className="mt-8 max-w-3xl space-y-4 text-[16px] leading-7 text-muted-foreground">
        {section.teach.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-8">
        <RateLimiterLessonDiagram kind={section.diagram} />
      </div>

      <p className="mt-8 max-w-3xl text-sm leading-6 text-foreground">
        {section.takeaway}
      </p>

      <nav className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6">
        {previous ? (
          <Link
            href={rateLimiterLessonHref(previous.id)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← {previous.shortTitle}
          </Link>
        ) : (
          <Link href="/learn#designs" className="text-sm text-muted-foreground hover:text-foreground">
            ← All systems
          </Link>
        )}
        {next ? (
          <Button asChild>
            <Link href={rateLimiterLessonHref(next.id)} onClick={continueOn}>
              Continue
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/learn/problems/rate-limiter" onClick={continueOn}>
              Try it on the board
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </nav>
    </div>
  );
}
