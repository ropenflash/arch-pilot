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
import { Trash2, Unplug, X } from "lucide-react";
import { useMemo, useState } from "react";

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-zinc-950/40 px-2.5 text-sm outline-none focus-visible:border-zinc-600 focus-visible:ring-1 focus-visible:ring-zinc-600 disabled:opacity-50";

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
      <aside className="hidden w-[340px] shrink-0 rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground lg:block">
        <p className="font-medium text-zinc-300">Inspector</p>
        <p className="mt-2 leading-6">
          Select a component to edit name, type, technology, and failure
          behavior. Select an edge to rename the protocol.
        </p>
        <ul className="mt-4 list-disc space-y-1.5 pl-4 text-xs leading-5">
          <li>Drag palette items onto the canvas</li>
          <li>Pull from a handle to connect two nodes</li>
          <li>Backspace deletes the selection</li>
        </ul>
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
    <aside className="w-full shrink-0 rounded-xl border border-border bg-zinc-950 p-5 lg:w-[340px]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-zinc-500">Component</p>
          <h3 className="mt-1 text-base font-medium">{component.name}</h3>
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge>{component.type.replaceAll("_", " ")}</Badge>
            {component.kind ? <Badge variant="outline">{component.kind}</Badge> : null}
          </div>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close inspector">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {editable ? (
        <div className="space-y-3">
          <Field label="Name">
            <Input
              value={component.name}
              onChange={(event) => patch({ name: event.target.value })}
            />
          </Field>
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
          <Field label="Description">
            <Textarea
              className="min-h-[88px]"
              value={component.description}
              onChange={(event) => patch({ description: event.target.value })}
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
              placeholder="One responsibility per line"
            />
          </Field>
          <Field label="Scaling">
            <Textarea
              className="min-h-[72px]"
              value={component.scalingStrategy ?? ""}
              onChange={(event) => patch({ scalingStrategy: event.target.value })}
            />
          </Field>
          <Field label="Failure behavior">
            <Textarea
              className="min-h-[72px]"
              value={component.failureBehavior ?? ""}
              onChange={(event) => patch({ failureBehavior: event.target.value })}
            />
          </Field>
        </div>
      ) : (
        <>
          <p className="text-sm leading-6 text-zinc-400">{component.description}</p>
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
          <Section title="Scaling">{component.scalingStrategy || "—"}</Section>
          <Section title="Failure behavior">{component.failureBehavior || "—"}</Section>
        </>
      )}

      <Section title="Dependencies">
        {[...deps.upstream, ...deps.downstream].length
          ? [...new Set([...deps.upstream, ...deps.downstream])].join(", ")
          : "None recorded"}
      </Section>

      {editable ? (
        <div className="mt-5 space-y-3">
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
    <aside className="w-full shrink-0 rounded-xl border border-border bg-zinc-950 p-5 lg:w-[340px]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-zinc-500">Connection</p>
          <h3 className="mt-1 text-base font-medium">
            {names.get(from) ?? from} → {names.get(to) ?? to}
          </h3>
        </div>
        <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close inspector">
          <X className="h-4 w-4" />
        </Button>
      </div>
      {editable ? (
        <>
          <Field label="Protocol / label">
            <Input
              value={edge.label || edge.protocol || ""}
              onChange={(event) =>
                onDesignChange?.(updateEdgeLabel(design, from, to, event.target.value))
              }
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
      <h4 className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
        {title}
      </h4>
      <div className="mt-1.5 text-sm leading-6 text-zinc-300">{children}</div>
    </div>
  );
}
