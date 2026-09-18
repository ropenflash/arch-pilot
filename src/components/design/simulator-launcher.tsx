import Link from "next/link";
import { ArrowRight, Brain, FilePenLine, Gauge, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRACTICE_PROBLEMS, problemHref } from "@/lib/learn/problems";

const LEVELS = [
  {
    id: "beginner",
    title: "Beginner",
    description: "One dominant path. Learn to scope and place the first few boxes.",
    problemIds: ["url-shortener", "rate-limiter", "pastebin", "unique-ids"],
  },
  {
    id: "intermediate",
    title: "Intermediate",
    description: "Queues, fan-out, indexing, and product-specific bottlenecks.",
    problemIds: ["notifications", "news-feed", "web-crawler", "autocomplete", "chat"],
  },
  {
    id: "advanced",
    title: "Advanced",
    description: "Large byte paths, synchronization, and distributed placement.",
    problemIds: ["video", "cloud-files", "large-scale-search", "consistent-hashing"],
  },
] as const;

const PROCESS = [
  { icon: Brain, title: "Understand", body: "Clarify the product and assumptions" },
  { icon: Gauge, title: "Estimate", body: "Size the busy path and stored bytes" },
  { icon: Network, title: "Design", body: "Draw components and directional flows" },
  { icon: ArrowRight, title: "Iterate", body: "Use observations and trade-offs" },
] as const;

export function SimulatorLauncher({ onCustom }: { onCustom: () => void }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            System design simulator
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Get a system. Make decisions. Explain what breaks.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            The prompt and constraints are already written. Build on the canvas,
            evaluate the reasoning, inspect trade-offs, and iterate. The goal is
            not a green check—it is a defensible design.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Have your own product?</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Keep using the existing AI-assisted brief and editable workspace.
          </p>
          <Button type="button" variant="secondary" className="mt-4" onClick={onCustom}>
            <FilePenLine className="h-4 w-4" />
            Create a custom design
          </Button>
        </div>
      </div>

      <div className="mt-10 grid gap-3 md:grid-cols-4">
        {PROCESS.map((item) => (
          <article key={item.title} className="rounded-xl border border-border bg-card p-4">
            <item.icon className="h-4 w-4 text-primary" />
            <h2 className="mt-3 text-sm font-semibold">{item.title}</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-12 space-y-10">
        {LEVELS.map((level) => (
          <section key={level.id}>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                  {level.title}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{level.description}</p>
              </div>
              {level.id === "beginner" ? (
                <Link
                  href="/learn/foundations/url-shortener"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  New? Learn requirements first →
                </Link>
              ) : null}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {level.problemIds.map((id) => {
                const problem = PRACTICE_PROBLEMS.find((item) => item.id === id)!;
                return (
                  <Link
                    key={problem.id}
                    href={problemHref(problem.id)}
                    className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {problem.product} · {problem.minutes} min
                    </p>
                    <h2 className="mt-2 text-sm font-semibold">{problem.title}</h2>
                    <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">
                      {problem.prompt}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
                      Start simulation
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
