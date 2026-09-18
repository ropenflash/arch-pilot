import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buildCapacityBreakdown } from "@/lib/capacity/calculations";
import type { SystemDesign, SystemDesignInput } from "@/lib/architecture/validation";
import { formatNumber } from "@/lib/utils";
import { PRODUCT } from "@/lib/content/product";

export function CapacityPanel({
  design,
  input,
}: {
  design: SystemDesign;
  input: SystemDesignInput;
}) {
  const breakdown = buildCapacityBreakdown(input, design);
  const steps = [
    breakdown.dau != null && breakdown.requestsPerUserPerDay != null
      ? `Daily requests = ${fmt(breakdown.dau, 0)} DAU × ${fmt(breakdown.requestsPerUserPerDay, 0)} requests/user = ${fmt(breakdown.dailyRequests, 0)}`
      : null,
    breakdown.dailyRequests != null
      ? `Average RPS = daily requests ÷ 86,400 = ${fmt(breakdown.averageRps ?? breakdown.averageRpsRounded, 0)}`
      : null,
    breakdown.peakMultiplier != null
      ? `Peak RPS = average × ${breakdown.peakMultiplier}× busy hour = ${fmt(breakdown.peakRpsFromRoundedAverage ?? breakdown.peakRps, 0)}`
      : null,
    breakdown.storagePerDayGb != null
      ? `Storage ≈ ${formatNumber(breakdown.storagePerDayGb, 2)} GB/day, ${formatNumber(breakdown.storagePerYearTb ?? 0, 2)} TB/year`
      : null,
    breakdown.bandwidthMbps != null
      ? `Busy-hour pipe ≈ ${formatNumber(breakdown.bandwidthMbps, 1)} Mbps`
      : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold text-foreground">Capacity estimation</h2>
        <Badge variant="outline">
          {breakdown.source === "calculated"
            ? "Deterministic"
            : breakdown.source === "mixed"
              ? "Mixed"
              : "Estimated"}
        </Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="Average RPS" value={fmt(breakdown.averageRps)} />
        <Metric label="Peak RPS" value={fmt(breakdown.peakRps)} />
        <Metric
          label="Storage / Day"
          value={
            breakdown.storagePerDayGb != null
              ? `${formatNumber(breakdown.storagePerDayGb, 2)} GB`
              : "—"
          }
        />
        <Metric
          label="Storage / Year"
          value={
            breakdown.storagePerYearTb != null
              ? `${formatNumber(breakdown.storagePerYearTb, 2)} TB`
              : "—"
          }
        />
        <Metric
          label="Bandwidth"
          value={
            breakdown.bandwidthMbps != null
              ? `${formatNumber(breakdown.bandwidthMbps, 1)} Mbps`
              : "—"
          }
        />
      </div>
      {steps.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Napkin walkthrough</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm leading-6 text-muted-foreground">
            <ol className="list-decimal space-y-1 pl-5">
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p>
              <Link href="/learn/estimate" className="font-medium text-primary hover:underline">
                Practice napkin math
              </Link>
              {" · "}
              <Link href="/learn/approach" className="font-medium text-primary hover:underline">
                Interview approach
              </Link>
            </p>
          </CardContent>
        </Card>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>Formulas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <Formula k="DAU" v={fmt(breakdown.dau, 0)} />
          <Formula k="Requests/User/Day" v={fmt(breakdown.requestsPerUserPerDay, 0)} />
          <Formula k="Daily Requests" v={fmt(breakdown.dailyRequests, 0)} />
          <Formula
            k="Average RPS"
            v={`≈ ${fmt(breakdown.averageRpsRounded ?? breakdown.averageRps, 0)}`}
          />
          <Formula k="Peak Multiplier" v={breakdown.peakMultiplier ? `${breakdown.peakMultiplier}x` : "—"} />
          <Formula
            k="Peak RPS"
            v={`≈ ${fmt(breakdown.peakRpsFromRoundedAverage ?? breakdown.peakRps, 0)}`}
          />
        </CardContent>
      </Card>
      {breakdown.notes.length ? (
        <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
          {breakdown.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          {PRODUCT.capacityNote}
        </p>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="p-4">
        <p className="text-[11px] uppercase tracking-wider text-foreground0">{label}</p>
        <p className="text-xl font-medium text-foreground">{value}</p>
      </CardHeader>
    </Card>
  );
}

function Formula({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
      <span className="text-foreground0">{k}</span>
      <span className="font-mono text-foreground">{v}</span>
    </div>
  );
}

function fmt(value: number | undefined, digits = 0) {
  if (value == null || Number.isNaN(value)) return "—";
  return formatNumber(value, digits);
}
