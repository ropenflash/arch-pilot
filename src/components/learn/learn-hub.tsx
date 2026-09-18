import Link from "next/link";
import { ArrowRight, Gamepad2, Lightbulb, Spline } from "lucide-react";
import {
  FROM_ZERO_CAMPAIGN,
  FROM_ZERO_STEPS,
} from "@/lib/learn/campaign";
import { Button } from "@/components/ui/button";

const BEATS = [
  {
    icon: Spline,
    title: "Start tiny",
    body: "The first board is one user talking to one machine. If it works, it is allowed to be that simple.",
  },
  {
    icon: Gamepad2,
    title: "Traffic grows",
    body: "Each round names what just broke — CPU, disk, a single point of failure — and asks you to improve the same diagram.",
  },
  {
    icon: Lightbulb,
    title: "Hints, then the why",
    body: "Stuck? Reveal a hint. When the checklist goes green you get the reason, then the next bottleneck.",
  },
];

export function LearnHub() {
  const canvasRounds = FROM_ZERO_STEPS.filter((step) => step.kind === "canvas").length;
  const deepDives = FROM_ZERO_STEPS.filter((step) => step.kind === "quiz").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        Guided practice
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Play architecture</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
        Same idea as a strong system-design interview: begin with the smallest
        design that works, then keep raising the load until the board has to
        change. This path is original ArchPilot practice, not a page-by-page
        recap of any book.
      </p>

      <div className="mt-10 grid gap-3 md:grid-cols-3">
        {BEATS.map((beat) => (
          <article
            key={beat.title}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <beat.icon className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-base font-semibold">{beat.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{beat.body}</p>
          </article>
        ))}
      </div>

      <article className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Campaign
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {FROM_ZERO_CAMPAIGN.title}
            </h2>
            <p className="mt-2 text-muted-foreground">{FROM_ZERO_CAMPAIGN.tagline}</p>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {FROM_ZERO_CAMPAIGN.description}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              {FROM_ZERO_STEPS.length} rounds · {canvasRounds} on the whiteboard ·{" "}
              {deepDives} deep dives · {FROM_ZERO_CAMPAIGN.estimated}
            </p>
            <Button asChild className="mt-6">
              <Link href="/learn/from-zero">
                Start from one box
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <ol className="space-y-2 text-sm">
            {FROM_ZERO_STEPS.map((step, index) => (
              <li key={step.id} className="flex gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <span>
                  <span className="font-medium text-foreground">{step.title}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {step.kind === "quiz" ? "Deep dive" : "Improve the board"}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </article>
    </div>
  );
}
