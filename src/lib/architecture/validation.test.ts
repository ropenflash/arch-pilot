import { describe, expect, it } from "vitest";
import { extractJson, parseSystemDesignOutput } from "@/lib/ai/parser";
import { systemDesignInputSchema, systemDesignSchema } from "@/lib/architecture/validation";

const validDesign = {
  title: "URL Shortener",
  summary: "A read-heavy redirect service with uniqueness on write.",
  assumptions: [{ name: "Requests per user per day", value: "8", rationale: "Mostly redirects." }],
  requirements: { functional: ["Redirect"], nonFunctional: ["Low latency"] },
  capacity: {},
  services: [
    {
      id: "api",
      name: "API Service",
      type: "service",
      description: "Creates and resolves short links.",
      responsibilities: ["Mint codes", "Redirect"],
      technology: "Go",
      scalingStrategy: "Horizontal",
      failureBehavior: "Fail closed on writes",
    },
  ],
  dataStores: [
    {
      id: "db",
      name: "PostgreSQL",
      type: "database",
      description: "Mapping store",
      responsibilities: ["Persist mappings"],
      technology: "PostgreSQL",
      scalingStrategy: "Read replicas",
    },
  ],
  messageSystems: [],
  externalSystems: [],
  architectureEdges: [{ from: "api", to: "db", label: "SQL" }],
  apis: [],
  dataModel: [],
  tradeoffs: [],
  failureScenarios: [],
  scalingStrategy: [],
  securityConsiderations: [],
  observability: { metrics: [], logs: [], traces: [], alerts: [] },
  technologyDecisions: [],
};

describe("AI JSON parsing", () => {
  it("extracts JSON from markdown fences", () => {
    const raw = "```json\n{\"ok\":true}\n```";
    expect(extractJson(raw)).toEqual({ ok: true });
  });

  it("extracts the first JSON object from surrounding text", () => {
    expect(extractJson("Here you go\n{\"a\":1}\nThanks")).toEqual({ a: 1 });
  });

  it("rejects malformed AI JSON", () => {
    expect(() => extractJson("not json at all")).toThrow(/Malformed JSON|Empty/);
    const parsed = parseSystemDesignOutput("```json\n{not json}\n```");
    expect(parsed.success).toBe(false);
    expect(parsed.error).toMatch(/Unable to parse architecture/);
  });

  it("validates a complete design", () => {
    const parsed = parseSystemDesignOutput(JSON.stringify(validDesign));
    expect(parsed.success).toBe(true);
    expect(parsed.data?.title).toBe("URL Shortener");
  });
});

describe("architecture validation", () => {
  it("fails when required architecture fields are missing", () => {
    const parsed = systemDesignSchema.safeParse({ title: "x" });
    expect(parsed.success).toBe(false);
  });

  it("requires at least one service", () => {
    const parsed = systemDesignSchema.safeParse({
      ...validDesign,
      services: [],
    });
    expect(parsed.success).toBe(false);
  });
});

describe("API input validation", () => {
  it("rejects a short description", () => {
    const parsed = systemDesignInputSchema.safeParse({
      name: "Sys",
      description: "too short",
      requirements: { functional: [], nonFunctional: [] },
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts a valid design request", () => {
    const parsed = systemDesignInputSchema.safeParse({
      name: "Payments",
      description: "Design a payment platform with a ledger and webhooks.",
      requirements: { functional: ["Charges"], nonFunctional: ["Idempotency"] },
    });
    expect(parsed.success).toBe(true);
  });
});
