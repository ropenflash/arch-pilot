import Link from "next/link";
import {
  ArrowRight,
  GitBranch,
  Scale,
  ShieldAlert,
  Sparkles,
  Timer,
} from "lucide-react";
import { PRODUCT } from "@/lib/content/product";
import { PRACTICE_PROBLEMS, problemHref } from "@/lib/learn/problems";

const QUESTION_ICONS = {
  why: Sparkles,
  tradeoffs: Scale,
  breaks: Timer,
  scale: GitBranch,
  fails: ShieldAlert,
} as const;

export function Hero() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        {PRODUCT.kicker}
      </p>
      <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
        {PRODUCT.name}
      </h1>
      <p className="mt-5 text-xl text-foreground">{PRODUCT.tagline}</p>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
        {PRODUCT.longDescription}
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/learn"
          className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          {PRODUCT.learnCta}
        </Link>
        <Link
          href="/design"
          className="inline-flex h-10 items-center rounded-md border border-border px-5 text-sm text-foreground hover:bg-accent"
        >
          {PRODUCT.primaryCta}
        </Link>
        <Link
          href="/design?canvas=1"
          className="inline-flex h-10 items-center rounded-md border border-border px-5 text-sm text-foreground hover:bg-accent"
        >
          Blank canvas
        </Link>
      </div>
    </section>
  );
}

export function WhyArchPilot() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-xl font-semibold text-foreground">{PRODUCT.whyHeadline}</h2>
        <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
          {PRODUCT.whyLead}
        </p>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {PRODUCT.questions.map((question) => {
          const Icon = QUESTION_ICONS[question.id];
          return (
            <article
              key={question.id}
              className="rounded-xl border border-border bg-card p-4 text-left"
            >
              <Icon className="h-4 w-4 text-primary" />
              <h3 className="mt-3 text-sm font-semibold uppercase tracking-wide text-foreground">
                {question.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {question.body}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function Deliverables() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {PRODUCT.outputsHeadline}
          </h2>
          <p className="mt-1 text-[15px] text-muted-foreground">
            One brief in. A design you can argue with, not a chatbot transcript.
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCT.outputs.map((item) => (
          <article
            key={item.title}
            className="rounded-xl border border-border bg-card p-5"
          >
            <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.body}
            </p>
          </article>
        ))}
      </div>
      <ol className="mt-8 grid gap-3 md:grid-cols-3">
        {PRODUCT.method.map((item) => (
          <li
            key={item.step}
            className="rounded-xl border border-border px-5 py-4"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {item.step}
            </p>
            <p className="mt-2 text-base font-semibold text-foreground">{item.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ExampleGrid() {
  return (
    <section id="examples" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium">{PRODUCT.examplesHeadline}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {PRODUCT.examplesLead}
          </p>
        </div>
        <Link href="/learn#designs" className="shrink-0 text-sm text-primary hover:underline">
          Full path
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PRACTICE_PROBLEMS.map((problem, index) => (
          <Link
            key={problem.id}
            href={problemHref(problem.id)}
            className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/60"
          >
            <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span className="text-border">·</span>
              <span>{problem.product}</span>
              <span className="text-border">·</span>
              <span>~{problem.minutes} min</span>
            </div>
            <h3 className="mt-3 text-sm font-medium text-foreground">
              {problem.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {problem.prompt}
            </p>
            <p className="mt-4 inline-flex items-center gap-1 text-xs text-primary group-hover:underline">
              Design this
              <ArrowRight className="h-3 w-3" />
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
