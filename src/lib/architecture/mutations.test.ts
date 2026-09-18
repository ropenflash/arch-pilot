import { describe, expect, it } from "vitest";
import { toReactFlowGraph } from "@/lib/architecture/graph";
import {
  addComponent,
  applyNodePositions,
  connectComponents,
  createBlankDesign,
  defaultEdgeLabel,
  disconnectComponents,
  kindForType,
  layoutDesign,
  removeComponent,
  updateComponent,
  updateEdgeLabel,
} from "@/lib/architecture/mutations";

describe("architecture mutations", () => {
  it("classifies node types into design buckets", () => {
    expect(kindForType("database")).toBe("dataStore");
    expect(kindForType("queue")).toBe("messageSystem");
    expect(kindForType("external")).toBe("externalSystem");
    expect(kindForType("gateway")).toBe("service");
  });

  it("creates a blank canvas with a single client", () => {
    const design = createBlankDesign("Canvas", "short");
    expect(design.services).toHaveLength(1);
    expect(design.services[0]?.type).toBe("client");
    expect(design.architectureEdges).toHaveLength(0);
  });

  it("adds, connects, and removes components without cargo-cult defaults", () => {
    let design = createBlankDesign("Relay", "A canvas-first chat architecture.");
    design = addComponent(design, "service", { x: 200, y: 180 });
    design = addComponent(design, "database", { x: 200, y: 320 });
    const api = design.services.find((item) => item.id !== "client")!;
    const db = design.dataStores[0]!;
    design = connectComponents(design, "client", api.id);
    design = connectComponents(design, api.id, db.id);
    expect(design.architectureEdges).toHaveLength(2);
    expect(defaultEdgeLabel("service", "database")).toBe("SQL");

    const removed = removeComponent(design, db.id);
    expect(removed.ok).toBe(true);
    if (removed.ok) {
      expect(removed.design.dataStores).toHaveLength(0);
      expect(removed.design.architectureEdges.every((edge) => edge.to !== db.id)).toBe(
        true,
      );
    }
  });

  it("refuses to delete the last service", () => {
    const design = createBlankDesign("Only client", "Keep one service on the canvas.");
    const result = removeComponent(design, "client");
    expect(result.ok).toBe(false);
  });

  it("moves a component between buckets when its type changes", () => {
    let design = createBlankDesign("Move", "Change a service into a datastore.");
    design = addComponent(design, "service");
    const service = design.services.find((item) => item.id !== "client")!;
    design = updateComponent(design, service.id, { type: "database", name: "Postgres" });
    expect(design.services.some((item) => item.id === service.id)).toBe(false);
    expect(design.dataStores.some((item) => item.id === service.id)).toBe(true);
  });

  it("keeps stored positions when layout is skipped", () => {
    let design = createBlankDesign("Laid out", "Preserve dragged node positions.");
    design = addComponent(design, "service", { x: 480, y: 240 });
    const graph = toReactFlowGraph(design, { layout: false });
    const added = graph.nodes.find((node) => node.id !== "client");
    expect(added?.position).toEqual({ x: 480, y: 240 });
  });

  it("keeps spaces in component names while typing", () => {
    let design = createBlankDesign("Names", "Allow spaces in component titles.");
    design = updateComponent(design, "client", { name: "Web " });
    expect(design.services[0]?.name).toBe("Web ");
    design = updateComponent(design, "client", { name: "Web client" });
    expect(design.services[0]?.name).toBe("Web client");
  });

  it("updates edge labels, disconnects, and stores layout positions", () => {
    let design = createBlankDesign("Edges", "Connection editing for the canvas.");
    design = addComponent(design, "service", { x: 200, y: 160 });
    const api = design.services.find((item) => item.id !== "client")!;
    design = connectComponents(design, "client", api.id, "HTTP");
    design = updateEdgeLabel(design, "client", api.id, "gRPC");
    expect(design.architectureEdges[0]?.label).toBe("gRPC");
    design = disconnectComponents(design, "client", api.id);
    expect(design.architectureEdges).toHaveLength(0);

    design = applyNodePositions(design, { client: { x: 10, y: 20 } });
    expect(design.services[0]?.position).toEqual({ x: 10, y: 20 });
    design = layoutDesign(design, "LR");
    expect(design.services.every((item) => item.position)).toBe(true);
  });
});
