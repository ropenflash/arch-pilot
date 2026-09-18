import { describe, expect, it } from "vitest";
import {
  APPROACH_DONT,
  APPROACH_DO,
  APPROACH_DRILLS,
  APPROACH_STEPS,
  getApproachStep,
  scoreChoices,
} from "@/lib/learn/approach";
import {
  BYTE_UNITS,
  computeNapkin,
  ESTIMATE_SCENARIOS,
  fmtCount,
  gradeQpsGuess,
  hopWritesPerUserPerDay,
} from "@/lib/learn/estimate";
import { SYLLABUS } from "@/lib/learn/syllabus";

describe("napkin math", () => {
  it("keeps unit names as public facts, not a book table reprint", () => {
    expect(BYTE_UNITS.map((item) => item.powerOfTwo)).toEqual([10, 20, 30, 40, 50]);
    expect(JSON.stringify(BYTE_UNITS)).not.toMatch(/twitter/i);
  });

  it("walks Lumen from users to QPS and storage", () => {
    const lumen = ESTIMATE_SCENARIOS.find((item) => item.id === "lumen")!;
    const result = computeNapkin(lumen.fields);
    expect(result.dau).toBe(10_000_000);
    expect(result.avgQps).toBeGreaterThan(1000);
    expect(result.peakQps).toBeGreaterThan(result.avgQps);
    expect(result.interviewAvgQps).toBeLessThan(result.avgQps);
    expect(result.storageBytesPerDay).toBeGreaterThan(0);
    expect(result.english.length).toBeGreaterThanOrEqual(4);
  });

  it("counts Hop pings from trips, not from every opener", () => {
    expect(hopWritesPerUserPerDay()).toBeCloseTo(72, 5);
    const hop = ESTIMATE_SCENARIOS.find((item) => item.id === "hop")!;
    expect(hop.fields.writesPerUserPerDay).toBeCloseTo(72, 5);
    const result = computeNapkin(hop.fields);
    expect(result.dailyWrites).toBeCloseTo(1_500_000 * 72, 0);
  });

  it("grades a QPS guess by order of magnitude", () => {
    expect(gradeQpsGuess(1000, 1000).rank).toBe("tight");
    expect(gradeQpsGuess(1800, 1000).rank).toBe("order");
    expect(gradeQpsGuess(200, 1000).rank).toBe("far");
    expect(gradeQpsGuess(1, 1000).rank).toBe("miss");
    expect(fmtCount(10_000_000)).toBe("10M");
  });
});

describe("interview approach", () => {
  it("is a four-step hour with original copy", () => {
    expect(APPROACH_STEPS.map((step) => step.id)).toEqual([
      "scope",
      "blueprint",
      "deep-dive",
      "wrap",
    ]);
    expect(getApproachStep("blueprint").minutesLow).toBe(10);
    const blob = JSON.stringify({ APPROACH_STEPS, APPROACH_DO, APPROACH_DONT, APPROACH_DRILLS });
    expect(blob).not.toMatch(/why did the tiger roar/i);
    expect(blob).not.toMatch(/don't be like jimmy/i);
    expect(blob).not.toMatch(/edgerank/i);
    expect(blob).not.toMatch(/scale from zero to millions/i);
  });

  it("scores clarifying questions: good picks help, premature ones hurt", () => {
    const drill = APPROACH_DRILLS[0]!;
    const goodIds = drill.questions.filter((item) => item.good).map((item) => item.id);
    const perfect = scoreChoices(drill.questions, goodIds);
    expect(perfect.badPicked).toBe(0);
    expect(perfect.missedGood).toBe(0);
    const noisy = scoreChoices(drill.questions, ["k8s", "rank"]);
    expect(noisy.score).toBe(0);
    expect(noisy.badPicked).toBe(2);
  });
});

describe("learn tracks stay original", () => {
  it("does not paste book slogans into the syllabus blob", () => {
    const blob = JSON.stringify(SYLLABUS);
    expect(blob).not.toMatch(/scale from zero to millions/i);
    expect(blob).not.toMatch(/journey of a thousand miles/i);
  });
});
