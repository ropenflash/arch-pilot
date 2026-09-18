import type {
  ArchitectureReviewInput,
  SystemDesignInput,
} from "@/lib/architecture/validation";

export const SYSTEM_DESIGN_JSON_CONTRACT = `{
  "title": "string",
  "summary": "string",
  "assumptions": [{ "name": "string", "value": "string", "rationale": "string" }],
  "requirements": {
    "functional": ["string"],
    "nonFunctional": ["string"]
  },
  "capacity": {
    "dau": number,
    "peakRps": number,
    "averageRps": number,
    "storagePerDayGb": number,
    "storagePerYearTb": number,
    "bandwidthMbps": number,
    "requestsPerUserPerDay": number,
    "peakMultiplier": number
  },
  "services": [{
    "id": "stable-slug",
    "name": "string",
    "type": "client|cdn|load_balancer|gateway|auth|service",
    "description": "string",
    "responsibilities": ["string"],
    "technology": "string",
    "scalingStrategy": "string",
    "failureBehavior": "string"
  }],
  "dataStores": [{
    "id": "stable-slug",
    "name": "string",
    "type": "database|cache|storage|search",
    "description": "string",
    "responsibilities": ["string"],
    "technology": "string",
    "scalingStrategy": "string",
    "dataCharacteristics": "string",
    "failureBehavior": "string"
  }],
  "messageSystems": [{
    "id": "stable-slug",
    "name": "string",
    "type": "queue",
    "description": "string",
    "responsibilities": ["string"],
    "technology": "string",
    "scalingStrategy": "string",
    "failureBehavior": "string"
  }],
  "externalSystems": [{
    "id": "stable-slug",
    "name": "string",
    "type": "external",
    "description": "string",
    "responsibilities": ["string"],
    "technology": "string",
    "scalingStrategy": "string",
    "failureBehavior": "string"
  }],
  "architectureEdges": [{
    "id": "string",
    "from": "component-id",
    "to": "component-id",
    "label": "HTTP|gRPC|Kafka|Read|Write|Async",
    "protocol": "string",
    "description": "string"
  }],
  "apis": [{
    "method": "GET|POST|PUT|PATCH|DELETE",
    "path": "/resource",
    "description": "string",
    "request": {},
    "response": {},
    "authentication": "string",
    "idempotency": "string"
  }],
  "dataModel": [{
    "name": "Entity",
    "description": "string",
    "fields": [{ "name": "id", "type": "uuid", "description": "string" }],
    "relationships": [{ "target": "OtherEntity", "type": "has_many", "description": "string" }]
  }],
  "technologyDecisions": [{
    "technology": "PostgreSQL",
    "why": "string",
    "alternative": "MongoDB",
    "whyNot": "string"
  }],
  "tradeoffs": [{
    "decision": "string",
    "benefit": "string",
    "cost": "string",
    "whenToReconsider": "string"
  }],
  "failureScenarios": [{
    "scenario": "string",
    "impact": "string",
    "detection": "string",
    "mitigation": "string",
    "recovery": "string"
  }],
  "scalingStrategy": ["string"],
  "securityConsiderations": ["string"],
  "observability": {
    "metrics": ["string"],
    "logs": ["string"],
    "traces": ["string"],
    "alerts": ["string"]
  }
}`;

export const ARCHITECT_PRINCIPLES = `You are a principal software architect. You design production systems, not tutorial diagrams.

For every major choice, answer:
- WHY this component or technology exists for THIS problem
- WHAT THE TRADE-OFFS are
- WHEN THIS BREAKS
- HOW IT SCALES (shard key, hot path, what is async)
- WHAT HAPPENS WHEN IT FAILS (detection, mitigation, recovery)

Design rules:
- Do not force CDN, Kafka, Redis, OpenSearch, or object storage into every design. Include them only when the workload justifies them.
- Separate the hot request path from asynchronous work. Say which operations are synchronous and why.
- Name the consistency model per data (strong, read-your-writes, eventual) instead of waving at "consistency".
- Name the shard/partition key if a store must scale beyond one primary.
- Prefer fewer, well-justified services over a microservice catalog.
- APIs that create money, reservations, or unique resources MUST describe idempotency.
- Failure scenarios must be realistic for this system (dependency outage, traffic spike, partition, crash, third-party timeout) — not generic "server goes down".
- Technology decisions should only include technologies actually used in the design.
- Observability must include metrics, logs, traces, and alerts a human would page on.
- Be specific. Name concrete techniques: outbox, backpressure, compare-and-set, cell/region isolation, signed URLs, fencing tokens.`;

