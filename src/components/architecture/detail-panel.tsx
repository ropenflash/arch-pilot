"use client";

import { collectComponents, dependenciesFor } from "@/lib/architecture/graph";
import {
  COMPONENT_PALETTE,
  connectComponents,
  disconnectComponents,
  removeComponent,
  updateComponent,
  updateEdgeLabel,
} from "@/lib/architecture/mutations";
import type {
  ArchitectureNodeType,
  SystemDesign,
} from "@/lib/architecture/validation";
import type { CanvasSelection } from "@/components/architecture/canvas-selection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MousePointerClick, Spline, Trash2, Unplug, X } from "lucide-react";
import { useMemo, useState } from "react";

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50";

const panelClass =
  "w-full shrink-0 overflow-y-auto rounded-xl border border-border bg-card p-5 lg:sticky lg:top-20 lg:max-h-[calc(100vh-140px)] lg:w-[380px]";

export function ArchitectureDetailPanel({
  design,
  selection,
  onClose,
  onDesignChange,
  readOnly = false,
}: {
  design: SystemDesign;
  selection: CanvasSelection | null;
  onClose: () => void;
  onDesignChange?: (design: SystemDesign) => void;
  readOnly?: boolean;
}) {
  const editable = !readOnly && Boolean(onDesignChange);

  if (!selection) {
    return (
      <aside className={`${panelClass} text-[15px] leading-6 text-muted-foreground`}>
        <p className="text-base font-semibold text-foreground">Inspector</p>
        <p className="mt-2 text-muted-foreground">
          Click a box on the canvas to edit it. Click a line to rename the
          connection.
        </p>
        <ol className="mt-5 space-y-3 text-sm leading-6 text-foreground">
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
              1
            </span>
            Add a component from the list on the left.
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
              2
            </span>
            <span className="flex items-start gap-2">
              <MousePointerClick className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              Click it to name it and say what it does.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
              3
            </span>
            <span className="flex items-start gap-2">
              <Spline className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              Drag from a dot to connect two components.
            </span>
          </li>
        </ol>
      </aside>
    );
  }

  if (selection.kind === "edge") {
    return (
      <EdgeInspector
        design={design}
        from={selection.from}
        to={selection.to}
        editable={editable}
        onClose={onClose}
        onDesignChange={onDesignChange}
      />
    );
  }

  return (
    <NodeInspector
      design={design}
      selectedId={selection.id}
      editable={editable}
      onClose={onClose}
      onDesignChange={onDesignChange}
    />
  );
}

