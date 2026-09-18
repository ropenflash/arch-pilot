import { collectComponents } from "@/lib/architecture/graph";
import type {
  ArchitectureNodeType,
  SystemDesign,
} from "@/lib/architecture/validation";

export type CheckResult = {
  id: string;
  label: string;
  ok: boolean;
};

export type DesignCheck = {
  id: string;
  label: string;
  pass: (design: SystemDesign) => boolean;
};

const EDGE_TYPES = new Set<ArchitectureNodeType>([
  "client",
  "cdn",
  "load_balancer",
  "gateway",
  "auth",
]);

export function ofType(design: SystemDesign, type: ArchitectureNodeType) {
  return collectComponents(design).filter((item) => item.type === type);
}

export function appServers(design: SystemDesign) {
  return design.services.filter((item) => !EDGE_TYPES.has(item.type));
}

export function hasEdgeBetween(
  design: SystemDesign,
  fromIds: string[],
  toIds: string[],
) {
  const from = new Set(fromIds);
  const to = new Set(toIds);
  return design.architectureEdges.some(
    (edge) => from.has(edge.from) && to.has(edge.to),
  );
}

export function hasTypedEdge(
  design: SystemDesign,
  fromType: ArchitectureNodeType,
  toType: ArchitectureNodeType,
) {
  return hasEdgeBetween(
    design,
    ofType(design, fromType).map((item) => item.id),
    ofType(design, toType).map((item) => item.id),
  );
}

export function hasTypedEdgeToAny(
  design: SystemDesign,
  fromType: ArchitectureNodeType,
  toIds: string[],
) {
  return hasEdgeBetween(
    design,
    ofType(design, fromType).map((item) => item.id),
    toIds,
  );
}

export function evaluateChecks(
  design: SystemDesign,
  checks: DesignCheck[],
): { passed: boolean; results: CheckResult[] } {
  const results = checks.map((check) => ({
    id: check.id,
    label: check.label,
    ok: check.pass(design),
  }));
  return { passed: results.every((item) => item.ok), results };
}
