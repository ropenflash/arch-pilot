export const APPROACH_SESSION_MINUTES = 45;

export type ApproachStepId = "scope" | "blueprint" | "deep-dive" | "wrap";

export type ApproachStep = {
  id: ApproachStepId;
  number: number;
  title: string;
  minutes: string;
  minutesLow: number;
  minutesHigh: number;
  kicker: string;
  goal: string;
  youDo: string[];
  watchFor: string[];
  doneWhen: string;
};

export const APPROACH_STEPS: ApproachStep[] = [
  {
    id: "scope",
    number: 1,
    title: "Scope the problem",
    minutes: "3–10 min",
    minutesLow: 3,
    minutesHigh: 10,
    kicker: "Do not draw yet",
    goal: "Turn a vague prompt into a short list of features, users, and constraints you both agree on.",
    youDo: [
      "Repeat the prompt in one sentence, then ask what is in v1 versus later.",
      "Ask who the clients are, how many people show up, and how fast that number grows.",
      "Ask about reads vs writes, media vs text, and any latency or freshness bar.",
      "If the interviewer will not pick a number, invent one out loud and write it down.",
    ],
    watchFor: [
      "Sprinting to a stack before you know the product.",
      "Treating this as trivia — there is no single correct architecture hiding in the prompt.",
    ],
    doneWhen: "You can point at a v1 feature list, a scale guess, and a handful of labeled assumptions.",
  },
  {
    id: "blueprint",
    number: 2,
    title: "Sketch a blueprint and get a nod",
    minutes: "10–15 min",
    minutesLow: 10,
    minutesHigh: 15,
    kicker: "Boxes first, then napkin math",
    goal: "Show the whole system at a glance, check that it can carry the load, and invite the other person in.",
    youDo: [
      "Draw clients, the public door, app servers, and the stores. Name the two or three hottest flows.",
      "Talk through a write path and a read path if they differ — posting is not the same as opening the home grid.",
      "Run napkin math on QPS, storage, and the busy-hour pipe. Say the assumptions while you round.",
      "Pause. Ask what to keep, cut, or zoom into. Treat this as a pairing session, not a lecture.",
    ],
    watchFor: [
      "APIs and table schemas too early on a huge problem — save those for a smaller prompt.",
      "Silence. If you are not narrating, nobody can course-correct you.",
    ],
    doneWhen: "There is a labeled diagram, a scale check, and agreement on where to go deep.",
  },
  {
    id: "deep-dive",
    number: 3,
    title: "Go deep on the risky parts",
    minutes: "10–25 min",
    minutesLow: 10,
    minutesHigh: 25,
    kicker: "One or two bottlenecks, not everything",
    goal: "Pick the pieces that actually decide whether the design works, and ignore the rest on purpose.",
    youDo: [
      "Ask which component they care about. Senior sessions often want a bottleneck, not another box diagram.",
      "For a short-link product, the encoding and the read cache are interesting. For chat, fan-out and presence are.",
      "Stay at the depth that proves you can scale and fail, not the depth of a research paper.",
      "Timebox. A ranking essay that eats twenty minutes does not show you can ship a system.",
    ],
    watchFor: [
      "Disappearing into one function while the rest of the board is unlabeled.",
      "Ignoring hints. If they keep steering you to latency, follow latency.",
    ],
    doneWhen: "The scariest flow has a data path, a failure story, and a scale story.",
  },
  {
    id: "wrap",
    number: 4,
    title: "Close the loop",
    minutes: "3–5 min",
    minutesLow: 3,
    minutesHigh: 5,
    kicker: "You are not done until they say so",
    goal: "Leave a clear recap, name what breaks, and show you know the design is unfinished on purpose.",
    youDo: [
      "Restate the v1, the diagram, and the two deep dives in under a minute.",
      "Name a failure (box down, region down, thundering herd) and how you would see it.",
      "Say what changes at 10× users. If today’s board is for one million, the next curve is the plot twist.",
      "Offer ops: metrics, logs, deploys. Ask what they still want on the board.",
    ],
    watchFor: [
      "Claiming the design is complete. There is always a next constraint.",
      "Packing up after the last box. Ask for feedback while you still have minutes.",
    ],
    doneWhen: "They have a recap, a failure, a next-scale note, and a chance to steer you once more.",
  },
];

