import Dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";
import type {
  ArchitectureNodeType,
  SystemDesign,
} from "@/lib/architecture/validation";

export interface ArchitectureNodeData extends Record<string, unknown> {
  label: string;
  nodeType: ArchitectureNodeType;
  technology: string;
  description: string;
  responsibilities: string[];
  scalingStrategy: string;
  failureBehavior: string;
  kind: "service" | "dataStore" | "messageSystem" | "externalSystem";
}

export type ArchitectureFlowNode = Node<ArchitectureNodeData, "architecture">;

const NODE_WIDTH = 248;
const NODE_HEIGHT = 96;

const RANK: Record<ArchitectureNodeType, number> = {
  client: 0,
  cdn: 1,
  load_balancer: 2,
  gateway: 3,
  auth: 4,
  service: 4,
  cache: 5,
  queue: 5,
  search: 5,
  database: 6,
  storage: 6,
  external: 7,
  other: 4,
};

export function collectComponents(design: SystemDesign) {
  return [
    ...design.services.map((item) => ({ ...item, kind: "service" as const })),
    ...design.dataStores.map((item) => ({ ...item, kind: "dataStore" as const })),
    ...design.messageSystems.map((item) => ({
      ...item,
      kind: "messageSystem" as const,
    })),
    ...design.externalSystems.map((item) => ({
      ...item,
      kind: "externalSystem" as const,
    })),
  ];
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function hasStoredPositions(design: SystemDesign): boolean {
  return collectComponents(design).some(
    (component) =>
      component.position != null &&
      Number.isFinite(component.position.x) &&
      Number.isFinite(component.position.y),
  );
}

function componentPosition(
  component: { id: string; position?: { x: number; y: number } },
  index: number,
  positions?: Record<string, { x: number; y: number }>,
): { x: number; y: number } {
  return (
    positions?.[component.id] ??
    component.position ?? {
      x: (index % 3) * 260,
      y: Math.floor(index / 3) * 120,
    }
  );
}

export function toReactFlowGraph(
  design: SystemDesign,
  options: {
    layout?: boolean;
    positions?: Record<string, { x: number; y: number }>;
  } = {},
): {
  nodes: ArchitectureFlowNode[];
  edges: Edge[];
  droppedEdges: string[];
} {
  const shouldLayout = options.layout ?? true;
  const components = collectComponents(design);
  const idSet = new Set(components.map((component) => component.id));
  const nameToId = new Map(
    components.map((component) => [component.name.toLowerCase(), component.id]),
  );

  const nodes: ArchitectureFlowNode[] = components.map((component, index) => ({
    id: component.id,
    type: "architecture",
    position: componentPosition(component, index, options.positions),
    style: { width: 248, padding: 0, background: "transparent", border: "none" },
    data: {
      label: component.name,
      nodeType: component.type,
      technology: component.technology ?? "",
      description: component.description,
      responsibilities: component.responsibilities,
      scalingStrategy: component.scalingStrategy ?? "",
      failureBehavior: component.failureBehavior ?? "",
      kind: component.kind,
    },
  }));

  const droppedEdges: string[] = [];
  const edges: Edge[] = [];

  design.architectureEdges.forEach((edge, index) => {
    const source =
      idSet.has(edge.from) ? edge.from : nameToId.get(edge.from.toLowerCase());
    const target = idSet.has(edge.to) ? edge.to : nameToId.get(edge.to.toLowerCase());
    if (!source || !target) {
      droppedEdges.push(`${edge.from}->${edge.to}`);
      return;
    }
    const label = edge.label || edge.protocol || "";
    edges.push({
      id: edge.id || `${source}-${target}-${index}`,
      source,
      target,
      label,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      data: { protocol: edge.protocol, description: edge.description },
    });
  });

  if (!shouldLayout) {
    return { nodes, edges, droppedEdges };
  }
  const layouted = layoutGraph(nodes, edges);
  return { nodes: layouted.nodes, edges: layouted.edges, droppedEdges };
}

export function layoutGraph(
  nodes: ArchitectureFlowNode[],
  edges: Edge[],
  direction: "TB" | "LR" = "TB",
): { nodes: ArchitectureFlowNode[]; edges: Edge[] } {
  const graph = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: direction,
    nodesep: 48,
    ranksep: 88,
    marginx: 24,
    marginy: 24,
  });

  for (const node of nodes) {
    graph.setNode(node.id, {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      rank: RANK[node.data.nodeType] ?? 4,
    });
  }
  for (const edge of edges) {
    graph.setEdge(edge.source, edge.target);
  }

  Dagre.layout(graph);

  const grouped = new Map<number, ArchitectureFlowNode[]>();
  for (const node of nodes) {
    const rank = RANK[node.data.nodeType] ?? 4;
    const list = grouped.get(rank) ?? [];
    list.push(node);
    grouped.set(rank, list);
  }

  const layoutedNodes = nodes.map((node) => {
    const positioned = graph.node(node.id);
    return {
      ...node,
      position: {
        x: positioned.x - NODE_WIDTH / 2,
        y: positioned.y - NODE_HEIGHT / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}

export function dependenciesFor(
  design: SystemDesign,
  componentId: string,
): { upstream: string[]; downstream: string[] } {
  const names = new Map(
    collectComponents(design).map((component) => [component.id, component.name]),
  );
  const upstream: string[] = [];
  const downstream: string[] = [];
  for (const edge of design.architectureEdges) {
    if (edge.to === componentId) {
      upstream.push(names.get(edge.from) ?? edge.from);
    }
    if (edge.from === componentId) {
      downstream.push(names.get(edge.to) ?? edge.to);
    }
  }
  return { upstream, downstream };
}

export function suggestComponentId(name: string, used: Set<string>): string {
  const base = slug(name) || "component";
  if (!used.has(base)) return base;
  let i = 2;
  while (used.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}
