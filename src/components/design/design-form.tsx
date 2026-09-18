"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GenerationProgress } from "@/components/design/generation-progress";
import { getTemplate } from "@/lib/projects/templates";
import { linesToList } from "@/lib/utils/sanitize";
import type { SystemDesignInput } from "@/lib/architecture/validation";
import { toast } from "sonner";

function optionalNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function DesignForm({
  onGenerated,
}: {
  onGenerated: (payload: {
    input: SystemDesignInput;
    design: import("@/lib/architecture/validation").SystemDesign;
  }) => void;
}) {
  const search = useSearchParams();
  const example = search.get("example");
  const template = example ? getTemplate(example) : undefined;

  const [name, setName] = useState(template?.input.name ?? "");
  const [description, setDescription] = useState(
    template?.input.description ?? "",
  );
  const [dau, setDau] = useState(template?.input.scale?.dau?.toString() ?? "");
  const [peak, setPeak] = useState(
    template?.input.scale?.peakTrafficMultiplier?.toString() ?? "",
  );
  const [ratio, setRatio] = useState(
    template?.input.scale?.readWriteRatio ?? "",
  );
  const [requestSize, setRequestSize] = useState(
    template?.input.scale?.averageRequestSizeBytes?.toString() ?? "",
  );
  const [storage, setStorage] = useState(
    template?.input.scale?.expectedStorageGrowthGbPerDay?.toString() ?? "",
  );
  const [functional, setFunctional] = useState(
    (template?.input.requirements.functional ?? []).join("\n"),
  );
  const [nonFunctional, setNonFunctional] = useState(
    (template?.input.requirements.nonFunctional ?? []).join("\n"),
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const input: SystemDesignInput = useMemo(
    () => ({
      name,
      description,
      scale: {
        dau: optionalNumber(dau),
        peakTrafficMultiplier: optionalNumber(peak),
        readWriteRatio: ratio.trim() || undefined,
        averageRequestSizeBytes: optionalNumber(requestSize),
        expectedStorageGrowthGbPerDay: optionalNumber(storage),
      },
      requirements: {
        functional: linesToList(functional),
        nonFunctional: linesToList(nonFunctional),
      },
    }),
    [name, description, dau, peak, ratio, requestSize, storage, functional, nonFunctional],
  );

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await response.json();
      if (!response.ok) {
        const message =
          data.error?.message ?? "Unable to generate architecture.";
        setError(message);
        toast.error(message);
        return;
      }
      onGenerated({ input: data.input, design: data.design });
      router.replace("/design");
    } catch {
      setError(
        "Local AI provider unavailable. Configure another AI provider or start Ollama.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Create System Design</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Describe the system as you would to a principal architect. Optional scale
          fields make capacity math deterministic.
        </p>
      </div>

      <section className="space-y-3">
        <Label htmlFor="name">System name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Scalable E-commerce Platform"
          required
        />
      </section>

      <section className="space-y-3">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Design an e-commerce platform capable of handling 1 million daily active users."
          className="min-h-[180px]"
          required
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-medium">Expected scale</h2>
          <p className="text-xs text-muted-foreground">Optional. Leave blank if unknown.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Daily Active Users" value={dau} onChange={setDau} placeholder="1000000" />
          <Field label="Peak traffic multiplier" value={peak} onChange={setPeak} placeholder="5" />
          <Field label="Read/write ratio" value={ratio} onChange={setRatio} placeholder="30:1" />
          <Field
            label="Average request size"
            value={requestSize}
            onChange={setRequestSize}
            placeholder="1200 bytes"
          />
          <Field
            label="Expected storage growth"
            value={storage}
            onChange={setStorage}
            placeholder="GB / day"
          />
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3">
          <Label htmlFor="functional">Functional requirements</Label>
          <Textarea
            id="functional"
            value={functional}
            onChange={(e) => setFunctional(e.target.value)}
            placeholder={"User authentication\nProduct search\nCart\nCheckout\nPayments\nOrder tracking"}
            className="min-h-[160px]"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="nfr">Non-functional requirements</Label>
          <Textarea
            id="nfr"
            value={nonFunctional}
            onChange={(e) => setNonFunctional(e.target.value)}
            placeholder={"99.99% availability\nLow latency\nHorizontal scalability\nFault tolerance"}
            className="min-h-[160px]"
          />
        </div>
      </section>

      {error ? (
        <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {pending ? <GenerationProgress /> : null}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Generating architecture..." : "Generate Architecture"}
      </Button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