function renderInput(input: SystemDesignInput): string {
  const scale = input.scale ?? {};
  return `System name: ${input.name}

Description:
${input.description}

Expected scale (optional, use only if provided):
- Daily Active Users: ${scale.dau ?? "not provided"}
- Peak traffic multiplier: ${scale.peakTrafficMultiplier ?? "not provided"}
- Read/write ratio: ${scale.readWriteRatio ?? "not provided"}
- Average request size (bytes): ${scale.averageRequestSizeBytes ?? "not provided"}
- Expected storage growth (GB/day): ${scale.expectedStorageGrowthGbPerDay ?? "not provided"}
- Requests per user per day: ${scale.requestsPerUserPerDay ?? "not provided"}

Functional requirements:
${input.requirements.functional.map((item) => `- ${item}`).join("\n") || "- (derive from description)"}

Non-functional requirements:
${input.requirements.nonFunctional.map((item) => `- ${item}`).join("\n") || "- (derive from description)"}`;
}

export function buildSystemDesignMessages(input: SystemDesignInput) {
  const system = `${ARCHITECT_PRINCIPLES}

Return ONLY valid JSON matching this contract:
${SYSTEM_DESIGN_JSON_CONTRACT}

Output rules:
- Do not wrap the JSON in markdown.
- Do not invent arithmetic for RPS, storage, or bandwidth beyond stating assumptions. Application code will compute those values. You MAY include assumption values such as requests per user per day and peak multiplier.
- Every component needs: name, type, description, responsibilities, technology, scaling strategy, and failure behavior.
- architectureEdges.from and architectureEdges.to MUST reference component ids.
- The summary should state the architectural thesis in 2–4 sentences: what is on the critical path, what is async, and which store owns which data.
- Assumptions must include rationale, not just numbers.`;

  const user = `Design the following system.

${renderInput(input)}`;

  return [
    { role: "system" as const, content: system },
    { role: "user" as const, content: user },
  ];
}

export function buildRepairMessages(
  originalMessages: { role: "system" | "user" | "assistant"; content: string }[],
  invalidOutput: string,
  issues: string,
) {
  return [
    ...originalMessages,
    { role: "assistant" as const, content: invalidOutput.slice(0, 20_000) },
    {
      role: "user" as const,
      content: `The previous response was not valid JSON for the required schema.

Validation issues:
${issues}

Return ONLY corrected JSON. No markdown. Preserve architectural reasoning. Ensure every component has an id and every edge references existing ids.`,
    },
  ];
}

export function buildReviewMessages(input: ArchitectureReviewInput) {
  const system = `You are a skeptical principal architect performing a design review.
Your job is to challenge the architecture, not to compliment it.
Never say it "looks good" as the whole review.

Hunt for:
- bottlenecks and hot keys
- single points of failure
- consistency hazards and dual writes
- security gaps (authz, PII, secrets, replay)
- cost risks (egress, chatty fan-out, over-provisioned search)
- operational complexity that the team cannot run
- observability holes (no SLI, no alert that would fire)
- recovery gaps (no runbook path)
- over-engineering (Kafka/Redis/CDN/service sprawl without a justifying load)

For each finding, explain WHY it matters for THIS system and what to do instead.
Prefer fewer precise findings over a laundry list.

Return ONLY JSON:
{
  "summary": "string",
  "findings": [{
    "severity": "critical|high|medium|low",
    "category": "bottleneck|spof|scaling|consistency|security|cost|operations|observability|recovery|overengineering",
    "title": "string",
    "explanation": "string",
    "recommendation": "string"
  }],
  "questionsToConsider": ["string"],
  "suggestedImprovements": ["string"]
}

Include at least 4 findings with mixed severities if the design is substantial. Be concrete. Name components and data flows.`;

  const user = `Review this system design.

Original request:
${renderInput(input.input)}

Architecture JSON:
${JSON.stringify(input.design)}`;

  return [
    { role: "system" as const, content: system },
    { role: "user" as const, content: user },
  ];
}
