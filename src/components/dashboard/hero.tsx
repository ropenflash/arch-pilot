import Link from "next/link";
import { DESIGN_TEMPLATES } from "@/lib/projects/templates";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
        System design copilot
      </p>
      <h1 className="text-5xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
        ArchPilot
      </h1>
      <p className="mt-5 text-xl text-zinc-300">Design better systems with AI.</p>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-400">
        Describe what you&apos;re building. ArchPilot turns your requirements into
        architecture, capacity estimates, trade-offs and failure scenarios.
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/design"
          className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          Create System Design
        </Link>
        <Link
          href="#examples"
          className="inline-flex h-10 items-center rounded-md border border-border px-5 text-sm text-zinc-300 hover:bg-zinc-900"
        >
          View Examples
        </Link>
      </div>
    </section>
  );
}

export function ExampleGrid() {
  return (
    <section id="examples" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-medium">Example system designs</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Start from a known problem. Each example pre-fills a serious design brief.
          </p>
        </div>
        <Link href="/projects" className="text-sm text-zinc-400 hover:text-zinc-200">
          Open projects
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {DESIGN_TEMPLATES.map((example) => (
          <Link
            key={example.slug}
            href={`/design?example=${example.slug}`}
            className="group rounded-xl border border-border bg-zinc-950/40 p-5 transition-colors hover:border-zinc-600 hover:bg-zinc-900/50"
          >
            <h3 className="text-sm font-medium text-zinc-100">{example.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {example.subtitle}
            </p>
            <p className="mt-4 inline-flex items-center gap-1 text-xs text-zinc-400 group-hover:text-zinc-200">
              Use this brief
              <ArrowRight className="h-3 w-3" />
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
