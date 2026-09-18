import type { SystemDesign, SystemDesignInput } from "@/lib/architecture/validation";

export const SECONDS_PER_DAY = 86_400;
export const BYTES_PER_GB = 1024 ** 3;
export const GB_PER_TB = 1024;
export const BITS_PER_BYTE = 8;

export function calculateAverageRps(
  dau: number,
  requestsPerUserPerDay: number,
): number {
  if (!Number.isFinite(dau) || !Number.isFinite(requestsPerUserPerDay)) {
    throw new Error("DAU and requests per user per day must be finite numbers");
  }
  if (dau < 0 || requestsPerUserPerDay < 0) {
    throw new Error("DAU and requests per user per day cannot be negative");
  }
  return (dau * requestsPerUserPerDay) / SECONDS_PER_DAY;
}

export function calculatePeakRps(
  averageRps: number,
  peakMultiplier: number,
): number {
  if (!Number.isFinite(averageRps) || !Number.isFinite(peakMultiplier)) {
    throw new Error("Average RPS and peak multiplier must be finite numbers");
  }
  if (averageRps < 0 || peakMultiplier < 0) {
    throw new Error("Average RPS and peak multiplier cannot be negative");
  }
  return averageRps * peakMultiplier;
}

export function calculateStorage(params: {
  dau?: number;
  bytesPerUserPerDay?: number;
  storagePerDayGb?: number;
}): { storagePerDayGb: number; storagePerYearTb: number } {
  const storagePerDayGb =
    params.storagePerDayGb != null
      ? params.storagePerDayGb
      : params.dau != null && params.bytesPerUserPerDay != null
        ? (params.dau * params.bytesPerUserPerDay) / BYTES_PER_GB
        : NaN;

  if (!Number.isFinite(storagePerDayGb) || storagePerDayGb < 0) {
    throw new Error(
      "Storage calculation requires non-negative storagePerDayGb or dau + bytesPerUserPerDay",
    );
  }

  return {
    storagePerDayGb,
    storagePerYearTb: (storagePerDayGb * 365) / GB_PER_TB,
  };
}

export function calculateBandwidth(params: {
  peakRps: number;
  averageRequestSizeBytes: number;
}): number {
  if (
    !Number.isFinite(params.peakRps) ||
    !Number.isFinite(params.averageRequestSizeBytes)
  ) {
    throw new Error("Peak RPS and average request size must be finite numbers");
  }
  if (params.peakRps < 0 || params.averageRequestSizeBytes < 0) {
    throw new Error("Peak RPS and average request size cannot be negative");
  }
  return (params.peakRps * params.averageRequestSizeBytes * BITS_PER_BYTE) / 1_000_000;
}

export interface CapacityBreakdown {
  dau?: number;
  requestsPerUserPerDay?: number;
  dailyRequests?: number;
  averageRps?: number;
  averageRpsRounded?: number;
  peakMultiplier?: number;
  peakRps?: number;
  peakRpsFromRoundedAverage?: number;
  storagePerDayGb?: number;
  storagePerYearTb?: number;
  averageRequestSizeBytes?: number;
  bandwidthMbps?: number;
  source: "calculated" | "estimated" | "mixed";
  notes: string[];
}

