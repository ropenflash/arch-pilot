import { describe, expect, it } from "vitest";
import { toReactFlowGraph } from "@/lib/architecture/graph";
import { systemDesignSchema } from "@/lib/architecture/validation";

const design = systemDesignSchema.parse({
  title: "Graph Fixture",
  summary: "Tiny graph",
  services: [
    {
      id: "client",
      name: "Client",
      type: "client",
      description: "UI",
      responsibilities: ["Render"],
    },
    {
      id: "api",
      name: "API",
      type: "service",
      description: "API",
      responsibilities: ["Serve"],
    },
  ],
  dataStores: [
    {
      id: "db",
      name: "DB",
      type: "database",
      description: "Store",
      responsibilities: ["Persist"],
    },
  ],
  architectureEdges: [
    { from: "client", to: "api", label: "HTTP" },
    { from: "api", to: "db", label: "SQL" },
    { from: "api", to: "missing", label: "Nope" },
  ],
});

describe("architecture graph conversion", () => {
  it("creates nodes from services and stores", () => {
    const graph = toReactFlowGraph(design);
    expect(graph.nodes.map((node) => node.id).sort()).toEqual(["api", "client", "db"]);
    expect(graph.nodes.every((node) => node.type === "architecture")).toBe(true);
  });

  it("keeps labeled edges and drops unknown endpoints", () => {
    const graph = toReactFlowGraph(design);
    expect(graph.edges).toHaveLength(2);
    expect(graph.edges.map((edge) => edge.label)).toEqual(["HTTP", "SQL"]);
    expect(graph.droppedEdges).toContain("api->missing");
  });

  it("assigns positions via layout", () => {
    const graph = toReactFlowGraph(design);
    expect(graph.nodes.every((node) => Number.isFinite(node.position.x))).toBe(true);
  });
});