function NodeInspector({
  design,
  selectedId,
  editable,
  onClose,
  onDesignChange,
}: {
  design: SystemDesign;
  selectedId: string;
  editable: boolean;
  onClose: () => void;
  onDesignChange?: (design: SystemDesign) => void;
}) {
  const component = collectComponents(design).find((item) => item.id === selectedId);
  const [connectTo, setConnectTo] = useState("");

  const others = useMemo(
    () => collectComponents(design).filter((item) => item.id !== selectedId),
    [design, selectedId],
  );

  if (!component) return null;
  const deps = dependenciesFor(design, selectedId);

  const patch = (next: Parameters<typeof updateComponent>[2]) => {
    onDesignChange?.(updateComponent(design, selectedId, next));
  };

  const remove = () => {
    const result = removeComponent(design, selectedId);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    onDesignChange?.(result.design);
    onClose();
  };

  return (
    <aside className={panelClass}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Component
          </p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">{component.name}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge>{component.type.replaceAll("_", " ")}</Badge>
          </div>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close inspector">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {editable ? (
        <div className="space-y-4">
          <Field label="Name">
            <Input
              value={component.name}
              onChange={(event) => patch({ name: event.target.value })}
            />
          </Field>
          <div className="grid grid-cols-1 gap-4">
            <Field label="Type">
              <select
                className={selectClass}
                value={component.type}
                onChange={(event) =>
                  patch({ type: event.target.value as ArchitectureNodeType })
                }
              >
                {COMPONENT_PALETTE.map((item) => (
                  <option key={item.type} value={item.type}>
                    {item.label}
                  </option>
                ))}
                <option value="other">Other</option>
              </select>
            </Field>
            <Field label="Technology">
              <Input
                value={component.technology ?? ""}
                onChange={(event) => patch({ technology: event.target.value })}
                placeholder="Postgres, Redis, Envoy…"
              />
            </Field>
          </div>
          <Field label="What it does">
            <Textarea
              className="min-h-[88px]"
              value={component.description}
              onChange={(event) => patch({ description: event.target.value })}
              placeholder="One or two sentences in plain language."
            />
          </Field>
          <Field label="Responsibilities">
            <Textarea
              className="min-h-[88px]"
              value={component.responsibilities.join("\n")}
              onChange={(event) =>
                patch({
                  responsibilities: event.target.value
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean),
                })
              }
              placeholder="One item per line"
            />
          </Field>
          <Field label="How it scales">
            <Textarea
              className="min-h-[72px]"
              value={component.scalingStrategy ?? ""}
              onChange={(event) => patch({ scalingStrategy: event.target.value })}
            />
          </Field>
          <Field label="What happens if it fails">
            <Textarea
              className="min-h-[72px]"
              value={component.failureBehavior ?? ""}
              onChange={(event) => patch({ failureBehavior: event.target.value })}
            />
          </Field>
        </div>
      ) : (
        <>
          <p className="text-[15px] leading-7 text-foreground">
            {component.description || "No description yet."}
          </p>
          <Section title="Technology">{component.technology || "—"}</Section>
          <Section title="Responsibilities">
            {component.responsibilities.length ? (
              <ul className="list-disc space-y-1 pl-4">
                {component.responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              "—"
            )}
          </Section>
          <Section title="How it scales">{component.scalingStrategy || "—"}</Section>
          <Section title="If it fails">{component.failureBehavior || "—"}</Section>
        </>
      )}

      <Section title="Connected to">
        {[...deps.upstream, ...deps.downstream].length
          ? [...new Set([...deps.upstream, ...deps.downstream])].join(", ")
          : "Nothing yet"}
      </Section>

      {editable ? (
        <div className="mt-5 space-y-3 border-t border-border pt-5">
          <Field label="Connect to">
            <div className="flex gap-2">
              <select
                className={selectClass}
                value={connectTo}
                onChange={(event) => setConnectTo(event.target.value)}
              >
                <option value="">Choose a component</option>
                {others.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={!connectTo}
                onClick={() => {
                  if (!connectTo) return;
                  onDesignChange?.(connectComponents(design, selectedId, connectTo));
                  setConnectTo("");
                }}
              >
                Link
              </Button>
            </div>
          </Field>
          <Button type="button" variant="destructive" size="sm" onClick={remove}>
            <Trash2 className="h-3.5 w-3.5" />
            Remove component
          </Button>
        </div>
      ) : null}
    </aside>
  );
}

function EdgeInspector({
  design,
  from,
  to,
  editable,
  onClose,
  onDesignChange,
}: {
  design: SystemDesign;
  from: string;
  to: string;
  editable: boolean;
  onClose: () => void;
  onDesignChange?: (design: SystemDesign) => void;
}) {
  const names = new Map(
    collectComponents(design).map((item) => [item.id, item.name]),
  );
  const edge = design.architectureEdges.find(
    (item) => item.from === from && item.to === to,
  );
  if (!edge) return null;

  return (
    <aside className={panelClass}>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Connection
          </p>
          <h3 className="mt-1 text-lg font-semibold leading-7 text-foreground">
            {names.get(from) ?? from}
            <span className="mx-1.5 text-foreground0">→</span>
            {names.get(to) ?? to}
          </h3>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close inspector">
          <X className="h-4 w-4" />
        </Button>
      </div>
      {editable ? (
        <>
          <Field label="Protocol or label">
            <Input
              value={edge.label || edge.protocol || ""}
              onChange={(event) =>
                onDesignChange?.(updateEdgeLabel(design, from, to, event.target.value))
              }
              placeholder="HTTP, gRPC, SQL…"
            />
          </Field>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="mt-5"
            onClick={() => {
              onDesignChange?.(disconnectComponents(design, from, to));
              onClose();
            }}
          >
            <Unplug className="h-3.5 w-3.5" />
            Disconnect
          </Button>
        </>
      ) : (
        <Section title="Protocol">{edge.label || edge.protocol || "—"}</Section>
      )}
    </aside>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h4>
      <div className="mt-1.5 text-[15px] leading-7 text-foreground">{children}</div>
    </div>
  );
}
