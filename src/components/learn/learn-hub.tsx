import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  Gamepad2,
  Lightbulb,
  Route,
} from "lucide-react";
import { FROM_ZERO_CAMPAIGN, FROM_ZERO_STEPS } from "@/lib/learn/campaign";
import { SYLLABUS, allLessons } from "@/lib/learn/syllabus";
import { Button } from "@/components/ui/button";

const TRACKS = [
  {
    href: "/learn/approach",
    kicker: "The hour",
    title: "Interview approach",
    body: "Four steps: scope the prompt, sketch a blueprint with napkin math, deep-dive the risky piece, then wrap. Practice picking questions — not dumping a stack.",
    cta: "Run the hour",
    icon: Route,
  },
  {
    href: "/learn/estimate",
    kicker: "Napkin math",
    title: "Back-of-the-envelope",
    body: "Units, what is slow, nines of uptime, then live QPS and storage on five original products. Guess the number, then show the work.",
    cta: "Open the playground",
    icon: Calculator,
  },
] as const;

export function LearnHub() {
  const lessons = allLessons();
  const first = lessons[0];
  const scaleModules = SYLLABUS.filter((module) => module.id !== "napkin" && module.id !== "approach");
  const extraModules = SYLLABUS.filter((module) => module.id === "napkin" || module.id === "approach");

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        Structured path
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Scale a product from one box
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
        A structured program: how to run the hour, how to size the system, then
        how to grow the architecture. Content is original ArchPilot teaching —
        not a page-by-page recap of any book.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {TRACKS.map((track) => (
          <article
            key={track.href}
            className="rounded-2xl border border-border bg-card p-6"
          >
            <track.icon className="h-5 w-5 text-primary" />
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {track.kicker}
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">{track.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{track.body}</p>
            <Button asChild className="mt-4">
              <Link href={track.href}>
                {track.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </article>
        ))}
      </div>

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
        {scaleModules.map((module, moduleIndex) => (
          <ModuleCard
            key={module.id}
            module={module}
            moduleIndex={moduleIndex}
          />
        ))}
      </ol>

      <h2 className="mt-14 text-2xl font-semibold tracking-tight">Then size it, then run the hour</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        After the scale-up path, the next skills are napkin math and a repeatable
        interview approach. Same ideas as the playgrounds above, as short lessons.
      </p>
      <ol className="mt-6 space-y-4">
        {extraModules.map((module, moduleIndex) => (
          <ModuleCard
            key={module.id}
            module={module}
            moduleIndex={scaleModules.length + moduleIndex}
          />
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
          Lessons teach the idea. Napkin math sizes it. Practice makes you draw
          it before the next bottleneck shows up.
        </p>
      </article>
    </div>
  );
}

function ModuleCard({
  module,
  moduleIndex,
}: {
  module: (typeof SYLLABUS)[number];
  moduleIndex: number;
}) {
  return (
    <li className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        Module {moduleIndex + 1}
      </p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight">{module.title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{module.summary}</p>
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
                    {lesson.practiceHref || lesson.practiceStepIds?.length
                      ? " · then practice"
                      : ""}
                  </span>
                </span>
              </span>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}
