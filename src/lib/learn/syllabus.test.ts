import { describe, expect, it } from "vitest";
import { FROM_ZERO_STEPS } from "@/lib/learn/campaign";
import {
  SYLLABUS,
  allLessons,
  getLesson,
  lessonForPractice,
  nextLesson,
} from "@/lib/learn/syllabus";

describe("scale-up syllabus", () => {
  it("covers the scale-up topics as original lessons, not a book recap", () => {
    const slugs = allLessons().map((lesson) => lesson.slug);
    expect(slugs).toEqual([
      "single-server",
      "split-web-db",
      "sql-or-not",
      "up-then-out",
      "load-balancer",
      "replicas",
      "cache-layer",
      "edge-cdn",
      "stateless-web",
      "multi-dc",
      "queues",
      "sharding",
      "observability",
      "production-checklist",
      "units-and-rounding",
      "latency-orders",
      "nines-of-uptime",
      "napkin-qps",
      "scope-the-hour",
      "blueprint-and-buy-in",
      "deep-dive-choices",
      "wrap-the-session",
    ]);
    const blob = JSON.stringify(SYLLABUS);
    expect(blob).not.toMatch(/scale from zero to millions/i);
    expect(blob).not.toMatch(/journey of a thousand miles/i);
    expect(allLessons().every((lesson) => lesson.sections.length >= 2)).toBe(true);
    expect(allLessons().every((lesson) => lesson.takeaways.length >= 3)).toBe(true);
    expect(allLessons().every((lesson) => lesson.check?.choices.some((c) => c.correct))).toBe(
      true,
    );
  });

  it("links every practice round to a lesson", () => {
    for (const step of FROM_ZERO_STEPS) {
      expect(lessonForPractice(step.id), step.id).toBeTruthy();
    }
  });

  it("walks lessons in order", () => {
    expect(getLesson("single-server")?.practiceStepIds).toEqual(["one-box"]);
    expect(getLesson("cache-layer")?.practiceStepIds).toEqual(["cache", "cache-miss"]);
    expect(nextLesson("single-server")?.slug).toBe("split-web-db");
    expect(nextLesson("production-checklist")?.slug).toBe("units-and-rounding");
    expect(nextLesson("wrap-the-session")).toBeUndefined();
    expect(getLesson("napkin-qps")?.practiceHref).toBe("/learn/estimate/lumen");
    expect(getLesson("scope-the-hour")?.practiceHref).toBe("/learn/approach/scope");
  });
});
