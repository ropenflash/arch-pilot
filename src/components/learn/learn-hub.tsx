import Link from "next/link";
import { ArrowRight, BookOpen, Gamepad2, Lightbulb } from "lucide-react";
import { FROM_ZERO_CAMPAIGN, FROM_ZERO_STEPS } from "@/lib/learn/campaign";
import { SYLLABUS, allLessons } from "@/lib/learn/syllabus";
import { Button } from "@/components/ui/button";

export function LearnHub() {
  const lessons = allLessons();
  const first = lessons[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        Structured path
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Scale a product from one box
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
        A structured program: read a short lesson, check that you understood it,
        then improve the same architecture on the whiteboard. Content is original
        ArchPilot teaching — not a page-by-page recap of any book.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        {first ? (
          <Button asChild>
            <Link href={`/learn/lessons/${first.slug}`}>
              Start the syllabus
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : null}
        <Button asChild variant="outline">
          <Link href="/learn/from-zero">Jump to practice</Link>
        </Button>
      </div>

      <ol className="mt-12 space-y-4">
        {SYLLABUS.map((module, moduleIndex) => (
          <li
            key={module.id}
            className="rounded-2xl border border-border bg-card p-5 sm:p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Module {moduleIndex + 1}
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">{module.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {module.summary}
            </p>
            <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
              {module.lessons.map((lesson, lessonIndex) => (
                <li key={lesson.slug}>
                  <Link
                    href={`/learn/lessons/${lesson.slug}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-accent/60"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {moduleIndex + 1}.{lessonIndex + 1}
                      </span>
                      <span>
                        <span className="block text-sm font-medium">{lesson.title}</span>
                        <span className="block text-xs text-muted-foreground">
                          {lesson.minutes} min
                          {lesson.practiceStepIds?.length ? " · then practice" : ""}
                        </span>
                      </span>
                    </span>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <article className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <Gamepad2 className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              {FROM_ZERO_CAMPAIGN.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Same path, on the canvas: start tiny, raise the load, take a hint
              when you are stuck. {FROM_ZERO_STEPS.length} rounds ·{" "}
              {FROM_ZERO_CAMPAIGN.estimated}.
            </p>
            <Button asChild className="mt-5">
              <Link href="/learn/from-zero">
                Open the whiteboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        <p className="mt-6 flex items-start gap-2 text-sm text-muted-foreground">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          Lessons teach the idea. Practice makes you draw it before the next
          bottleneck shows up.
        </p>
      </article>
    </div>
  );
}
