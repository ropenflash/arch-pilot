import Link from "next/link";
import {
  ArrowRight,
  GitBranch,
  Scale,
  ShieldAlert,
  Sparkles,
  Timer,
} from "lucide-react";
import { DESIGN_TEMPLATES } from "@/lib/projects/templates";
import { PRODUCT } from "@/lib/content/product";

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
      <p className="mb-4 text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
        {PRODUCT.kicker}
      </p>
      <h1 className="text-5xl font-semibold tracking-tight text-zinc-50 sm:text-6xl">
        {PRODUCT.name}
      </h1>
      <p className="mt-5 text-xl text-zinc-300">{PRODUCT.tagline}</p>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-zinc-400">
        {PRODUCT.longDescription}
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/design"
          className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          {PRODUCT.primaryCta}
        </Link>
        <Link
          href="#examples"
          className="inline-flex h-10 items-center rounded-md border border-border px-5 text-sm text-zinc-300 hover:bg-zinc-900"
        >
          {PRODUCT.secondaryCta}
        </Link>
      </div>
    </section>
  );
}

export function WhyArchPilot() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-lg font-medium">{PRODUCT.whyHeadline}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {PRODUCT.whyLead}
        </p>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {PRODUCT.questions.map((question) => {
          const Icon = QUESTION_ICONS[question.id];
          return (
            <article
              key={question.id}
              className="rounded-xl border border-border bg-zinc-950/40 p-4 text-left"
            >
              <Icon className="h-4 w-4 text-zinc-400" />
              <h3 className="mt-3 text-sm font-medium uppercase tracking-wide text-zinc-100">
                {question.title}
              </h3>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
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
          <h2 className="text-lg font-medium">{PRODUCT.outputsHeadline}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            One brief in. A design you can argue with, not a chatbot transcript.
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCT.outputs.map((item) => (
          <article
            key={item.title}
            className="rounded-xl border border-border bg-zinc-950/40 p-5"
          >
            <h3 className="text-sm font-medium text-zinc-100">{item.title}</h3>
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
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              {item.step}
            </p>
            <p className="mt-2 text-sm font-medium text-zinc-100">{item.title}</p>
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
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-lg font-medium">{PRODUCT.examplesHeadline}</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            {PRODUCT.examplesLead}
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
            <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wider text-zinc-500">
              <span>{example.domain}</span>
              <span className="text-zinc-700">·</span>
              <span>{example.scaleLabel}</span>
            </div>
            <h3 className="mt-3 text-sm font-medium text-zinc-100">
              {example.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {example.subtitle}
            </p>
            <p className="mt-3 text-xs text-zinc-500">{example.focus}</p>
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
