import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buildCapacityBreakdown } from "@/lib/capacity/calculations";
import type { SystemDesign, SystemDesignInput } from "@/lib/architecture/validation";
import { formatNumber } from "@/lib/utils";

export function CapacityPanel({
  design,
  input,
}: {
  design: SystemDesign;
  input: SystemDesignInput;
}) {
  const breakdown = buildCapacityBreakdown(input, design);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium">Capacity estimation</h2>
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
        <ul className="list-disc space-y-1 pl-5 text-xs text-amber-200/80">
          {breakdown.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">
          Arithmetic is computed in application code. The model may supply assumptions,
          not invented RPS math.
        </p>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="p-4">
        <p className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</p>
        <p className="text-xl font-medium text-zinc-50">{value}</p>
      </CardHeader>
    </Card>
  );
}

function Formula({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
      <span className="text-zinc-500">{k}</span>
      <span className="font-mono text-zinc-200">{v}</span>
    </div>
  );
}

function fmt(value: number | undefined, digits = 0) {
  if (value == null || Number.isNaN(value)) return "—";
  return formatNumber(value, digits);
}
