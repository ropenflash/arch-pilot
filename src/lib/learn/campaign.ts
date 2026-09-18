import type { ArchitectureNodeType, SystemDesign } from "@/lib/architecture/validation";
import {
  appServers,
  evaluateChecks,
  hasEdgeBetween,
  hasTypedEdge,
  ofType,
  type DesignCheck,
} from "@/lib/learn/grade";
import {
  starterClientOnly,
  starterSharded,
  starterSingleServer,
  starterSplitData,
  starterTwoAppsAndLb,
  starterWithCache,
  starterWithCdn,
  starterWithQueue,
  starterWithReplica,
} from "@/lib/learn/starters";

export type QuizChoice = {
  id: string;
  label: string;
  correct: boolean;
  feedback: string;
};

export type CanvasStep = {
  kind: "canvas";
  id: string;
  title: string;
  kicker: string;
  story: string;
  prompt: string;
  why: string;
  hints: string[];
  highlight: ArchitectureNodeType[];
  checks: DesignCheck[];
  starter: () => SystemDesign;
};

export type QuizStep = {
  kind: "quiz";
  id: string;
  title: string;
  kicker: string;
  story: string;
  prompt: string;
  why: string;
  hints: string[];
  question: string;
  choices: QuizChoice[];
};

export type LearnStep = CanvasStep | QuizStep;

export const FROM_ZERO_CAMPAIGN = {
  id: "from-zero",
  title: "From one box to millions",
  tagline: "Start with the simplest design that works. Traffic grows. You improve it.",
  description:
    "A guided architecture round in the style of a system-design interview: one machine first, then a series of “now it is breaking — what do you add?” prompts, with hints when you get stuck.",
  estimated: "About 20 minutes",
} as const;

const twoAppServers: DesignCheck = {
  id: "two-apps",
  label: "At least two app servers (not the load balancer or client)",
  pass: (design) => appServers(design).length >= 2,
};

const loadBalancerInFront: DesignCheck = {
  id: "lb-front",
  label: "Clients talk to a load balancer, not straight to app servers",
  pass: (design) => {
    const lb = ofType(design, "load_balancer").map((item) => item.id);
    const apps = appServers(design).map((item) => item.id);
    if (lb.length === 0) return false;
    const clientToLb = hasTypedEdge(design, "client", "load_balancer");
    const lbToApps =
      design.architectureEdges.filter(
        (edge) => lb.includes(edge.from) && apps.includes(edge.to),
      ).length >= 2;
    const clientToApp = hasEdgeBetween(design, ["client"], apps);
    return clientToLb && lbToApps && !clientToApp;
  },
};