export const APPROACH_CLARIFY = [
  {
    id: "surface",
    prompt: "Who talks to this system?",
    examples: ["Mobile, web, or both?", "Public API for third parties, or only first-party apps?"],
  },
  {
    id: "v1",
    prompt: "What is actually in v1?",
    examples: ["Must-have actions vs nice-to-have.", "Can we drop search, ads, or live comments for this hour?"],
  },
  {
    id: "scale",
    prompt: "How big, and how fast?",
    examples: ["Daily actives today.", "Where should we be in 3 months, 6 months, a year?"],
  },
  {
    id: "shape",
    prompt: "What does a typical request look like?",
    examples: ["Read-heavy or write-heavy?", "Text only, or images and video?", "Latency bar for the home screen?"],
  },
  {
    id: "constraints",
    prompt: "What is already decided?",
    examples: ["Existing stores or clouds we should reuse.", "Consistency vs availability if they disagree."],
  },
];

export const APPROACH_WRAP_PROMPTS = [
  "If this box dies, who notices and how?",
  "What is the next 10× of users going to break first?",
  "Which metric would page you at 3am?",
  "What would you build next if we had another twenty minutes?",
];

export const APPROACH_DO = [
  "Ask until the prompt is small enough to draw.",
  "Say assumptions out loud and write units on every number.",
  "Narrate. A quiet whiteboard is an untestable whiteboard.",
  "Offer two shapes when it is cheap — then pick one with them.",
  "Deep-dive the bottleneck you agreed on, not your favorite trivia.",
  "Treat the other side as a teammate. Bounce the next cut off them.",
];

export const APPROACH_DONT = [
  "Do not answer in the first thirty seconds to look sharp. Speed without scope is a red flag.",
  "Do not dump Kafka, a service mesh, and six caches on a v1 that does not need them.",
  "Do not vanish into one function before the high-level picture exists.",
  "Do not sit in silence hoping they will guess your plan.",
  "Do not declare victory after the last box. Ask what is still itchy.",
  "Do not refuse a hint. Stubbornness reads as narrowness.",
];

export type ClarifyChoice = {
  id: string;
  label: string;
  good: boolean;
  why: string;
};

export type ApproachDrill = {
  id: string;
  title: string;
  prompt: string;
  setup: string;
  questions: ClarifyChoice[];
  blueprint: {
    writePath: string;
    readPath: string;
    boxes: string[];
  };
  deepDives: ClarifyChoice[];
};

