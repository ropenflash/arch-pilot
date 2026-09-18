import { describe, expect, it } from "vitest";
import {
  FROM_ZERO_STEPS,
  gradeCanvasStep,
  type CanvasStep,
  type QuizStep,
} from "@/lib/learn/campaign";
import {
  starterClientOnly,
  starterSharded,
  starterSingleServer,
  starterSplitData,
  starterTwoAppsAndLb,
  starterWithCache,
  starterWithCdn,
  starterWithQueue,
  starterWithReplica,
} from "@/lib/learn/starters";
import { addComponent, connectComponents } from "@/lib/architecture/mutations";
import { appServers, ofType } from "@/lib/learn/grade";
import { parseLearnProgress } from "@/lib/learn/progress";

function canvas(id: string): CanvasStep {
  const step = FROM_ZERO_STEPS.find((item) => item.id === id);
  if (!step || step.kind !== "canvas") {
    throw new Error(`Missing canvas step ${id}`);
  }
  return step;
}

describe("from-zero campaign", () => {
  it("starts small and asks for improvements with hints", () => {
    expect(FROM_ZERO_STEPS[0]?.id).toBe("one-box");
    expect(FROM_ZERO_STEPS.some((step) => step.kind === "quiz")).toBe(true);
    expect(FROM_ZERO_STEPS.every((step) => step.hints.length > 0)).toBe(true);
    expect(FROM_ZERO_STEPS[0]?.story).not.toMatch(/scale from zero to millions/i);
  });

  it("grades the first round: browser plus one app server", () => {
    const step = canvas("one-box");
    expect(gradeCanvasStep(step, starterClientOnly()).passed).toBe(false);
    expect(gradeCanvasStep(step, starterSingleServer()).passed).toBe(true);
  });

  it("rejects a browser talking straight to the database", () => {
    let design = starterSingleServer();
    design = addComponent(design, "database", { x: 0, y: 0 });
    const db = ofType(design, "database")[0]!;
    design = connectComponents(design, "client", db.id, "SQL");
    expect(gradeCanvasStep(canvas("split-data"), design).passed).toBe(false);
    expect(gradeCanvasStep(canvas("split-data"), starterSplitData()).passed).toBe(
      true,
    );
  });

  it("requires a balancer in front of two app servers", () => {
    expect(gradeCanvasStep(canvas("balance-the-fleet"), starterSplitData()).passed).toBe(
      false,
    );
    expect(
      gradeCanvasStep(canvas("balance-the-fleet"), starterTwoAppsAndLb()).passed,
    ).toBe(true);
    expect(appServers(starterTwoAppsAndLb()).length).toBeGreaterThanOrEqual(2);
  });

  it("builds a cumulative board for later rounds", () => {
    expect(gradeCanvasStep(canvas("replica"), starterWithReplica()).passed).toBe(true);
    expect(gradeCanvasStep(canvas("cache"), starterWithCache()).passed).toBe(true);
    expect(gradeCanvasStep(canvas("cdn"), starterWithCdn()).passed).toBe(true);
    expect(gradeCanvasStep(canvas("queue"), starterWithQueue()).passed).toBe(true);
    expect(gradeCanvasStep(canvas("shards"), starterWithQueue()).passed).toBe(false);
    expect(gradeCanvasStep(canvas("shards"), starterSharded()).passed).toBe(true);
    expect(gradeCanvasStep(canvas("ship-it"), starterSharded()).passed).toBe(true);
  });

  it("gives every deep dive exactly one correct answer and a hint", () => {
    const quizzes = FROM_ZERO_STEPS.filter(
      (step): step is QuizStep => step.kind === "quiz",
    );
    expect(quizzes.length).toBeGreaterThanOrEqual(4);
    for (const step of quizzes) {
      expect(step.choices.filter((choice) => choice.correct)).toHaveLength(1);
      expect(step.hints.length).toBeGreaterThan(0);
    }
  });

  it("parses saved progress without executing stored design data", () => {
    const progress = parseLearnProgress({
      stepId: "cache",
      completed: ["one-box"],
      design: starterWithCache(),
      hints: { cache: 1 },
      quizAnswers: { "sql-vs-docs": "sql" },
    });
    expect(progress.stepId).toBe("cache");
    expect(progress.completed).toEqual(["one-box"]);
    expect(progress.design?.title).toBeTruthy();
  });
});
