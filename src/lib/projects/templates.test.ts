import { describe, expect, it } from "vitest";
import { DESIGN_TEMPLATES, getTemplate } from "@/lib/projects/templates";
import { systemDesignInputSchema } from "@/lib/architecture/validation";

describe("example briefs", () => {
  it("ships the six core system-design problems", () => {
    expect(DESIGN_TEMPLATES.map((item) => item.slug)).toEqual([
      "video-streaming",
      "ride-sharing",
      "ecommerce",
      "url-shortener",
      "realtime-chat",
      "payments",
    ]);
  });

  it("validates every brief as a system design input", () => {
    for (const template of DESIGN_TEMPLATES) {
      const parsed = systemDesignInputSchema.parse(template.input);
      expect(parsed.description.length).toBeGreaterThan(240);
      expect(parsed.requirements.functional.length).toBeGreaterThanOrEqual(4);
      expect(parsed.requirements.nonFunctional.length).toBeGreaterThanOrEqual(3);
      expect(parsed.scale?.dau).toBeGreaterThan(0);
      expect(template.domain).toBeTruthy();
      expect(template.focus).toBeTruthy();
      expect(template.scaleLabel).toMatch(/DAU|K DAU|M DAU/);
    }
  });

  it("looks up templates by slug", () => {
    expect(getTemplate("ecommerce")?.input.name).toBe("Scalable E-commerce Platform");
    expect(getTemplate("missing")).toBeUndefined();
  });
});
