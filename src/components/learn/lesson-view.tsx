"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { ArrowRight, BookOpen, Check } from "lucide-react";
import { LessonDiagram } from "@/components/learn/lesson-diagram";
import { LearnPathHeader, StagePills } from "@/components/learn/learn-chrome";
import { Button } from "@/components/ui/button";
import {
  moduleForLesson,
  nextLesson,
  previousLesson,
  type Lesson,
} from "@/lib/learn/syllabus";
import {
  lessonsForStage,
  practiceFor,
  stageForLesson,
} from "@/lib/learn/course";
import {
  defaultSyllabusProgress,
  parseSyllabusProgress,
  readSyllabusProgressSnapshot,
  saveSyllabusProgress,
  subscribeSyllabusProgress,
} from "@/lib/learn/syllabus-progress";
import { cn } from "@/lib/utils";

export function LessonView({ lesson }: { lesson: Lesson }) {
  const snapshot = useSyncExternalStore(
    subscribeSyllabusProgress,
    readSyllabusProgressSnapshot,
    () => "",
  );
  const progress = useMemo(() => {
    if (!snapshot) return defaultSyllabusProgress();
    try {
      return parseSyllabusProgress(JSON.parse(snapshot));
    } catch {
      return defaultSyllabusProgress();
    }
  }, [snapshot]);

  const currentModule = moduleForLesson(lesson.slug);
  const stage = stageForLesson(lesson.slug);
  const stageLessons = lessonsForStage(stage);
  const prev = previousLesson(lesson.slug);
  const next = nextLesson(lesson.slug);
  const index = stageLessons.findIndex((item) => item.slug === lesson.slug);
  const total = stageLessons.length;
  const practice = practiceFor(lesson);
  const done = progress.completed.includes(lesson.slug);
  const picked = progress.answers[lesson.slug];
  const choice = lesson.check?.choices.find((item) => item.id === picked);
  const checkPassed = Boolean(choice?.correct);

  function pick(id: string) {
    const selected = lesson.check?.choices.find((item) => item.id === id);
    const completed = new Set(progress.completed);
    if (selected?.correct) completed.add(lesson.slug);
    saveSyllabusProgress({
      ...progress,
      answers: { ...progress.answers, [lesson.slug]: id },
      completed: [...completed],
    });
  }

  function markComplete() {
    if (done) return;
    saveSyllabusProgress({
      ...progress,
      completed: [...progress.completed, lesson.slug],
    });
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav className="lg:sticky lg:top-20 lg:self-start">
        <LearnPathHeader stageId={stage.id} />
        <StagePills activeId={stage.id} />
        <ol className="mt-5 space-y-1">
          {stageLessons.map((entry) => {
            const active = entry.slug === lesson.slug;
            const complete = progress.completed.includes(entry.slug);
            return (
              <li key={entry.slug}>
                <Link
                  href={`/learn/lessons/${entry.slug}`}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1 text-sm",
                    active
                      ? "bg-primary/10 font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-full border text-[10px]",
                      complete
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border",
                    )}
                  >
                    {complete ? <Check className="h-2.5 w-2.5" /> : null}
                  </span>
                  {entry.title}
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>

      <article className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {currentModule?.title} · {index + 1} of {total} in this stage · {lesson.minutes} min
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{lesson.title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          {lesson.summary}
        </p>

        <div className="mt-6">
          <LessonDiagram kind={lesson.diagram} />
        </div>

        <div className="mt-8 space-y-8">
          {lesson.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold">{section.heading}</h2>
              <p className="mt-2 text-[15px] leading-7 text-muted-foreground">
                {section.body}
              </p>
              {section.bullets ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-[15px] leading-7 text-muted-foreground">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
            Takeaways
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-6">
            {lesson.takeaways.map((item) => (
              <li key={item} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {lesson.check ? (
          <section className="mt-6 rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
              Check your understanding
            </h2>
            <p className="mt-3 text-sm font-medium leading-6">{lesson.check.question}</p>
            <div className="mt-3 space-y-2">
              {lesson.check.choices.map((item) => {
                const selected = picked === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => pick(item.id)}
                    aria-pressed={selected}
                    className={cn(
                      "w-full rounded-xl border px-3 py-3 text-left text-sm leading-6",
                      selected
                        ? item.correct
                          ? "border-primary bg-primary/10"
                          : "border-destructive bg-destructive/10"
                        : "border-border hover:border-primary/40 hover:bg-accent",
                    )}
                  >
                    {item.label}
                    {selected ? (
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {item.feedback}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-2">
          {practice ? (
            <Button asChild>
              <Link href={practice.href}>
                {practice.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : null}
          {!done && !checkPassed ? (
            <Button type="button" variant="outline" onClick={markComplete}>
              <BookOpen className="h-4 w-4" />
              Mark lesson complete
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">Lesson complete.</p>
          )}
        </div>

        <div className="mt-8 flex justify-between border-t border-border pt-6 text-sm">
          {prev ? (
            <Link
              href={`/learn/lessons/${prev.slug}`}
              className="text-muted-foreground hover:text-foreground"
            >
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/learn/lessons/${next.slug}`}
              className="font-medium text-primary hover:underline"
            >
              {next.title} →
            </Link>
          ) : (
            <Link href="/learn#designs" className="font-medium text-primary hover:underline">
              Design a real system →
            </Link>
          )}
        </div>
      </article>
    </div>
  );
}
