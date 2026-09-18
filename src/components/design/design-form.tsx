"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GenerationProgress } from "@/components/design/generation-progress";
import { getTemplate } from "@/lib/projects/templates";
import { linesToList } from "@/lib/utils/sanitize";
import type { SystemDesignInput } from "@/lib/architecture/validation";
import { createBlankDesign } from "@/lib/architecture/mutations";
import { PRODUCT } from "@/lib/content/product";
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
  const [requestsPerUser, setRequestsPerUser] = useState(
    template?.input.scale?.requestsPerUserPerDay?.toString() ?? "",
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
        requestsPerUserPerDay: optionalNumber(requestsPerUser),
      },
      requirements: {
        functional: linesToList(functional),
        nonFunctional: linesToList(nonFunctional),
      },
    }),
    [
      name,
      description,
      dau,
      peak,
      ratio,
      requestSize,
      storage,
      requestsPerUser,
      functional,
      nonFunctional,
    ],
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
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{PRODUCT.primaryCta}</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-muted-foreground">
          {PRODUCT.formLead}
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          {PRODUCT.formLearnNote}{" "}
          <Link href="/learn#designs" className="font-medium text-primary hover:underline">
            Design a system
          </Link>
          .
        </p>
        {template ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Starting from <span className="text-foreground">{template.title}</span>
            {" · "}
            {template.domain}
            {" · "}
            {template.focus}
          </p>
        ) : null}
      </div>

      <section className="space-y-3 rounded-xl border border-border bg-card p-5">
        <Label htmlFor="name">System name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Scalable E-commerce Platform"
          required
        />
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-5">
        <div>
          <Label htmlFor="description">Description</Label>
          <p className="mt-1 text-sm text-muted-foreground">
            Write it the way you would explain the problem to a principal architect.
          </p>
        </div>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Design an e-commerce platform for 1 million daily active users. Shoppers browse and search a catalog, manage a cart, check out with a payment provider, and track orders. Flash sales multiply traffic. Inventory must not oversell. Payment and order creation must be idempotent."
          className="min-h-[180px]"
          required
        />
      </section>

      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">Expected scale</h2>
          <p className="mt-1 text-sm text-muted-foreground">Optional. Leave blank if unknown.</p>
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
          <Field
            label="Requests per user per day"
            value={requestsPerUser}
            onChange={setRequestsPerUser}
            placeholder="50"
          />
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <Label htmlFor="functional">Functional requirements</Label>
          <p className="text-sm text-muted-foreground">One per line.</p>
          <Textarea
            id="functional"
            value={functional}
            onChange={(e) => setFunctional(e.target.value)}
            placeholder={
              "User authentication\nProduct catalog\nProduct search\nCart\nCheckout\nPayments\nOrder tracking"
            }
            className="min-h-[160px]"
          />
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-card p-5">
          <Label htmlFor="nfr">Non-functional requirements</Label>
          <p className="text-sm text-muted-foreground">Availability, latency, scale…</p>
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Generating architecture..." : "Generate Architecture"}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="secondary"
          disabled={pending}
          onClick={() => {
            const title = name.trim() || "Untitled architecture";
            const design = createBlankDesign(title, description);
            onGenerated({
              input: {
                ...input,
                name: title,
                description:
                  description.trim().length >= 10
                    ? description.trim()
                    : design.summary,
              },
              design,
            });
            router.replace("/design");
          }}
        >
          Start on a blank canvas
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Generate from the brief, or skip the model and draw the architecture yourself.
      </p>
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
