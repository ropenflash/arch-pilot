export const PRODUCT = {
  name: "ArchPilot",
  kicker: "System design copilot",
  documentTitle: "ArchPilot — System Design Copilot",
  tagline: "Design better systems with AI.",
  description:
    "Learn system design by clarifying requirements, estimating load, building architecture, and reasoning through trade-offs.",
  longDescription:
    "ArchPilot is an interactive system-design learning platform: understand the problem, estimate scale, build the architecture, simulate pressure, and explain every decision.",
  primaryCta: "Create System Design",
  secondaryCta: "View Examples",
  learnCta: "Learn the path",
  learnKicker: "Guided practice",
  formLearnNote:
    "Learning the interview? Skip this form. The prompts are already written — pick a system and design it.",
  whyHeadline: "Why ArchPilot?",
  whyLead:
    "Most AI coding tools generate code. ArchPilot focuses on the decisions that come before the code.",
  questions: [
    {
      id: "why",
      title: "Why?",
      body: "Every component and datastore has to earn its place. No Kafka, Redis, or CDN unless this problem needs it.",
    },
    {
      id: "tradeoffs",
      title: "What are the trade-offs?",
      body: "Each major choice names the benefit, the cost, and the moment you would reverse it.",
    },
    {
      id: "breaks",
      title: "When does this break?",
      body: "Designs include the failure that will actually happen: spikes, partitions, timeouts, and dependency outages.",
    },
    {
      id: "scale",
      title: "How does it scale?",
      body: "Hot paths, sharding keys, and what stays off the critical path are explicit — not a generic 'horizontal scaling' slide.",
    },
    {
      id: "fails",
      title: "What happens when it fails?",
      body: "Detection, mitigation, and recovery are part of the architecture, not an afterthought in the appendix.",
    },
  ],
  outputsHeadline: "What you get from a brief",
  outputs: [
    {
      title: "Requirements",
      body: "Functional and non-functional requirements derived from the problem, not a generic checklist.",
    },
    {
      title: "Capacity",
      body: "Average and peak RPS, storage, and bandwidth computed in TypeScript. The model does not invent arithmetic.",
    },
    {
      title: "Architecture",
      body: "Services, stores, queues, and edges that fit this workload — with technology, scaling, and failure behavior.",
    },
    {
      title: "Diagram",
      body: "An editable canvas: add components, draw connections, inspect each node, auto-layout, and export a PNG. Generated designs are a starting point you can redraw.",
    },
    {
      title: "Data & APIs",
      body: "Entities, relationships, and the endpoints that actually move state — including auth and idempotency.",
    },
    {
      title: "Review",
      body: "A second-pass critique that hunts bottlenecks, SPOFs, and over-engineering without regenerating the design.",
    },
  ],
  methodHeadline: "How a design is produced",
  method: [
    {
      step: "01",
      title: "Write the brief",
      body: "Name the system, describe the problem, and optionally give DAU, peak multiplier, and read/write shape.",
    },
    {
      step: "02",
      title: "Generate the architecture",
      body: "The model returns strict JSON. Zod validates it. Capacity formulas run in application code, not in the prompt.",
    },
    {
      step: "03",
      title: "Challenge it",
      body: "Review Architecture asks a skeptical principal architect to attack the design. It does not rewrite it.",
    },
  ],
  examplesHeadline: "Design these systems",
  examplesLead:
    "Written interview problems with guided moves, nudges, trade-offs, a reference approach, and a failure drill.",
  formLead:
    "Describe the system as you would to a principal architect, then generate an architecture — or start on a blank canvas and design the diagram yourself. Optional scale fields make capacity math deterministic.",
  reviewEmpty:
    "No review yet. Review Architecture asks a skeptical principal architect to challenge this design. It does not regenerate the architecture.",
  capacityNote:
    "Average RPS = DAU × requests/user/day ÷ 86,400. Peak RPS = average × peak multiplier. Storage and bandwidth use the same TypeScript formulas. The model may supply assumptions; it does not invent the arithmetic.",
  footer:
    "Grow the system, size it, run the hour, then design the systems you will actually be asked.",
  generationSteps: [
    "Understanding requirements...",
    "Estimating scale...",
    "Designing architecture...",
    "Evaluating trade-offs...",
    "Mapping failure scenarios...",
    "Generating architecture graph...",
  ],
} as const;
