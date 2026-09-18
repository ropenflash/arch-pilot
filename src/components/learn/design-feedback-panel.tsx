import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  Minus,
  Plus,
} from "lucide-react";
import {
  evaluateDesignReasoning,
  tradeoffsForDesign,
} from "@/lib/learn/design-feedback";
import type { PracticeProblem } from "@/lib/learn/problems";
import type { SystemDesign } from "@/lib/architecture/validation";
import { cn } from "@/lib/utils";

export function DesignFeedbackPanel({
  design,
  problem,
}: {
  design: SystemDesign;
  problem: PracticeProblem;
}) {
  const observations = evaluateDesignReasoning(design, problem);
  const tradeoffs = tradeoffsForDesign(design);
  return (
    <div className="mt-5 space-y-5">
      <section className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Design review
          </p>
          <h2 className="mt-1 text-lg font-semibold">Reason about the board</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            These are observations, not a verdict. Change the assumptions and the advice may change.
          </p>
        </div>
        <div className="divide-y divide-border">
          {observations.map((item) => {
            const Icon =
              item.level === "strength"
                ? CheckCircle2
                : item.level === "risk"
                  ? AlertTriangle
                  : CircleHelp;
            return (
              <article key={item.id} className="grid gap-3 p-5 sm:grid-cols-[24px_1fr]">
                <Icon
                  className={cn(
                    "mt-0.5 h-5 w-5",
                    item.level === "strength" && "text-emerald-600",
                    item.level === "risk" && "text-red-600",
                    item.level === "question" && "text-primary",
                  )}
                />
                <div>
                  <p className="text-sm font-semibold">{item.observation}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    <span className="font-medium text-foreground">Why it matters: </span>
                    {item.why}
                  </p>
                  <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-sm leading-6">
                    <span className="font-medium">Question to consider: </span>
                    {item.question}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {tradeoffs.length ? (
        <section>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              Trade-off engine
            </p>
            <h2 className="mt-1 text-lg font-semibold">What your components bought—and cost</h2>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {tradeoffs.map((tradeoff) => (
              <article key={tradeoff.type} className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold">{tradeoff.label}</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <ul className="space-y-1.5 text-xs leading-5 text-muted-foreground">
                    {tradeoff.benefits.map((benefit) => (
                      <li key={benefit} className="flex gap-1.5">
                        <Plus className="mt-1 h-3 w-3 shrink-0 text-emerald-600" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <ul className="space-y-1.5 text-xs leading-5 text-muted-foreground">
                    {tradeoff.costs.map((cost) => (
                      <li key={cost} className="flex gap-1.5">
                        <Minus className="mt-1 h-3 w-3 shrink-0 text-red-600" />
                        {cost}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-3 border-t border-border pt-3 text-xs leading-5">
                  <span className="font-semibold">Ask: </span>
                  <span className="text-muted-foreground">{tradeoff.question}</span>
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
