"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CircleHelp,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { NODE_ICONS } from "@/components/diagrams/architecture-node";
import { LearnPathHeader } from "@/components/learn/learn-chrome";
import { Button } from "@/components/ui/button";
import {
  BUILDING_BLOCKS,
  buildingBlockHref,
  type BuildingBlock,
} from "@/lib/learn/building-blocks";
import { recordConcept, recordQuiz } from "@/lib/learn/platform-progress";
import { cn } from "@/lib/utils";

export function BuildingBlockStudio({ block }: { block: BuildingBlock }) {
  const index = BUILDING_BLOCKS.findIndex((item) => item.id === block.id);
  const previous = BUILDING_BLOCKS[index - 1];
  const next = BUILDING_BLOCKS[index + 1];
  const [answer, setAnswer] = useState<string | null>(null);
  const selected = block.exercise.options.find((item) => item.id === answer);
  const Icon = NODE_ICONS[block.nodeType];

  function choose(id: string) {
    const option = block.exercise.options.find((item) => item.id === id);
    setAnswer(id);
    if (!option) return;
    recordQuiz(`building-block-${block.id}`, {
      correct: option.good,
      area:
        block.id === "sharding" || block.id === "consistent-hashing"
          ? "distributed"
          : "scalability",
    });
    if (option.good) recordConcept(block.id);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid items-start gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-20">
          <LearnPathHeader stageId="grow" detail="Building blocks" />
          <p className="text-xs leading-5 text-muted-foreground">
            Do not memorize tools. Start with pressure, choose a component, then
            accept its new cost.
          </p>
          <nav className="mt-5 max-h-[calc(100vh-190px)] space-y-0.5 overflow-y-auto pr-1">
            {BUILDING_BLOCKS.map((item, itemIndex) => (
              <Link
                key={item.id}
                href={buildingBlockHref(item.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-2 py-2 text-sm",
                  item.id === block.id
                    ? "bg-primary/10 font-medium text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <span className="w-5 text-center font-mono text-[10px]">
                  {String(itemIndex + 1).padStart(2, "0")}
                </span>
                {item.title}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">
          <header className="grid items-end gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                Problem → component → trade-off
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight">{block.title}</h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-muted-foreground">
                {block.oneLine}
              </p>
            </div>
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
              <Icon className="h-8 w-8 text-primary" />
            </div>
          </header>

          <section className="mt-8 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
            <FlowCard eyebrow="Pressure" title="What hurts?" body={block.problem} />
            <ArrowRight className="mx-auto hidden h-5 w-5 self-center text-primary md:block" />
            <FlowCard eyebrow="Decision" title={block.title} body={block.why} accent />
            <ArrowRight className="mx-auto hidden h-5 w-5 self-center text-primary md:block" />
            <FlowCard
              eyebrow="New responsibility"
              title="What did we introduce?"
              body={block.introduces[0]!}
            />
          </section>

          <section className="mt-8 grid gap-4 lg:grid-cols-2">
            <ContentCard title="What is it?">
              <p>{block.what}</p>
            </ContentCard>
            <ContentCard title="Why do we need it?">
              <p>{block.why}</p>
            </ContentCard>
            <ListCard title="Use it when" items={block.useWhen} icon="plus" />
            <ListCard title="Do not reach for it when" items={block.notWhen} icon="minus" />
            <ListCard title="Problems it solves" items={block.solves} icon="check" />
            <ListCard title="Problems it introduces" items={block.introduces} icon="warning" />
          </section>

          <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Trade-off engine
              </p>
              <h2 className="mt-1 text-lg font-semibold">
                Every useful component sends you a bill
              </h2>
            </div>
            <div className="grid md:grid-cols-2">
              <div className="border-b border-border p-5 md:border-b-0 md:border-r">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Plus className="h-4 w-4 text-emerald-600" />
                  Benefits
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                  {block.benefits.map((item) => (
                    <li key={item}>+ {item}</li>
                  ))}
                </ul>
              </div>
              <div className="p-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  <Minus className="h-4 w-4 text-red-600" />
                  Costs
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                  {block.costs.map((item) => (
                    <li key={item}>− {item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="border-t border-border bg-muted/40 px-5 py-4">
              <p className="text-sm font-medium">Ask yourself: when would I deliberately not use this?</p>
            </div>
          </section>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <section className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Real system shape
              </p>
              <h2 className="mt-2 text-lg font-semibold">{block.example.title}</h2>
              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-muted p-4 text-sm">
                {block.example.flow.split("→").map((part, partIndex, parts) => (
                  <span key={`${part}-${partIndex}`} className="contents">
                    <span className="rounded-lg border border-border bg-card px-3 py-2 font-medium">
                      {part.trim()}
                    </span>
                    {partIndex < parts.length - 1 ? (
                      <ArrowRight className="h-4 w-4 text-primary" />
                    ) : null}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {block.example.explanation}
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Common interview questions
              </p>
              <ul className="mt-3 space-y-3">
                {block.interviewQuestions.map((question) => (
                  <li key={question} className="flex gap-2 text-sm leading-6">
                    <CircleHelp className="mt-1 h-4 w-4 shrink-0 text-primary" />
                    {question}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <section className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Try it yourself
            </p>
            <h2 className="mt-2 text-lg font-semibold">{block.exercise.scenario}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose what you would investigate first. The scenario may not need
              the component on this page.
            </p>
            <div className="mt-4 space-y-2">
              {block.exercise.options.map((option) => {
                const active = option.id === answer;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => choose(option.id)}
                    aria-pressed={active}
                    className={cn(
                      "w-full rounded-xl border bg-card px-4 py-3 text-left text-sm",
                      !active && "border-border hover:border-primary/40",
                      active && option.good && "border-emerald-500/40 bg-emerald-500/10",
                      active && !option.good && "border-red-500/40 bg-red-500/10",
                    )}
                  >
                    <span className="flex gap-2">
                      {active ? (
                        option.good ? (
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        ) : (
                          <X className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                        )
                      ) : (
                        <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-border" />
                      )}
                      <span>{option.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {selected ? (
              <div className="mt-4 rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-semibold">
                  {selected.good ? "Reasonable first move" : "Not the first pressure to solve"}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{selected.why}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                  What assumption would change the answer?
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {selected.assumption}
                </p>
              </div>
            ) : null}
          </section>

          {block.id === "sharding" || block.id === "consistent-hashing" ? (
            <Button asChild variant="secondary" className="mt-5">
              <Link href="/learn/labs/sharding">
                Open the sharding playground
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : null}
          {block.id === "rate-limiter" ? (
            <Button asChild variant="secondary" className="mt-5">
              <Link href="/learn/problems/rate-limiter/learn">
                Open the full visual course
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : null}

          <nav className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6 text-sm">
            {previous ? (
              <Link
                href={buildingBlockHref(previous.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                ← {previous.title}
              </Link>
            ) : (
              <Link href="/learn" className="text-muted-foreground hover:text-foreground">
                ← Learning map
              </Link>
            )}
            {next ? (
              <Link
                href={buildingBlockHref(next.id)}
                className="font-medium text-primary hover:underline"
              >
                Next: {next.title} →
              </Link>
            ) : (
              <Link href="/learn#designs" className="font-medium text-primary hover:underline">
                Apply it in a system →
              </Link>
            )}
          </nav>
        </main>
      </div>
    </div>
  );
}

function FlowCard({
  eyebrow,
  title,
  body,
  accent = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <article
      className={cn(
        "rounded-xl border p-4",
        accent ? "border-primary/40 bg-primary/10" : "border-border bg-card",
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-sm font-semibold">{title}</h2>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{body}</p>
    </article>
  );
}

function ContentCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        {title}
      </h2>
      <div className="mt-3 text-sm leading-6 text-muted-foreground">{children}</div>
    </article>
  );
}

function ListCard({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: "plus" | "minus" | "check" | "warning";
}) {
  const Icon =
    icon === "plus"
      ? Plus
      : icon === "minus"
        ? Minus
        : icon === "check"
          ? Check
          : AlertTriangle;
  return (
    <article className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        {title}
      </h2>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-muted-foreground">
            <Icon className="mt-1 h-4 w-4 shrink-0 text-primary" />
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}
