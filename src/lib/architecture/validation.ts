import { z } from "zod";

const MAX_STRING = 8_000;
const MAX_TEXT = 40_000;

export const architectureNodeTypeSchema = z.enum([
  "client",
  "cdn",
  "load_balancer",
  "gateway",
  "auth",
  "service",
  "database",
  "cache",
  "queue",
  "storage",
  "search",
  "external",
  "other",
]);

export type ArchitectureNodeType = z.infer<typeof architectureNodeTypeSchema>;

function coerceStringList(value: unknown): unknown {
  if (value == null) return [];
  if (typeof value === "string") {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return value;
}

export const stringListSchema = z.preprocess(
  coerceStringList,
  z.array(z.string().min(1).max(MAX_STRING)).max(200),
);

const optionalNumber = z
  .union([z.number(), z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value == null || value === "") return undefined;
    const parsed = typeof value === "number" ? value : Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  });

export const assumptionSchema = z
  .object({
    name: z.string().min(1).max(200),
    value: z.union([z.string(), z.number()]).transform((value) => String(value)),
    rationale: z.string().max(MAX_STRING).optional().default(""),
  })
  .passthrough();

export const componentBaseSchema = z.object({
  id: z.string().min(1).max(120),
  name: z.string().min(1).max(200),
  description: z.string().max(MAX_TEXT).default(""),
  responsibilities: stringListSchema.default([]),
  technology: z.string().max(200).optional().default(""),
  scalingStrategy: z.string().max(MAX_STRING).optional().default(""),
  failureBehavior: z.string().max(MAX_STRING).optional().default(""),
});

function normalizeNodeType(
  value: unknown,
  fallback: ArchitectureNodeType,
): ArchitectureNodeType {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  const aliases: Record<string, ArchitectureNodeType> = {
    client: "client",
    web_client: "client",
    mobile: "client",
    browser: "client",
    cdn: "cdn",
    loadbalancer: "load_balancer",
    load_balancer: "load_balancer",
    lb: "load_balancer",
    api_gateway: "gateway",
    gateway: "gateway",
    auth: "auth",
    authentication: "auth",
    identity: "auth",
    service: "service",
    application: "service",
    app: "service",
    microservice: "service",
    database: "database",
    db: "database",
    postgres: "database",
    postgresql: "database",
    mysql: "database",
    cache: "cache",
    redis: "cache",
    queue: "queue",
    kafka: "queue",
    pubsub: "queue",
    stream: "queue",
    message_queue: "queue",
    broker: "queue",
    storage: "storage",
    object_storage: "storage",
    s3: "storage",
    blob: "storage",
    search: "search",
    opensearch: "search",
    elasticsearch: "search",
    external: "external",
    third_party: "external",
    api: "external",
  };
  return aliases[normalized] ?? fallback;
}

export const serviceSchema = componentBaseSchema
  .extend({
    type: z
      .unknown()
      .transform((value) =>
        normalizeNodeType(value, "service"),
      ) as z.ZodType<ArchitectureNodeType>,
  })
  .passthrough();

export const dataStoreSchema = componentBaseSchema
  .extend({
    type: z
      .unknown()
      .transform((value) =>
        normalizeNodeType(value, "database"),
      ) as z.ZodType<ArchitectureNodeType>,
    dataCharacteristics: z.string().max(MAX_STRING).optional().default(""),
  })
  .passthrough();

export const messageSystemSchema = componentBaseSchema
  .extend({
    type: z
      .unknown()
      .transform((value) =>
        normalizeNodeType(value, "queue"),
      ) as z.ZodType<ArchitectureNodeType>,
  })
  .passthrough();

export const externalSystemSchema = componentBaseSchema
  .extend({
    type: z
      .unknown()
      .transform((value) =>
        normalizeNodeType(value, "external"),
      ) as z.ZodType<ArchitectureNodeType>,
  })
  .passthrough();