function parseNumeric(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  if (!cleaned) return undefined;
  const parsed = Number(cleaned[0]);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function findAssumption(
  assumptions: { name: string; value: string }[],
  patterns: RegExp[],
): number | undefined {
  for (const assumption of assumptions) {
    if (patterns.some((pattern) => pattern.test(assumption.name))) {
      const parsed = parseNumeric(assumption.value);
      if (parsed != null) return parsed;
    }
  }
  return undefined;
}

export function buildCapacityBreakdown(
  input: SystemDesignInput,
  design: SystemDesign,
): CapacityBreakdown {
  const notes: string[] = [];
  const dau = input.scale?.dau;
  const requestsPerUserPerDay =
    input.scale?.requestsPerUserPerDay ??
    findAssumption(design.assumptions, [
      /requests?\s*\/?\s*user/i,
      /req(uest)?s?\s+per\s+user/i,
    ]);
  const peakMultiplier =
    input.scale?.peakTrafficMultiplier ??
    findAssumption(design.assumptions, [/peak/i, /multiplier/i]) ??
    5;
  const averageRequestSizeBytes =
    input.scale?.averageRequestSizeBytes ??
    findAssumption(design.assumptions, [
      /request size/i,
      /payload/i,
      /bytes per request/i,
    ]);
  const bytesPerUserPerDay =
    input.scale?.bytesPerUserPerDay ??
    findAssumption(design.assumptions, [
      /bytes per user/i,
      /storage per user/i,
    ]);
  const storagePerDayInput = input.scale?.expectedStorageGrowthGbPerDay;

  const breakdown: CapacityBreakdown = {
    dau,
    requestsPerUserPerDay,
    peakMultiplier,
    averageRequestSizeBytes,
    source: "estimated",
    notes,
  };

  let calculatedFields = 0;
  let estimatedFields = 0;

  if (dau != null && requestsPerUserPerDay != null) {
    const dailyRequests = dau * requestsPerUserPerDay;
    const averageRps = calculateAverageRps(dau, requestsPerUserPerDay);
    const averageRpsRounded = Math.round(averageRps);
    const peakRps = calculatePeakRps(averageRps, peakMultiplier);
    breakdown.dailyRequests = dailyRequests;
    breakdown.averageRps = averageRps;
    breakdown.averageRpsRounded = averageRpsRounded;
    breakdown.peakRps = peakRps;
    breakdown.peakRpsFromRoundedAverage = averageRpsRounded * peakMultiplier;
    calculatedFields += 2;
  } else {
    if (design.capacity.averageRps != null) {
      breakdown.averageRps = design.capacity.averageRps;
      estimatedFields += 1;
      notes.push(
        "Average RPS is estimated because DAU or requests/user/day was not provided.",
      );
    }
    if (design.capacity.peakRps != null) {
      breakdown.peakRps = design.capacity.peakRps;
      estimatedFields += 1;
      notes.push(
        "Peak RPS is estimated because inputs were insufficient for deterministic calculation.",
      );
    }
  }

  try {
    const storage = calculateStorage({
      dau,
      bytesPerUserPerDay,
      storagePerDayGb: storagePerDayInput,
    });
    breakdown.storagePerDayGb = storage.storagePerDayGb;
    breakdown.storagePerYearTb = storage.storagePerYearTb;
    calculatedFields += 1;
  } catch {
    if (design.capacity.storagePerDayGb != null) {
      breakdown.storagePerDayGb = design.capacity.storagePerDayGb;
      estimatedFields += 1;
      notes.push("Storage/day is estimated from architecture assumptions.");
    }
    if (design.capacity.storagePerYearTb != null) {
      breakdown.storagePerYearTb = design.capacity.storagePerYearTb;
      estimatedFields += 1;
    }
  }

  const peakForBandwidth = breakdown.peakRps;
  if (peakForBandwidth != null && averageRequestSizeBytes != null) {
    breakdown.bandwidthMbps = calculateBandwidth({
      peakRps: peakForBandwidth,
      averageRequestSizeBytes,
    });
    calculatedFields += 1;
  } else if (design.capacity.bandwidthMbps != null) {
    breakdown.bandwidthMbps = design.capacity.bandwidthMbps;
    estimatedFields += 1;
    notes.push(
      "Bandwidth is estimated because peak RPS or average request size was missing.",
    );
  }

  breakdown.source =
    calculatedFields > 0 && estimatedFields === 0
      ? "calculated"
      : calculatedFields > 0
        ? "mixed"
        : "estimated";

  return breakdown;
}

export function applyDeterministicCapacity(
  input: SystemDesignInput,
  design: SystemDesign,
): SystemDesign {
  const breakdown = buildCapacityBreakdown(input, design);
  return {
    ...design,
    capacity: {
      ...design.capacity,
      dau: breakdown.dau ?? design.capacity.dau,
      averageRps: breakdown.averageRps ?? design.capacity.averageRps,
      peakRps: breakdown.peakRps ?? design.capacity.peakRps,
      storagePerDayGb:
        breakdown.storagePerDayGb ?? design.capacity.storagePerDayGb,
      storagePerYearTb:
        breakdown.storagePerYearTb ?? design.capacity.storagePerYearTb,
      bandwidthMbps: breakdown.bandwidthMbps ?? design.capacity.bandwidthMbps,
      requestsPerUserPerDay:
        breakdown.requestsPerUserPerDay ??
        design.capacity.requestsPerUserPerDay,
      peakMultiplier: breakdown.peakMultiplier ?? design.capacity.peakMultiplier,
      source: breakdown.source,
    },
  };
}
