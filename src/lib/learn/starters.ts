import {
  addComponent,
  connectComponents,
  createBlankDesign,
  disconnectComponents,
  updateComponent,
} from "@/lib/architecture/mutations";
import type { ArchitectureNodeType, SystemDesign } from "@/lib/architecture/validation";
import { ofType } from "@/lib/learn/grade";

const BRIEF =
  "A photo-sharing product that starts on one machine and grows as traffic grows.";

function base(title: string): SystemDesign {
  return createBlankDesign(title, BRIEF);
}

function lastOf(design: SystemDesign, type: ArchitectureNodeType) {
  const match = ofType(design, type).at(-1);
  if (!match) {
    throw new Error(`Expected a ${type} on the canvas.`);
  }
  return match;
}

function named(
  design: SystemDesign,
  type: ArchitectureNodeType,
  name: string,
  technology: string,
  position: { x: number; y: number },
): SystemDesign {
  let next = addComponent(design, type, position);
  const added = lastOf(next, type);
  next = updateComponent(next, added.id, { name, technology });
  return next;
}

export function starterClientOnly(): SystemDesign {
  return updateComponent(base("One box"), "client", {
    name: "Browser",
    technology: "HTTPS",
  });
}

export function starterSingleServer(): SystemDesign {
  let design = starterClientOnly();
  design = named(design, "service", "App server", "One machine", {
    x: 120,
    y: 220,
  });
  return connectComponents(design, "client", lastOf(design, "service").id, "HTTP");
}

export function starterSplitData(): SystemDesign {
  let design = starterSingleServer();
  design = named(design, "database", "Primary database", "SQL", {
    x: 120,
    y: 400,
  });
  return connectComponents(
    design,
    lastOf(design, "service").id,
    lastOf(design, "database").id,
    "SQL",
  );
}

export function starterTwoAppsAndLb(): SystemDesign {
  let design = starterSplitData();
  design = named(design, "service", "App server 2", "Stateless app", {
    x: 400,
    y: 220,
  });
  const apps = ofType(design, "service");
  design = named(design, "load_balancer", "Load balancer", "HTTP", {
    x: 240,
    y: 80,
  });
  const lb = lastOf(design, "load_balancer").id;
  for (const app of apps) {
    design = disconnectComponents(design, "client", app.id);
  }
  design = connectComponents(design, "client", lb, "HTTPS");
  for (const app of ofType(design, "service")) {
    design = connectComponents(design, lb, app.id, "HTTP");
  }
  return design;
}

export function starterWithReplica(): SystemDesign {
  let design = starterTwoAppsAndLb();
  design = named(design, "database", "Read replica", "SQL replica", {
    x: 400,
    y: 400,
  });
  const apps = ofType(design, "service");
  const replica = lastOf(design, "database").id;
  return connectComponents(design, apps[0]!.id, replica, "Read");
}

export function starterWithCache(): SystemDesign {
  let design = starterWithReplica();
  design = named(design, "cache", "Cache", "In-memory", { x: 240, y: 300 });
  const cache = lastOf(design, "cache").id;
  for (const app of ofType(design, "service")) {
    design = connectComponents(design, app.id, cache, "Cache");
  }
  return design;
}

export function starterWithCdn(): SystemDesign {
  let design = starterWithCache();
  design = named(design, "cdn", "CDN", "Static edge", { x: 20, y: 80 });
  design = named(design, "storage", "Object storage", "Photos", {
    x: 20,
    y: 400,
  });
  const cdn = lastOf(design, "cdn").id;
  const storage = lastOf(design, "storage").id;
  design = connectComponents(design, "client", cdn, "HTTPS");
  return connectComponents(design, cdn, storage, "Origin");
}

export function starterWithQueue(): SystemDesign {
  let design = starterWithCdn();
  design = named(design, "queue", "Job queue", "Async", { x: 560, y: 300 });
  const queue = lastOf(design, "queue").id;
  return connectComponents(design, ofType(design, "service")[0]!.id, queue, "Enqueue");
}

export function starterSharded(): SystemDesign {
  let design = starterWithQueue();
  design = named(design, "database", "User shard B", "SQL shard", {
    x: 560,
    y: 400,
  });
  return connectComponents(
    design,
    ofType(design, "service")[0]!.id,
    lastOf(design, "database").id,
    "SQL",
  );
}
