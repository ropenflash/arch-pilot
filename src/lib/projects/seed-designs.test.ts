import { describe, expect, it } from "vitest";
import { SEEDED_DESIGNS } from "@/lib/projects/seed-designs";
import { systemDesignSchema } from "@/lib/architecture/validation";

describe("seeded architectures", () => {
  it("keeps three production-quality reference designs", () => {
    expect(SEEDED_DESIGNS.map((item) => item.design.title)).toEqual([
      "Scalable E-commerce Platform",
      "RideGrid Ride Sharing System",
      "StreamForge Video Platform",
    ]);
  });

  it("states an architectural thesis and explicit assumptions", () => {
    for (const item of SEEDED_DESIGNS) {
      expect(systemDesignSchema.parse(item.design).title).toBe(item.design.title);
      expect(item.design.summary.length).toBeGreaterThan(180);
      expect(item.design.assumptions.length).toBeGreaterThanOrEqual(3);
      expect(item.design.tradeoffs.length).toBeGreaterThan(0);
      expect(item.design.failureScenarios.length).toBeGreaterThanOrEqual(3);
      expect(item.template.input.description.length).toBeGreaterThan(240);
    }
  });
});
