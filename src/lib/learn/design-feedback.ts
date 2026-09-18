import { collectComponents } from "@/lib/architecture/graph";
import { appServers, hasTypedEdge, ofType } from "@/lib/learn/grade";
import type { PracticeProblem } from "@/lib/learn/problems";
import type {
  ArchitectureNodeType,
  SystemDesign,
} from "@/lib/architecture/validation";

export type DesignObservation = {
  id: string;
  level: "question" | "risk" | "strength";
  observation: string;
  why: string;
  question: string;
};

export type ComponentTradeoff = {
  type: ArchitectureNodeType;
  label: string;
  benefits: string[];
  costs: string[];
  question: string;
};

const READ_HEAVY = new Set([
  "url-shortener",
  "pastebin",
  "news-feed",
  "autocomplete",
  "large-scale-search",
  "video",
]);
const NEEDS_DURABILITY = new Set([
  "kv-store",
  "url-shortener",
  "pastebin",
  "chat",
  "cloud-files",
  "news-feed",
]);

export function evaluateDesignReasoning(
  design: SystemDesign,
  problem: PracticeProblem,
): DesignObservation[] {
  const observations: DesignObservation[] = [];
  const components = collectComponents(design);
  const apps = appServers(design);
  const dataStores = design.dataStores;
  const connected = new Set(
    design.architectureEdges.flatMap((edge) => [edge.from, edge.to]),
  );

  if (apps.length === 0) {
    observations.push({
      id: "missing-app",
      level: "risk",
      observation: "The client has no trusted application layer.",
      why: "Clients should not own authorization, validation, or direct access to internal state.",
      question: "Where will product rules run before data is read or changed?",
    });
  } else {
    observations.push({
      id: "app-boundary",
      level: "strength",
      observation: "A trusted application boundary exists.",
      why: "This gives validation and authorization a place to live.",
      question: "Can these instances remain stateless so any one can serve a request?",
    });
  }

  if (apps.length === 1 && components.length > 2) {
    observations.push({
      id: "one-app",
      level: "question",
      observation: "One application instance is a compute failure domain.",
      why: "A restart or saturated CPU can stop the whole request path even if storage is healthy.",
      question: "Does the stated peak require horizontal compute, and how would traffic reach healthy instances?",
    });
  }

  if (hasTypedEdge(design, "client", "database")) {
    observations.push({
      id: "client-db",
      level: "risk",
      observation: "The client connects directly to a database.",
      why: "That exposes internal storage and bypasses a trusted policy boundary.",
      question: "Which application API should own this read or write?",
    });
  }

  const disconnected = components.filter(
    (item) => item.type !== "client" && !connected.has(item.id),
  );
  if (disconnected.length > 0) {
    observations.push({
      id: "disconnected",
      level: "risk",
      observation: `${disconnected.length} component${disconnected.length === 1 ? " is" : "s are"} not on any flow.`,
      why: "A box without an incoming or outgoing responsibility cannot affect the system.",
      question: `What request, event, or data path uses ${disconnected
        .slice(0, 2)
        .map((item) => item.name)
        .join(" and ")}?`,
    });
  }

  if (
    READ_HEAVY.has(problem.id) &&
    ofType(design, "cache").length === 0 &&
    ofType(design, "cdn").length === 0
  ) {
    observations.push({
      id: "read-pressure",
      level: "question",
      observation: "The read-heavy path always reaches origin services or storage.",
      why: "Repeated reads can dominate latency and database/origin load at the stated traffic shape.",
      question: "Which response or lookup repeats enough to cache, and how stale may it be?",
    });
  }

  if (NEEDS_DURABILITY.has(problem.id) && dataStores.length === 0) {
    observations.push({
      id: "no-durable-state",
      level: "risk",
      observation: "No durable source of truth is shown.",
      why: "A restart would lose the product’s mappings, messages, files, or posts.",
      question: "What state must survive every application and cache restart?",
    });
  } else if (
    NEEDS_DURABILITY.has(problem.id) &&
    ofType(design, "database").length === 1 &&
    ofType(design, "storage").length === 0
  ) {
    observations.push({
      id: "data-spof",
      level: "question",
      observation: "One database currently owns all durable state.",
      why: "That can be a valid first design, but its failure and recovery objective are not visible.",
      question: "Is backup restore enough, or does the availability target require a live replica and tested failover?",
    });
  }

  if (
    ofType(design, "queue").length > 0 &&
    problem.id !== "web-crawler" &&
    problem.id !== "notifications" &&
    problem.id !== "video"
  ) {
    observations.push({
      id: "queue-purpose",
      level: "question",
      observation: "A queue introduces asynchronous completion.",
      why: "It helps only when the caller can stop waiting and workers can process at least once.",
      question: "Which exact work is off the request path, and how is a duplicate job made safe?",
    });
  }

  if (
    components.length >= 4 &&
    design.architectureEdges.length >= components.length - 1 &&
    disconnected.length === 0
  ) {
    observations.push({
      id: "complete-flow",
      level: "strength",
      observation: "The major boxes participate in a connected flow.",
      why: "Connections make responsibilities and bottlenecks discussable instead of decorative.",
      question: "Trace the highest-volume request end to end. Which hop breaks first at 10× traffic?",
    });
  }

  return observations;
}

