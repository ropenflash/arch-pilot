import { describe, expect, it } from "vitest";
import {
  addComponent,
  connectComponents,
  createBlankDesign,
} from "@/lib/architecture/mutations";
import { BUILDING_BLOCKS } from "@/lib/learn/building-blocks";
import {
  evaluateDesignReasoning,
  tradeoffsForDesign,
} from "@/lib/learn/design-feedback";
import { MINDSET_LESSONS } from "@/lib/learn/mindset";
import { parsePlatformProgress } from "@/lib/learn/platform-progress";
import { getProblem } from "@/lib/learn/problems";
import {
  assignments,
  consistentHashOwner,
  moduloShard,
  movedKeys,
  ringNodes,
} from "@/lib/learn/sharding";

describe("learning platform curriculum", () => {
  it("has the eight mindset lessons in the requested thinking order", () => {
    expect(MINDSET_LESSONS.map((lesson) => lesson.id)).toEqual([
      "what-is-system-design",
      "requirements-before-architecture",
      "functional-vs-non-functional",
      "clarifying-questions",
      "define-scope",
      "explicit-assumptions",
      "communicate-while-designing",
      "tradeoffs-not-perfect",
    ]);
    expect(MINDSET_LESSONS.every((lesson) => lesson.takeaways.length >= 3)).toBe(true);
    expect(
      MINDSET_LESSONS.every((lesson) =>
        lesson.quiz.choices.some((choice) => choice.correct),
      ),
    ).toBe(true);
  });

  it("covers every core building block as problem → component → trade-off", () => {
    expect(BUILDING_BLOCKS.map((block) => block.id)).toEqual([
      "dns",
      "load-balancer",
      "application-servers",
      "database",
      "replication",
      "cache",
      "cdn",
      "message-queue",
      "object-storage",
      "search",
      "sharding",
      "consistent-hashing",
      "rate-limiter",
    ]);
    for (const block of BUILDING_BLOCKS) {
      expect(block.problem.length, block.id).toBeGreaterThan(30);
      expect(block.benefits.length, block.id).toBeGreaterThanOrEqual(3);
      expect(block.costs.length, block.id).toBeGreaterThanOrEqual(3);
      expect(block.exercise.options.some((option) => option.good), block.id).toBe(true);
    }
  });

  it("keeps new educational content original", () => {
    const content = JSON.stringify({ MINDSET_LESSONS, BUILDING_BLOCKS });
    expect(content).not.toMatch(/journey of a thousand miles/i);
    expect(content).not.toMatch(/scale from zero to millions/i);
    expect(content).not.toMatch(/figure \d+-\d+/i);
  });
});

describe("sharding playground math", () => {
  it("routes numeric keys with modulo", () => {
    expect(moduloShard(7, 4)).toBe(3);
    expect(moduloShard(8, 4)).toBe(0);
  });

  it("moves fewer than all keys when a ring server is added", () => {
    const keys = Array.from({ length: 100 }, (_, index) => `key-${index}`);
    const before = assignments(keys, ringNodes(3));
    const after = assignments(keys, ringNodes(4));
    const moved = movedKeys(before, after);
    expect(moved.length).toBeGreaterThan(0);
    expect(moved.length).toBeLessThan(keys.length);
    expect(consistentHashOwner("known-key", ringNodes(3))).toBeTruthy();
  });
});

describe("reasoning-oriented design evaluation", () => {
  it("explains missing boundaries without calling the design wrong", () => {
    const design = createBlankDesign("TinyPath", "Short-link practice");
    const observations = evaluateDesignReasoning(design, getProblem("url-shortener")!);
    expect(observations.some((item) => item.id === "missing-app")).toBe(true);
    expect(observations.some((item) => item.id === "read-pressure")).toBe(true);
    expect(observations.every((item) => item.why && item.question)).toBe(true);
  });

  it("derives component trade-offs from the board", () => {
    let design = createBlankDesign("TinyPath", "Short-link practice");
    design = addComponent(design, "service");
    design = addComponent(design, "cache");
    const app = design.services.find((item) => item.type === "service")!;
    const cache = design.dataStores.find((item) => item.type === "cache")!;
    design = connectComponents(design, "client", app.id);
    design = connectComponents(design, app.id, cache.id);
    expect(tradeoffsForDesign(design).map((item) => item.type)).toEqual([
      "service",
      "cache",
    ]);
  });
});

describe("platform progress parsing", () => {
  it("deduplicates activity and keeps valid quiz areas", () => {
    const progress = parsePlatformProgress({
      concepts: ["cache", "cache", 2],
      exercises: ["latency-path", "latency-path"],
      quizAttempts: {
        a: { correct: true, area: "scalability" },
        b: { correct: false, area: "unknown" },
      },
    });
    expect(progress.concepts).toEqual(["cache"]);
    expect(progress.exercises).toEqual(["latency-path"]);
    expect(progress.quizAttempts).toEqual({
      a: { correct: true, area: "scalability" },
    });
  });
});