export const architectureEdgeSchema = z
  .object({
    id: z.string().min(1).max(120).optional(),
    from: z.string().min(1).max(120),
    to: z.string().min(1).max(120),
    label: z.string().max(80).optional().default(""),
    protocol: z.string().max(80).optional().default(""),
    description: z.string().max(MAX_STRING).optional().default(""),
  })
  .passthrough();

export const apiEndpointSchema = z
  .object({
    method: z.string().min(1).max(16),
    path: z.string().min(1).max(300),
    description: z.string().max(MAX_STRING).optional().default(""),
    request: z.unknown().optional(),
    response: z.unknown().optional(),
    authentication: z.string().max(200).optional().default(""),
    idempotency: z.string().max(200).optional().default(""),
  })
  .passthrough();

export const dataModelFieldSchema = z.object({
  name: z.string().min(1).max(120),
  type: z.string().min(1).max(120),
  description: z.string().max(MAX_STRING).optional().default(""),
});

export const dataModelSchema = z
  .object({
    name: z.string().min(1).max(120),
    description: z.string().max(MAX_STRING).optional().default(""),
    fields: z.array(dataModelFieldSchema).default([]),
    relationships: z
      .array(
        z.object({
          target: z.string().min(1).max(120),
          type: z.string().max(80).optional().default("references"),
          description: z.string().max(MAX_STRING).optional().default(""),
        }),
      )
      .default([]),
  })
  .passthrough();

export const tradeoffSchema = z
  .object({
    decision: z.string().min(1).max(MAX_STRING),
    benefit: z.string().max(MAX_STRING).default(""),
    cost: z.string().max(MAX_STRING).default(""),
    whenToReconsider: z.string().max(MAX_STRING).default(""),
  })
  .passthrough();

export const failureScenarioSchema = z
  .object({
    scenario: z.string().min(1).max(MAX_STRING),
    impact: z.string().max(MAX_STRING).default(""),
    detection: z.string().max(MAX_STRING).default(""),
    mitigation: z.string().max(MAX_STRING).default(""),
    recovery: z.string().max(MAX_STRING).default(""),
  })
  .passthrough();

export const technologyDecisionSchema = z
  .object({
    technology: z.string().min(1).max(200),
    why: z.string().max(MAX_STRING).default(""),
    alternative: z.string().max(200).default(""),
    whyNot: z.string().max(MAX_STRING).default(""),
  })
  .passthrough();

export const observabilitySchema = z
  .object({
    metrics: stringListSchema.default([]),
    logs: stringListSchema.default([]),
    traces: stringListSchema.default([]),
    alerts: stringListSchema.default([]),
  })
  .default({
    metrics: [],
    logs: [],
    traces: [],
    alerts: [],
  });

export const capacitySchema = z
  .object({
    dau: optionalNumber,
    peakRps: optionalNumber,
    averageRps: optionalNumber,
    storagePerDayGb: optionalNumber,
    storagePerYearTb: optionalNumber,
    bandwidthMbps: optionalNumber,
    requestsPerUserPerDay: optionalNumber,
    peakMultiplier: optionalNumber,
    source: z.enum(["calculated", "estimated", "mixed"]).optional(),
  })
  .default(() => ({
    dau: undefined,
    peakRps: undefined,
    averageRps: undefined,
    storagePerDayGb: undefined,
    storagePerYearTb: undefined,
    bandwidthMbps: undefined,
    requestsPerUserPerDay: undefined,
    peakMultiplier: undefined,
    source: undefined,
  }));

