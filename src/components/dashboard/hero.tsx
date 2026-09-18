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
import { rateLimiterLessonHref } from "@/lib/learn/rate-limiter-course";
import { MiniArchitecture } from "@/components/dashboard/mini-architecture";

const QUESTION_ICONS = {
  why: Sparkles,
  tradeoffs: Scale,
  breaks: Timer,
  scale: GitBranch,
  fails: ShieldAlert,
} as const;

export function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pt-28">
      <div className="mx-auto max-w-4xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {PRODUCT.name} · {PRODUCT.kicker}
        </p>
        <h1 className="text-5xl font-semibold uppercase leading-[0.95] tracking-[-0.05em] text-foreground sm:text-7xl">
          System design,
          <span className="block text-primary">without the hand-waving.</span>
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-muted-foreground">
          Learn to design scalable systems by actually designing them. Clarify
          the problem, estimate the load, make architecture decisions, and
          explain every trade-off.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/learn"
            className="inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground"
          >
            Start learning
          </Link>
          <Link
            href="/design"
            className="inline-flex h-11 items-center rounded-md border border-border px-6 text-sm font-medium text-foreground hover:bg-accent"
          >
            Design a system
          </Link>
        </div>
      </div>
      <MiniArchitecture />
    </section>
  );
}

const JOURNEY = [
  {
    step: "01",
    title: "Understand",
    body: "Clarify users, scope, traffic shape, and quality constraints.",
    href: "/learn/mindset",
  },
  {
    step: "02",
    title: "Estimate",
    body: "Turn daily users and actions into peak QPS, bytes, and capacity.",
    href: "/learn/estimate/lumen",
  },
  {
    step: "03",
    title: "Design",
    body: "Draw the smallest architecture that satisfies the agreed problem.",
    href: "/learn/from-zero",
  },
  {
    step: "04",
    title: "Question",
    body: "Explain why each component exists and what assumption justifies it.",
    href: "/learn/concepts",
  },
  {
    step: "05",
    title: "Simulate",
    body: "Increase traffic, remove a node, create a hot key, and observe the consequence.",
    href: "/learn/labs/sharding",
  },
  {
    step: "06",
    title: "Iterate",
    body: "Use trade-offs and failure feedback to improve—not replace—the design.",
    href: "/design",
  },
] as const;

export function LearningJourney() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Learn by reasoning
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Not read → memorize → repeat.
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ArchPilot teaches the sequence strong engineers actually use.
        </p>
      </div>
      <ol className="mt-6 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {JOURNEY.map((item) => (
          <li key={item.step} className="bg-card">
            <Link
              href={item.href}
              className="group block h-full p-5 transition-colors hover:bg-accent/40"
            >
              <p className="font-mono text-xs text-primary">{item.step}</p>
              <h3 className="mt-3 text-base font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
                Practice this
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </li>
        ))}
      </ol>
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
            href={
              problem.id === "rate-limiter"
                ? rateLimiterLessonHref()
                : problemHref(problem.id)
            }
            className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/60"
          >
            <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span className="text-border">·</span>
              <span>{problem.product}</span>
              <span className="text-border">·</span>
              <span>4 guided moves</span>
            </div>
            <h3 className="mt-3 text-sm font-medium text-foreground">
              {problem.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {problem.prompt}
            </p>
            <p className="mt-4 inline-flex items-center gap-1 text-xs text-primary group-hover:underline">
              {problem.id === "rate-limiter" ? "Learn step by step" : "Design this"}
              <ArrowRight className="h-3 w-3" />
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
