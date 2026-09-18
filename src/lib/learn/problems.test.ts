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

describe("practice systems", () => {
  it("covers the interview index as original prompts, not a book reprint", () => {
    expect(PRACTICE_PROBLEMS.map((item) => item.id)).toEqual([
      "rate-limiter",
      "consistent-hashing",
      "kv-store",
      "unique-ids",
      "url-shortener",
      "web-crawler",
      "notifications",
      "news-feed",
      "chat",
      "autocomplete",
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

  it("parses saved problem progress", () => {
    expect(parseProblemProgress({ completed: ["chat", 2, "chat"] }).completed).toEqual([
      "chat",
      "chat",
    ]);
    expect(parseProblemProgress(null).completed).toEqual([]);
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
