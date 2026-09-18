import { describe, expect, it } from "vitest";
import {
  ARCHITECT_PRINCIPLES,
  buildReviewMessages,
  buildSystemDesignMessages,
} from "@/lib/ai/prompts";
import { DESIGN_TEMPLATES } from "@/lib/projects/templates";
import { SEEDED_DESIGNS } from "@/lib/projects/seed-designs";

describe("architect prompts", () => {
  it("encodes the five questions and anti-cargo-cult rules", () => {
    expect(ARCHITECT_PRINCIPLES).toContain("WHY");
    expect(ARCHITECT_PRINCIPLES).toContain("TRADE-OFFS");
    expect(ARCHITECT_PRINCIPLES).toContain("WHEN THIS BREAKS");
    expect(ARCHITECT_PRINCIPLES).toContain("HOW IT SCALES");
    expect(ARCHITECT_PRINCIPLES).toContain("WHAT HAPPENS WHEN IT FAILS");
    expect(ARCHITECT_PRINCIPLES).toContain("Do not force CDN, Kafka, Redis");
  });

  it("embeds the brief description in the user message", () => {
    const ecommerce = DESIGN_TEMPLATES.find((item) => item.slug === "ecommerce")!;
    const messages = buildSystemDesignMessages(ecommerce.input);
    expect(messages[0]?.content).toContain(ARCHITECT_PRINCIPLES.slice(0, 40));
    expect(messages[1]?.content).toContain("flash sales");
    expect(messages[1]?.content).toContain("1 million daily active users");
  });

  it("asks the reviewer to challenge rather than compliment", () => {
    const seed = SEEDED_DESIGNS[0]!;
    const messages = buildReviewMessages({
      input: seed.template.input,
      design: seed.design,
    });
    expect(messages[0]?.content).toContain("challenge the architecture");
    expect(messages[0]?.content).toContain("over-engineering");
  });
});