export const COMPONENT_TRADEOFFS: Partial<
  Record<ArchitectureNodeType, ComponentTradeoff>
> = {
  load_balancer: {
    type: "load_balancer",
    label: "Load balancer",
    benefits: ["Spreads requests", "Routes around unhealthy compute"],
    costs: ["Another network hop", "Needs redundant control and health checks"],
    question: "Are backends stateless enough for any instance to serve the request?",
  },
  service: {
    type: "service",
    label: "Application service",
    benefits: ["Trusted policy boundary", "Scales compute independently"],
    costs: ["Deployment and timeout surface", "Can become chatty or stateful"],
    question: "What responsibility belongs here, and what state must not stay local?",
  },
  cache: {
    type: "cache",
    label: "Cache",
    benefits: ["Lower repeated-read latency", "Shields the source of truth"],
    costs: ["Stale values", "Invalidation, stampedes, and hot keys"],
    question: "What is the TTL, and what happens on a miss or cache outage?",
  },
  database: {
    type: "database",
    label: "Database",
    benefits: ["Durable source of truth", "Indexes and consistency"],
    costs: ["Harder to scale than compute", "Schema, migration, and recovery work"],
    question: "Which query and write guarantees force this data model?",
  },
  queue: {
    type: "queue",
    label: "Message queue",
    benefits: ["Absorbs bursts", "Decouples producer and worker availability"],
    costs: ["Lag and duplicates", "Ordering and poison-job handling"],
    question: "Can the work complete later, and what makes retries idempotent?",
  },
  cdn: {
    type: "cdn",
    label: "CDN",
    benefits: ["Moves reusable bytes near users", "Protects origin from fan-out"],
    costs: ["Stale edge content", "Cache-key and purge complexity"],
    question: "Which bytes are safely reusable across users and for how long?",
  },
  storage: {
    type: "storage",
    label: "Object storage",
    benefits: ["Durable large-blob storage", "Direct upload/download path"],
    costs: ["Metadata lives elsewhere", "Whole-object and lifecycle semantics"],
    question: "How do object versions and metadata commits stay consistent?",
  },
  search: {
    type: "search",
    label: "Search index",
    benefits: ["Fast text/ranked retrieval", "Read model scales independently"],
    costs: ["Indexing lag", "A derived copy that must be rebuilt"],
    question: "How stale may results be, and how does the index receive changes?",
  },
  gateway: {
    type: "gateway",
    label: "API gateway",
    benefits: ["One trusted entry policy", "Early auth, routing, or limiting"],
    costs: ["Shared failure domain", "Can accumulate business logic"],
    question: "Which concerns are truly cross-cutting rather than service-specific?",
  },
};

export function tradeoffsForDesign(design: SystemDesign) {
  const types = new Set(collectComponents(design).map((item) => item.type));
  return [...types]
    .map((type) => COMPONENT_TRADEOFFS[type])
    .filter((item): item is ComponentTradeoff => Boolean(item));
}
