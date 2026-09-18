import { describe, expect, it } from "vitest";
import { PRODUCT } from "@/lib/content/product";

describe("product content", () => {
  it("keeps the original ArchPilot identity", () => {
    expect(PRODUCT.name).toBe("ArchPilot");
    expect(PRODUCT.tagline).toBe("Design better systems with AI.");
    expect(PRODUCT.primaryCta).toBe("Create System Design");
    expect(PRODUCT.secondaryCta).toBe("View Examples");
  });

  it("asks the five architecture questions", () => {
    expect(PRODUCT.questions.map((item) => item.title)).toEqual([
      "Why?",
      "What are the trade-offs?",
      "When does this break?",
      "How does it scale?",
      "What happens when it fails?",
    ]);
  });

  it("covers generation progress and review empty copy", () => {
    expect(PRODUCT.generationSteps.length).toBeGreaterThanOrEqual(5);
    expect(PRODUCT.reviewEmpty.toLowerCase()).toContain("does not regenerate");
    expect(PRODUCT.capacityNote).toContain("86,400");
  });

  it("points learners at written practice systems instead of inventing a brief", () => {
    expect(PRODUCT.examplesHeadline).toBe("Design these systems");
    expect(PRODUCT.formLearnNote.toLowerCase()).toContain("prompts are already written");
    expect(PRODUCT.footer.toLowerCase()).toContain("design the systems");
  });
});
