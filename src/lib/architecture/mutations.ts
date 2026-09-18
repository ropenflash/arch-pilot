import type { Edge } from "@xyflow/react";
import {
  collectComponents,
  layoutGraph,
  suggestComponentId,
  toReactFlowGraph,
  type ArchitectureNodeData,
} from "@/lib/architecture/graph";
import {
  systemDesignSchema,
  type ArchitectureNodeType,
  type SystemDesign,
} from "@/lib/architecture/validation";

export type ComponentKind =
  | "service"
  | "dataStore"
  | "messageSystem"
  | "externalSystem";

export const COMPONENT_PALETTE: {
  type: ArchitectureNodeType;
  label: string;
  name: string;
}[] = [
  { type: "client", label: "Client", name: "Client" },
  { type: "cdn", label: "CDN", name: "CDN" },
  { type: "load_balancer", label: "Load balancer", name: "Load balancer" },
  { type: "gateway", label: "Gateway", name: "API gateway" },
  { type: "auth", label: "Auth", name: "Auth service" },
  { type: "service", label: "Service", name: "Service" },
  { type: "cache", label: "Cache", name: "Cache" },
  { type: "queue", label: "Queue", name: "Queue" },
  { type: "database", label: "Database", name: "Database" },
  { type: "storage", label: "Storage", name: "Object storage" },
  { type: "search", label: "Search", name: "Search" },
  { type: "external", label: "External", name: "External system" },
];

const DATA_STORE_TYPES = new Set<ArchitectureNodeType>([
  "database",
  "cache",
  "storage",
  "search",
]);

export function kindForType(type: ArchitectureNodeType): ComponentKind {
  if (DATA_STORE_TYPES.has(type)) return "dataStore";
  if (type === "queue") return "messageSystem";
  if (type === "external") return "externalSystem";
  return "service";
}

export function defaultEdgeLabel(
  fromType?: ArchitectureNodeType,
  toType?: ArchitectureNodeType,
): string {
  if (toType === "database") return "SQL";
  if (toType === "cache") return "Cache";
  if (toType === "queue") return "Async";
  if (toType === "storage") return "Object";
  if (toType === "search") return "Query";
  if (fromType === "cdn" || toType === "cdn") return "HTTPS";
  return "HTTP";
}

function parseDesign(design: unknown): SystemDesign {
  return systemDesignSchema.parse(design);
}

function usedIds(design: SystemDesign): Set<string> {
  return new Set(collectComponents(design).map((item) => item.id));
}

function emptyComponent(input: {
  id: string;
  name: string;
  type: ArchitectureNodeType;
  position?: { x: number; y: number };
}) {
  return {
    id: input.id,
    name: input.name,
    type: input.type,
    description: "",
    responsibilities: [] as string[],
    technology: "",
    scalingStrategy: "",
    failureBehavior: "",
    ...(input.position ? { position: input.position } : {}),
  };
}

function buckets(design: SystemDesign) {
  return {
    services: [...design.services],
    dataStores: [...design.dataStores],
    messageSystems: [...design.messageSystems],
    externalSystems: [...design.externalSystems],
  };
}

function insertIntoKind(
  next: ReturnType<typeof buckets>,
  kind: ComponentKind,
  component: ReturnType<typeof emptyComponent> & {
    dataCharacteristics?: string;
  },
) {
  if (kind === "dataStore") {
    next.dataStores.push({
      ...component,
      dataCharacteristics: component.dataCharacteristics ?? "",
    });
  } else if (kind === "messageSystem") {
    next.messageSystems.push(component);
  } else if (kind === "externalSystem") {
    next.externalSystems.push(component);
  } else {
    next.services.push(component);
  }
}

export function createBlankDesign(name: string, description: string): SystemDesign {
  const title = name.trim() || "Untitled architecture";
  const summary =
    description.trim().length >= 10
      ? description.trim()
      : "Canvas-first architecture. Add components, connect them, and describe why each one exists.";
  return parseDesign({
    title,
    summary,
    assumptions: [],
    requirements: { functional: [], nonFunctional: [] },
    capacity: { source: "estimated" },
    services: [
      emptyComponent({
        id: "client",
        name: "Client",
        type: "client",
        position: { x: 120, y: 40 },
      }),
    ],
    dataStores: [],
    messageSystems: [],
    externalSystems: [],
    architectureEdges: [],
    apis: [],
    dataModel: [],
    technologyDecisions: [],
    tradeoffs: [],
    failureScenarios: [],
    scalingStrategy: [],
    securityConsiderations: [],
    observability: { metrics: [], logs: [], traces: [], alerts: [] },
  });
}

export function addComponent(
  design: SystemDesign,
  type: ArchitectureNodeType,
  position?: { x: number; y: number },
): SystemDesign {
  const palette = COMPONENT_PALETTE.find((item) => item.type === type);
  const name = palette?.name ?? "Component";
  const id = suggestComponentId(name, usedIds(design));
  const next = buckets(design);
  insertIntoKind(
    next,
    kindForType(type),
    emptyComponent({ id, name, type, position }),
  );
  return parseDesign({ ...design, ...next });
}