export const APPROACH_DRILLS: ApproachDrill[] = [
  {
    id: "lumen",
    title: "Pulse — a photo grid",
    prompt: "Design Pulse, a product where people post photos and open a home grid of people they follow.",
    setup: "You have ~45 minutes. v1 can be small. Numbers are yours to propose if they will not pick.",
    questions: [
      {
        id: "clients",
        label: "Is this mobile, web, or both?",
        good: true,
        why: "Clients change payload size, auth, and whether you need a public API on day one.",
      },
      {
        id: "v1",
        label: "Is v1 “post a photo and see a follow-grid,” or do we also owe search, stories, and ads?",
        good: true,
        why: "Scope is the whole game. Extra surfaces steal the deep dive.",
      },
      {
        id: "dau",
        label: "How many daily actives, and what does 12 months look like?",
        good: true,
        why: "Napkin math needs a population. Invent 8 million today and 3× in a year if they shrug.",
      },
      {
        id: "media",
        label: "Photos only, or photos plus video? Typical size?",
        good: true,
        why: "Storage and the CDN depend on this more than on caption text.",
      },
      {
        id: "fanout",
        label: "About how many people can one account follow, and is the grid newest-first?",
        good: true,
        why: "Fan-out vs pull is a design fork. Newest-first is a fine v1 if they agree.",
      },
      {
        id: "k8s",
        label: "Should we start with Kubernetes, Istio, and three regions?",
        good: false,
        why: "Stack tourism. You do not know the QPS yet. Regions come after one working path.",
      },
      {
        id: "rank",
        label: "Can I spend the hour on a personalization model for the grid?",
        good: false,
        why: "That is a research detour. It does not prove you can store a photo and serve a list.",
      },
      {
        id: "schema",
        label: "Should I write the full Postgres schema before we draw any boxes?",
        good: false,
        why: "On a broad prompt, tables are a deep dive — after the blueprint exists.",
      },
    ],
    blueprint: {
      writePath:
        "Client → public door → app → object store for bytes, metadata store for the post, then a fan-out or “write a pointer on the follower grid.”",
      readPath:
        "Client → public door → app → hot grid cache (or a precomputed timeline) → hydrate captions and CDN URLs for the bytes.",
      boxes: [
        "Client (web + mobile)",
        "Load balancer",
        "App / API",
        "Object storage + CDN",
        "Post metadata DB",
        "Grid cache",
        "Optional queue + fan-out workers",
      ],
    },
    deepDives: [
      {
        id: "upload",
        label: "Upload path: direct-to-object-store, processing, and what happens when the worker is behind",
        good: true,
        why: "Writes plus large bytes are where Pulse actually hurts.",
      },
      {
        id: "feed",
        label: "Home grid: precompute on write vs pull on read, and how a celebrity account blows up a shard",
        good: true,
        why: "This is the read bottleneck and a real fan-out fork.",
      },
      {
        id: "cdn",
        label: "CDN and cache invalidation for a replaced photo",
        good: true,
        why: "Bytes dwarf metadata. Worth a short, concrete pass.",
      },
      {
        id: "ml",
        label: "Train a ranking model and discuss feature stores",
        good: false,
        why: "You will not finish, and you still have not stored a photo.",
      },
      {
        id: "pixel",
        label: "Hand-roll a new image codec",
        good: false,
        why: "Off-the-shelf formats exist. This does not show system design.",
      },
    ],
  },
  {
    id: "relay",
    title: "Relay — presence and 1:1 chat",
    prompt: "Design Relay, a 1:1 chat with online/offline presence and photo attachments.",
    setup: "v1 is one-to-one, not channels. Presence can be “good enough,” not perfect.",
    questions: [
      {
        id: "fan",
        label: "Is v1 1:1 only, or group rooms of 1,000?",
        good: true,
        why: "Fan-out and membership change completely. Pin v1 to 1:1 if they allow it.",
      },
      {
        id: "online",
        label: "How fresh does “online” need to be — a few seconds, or exact?",
        good: true,
        why: "Presence is a popular deep dive. The SLO decides heartbeats vs a cheaper cache.",
      },
      {
        id: "history",
        label: "How long do we keep history, and do attachments live forever?",
        good: true,
        why: "Retention drives storage. Attachments are the expensive part.",
      },
      {
        id: "ws",
        label: "Should I start by comparing every pub/sub product on the market?",
        good: false,
        why: "Pick a delivery model (push vs poll) first. Vendor bingo is not design.",
      },
      {
        id: "e2e",
        label: "Must we design full e2e crypto before the message path exists?",
        good: false,
        why: "Call it out as a later constraint unless they insist. It can swallow the hour.",
      },
    ],
    blueprint: {
      writePath:
        "Client connection → gateway → chat service → append-only message store, plus a queue to push to the other party if they are online.",
      readPath:
        "Reconnect hydrates recent history from the store; presence is a short-TTL key updated by heartbeats.",
      boxes: [
        "Client",
        "Connection gateway",
        "Chat service",
        "Message store",
        "Presence cache",
        "Push queue / notifier",
        "Object store for attachments",
      ],
    },
    deepDives: [
      {
        id: "presence",
        label: "Presence heartbeats, TTLs, and what “online” means after a phone sleeps",
        good: true,
        why: "Classic chat deep dive. It is small, sharp, and operational.",
      },
      {
        id: "delivery",
        label: "Online push vs persist-then-notify, and at-least-once duplicates",
        good: true,
        why: "This is the reliability story for 1:1 chat.",
      },
      {
        id: "crdt",
        label: "A custom CRDT for typing indicators",
        good: false,
        why: "Over-engineered for v1. Typing can be ephemeral and lossy.",
      },
    ],
  },
];

export function getApproachStep(id: string) {
  return APPROACH_STEPS.find((step) => step.id === id) ?? APPROACH_STEPS[0]!;
}

export function approachStepIndex(id: string) {
  return APPROACH_STEPS.findIndex((step) => step.id === id);
}

export function getDrill(id: string) {
  return APPROACH_DRILLS.find((item) => item.id === id) ?? APPROACH_DRILLS[0]!;
}

export function scoreChoices(
  choices: ClarifyChoice[],
  picked: string[],
): { goodPicked: number; badPicked: number; missedGood: number; score: number } {
  const good = choices.filter((item) => item.good);
  const bad = choices.filter((item) => !item.good);
  const pickedSet = new Set(picked);
  const goodPicked = good.filter((item) => pickedSet.has(item.id)).length;
  const badPicked = bad.filter((item) => pickedSet.has(item.id)).length;
  const missedGood = good.length - goodPicked;
  const score = Math.max(0, goodPicked - badPicked);
  return { goodPicked, badPicked, missedGood, score };
}