export const FROM_ZERO_STEPS: LearnStep[] = [
  {
    kind: "canvas",
    id: "one-box",
    title: "The whole product on one machine",
    kicker: "Level 1 · Start small",
    story:
      "A photo-sharing product just launched. Today every request lands on a single computer you can SSH into: it renders pages and stores files on the same box.",
    prompt:
      "You already have a browser. Add one app server and connect the browser to it. That is the entire system for this round.",
    why: "One machine is the fastest way to ship. It is also a single point of failure: if that box dies, the product dies with it.",
    hints: [
      "Do not add a database, cache, or balancer yet. This round is only “a user can reach one process.”",
      "DNS turns the hostname into an IP. HTTP then talks to whatever is listening on that machine.",
      "Drag a Service onto the canvas, then pull a line from Browser to that service.",
    ],
    highlight: ["service"],
    starter: starterClientOnly,
    checks: [
      {
        id: "has-app",
        label: "There is an app server on the canvas",
        pass: (design) => appServers(design).length >= 1,
      },
      {
        id: "client-to-app",
        label: "The browser is connected to that app server",
        pass: (design) =>
          hasEdgeBetween(
            design,
            ofType(design, "client").map((item) => item.id),
            appServers(design).map((item) => item.id),
          ),
      },
    ],
  },
  {
    kind: "canvas",
    id: "split-data",
    title: "Stop mixing pages and rows",
    kicker: "Level 2 · Improve it",
    story:
      "Uploads and profile reads now share the same process as HTML. A heavy query stalls the whole site. You need compute and data to fail and scale independently.",
    prompt:
      "Add a database. Connect the app server to it. The browser should still talk to the app — never straight to the database.",
    why: "Splitting the web tier from storage lets you scale each side on its own and keep the database off the public internet.",
    hints: [
      "Keep the public entry as the app. The database belongs on a private network.",
      "One arrow from the app server to the database is enough for this round.",
      "If the browser can reach the database directly, users (and attackers) can too.",
    ],
    highlight: ["database"],
    starter: starterSingleServer,
    checks: [
      {
        id: "has-db",
        label: "A database is on the canvas",
        pass: (design) => ofType(design, "database").length >= 1,
      },
      {
        id: "app-to-db",
        label: "An app server talks to the database",
        pass: (design) =>
          hasEdgeBetween(
            design,
            appServers(design).map((item) => item.id),
            ofType(design, "database").map((item) => item.id),
          ),
      },
      {
        id: "no-client-db",
        label: "The browser does not talk to the database",
        pass: (design) =>
          !hasTypedEdge(design, "client", "database"),
      },
    ],
  },
  {
    kind: "quiz",
    id: "sql-vs-docs",
    title: "Pick a store that matches the data",
    kicker: "Level 3 · Deep dive",
    story:
      "The product has users, posts, comments, and likes. You will query those relationships together, and a like should not apply twice.",
    prompt: "Which store fits this round — and why?",
    why: "A relational store is a strong default when records are linked and you care about transactions. A document store can still win for loosely related blobs, but it is not free joins.",
    hints: [
      "Ask what you need to query together, and whether a write must succeed or fail as one unit.",
      "Object storage is excellent for photos. It is a poor source of truth for “did this user like that post?”",
    ],
    question:
      "Users, posts, comments, and likes will be queried together. Which data store belongs here first?",
    choices: [
      {
        id: "sql",
        label: "A relational database — joins and transactions match this shape",
        correct: true,
        feedback:
          "Right. Relationships plus “this write should be atomic” is exactly where SQL earns its place.",
      },
      {
        id: "doc",
        label: "A document store, because JSON is easier to print in the API",
        correct: false,
        feedback:
          "JSON convenience is not a data model. Cross-document relationships get painful once comments and likes matter.",
      },
      {
        id: "object",
        label: "Object storage only — photos are the product",
        correct: false,
        feedback:
          "Keep blobs in object storage, but likes and comments still need a real source of truth.",
      },
      {
        id: "memory",
        label: "Keep it in the app process. Disk is overkill at this size.",
        correct: false,
        feedback:
          "Process memory dies with the process. Even a small product needs durable storage.",
      },
    ],
  },
  {
    kind: "quiz",
    id: "up-or-out",
    title: "A bigger box, or more boxes?",
    kicker: "Level 4 · Deep dive",
    story:
      "The one app server is pegged. You can buy a larger machine (vertical) or run more machines (horizontal).",
    prompt: "What is the honest limit of “just buy a bigger box”?",
    why: "Vertical scaling is a valid first move. It still leaves you with one machine to fail and a ceiling on CPU, RAM, and price.",
    hints: [
      "Think about what happens when that one larger box reboots.",
      "Horizontal scaling needs something in front of the fleet — you will draw that next.",
    ],
    question: "CPU on the only app server is pegged. Why isn’t a larger machine the whole answer?",
    choices: [
      {
        id: "ceiling",
        label:
          "Vertical scaling hits a hardware and cost ceiling, and you still have one machine to fail",
        correct: true,
        feedback:
          "Exactly. Scale up until it is awkward, then scale out — knowing you will need a balancer.",
      },
      {
        id: "always-cheap",
        label: "A larger box is always cheaper than running two smaller ones",
        correct: false,
        feedback:
          "Prices are not that simple, and cost is not the only constraint. Failure domain is.",
      },
      {
        id: "no-lb",
        label: "More machines never need a load balancer if DNS has two records",
        correct: false,
        feedback:
          "DNS round-robin is a blunt instrument: no health checks, ugly failover, sticky caches.",
      },
      {
        id: "disk",
        label: "A bigger disk removes the need to think about sharding later",
        correct: false,
        feedback:
          "Disk size is not the same as write throughput, hot keys, or operational pain.",
      },
    ],
  },
  {
    kind: "canvas",
    id: "balance-the-fleet",
    title: "Put something in front of the app servers",
    kicker: "Level 5 · Improve it",
    story:
      "You are going horizontal. Two app processes can serve traffic — but users should not pick a server, and those servers should not have public IPs.",
    prompt:
      "Add a second app server and a load balancer. The browser talks only to the balancer. The balancer fans out to both app servers.",
    why: "The balancer is the public door. App servers sit on a private network and can come and go without clients noticing.",
    hints: [
      "Duplicate the app box first, then drop a load balancer above both of them.",
      "Remove the old browser → app arrow if it is still there. Public traffic should hit the balancer.",
      "You want two arrows out of the balancer, one into each app server.",
    ],
    highlight: ["load_balancer", "service"],
    starter: starterSplitData,
    checks: [twoAppServers, loadBalancerInFront],
  },
  {
    kind: "canvas",
    id: "replica",
    title: "The database is now the fragile bit",
    kicker: "Level 6 · Improve it",
    story:
      "App servers can disappear behind the balancer. The primary database cannot. A crash there takes writes with it, and reads all pile onto one disk.",
    prompt:
      "Add a replica database. Keep the original as the primary. Connect at least one app server to the replica for reads.",
    why: "Replicas spread read load and give you a failover candidate. Writes still go to one primary unless you change the model.",
    hints: [
      "A replica is another database node, not a cache.",
      "Name them so you can tell primary from replica. Writes stay on the primary.",
      "You do not need a fancy failover protocol in this round — show the topology.",
    ],
    highlight: ["database"],
    starter: starterTwoAppsAndLb,
    checks: [
      {
        id: "two-db",
        label: "At least two database nodes",
        pass: (design) => ofType(design, "database").length >= 2,
      },
      {
        id: "app-to-replica",
        label: "An app server is connected to more than one database (primary + replica)",
        pass: (design) => {
          const dbs = new Set(ofType(design, "database").map((item) => item.id));
          const apps = new Set(appServers(design).map((item) => item.id));
          const targets = new Set(
            design.architectureEdges
              .filter((edge) => apps.has(edge.from) && dbs.has(edge.to))
              .map((edge) => edge.to),
          );
          return targets.size >= 2;
        },
      },
    ],
  },
  {
    kind: "canvas",
    id: "cache",
    title: "Hot reads are hammering the primary",
    kicker: "Level 7 · Improve it",
    story:
      "The same profiles and feed pages are fetched over and over. Each hit still reaches the database. Latency is up and the primary is busy.",
    prompt:
      "Add a cache. Connect the app servers to it so hot reads can miss the database.",
    why: "A cache cuts read latency and database load. It also becomes a new failure domain: you now have to think about TTL, invalidation, and what happens when it is empty.",
    hints: [
      "Place the cache next to the app servers, in front of the database on the read path.",
      "You do not have to disconnect the database. Cache is an extra hop for hot keys, not a replacement yet.",
      "Think about a short TTL and how you will drop a key when the user updates a profile.",
    ],
    highlight: ["cache"],
    starter: starterWithReplica,
    checks: [
      {
        id: "has-cache",
        label: "A cache is on the canvas",
        pass: (design) => ofType(design, "cache").length >= 1,
      },
      {
        id: "app-to-cache",
        label: "An app server talks to the cache",
        pass: (design) =>
          hasEdgeBetween(
            design,
            appServers(design).map((item) => item.id),
            ofType(design, "cache").map((item) => item.id),
          ),
      },
    ],
  },
  {
    kind: "quiz",
    id: "cache-miss",
    title: "What if the cache disappears?",
    kicker: "Level 8 · Deep dive",
    story:
      "The cache cluster just vanished. Traffic did not. Your app servers are still taking requests.",
    prompt: "What should the app do?",
    why: "A cache is an optimization, not the source of truth. Falling back to the database is correct — and it can overload that database, so you need a plan for the thundering herd.",
    hints: [
      "Ask where the durable copy of the data lives.",
      "“Hang until cache returns” turns a cache outage into a total outage.",
    ],
    question: "The cache is gone. The next profile read should…",
    choices: [
      {
        id: "fallback",
        label: "Read from the database, accept extra latency, and watch for overload",
        correct: true,
        feedback:
          "Yes. Cache is optional speed. The database is still the source of truth — protect it if everyone misses at once.",
      },
      {
        id: "hang",
        label: "Wait for the cache. Serving the database would show stale data.",
        correct: false,
        feedback:
          "Waiting on a dead cache makes the whole site dead. Stale-vs-down is a product choice, not “always hang.”",
      },
      {
        id: "drop-db",
        label: "Drop the database so cache and disk cannot disagree",
        correct: false,
        feedback:
          "That destroys the source of truth. Consistency tricks do not include deleting durable data.",
      },
      {
        id: "ttl",
        label: "Do nothing. A TTL means a cache cannot be a single point of failure.",
        correct: false,
        feedback:
          "TTL expires keys. It does not keep the cache process alive. An empty or dead cache is still a load spike.",
      },
    ],
  },
  {
    kind: "canvas",
    id: "cdn",
    title: "Photos should not ride the origin",
    kicker: "Level 9 · Improve it",
    story:
      "Users are far from your origin. CSS, avatars, and photos are the same bytes over and over. Your app servers are acting like a worldwide file host.",
    prompt:
      "Add a CDN. Connect the browser to it. Optionally put object storage behind the CDN for the actual files.",
    why: "An edge cache keeps static bytes close to users and off the origin. Dynamic HTML and APIs can still hit your load balancer.",
    hints: [
      "CDN in front of static assets. Origin still owns the API.",
      "Object storage is a common origin for photos; the CDN is the public face.",
      "Draw Browser → CDN, and CDN → storage or CDN → app if you are caching HTML.",
    ],
    highlight: ["cdn", "storage"],
    starter: starterWithCache,
    checks: [
      {
        id: "has-cdn",
        label: "A CDN is on the canvas",
        pass: (design) => ofType(design, "cdn").length >= 1,
      },
      {
        id: "client-cdn",
        label: "The browser can reach the CDN",
        pass: (design) => hasTypedEdge(design, "client", "cdn"),
      },
    ],
  },
  {
    kind: "quiz",
    id: "stateless",
    title: "Stop pinning users to one box",
    kicker: "Level 10 · Deep dive",
    story:
      "Login sessions currently live in one app server’s memory. The balancer is “sticky” so the next request finds that memory. That server just died.",
    prompt: "How do you make app servers interchangeable?",
    why: "A stateless web tier means any app server can handle any request. Session data belongs in a shared store, not in one process.",
    hints: [
      "Sticky sessions turn a dead app server into logged-out users.",
      "You already have a cache on the board — that is a common session store.",
    ],
    question: "Sessions are in one app server’s memory. The better next step is…",
    choices: [
      {
        id: "shared",
        label: "Store sessions in a shared cache or database so any app server can serve the next request",
        correct: true,
        feedback:
          "That is the move. App servers become cattle. Losing one box no longer logs a slice of users out.",
      },
      {
        id: "stickier",
        label: "Make sticky sessions stricter so a user never hits a cold server",
        correct: false,
        feedback:
          "Stickier routing makes the outage worse. The point is to stop depending on one process’s RAM.",
      },
      {
        id: "cookie-secret",
        label: "Put the password in a cookie so the server does not need a session",
        correct: false,
        feedback:
          "Do not put secrets in cookies. Signed session ids are fine; credentials are not.",
      },
      {
        id: "one-server",
        label: "Go back to one app server so you do not need shared state",
        correct: false,
        feedback:
          "That throws away horizontal scaling. Shared session state is cheaper than a single box.",
      },
    ],
  },
  {
    kind: "canvas",
    id: "queue",
    title: "Get slow work off the request path",
    kicker: "Level 11 · Improve it",
    story:
      "Thumbnail generation and “welcome” emails run inside the upload HTTP handler. Peak hour makes every upload wait on work the user did not ask to stare at.",
    prompt:
      "Add a queue. Connect an app server to it so the HTTP response can return while workers chew on the job.",
    why: "Queues absorb spikes and keep the user-facing path short. They do not make work free — consumers, retries, and poison messages still need owners.",
    hints: [
      "The web request enqueues; a worker later consumes. That is the whole trick.",
      "Drop a Queue component and draw App server → Queue.",
      "At-least-once delivery is the usual contract. Design consumers to be idempotent.",
    ],
    highlight: ["queue"],
    starter: starterWithCdn,
    checks: [
      {
        id: "has-queue",
        label: "A queue is on the canvas",
        pass: (design) => ofType(design, "queue").length >= 1,
      },
      {
        id: "app-to-queue",
        label: "An app server enqueues work",
        pass: (design) =>
          hasEdgeBetween(
            design,
            appServers(design).map((item) => item.id),
            ofType(design, "queue").map((item) => item.id),
          ),
      },
    ],
  },
  {
    kind: "canvas",
    id: "shards",
    title: "One primary will not hold the data",
    kicker: "Level 12 · Improve it",
    story:
      "The primary is still one disk, one CPU, one failover story. User data will not fit comfortably, and a popular creator is a hotspot waiting to happen.",
    prompt:
      "Partition data. Add another database you treat as a second shard (you should have at least three database nodes including the replica).",
    why: "Sharding spreads storage and writes. The shard key has to spread load — a user id often works; a monotonic timestamp often does not — and joins across shards get expensive.",
    hints: [
      "Primary + replica is high availability, not a partition. A shard is another piece of the data.",
      "Add a third database node and connect an app server to it.",
      "Avoid keys that send every new row to the same shard (recent timestamps, “status = active”).",
    ],
    highlight: ["database"],
    starter: starterWithQueue,
    checks: [
      {
        id: "three-db",
        label: "At least three database nodes (primary, replica, and a shard)",
        pass: (design) => ofType(design, "database").length >= 3,
      },
    ],
  },
  {
    kind: "quiz",
    id: "observe",
    title: "You cannot improve what you cannot see",
    kicker: "Level 13 · Deep dive",
    story:
      "The architecture now has many moving parts. The next outage will not be “the one box is down.” It will be a queue lagging, a shard hot, or a cache stampeded.",
    prompt: "What belongs in this design before you call it done?",
    why: "Metrics, logs, traces, and alerts are part of the architecture. SSH-ing into production during an incident is not a strategy.",
    hints: [
      "You want to know error rate and latency before users tweet.",
      "Logs without metrics are a haystack. Metrics without traces hide the slow hop.",
    ],
    question: "Which set belongs in a production architecture at this scale?",
    choices: [
      {
        id: "full",
        label: "Metrics, structured logs, traces, and alerts on error rate and latency",
        correct: true,
        feedback:
          "That is the production bar. Detection is part of the design, not an appendix.",
      },
      {
        id: "top",
        label: "SSH and `top` when something feels slow",
        correct: false,
        feedback:
          "That does not scale past one box, and it only starts after users already felt the pain.",
      },
      {
        id: "prints",
        label: "Add print statements in production during incidents",
        correct: false,
        feedback:
          "Incident debugging needs traces you already emit, not a fresh deploy of print().",
      },
      {
        id: "later",
        label: "Skip monitoring until the first outage, to save cost",
        correct: false,
        feedback:
          "The first outage is the most expensive time to discover you are flying blind.",
      },
    ],
  },
  {
    kind: "canvas",
    id: "ship-it",
    title: "Show the whole board",
    kicker: "Level 14 · Boss round",
    story:
      "Traffic is no longer a garage project. Before you leave the whiteboard, the design should include the pieces you earned: balancer, multiple app servers, cache, CDN, queue, and more than a single database.",
    prompt:
      "Check the board against the production-ish checklist. Fill any gaps, then ship it.",
    why: "You started with one box and added complexity only when the previous design broke. That is the whole game: simplest thing that works, then the next bottleneck.",
    hints: [
      "Scan the checklist on the left. Each red row is a missing piece from an earlier round.",
      "Client → load balancer → app servers, plus cache, CDN, queue, and several databases.",
      "If you inherited a complete board from the path, this round is a victory lap.",
    ],
    highlight: ["load_balancer", "cache", "cdn", "queue", "database"],
    starter: starterSharded,
    checks: [
      twoAppServers,
      loadBalancerInFront,
      {
        id: "has-cache",
        label: "Cache is present",
        pass: (design) => ofType(design, "cache").length >= 1,
      },
      {
        id: "has-cdn",
        label: "CDN is present",
        pass: (design) => ofType(design, "cdn").length >= 1,
      },
      {
        id: "has-queue",
        label: "Queue is present",
        pass: (design) => ofType(design, "queue").length >= 1,
      },
      {
        id: "has-dbs",
        label: "More than one database node",
        pass: (design) => ofType(design, "database").length >= 2,
      },
    ],
  },
];

export function stepIndexById(id: string) {
  return FROM_ZERO_STEPS.findIndex((step) => step.id === id);
}

export function getStep(id: string) {
  return FROM_ZERO_STEPS.find((step) => step.id === id) ?? FROM_ZERO_STEPS[0]!;
}

export function gradeCanvasStep(step: CanvasStep, design: SystemDesign) {
  return evaluateChecks(design, step.checks);
}