export function removeComponent(
  design: SystemDesign,
  id: string,
): { ok: true; design: SystemDesign } | { ok: false; error: string } {
  if (design.services.length === 1 && design.services[0]?.id === id) {
    return {
      ok: false,
      error: "Keep at least one service on the canvas.",
    };
  }
  const next = {
    services: design.services.filter((item) => item.id !== id),
    dataStores: design.dataStores.filter((item) => item.id !== id),
    messageSystems: design.messageSystems.filter((item) => item.id !== id),
    externalSystems: design.externalSystems.filter((item) => item.id !== id),
    architectureEdges: design.architectureEdges.filter(
      (edge) => edge.from !== id && edge.to !== id,
    ),
  };
  if (
    next.services.length +
      next.dataStores.length +
      next.messageSystems.length +
      next.externalSystems.length ===
    collectComponents(design).length
  ) {
    return { ok: false, error: "Component not found." };
  }
  return { ok: true, design: parseDesign({ ...design, ...next }) };
}

export function updateComponent(
  design: SystemDesign,
  id: string,
  patch: {
    name?: string;
    type?: ArchitectureNodeType;
    description?: string;
    technology?: string;
    responsibilities?: string[];
    scalingStrategy?: string;
    failureBehavior?: string;
  },
): SystemDesign {
  const current = collectComponents(design).find((item) => item.id === id);
  if (!current) return design;

  const nextType = patch.type ?? current.type;
  const nextKind = kindForType(nextType);
  const merged = emptyComponent({
    id,
    name: patch.name?.trim() || current.name,
    type: nextType,
    position: current.position,
  });
  const component = {
    ...merged,
    description: patch.description ?? current.description,
    technology: patch.technology ?? current.technology,
    responsibilities: patch.responsibilities ?? current.responsibilities,
    scalingStrategy: patch.scalingStrategy ?? current.scalingStrategy,
    failureBehavior: patch.failureBehavior ?? current.failureBehavior,
    ...("dataCharacteristics" in current
      ? {
          dataCharacteristics:
            (current as { dataCharacteristics?: string }).dataCharacteristics ?? "",
        }
      : {}),
  };

  const next = {
    services: design.services.filter((item) => item.id !== id),
    dataStores: design.dataStores.filter((item) => item.id !== id),
    messageSystems: design.messageSystems.filter((item) => item.id !== id),
    externalSystems: design.externalSystems.filter((item) => item.id !== id),
  };
  insertIntoKind(next, nextKind, component);
  return parseDesign({ ...design, ...next });
}

export function connectComponents(
  design: SystemDesign,
  from: string,
  to: string,
  label?: string,
  handles?: { sourceHandle?: string | null; targetHandle?: string | null },
): SystemDesign {
  if (from === to) return design;
  const ids = usedIds(design);
  if (!ids.has(from) || !ids.has(to)) return design;
  const exists = design.architectureEdges.some(
    (edge) => edge.from === from && edge.to === to,
  );
  if (exists) return design;
  const components = collectComponents(design);
  const fromType = components.find((item) => item.id === from)?.type;
  const toType = components.find((item) => item.id === to)?.type;
  const edgeLabel = label || defaultEdgeLabel(fromType, toType);
  return parseDesign({
    ...design,
    architectureEdges: [
      ...design.architectureEdges,
      {
        id: `${from}-${to}`,
        from,
        to,
        label: edgeLabel,
        protocol: edgeLabel,
        description: "",
        ...(handles?.sourceHandle ? { sourceHandle: handles.sourceHandle } : {}),
        ...(handles?.targetHandle ? { targetHandle: handles.targetHandle } : {}),
      },
    ],
  });
}

export function disconnectComponents(
  design: SystemDesign,
  from: string,
  to: string,
): SystemDesign {
  return parseDesign({
    ...design,
    architectureEdges: design.architectureEdges.filter(
      (edge) => !(edge.from === from && edge.to === to),
    ),
  });
}

export function updateEdgeLabel(
  design: SystemDesign,
  from: string,
  to: string,
  label: string,
): SystemDesign {
  return parseDesign({
    ...design,
    architectureEdges: design.architectureEdges.map((edge) =>
      edge.from === from && edge.to === to
        ? { ...edge, label, protocol: label }
        : edge,
    ),
  });
}

export function layoutDesign(
  design: SystemDesign,
  direction: "TB" | "LR" = "TB",
): SystemDesign {
  const graph = toReactFlowGraph(design, { layout: false });
  const laid = layoutGraph(graph.nodes, graph.edges, direction);
  const positions = Object.fromEntries(
    laid.nodes.map((node) => [node.id, node.position]),
  );
  return applyNodePositions(design, positions);
}

export function applyNodePositions(
  design: SystemDesign,
  positions: Record<string, { x: number; y: number }>,
): SystemDesign {
  const withPos = <T extends { id: string }>(items: T[]): T[] =>
    items.map((item) =>
      positions[item.id] ? { ...item, position: positions[item.id] } : item,
    );
  return parseDesign({
    ...design,
    services: withPos(design.services),
    dataStores: withPos(design.dataStores),
    messageSystems: withPos(design.messageSystems),
    externalSystems: withPos(design.externalSystems),
  });
}

export function edgesFromDesign(design: SystemDesign): Edge[] {
  return design.architectureEdges.map((edge, index) => ({
    id: edge.id || `${edge.from}-${edge.to}-${index}`,
    source: edge.from,
    target: edge.to,
    label: edge.label || edge.protocol || "",
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    data: { protocol: edge.protocol, description: edge.description },
  }));
}

export function nodeDataPatch(
  data: ArchitectureNodeData,
  patch: Partial<ArchitectureNodeData>,
): ArchitectureNodeData {
  return { ...data, ...patch };
}
