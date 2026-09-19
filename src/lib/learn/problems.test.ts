import { describe, expect, it } from "vitest";
import { addComponent } from "@/lib/architecture/mutations";
import { evaluateChecks } from "@/lib/learn/grade";
import { COURSE_STAGES, continueLesson, practiceFor, stageForLesson } from "@/lib/learn/course";
import { getLesson } from "@/lib/learn/syllabus";
import {
  PRACTICE_PROBLEMS,
  getProblem,
  problemHref,
  starterForProblem,
} from "@/lib/learn/problems";
import { parseProblemProgress } from "@/lib/learn/problem-progress";
import { getProblemGuide, PROBLEM_GUIDES } from "@/lib/learn/problem-guides";
import {
  RATE_LIMITER_SECTIONS,
  getRateLimiterSection,
  rateLimiterLessonHref,
} from "@/lib/learn/rate-limiter-course";

describe("practice systems", () => {
  it("covers the interview index as original prompts, not a book reprint", () => {
    expect(PRACTICE_PROBLEMS.map((item) => item.id)).toEqual([
      "rate-limiter",
      "consistent-hashing",
      "kv-store",
      "unique-ids",
      "url-shortener",
      "pastebin",
      "web-crawler",
      "notifications",
      "news-feed",
      "chat",
      "autocomplete",
      "large-scale-search",
      "video",
      "cloud-files",
    ]);
    const blob = JSON.stringify(PRACTICE_PROBLEMS);
    expect(blob).not.toMatch(/scale from zero to millions/i);
    expect(blob).not.toMatch(/journey of a thousand miles/i);
    expect(blob).not.toMatch(/youtube/i);
    expect(blob).not.toMatch(/google drive/i);
    expect(blob).not.toMatch(/edgerank/i);
    expect(PRACTICE_PROBLEMS.every((item) => item.v1.length >= 3)).toBe(true);
    expect(PRACTICE_PROBLEMS.every((item) => item.checks.length >= 1)).toBe(true);
    expect(PRACTICE_PROBLEMS.every((item) => item.prompt.length > 40)).toBe(true);
  });

  it("starts each board empty so the learner has to draw it", () => {
    for (const problem of PRACTICE_PROBLEMS) {
      const design = starterForProblem(problem);
      expect(design.title).toBe(problem.product);
      expect(design.services).toHaveLength(1);
      expect(design.services[0]?.type).toBe("client");
      expect(evaluateChecks(design, problem.checks).passed).toBe(false);
    }
    const limiter = getProblem("rate-limiter")!;
    let design = starterForProblem(limiter);
    design = addComponent(design, "service");
    design = addComponent(design, "cache");
    expect(evaluateChecks(design, limiter.checks).passed).toBe(true);
    expect(problemHref("url-shortener")).toBe("/learn/problems/url-shortener");
  });

  it("gives every system a four-step coach and reference approach", () => {
    expect(Object.keys(PROBLEM_GUIDES).sort()).toEqual(
      PRACTICE_PROBLEMS.map((problem) => problem.id).sort(),
    );
    for (const problem of PRACTICE_PROBLEMS) {
      const guide = getProblemGuide(problem.id);
      expect(guide.concept.length, problem.id).toBeGreaterThan(40);
      expect(guide.steps, problem.id).toHaveLength(4);
      expect(
        guide.steps.every(
          (step) =>
            step.goal.length > 20 &&
            step.questions.length >= 2 &&
            step.nudge.length > 20,
        ),
        problem.id,
      ).toBe(true);
      expect(guide.referenceFlow.length, problem.id).toBeGreaterThan(50);
      expect(guide.decisions.length, problem.id).toBeGreaterThanOrEqual(3);
      expect(guide.failureDrill.length, problem.id).toBeGreaterThan(40);
    }
  });

  it("parses saved problem progress", () => {
    expect(parseProblemProgress({ completed: ["chat", 2, "chat"] }).completed).toEqual([
      "chat",
      "chat",
    ]);
    expect(parseProblemProgress(null).completed).toEqual([]);
    const problem = getProblem("chat")!;
    const design = starterForProblem(problem);
    expect(
      parseProblemProgress({
        completed: [],
        designs: { chat: design, broken: { title: "no graph" } },
      }).designs,
    ).toEqual({ chat: design });
  });
});

describe("course stages", () => {
  it("is grow → size → hour → design these systems", () => {
    expect(COURSE_STAGES.map((stage) => stage.id)).toEqual([
      "grow",
      "size",
      "hour",
      "designs",
    ]);
    expect(COURSE_STAGES[3]?.moduleIds).toEqual([]);
    expect(stageForLesson("single-server").id).toBe("grow");
    expect(stageForLesson("napkin-qps").id).toBe("size");
    expect(stageForLesson("scope-the-hour").id).toBe("hour");
    expect(continueLesson([]).slug).toBe("single-server");
    expect(practiceFor(getLesson("cache-layer")!)?.href).toBe("/learn/from-zero/cache");
    expect(practiceFor(getLesson("napkin-qps")!)?.href).toBe("/learn/estimate/lumen");
    expect(practiceFor(getLesson("wrap-the-session")!)?.href).toBe("/learn/approach/wrap");
  });
});

describe("rate limiter course", () => {
  it("teaches the limiter the way an interview starts: why, questions, bar, then design", () => {
    expect(RATE_LIMITER_SECTIONS.map((section) => section.id)).toEqual([
      "why",
      "scope",
      "requirements",
      "placement",
      "algorithms",
      "single-node",
      "distributed",
      "operations",
    ]);
    expect(RATE_LIMITER_SECTIONS.every((section) => section.intro.length >= 2)).toBe(true);
    expect(RATE_LIMITER_SECTIONS.every((section) => section.keyPoints.length >= 4)).toBe(
      true,
    );
    expect(
      RATE_LIMITER_SECTIONS.every((section) =>
        section.checkpoint.choices.some((choice) => choice.correct),
      ),
    ).toBe(true);
    expect(getRateLimiterSection("why")?.examples).toHaveLength(3);
    expect(getRateLimiterSection("scope")?.interview).toHaveLength(6);
    expect(getRateLimiterSection("requirements")?.requirements).toHaveLength(6);
    expect(getRateLimiterSection("algorithms")?.keyPoints).toHaveLength(5);
    expect(rateLimiterLessonHref()).toBe("/learn/problems/rate-limiter/learn/why");
  });

  it("uses the chapter pattern without copying its figures or distinctive text", () => {
    const content = JSON.stringify(RATE_LIMITER_SECTIONS);
    expect(content).not.toMatch(/figure 4-/i);
    expect(content).not.toMatch(/twitter/i);
    expect(content).not.toMatch(/lyft/i);
    expect(content).not.toMatch(/shopify/i);
    expect(content).not.toMatch(/cloudflare/i);
  });
});
