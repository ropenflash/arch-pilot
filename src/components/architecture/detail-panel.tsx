import { collectComponents, dependenciesFor } from "@/lib/architecture/graph";
import type { SystemDesign } from "@/lib/architecture/validation";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ArchitectureDetailPanel({
  design,
  selectedId,
  onClose,
}: {
  design: SystemDesign;
  selectedId: string | null;
  onClose: () => void;
}) {
  if (!selectedId) {
    return (
      <aside className="hidden w-[340px] shrink-0 rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground lg:block">
        Select a component to inspect responsibilities, scaling, dependencies, and
        failure behavior.
      </aside>
    );
  }

  const component = collectComponents(design).find((item) => item.id === selectedId);
  if (!component) return null;
  const deps = dependenciesFor(design, selectedId);

  return (
    <aside className="w-full shrink-0 rounded-xl border border-border bg-zinc-950 p-5 lg:w-[340px]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-medium">{component.name}</h3>
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge>{component.type.replaceAll("_", " ")}</Badge>
            {component.kind ? <Badge variant="outline">{component.kind}</Badge> : null}
          </div>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm leading-6 text-zinc-400">{component.description}</p>
      <Section title="Technology">{component.technology || "—"}</Section>
      <Section title="Responsibilities">
        <ul className="list-disc space-y-1 pl-4">
          {component.responsibilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>
      <Section title="Scaling">{component.scalingStrategy || "—"}</Section>
      <Section title="Dependencies">
        {[...deps.upstream, ...deps.downstream].length
          ? [...new Set([...deps.upstream, ...deps.downstream])].join(", ")
          : "None recorded"}
      </Section>
      <Section title="Failure behavior">{component.failureBehavior || "—"}</Section>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h4 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
        {title}
      </h4>
      <div className="mt-1.5 text-sm leading-6 text-zinc-300">{children}</div>
    </div>
  );
}
