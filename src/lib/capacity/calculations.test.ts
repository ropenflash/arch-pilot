import { describe, expect, it } from "vitest";
import {
  calculateAverageRps,
  calculateBandwidth,
  calculatePeakRps,
  calculateStorage,
} from "@/lib/capacity/calculations";

describe("capacity calculations", () => {
  it("calculates average RPS from DAU and requests/user/day", () => {
    expect(calculateAverageRps(1_000_000, 50)).toBeCloseTo(578.7037, 3);
  });

  it("calculates peak RPS from average and multiplier", () => {
    const average = calculateAverageRps(1_000_000, 50);
    expect(calculatePeakRps(average, 5)).toBeCloseTo(2893.5185, 3);
    expect(Math.round(average) * 5).toBe(2895);
  });

  it("calculates storage per day and year", () => {
    const result = calculateStorage({
      dau: 1_000_000,
      bytesPerUserPerDay: 50_000,
    });
    expect(result.storagePerDayGb).toBeCloseTo(46.566, 2);
    expect(result.storagePerYearTb).toBeCloseTo((result.storagePerDayGb * 365) / 1024, 6);
  });

  it("uses explicit storage/day when provided", () => {
    const result = calculateStorage({ storagePerDayGb: 40 });
    expect(result.storagePerDayGb).toBe(40);
    expect(result.storagePerYearTb).toBeCloseTo((40 * 365) / 1024, 6);
  });

  it("calculates bandwidth in Mbps", () => {
    expect(
      calculateBandwidth({ peakRps: 2895, averageRequestSizeBytes: 1200 }),
    ).toBeCloseTo(27.792, 3);
  });

  it("rejects negative inputs", () => {
    expect(() => calculateAverageRps(-1, 10)).toThrow();
    expect(() => calculatePeakRps(1, -2)).toThrow();
    expect(() => calculateStorage({ storagePerDayGb: -1 })).toThrow();
  });
});