export const systemDesignSchema = z
  .object({
    title: z.string().min(1).max(200),
    summary: z.string().min(1).max(MAX_TEXT),
    assumptions: z.array(assumptionSchema).default([]),
    requirements: z
      .object({
        functional: stringListSchema.default([]),
        nonFunctional: stringListSchema.default([]),
      })
      .default({ functional: [], nonFunctional: [] }),
    capacity: capacitySchema,
    services: z.array(serviceSchema).min(1, "At least one service is required"),
    dataStores: z.array(dataStoreSchema).default([]),
    messageSystems: z.array(messageSystemSchema).default([]),
    externalSystems: z.array(externalSystemSchema).default([]),
    architectureEdges: z.array(architectureEdgeSchema).default([]),
    apis: z.array(apiEndpointSchema).default([]),
    dataModel: z.array(dataModelSchema).default([]),
    tradeoffs: z.array(tradeoffSchema).default([]),
    failureScenarios: z.array(failureScenarioSchema).default([]),
    scalingStrategy: stringListSchema.default([]),
    securityConsiderations: stringListSchema.default([]),
    observability: observabilitySchema,
    technologyDecisions: z.array(technologyDecisionSchema).default([]),
  })
  .passthrough()
  .superRefine((design, ctx) => {
    const ids = new Set<string>();
    const duplicates: string[] = [];
    const components = [
      ...design.services,
      ...design.dataStores,
      ...design.messageSystems,
      ...design.externalSystems,
    ];
    for (const component of components) {
      if (ids.has(component.id)) duplicates.push(component.id);
      ids.add(component.id);
    }
    if (duplicates.length > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["services"],
        message: `Duplicate component ids: ${duplicates.join(", ")}`,
      });
    }
  });

export type SystemDesign = z.infer<typeof systemDesignSchema>;
export type Assumption = z.infer<typeof assumptionSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type DataStore = z.infer<typeof dataStoreSchema>;
export type MessageSystem = z.infer<typeof messageSystemSchema>;
export type ExternalSystem = z.infer<typeof externalSystemSchema>;
export type ArchitectureEdge = z.infer<typeof architectureEdgeSchema>;
export type APIEndpoint = z.infer<typeof apiEndpointSchema>;
export type DataModel = z.infer<typeof dataModelSchema>;
export type Tradeoff = z.infer<typeof tradeoffSchema>;
export type FailureScenario = z.infer<typeof failureScenarioSchema>;
export type TechnologyDecision = z.infer<typeof technologyDecisionSchema>;

export const scaleInputSchema = z.object({
  dau: z.number().positive().optional(),
  peakTrafficMultiplier: z.number().positive().optional(),
  readWriteRatio: z.string().max(80).optional(),
  averageRequestSizeBytes: z.number().positive().optional(),
  expectedStorageGrowthGbPerDay: z.number().nonnegative().optional(),
  requestsPerUserPerDay: z.number().positive().optional(),
  bytesPerUserPerDay: z.number().nonnegative().optional(),
});

export const systemDesignInputSchema = z.object({
  name: z.string().trim().min(1, "System name is required").max(200),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(20_000),
  scale: scaleInputSchema.optional(),
  requirements: z.object({
    functional: z.array(z.string().min(1).max(500)).max(100).default([]),
    nonFunctional: z.array(z.string().min(1).max(500)).max(100).default([]),
  }),
});

export type SystemDesignInput = z.infer<typeof systemDesignInputSchema>;
export type ScaleInput = z.infer<typeof scaleInputSchema>;

export const architectureReviewFindingSchema = z.object({
  severity: z.enum(["critical", "high", "medium", "low"]),
  category: z.string().min(1).max(120),
  title: z.string().min(1).max(240),
  explanation: z.string().min(1).max(MAX_TEXT),
  recommendation: z.string().min(1).max(MAX_TEXT),
});

export const architectureReviewSchema = z.object({
  summary: z.string().min(1).max(MAX_TEXT),
  findings: z.array(architectureReviewFindingSchema).min(1),
  questionsToConsider: stringListSchema.default([]),
  suggestedImprovements: stringListSchema.default([]),
});

export type ArchitectureReview = z.infer<typeof architectureReviewSchema>;
export type ArchitectureReviewFinding = z.infer<
  typeof architectureReviewFindingSchema
>;

export const architectureReviewInputSchema = z.object({
  input: systemDesignInputSchema,
  design: systemDesignSchema,
});

export type ArchitectureReviewInput = z.infer<
  typeof architectureReviewInputSchema
>;

export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length ? issue.path.join(".") : "root";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}
