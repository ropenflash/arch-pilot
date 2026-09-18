export type MindsetLesson = {
  id: string;
  title: string;
  minutes: number;
  concept: string;
  why: string;
  visual: { label: string; detail: string }[];
  commonMistake: string;
  interviewQuestion: string;
  tryIt: string;
  takeaways: string[];
  quiz: {
    question: string;
    choices: {
      id: string;
      label: string;
      correct: boolean;
      why: string;
      assumption: string;
    }[];
  };
};

export const MINDSET_LESSONS: MindsetLesson[] = [
  {
    id: "what-is-system-design",
    title: "What is system design?",
    minutes: 5,
    concept:
      "System design is the process of turning a product promise and workload into boundaries, data flows, and explicit engineering decisions.",
    why:
      "A diagram is useful only when every box exists for a reason. The work is deciding what must happen, where it happens, and what the system promises when a dependency fails.",
    visual: [
      { label: "Problem", detail: "What users need" },
      { label: "Constraints", detail: "Scale and quality" },
      { label: "Decisions", detail: "Flows and boundaries" },
      { label: "Consequences", detail: "Trade-offs and failures" },
    ],
    commonMistake:
      "Treating system design as a vocabulary test and adding every familiar component.",
    interviewQuestion:
      "What would you need to know before deciding whether this system needs a cache or queue?",
    tryIt:
      "Take a familiar product. Describe one user action, one durability promise, and one likely bottleneck without naming technology.",
    takeaways: [
      "Start from behavior and pressure, not a technology list.",
      "A design is a set of justified decisions.",
      "Failure behavior is part of the product promise.",
    ],
    quiz: {
      question: "Which opening best demonstrates system-design thinking?",
      choices: [
        { id: "stack", label: "I will use a gateway, Kafka, Redis, and five services.", correct: false, why: "The stack arrived before the product or workload.", assumption: "Those tools may become reasonable after concrete pressure appears." },
        { id: "scope", label: "First I want to agree on the main user flow, scale, and quality constraints.", correct: true, why: "Those answers give architecture decisions a job.", assumption: "If the prompt already specifies them, confirm and move forward." },
        { id: "code", label: "Let me choose a programming language first.", correct: false, why: "Language rarely determines the first architecture boundary.", assumption: "It matters when runtime constraints are part of the prompt." },
      ],
    },
  },
  {
    id: "requirements-before-architecture",
    title: "Requirements come before architecture",
    minutes: 6,
    concept:
      "Requirements tell you which paths must exist and which qualities are worth paying for.",
    why:
      "A news feed for chronological text posts is different from a personalized video feed. Drawing before clarifying silently chooses a product the interviewer may not mean.",
    visual: [
      { label: "Who?", detail: "clients and actors" },
      { label: "Do what?", detail: "core flows" },
      { label: "How much?", detail: "traffic and bytes" },
      { label: "How well?", detail: "latency, durability, availability" },
    ],
    commonMistake:
      "Asking twenty questions without explaining which architecture decision each answer changes.",
    interviewQuestion:
      "For a news feed, which three clarifications would most change the design?",
    tryIt:
      "Before drawing a URL shortener, write one sentence each for creator, reader, volume, and latency.",
    takeaways: [
      "Clarify only questions that change design.",
      "Core flows define the first diagram.",
      "Quality requirements justify extra infrastructure.",
    ],
    quiz: {
      question: "You are asked to design a feed. Which question has the highest architectural value first?",
      choices: [
        { id: "color", label: "What color is the post button?", correct: false, why: "It does not change data flow or scale.", assumption: "UI design matters in a product interview, not this architecture decision." },
        { id: "flow", label: "Is the feed chronological or personalized, and what content does it carry?", correct: true, why: "Ranking and media radically change the write/read paths.", assumption: "If it is fixed as chronological text, the first design can stay much simpler." },
        { id: "framework", label: "Which frontend framework is preferred?", correct: false, why: "The feed backend does not depend on this early choice.", assumption: "It matters only with a specified client/runtime constraint." },
      ],
    },
  },
  {
    id: "functional-vs-non-functional",
    title: "Functional vs non-functional requirements",
    minutes: 6,
    concept:
      "Functional requirements describe user-visible capabilities. Non-functional requirements describe how reliably, quickly, and at what scale those capabilities work.",
    why:
      "“Upload a video” creates a flow. “Playback starts globally in under two seconds” changes storage, processing, and delivery architecture.",
    visual: [
      { label: "Function", detail: "upload a video" },
      { label: "Quality", detail: "start quickly worldwide" },
      { label: "Function", detail: "send a message" },
      { label: "Quality", detail: "never lose accepted messages" },
    ],
    commonMistake:
      "Writing vague qualities such as “fast” and “scalable” without a measurable target or affected flow.",
    interviewQuestion:
      "Which requirement controls the critical path, and which can complete asynchronously?",
    tryIt:
      "For chat, write two functional and two measurable non-functional requirements.",
    takeaways: [
      "Capabilities create flows.",
      "Quality targets change architecture cost.",
      "Attach each quality requirement to a specific path.",
    ],
    quiz: {
      question: "Which is a useful non-functional requirement?",
      choices: [
        { id: "send", label: "Users can send messages.", correct: false, why: "That is a functional capability.", assumption: "Add a measurable delivery or durability promise to make it non-functional." },
        { id: "fast", label: "The system should be fast.", correct: false, why: "It is not measurable and names no path.", assumption: "“p95 send acknowledgement under 200 ms” would be useful." },
        { id: "latency", label: "Accepted messages are durable before the sender receives acknowledgement.", correct: true, why: "It gives the write path a specific ordering and durability constraint.", assumption: "If loss is acceptable, acknowledgement could happen earlier." },
      ],
    },
  },
  {
    id: "clarifying-questions",
    title: "Ask questions that change the design",
    minutes: 6,
    concept:
      "A strong clarifying question names an uncertainty and the decision it affects.",
    why:
      "Questions are not ceremony. They prevent hidden assumptions about users, content, scale, consistency, and scope from becoming expensive architecture mistakes.",
    visual: [
      { label: "Unknown", detail: "Are groups supported?" },
      { label: "Consequence", detail: "fan-out and ordering" },
      { label: "Unknown", detail: "Can data be stale?" },
      { label: "Consequence", detail: "cache and replicas" },
    ],
    commonMistake:
      "Asking for exact numbers when an order-of-magnitude assumption would be enough.",
    interviewQuestion:
      "If the interviewer says “assume whatever you need,” what do you do next?",
    tryIt:
      "For notifications, ask one product, one scale, one latency, and one failure question. Say what each answer changes.",
    takeaways: [
      "Connect each question to a decision.",
      "Prioritize product shape and dominant traffic.",
      "Make a labeled assumption when no answer exists.",
    ],
    quiz: {
      question: "Which clarifying question is most useful for cloud file sync?",
      choices: [
        { id: "font", label: "Which font does the desktop app use?", correct: false, why: "It does not affect sync architecture.", assumption: "UI questions belong outside this system-design scope." },
        { id: "conflict", label: "Can two offline devices edit the same file, and what conflict behavior is acceptable?", correct: true, why: "It determines versioning and conflict resolution.", assumption: "If files are append-only, the synchronization model simplifies." },
        { id: "language", label: "Should the server be written in Go?", correct: false, why: "The data semantics matter before implementation language.", assumption: "Language matters if a runtime constraint is explicit." },
      ],
    },
  },
  {
    id: "define-scope",
    title: "Define a first design scope",
    minutes: 5,
    concept:
      "Scope is a deliberate boundary around the smallest coherent product you can design deeply.",
    why:
      "Every extra feature creates APIs, data, failure cases, and discussion branches. A narrow v1 leaves room to reason about the hard path instead of naming boxes.",
    visual: [
      { label: "Must", detail: "create + redirect" },
      { label: "Later", detail: "analytics dashboard" },
      { label: "Must", detail: "1:1 messages" },
      { label: "Later", detail: "large communities" },
    ],
    commonMistake:
      "Silently dropping a difficult feature instead of stating that it is out of scope and why.",
    interviewQuestion:
      "What is explicitly in v1, and what will you name but not design?",
    tryIt:
      "Reduce “design a video platform” to three user capabilities and one deep-dive path.",
    takeaways: [
      "Choose a coherent v1.",
      "State exclusions out loud.",
      "Go deep on the path that drives architecture.",
    ],
    quiz: {
      question: "For a first URL-shortener design, which scope is strongest?",
      choices: [
        { id: "everything", label: "Short links, ads, recommendations, billing, social graph, and global analytics.", correct: false, why: "The design will become broad and shallow.", assumption: "Add one feature only if the prompt makes it central." },
        { id: "core", label: "Create a code, redirect it, and record clicks asynchronously.", correct: true, why: "It is coherent and leaves one useful asynchronous extension.", assumption: "Remove analytics if the interview is short or redirects are the only focus." },
        { id: "none", label: "Only draw a database without defining an API.", correct: false, why: "A component is not a product scope.", assumption: "The database follows from the create/read flows." },
      ],
    },
  },
  {
    id: "explicit-assumptions",
    title: "Make assumptions explicit",
    minutes: 5,
    concept:
      "An assumption is a temporary input with a reason and a design consequence.",
    why:
      "System-design prompts are intentionally incomplete. Good engineers move forward without pretending unknowns are facts.",
    visual: [
      { label: "Assume", detail: "10M daily users" },
      { label: "Because", detail: "consumer-scale prompt" },
      { label: "Therefore", detail: "estimate peak QPS" },
      { label: "Revisit if", detail: "enterprise-only users" },
    ],
    commonMistake:
      "Inventing precise numbers silently, then defending architecture built on false precision.",
    interviewQuestion:
      "Which assumption would most change your design if it were ten times larger?",
    tryIt:
      "Write a scale assumption as: value → reason → affected decision → trigger to revisit.",
    takeaways: [
      "Label assumptions.",
      "Prefer useful magnitude over fake precision.",
      "Name which decision changes if the assumption moves.",
    ],
    quiz: {
      question: "The interviewer gives no traffic number. What is the best response?",
      choices: [
        { id: "stop", label: "Refuse to continue.", correct: false, why: "Ambiguity is part of the exercise.", assumption: "Pause only if the missing information changes the entire product." },
        { id: "silent", label: "Silently assume one billion QPS.", correct: false, why: "The assumption and consequence are hidden and extreme.", assumption: "Large scale can be chosen if the prompt supports it and it is stated." },
        { id: "label", label: "Choose a round magnitude, state it, and explain which estimates use it.", correct: true, why: "This preserves momentum and makes the design revisable.", assumption: "Update it immediately if the interviewer supplies a different order of magnitude." },
      ],
    },
  },
  {
    id: "communicate-while-designing",
    title: "Communicate while designing",
    minutes: 5,
    concept:
      "Narrate decisions, invite correction, and keep the diagram synchronized with the conversation.",
    why:
      "The interviewer evaluates how you reason with another engineer. A silent final diagram hides prioritization, uncertainty, and adaptation.",
    visual: [
      { label: "State", detail: "what you are solving" },
      { label: "Draw", detail: "one flow" },
      { label: "Check", detail: "invite correction" },
      { label: "Deepen", detail: "follow the risky path" },
    ],
    commonMistake:
      "Speaking continuously without checkpoints, or drawing silently for ten minutes.",
    interviewQuestion:
      "How would you get buy-in before spending time on one subsystem?",
    tryIt:
      "Explain a client → API → database sketch in 30 seconds: scope, flow, assumption, and next question.",
    takeaways: [
      "Narrate why, not every drawing motion.",
      "Pause for alignment at architecture boundaries.",
      "Use the diagram as shared working memory.",
    ],
    quiz: {
      question: "You have a high-level diagram. What should happen before a cache deep dive?",
      choices: [
        { id: "continue", label: "Silently spend fifteen minutes on cache eviction.", correct: false, why: "The other engineer may want a different risk explored.", assumption: "Proceed if the deep dive was explicitly requested." },
        { id: "buyin", label: "Trace the main flow, name the likely bottleneck, and ask whether to deepen it.", correct: true, why: "This shows prioritization and collaboration.", assumption: "If a critical flaw appears during the trace, fix it before deep diving." },
        { id: "restart", label: "Erase the design and start with another stack.", correct: false, why: "Iteration should respond to evidence, not novelty.", assumption: "Restart only if requirements invalidated the architecture." },
      ],
    },
  },
  {
    id: "tradeoffs-not-perfect",
    title: "Design for trade-offs, not perfection",
    minutes: 6,
    concept:
      "Every architecture buys a benefit by accepting cost, complexity, latency, consistency, or operational risk.",
    why:
      "A “perfect” answer hides constraints. A strong answer says why a choice fits now, what it makes worse, and when it should change.",
    visual: [
      { label: "Choose", detail: "cache hot reads" },
      { label: "Gain", detail: "lower latency" },
      { label: "Pay", detail: "staleness + invalidation" },
      { label: "Reverse when", detail: "reuse is low" },
    ],
    commonMistake:
      "Listing benefits without naming the operational and correctness costs.",
    interviewQuestion:
      "When would you deliberately not use the component you just added?",
    tryIt:
      "For one load balancer, cache, queue, or replica, write: benefit, cost, failure mode, reversal trigger.",
    takeaways: [
      "No component is universally correct.",
      "Name the bill each box creates.",
      "Tie reversals to changed assumptions or measured pressure.",
    ],
    quiz: {
      question: "Which statement shows the strongest trade-off reasoning?",
      choices: [
        { id: "always", label: "Every read-heavy system must use Redis.", correct: false, why: "It jumps from traffic label to a product without checking reuse or staleness.", assumption: "A cache becomes likely when repeated reads and acceptable staleness are established." },
        { id: "reason", label: "Cache this repeated mapping for lower latency; accept stale edits for 60 seconds and protect misses from stampedes.", correct: true, why: "It names the pressure, benefit, cost, and failure behavior.", assumption: "If mappings must revoke instantly, use invalidation or shorten the policy." },
        { id: "perfect", label: "This architecture has no downside.", correct: false, why: "Every distributed component creates a cost.", assumption: "The relevant question is whether the downside matters under current constraints." },
      ],
    },
  },
];

export function getMindsetLesson(id: string) {
  return MINDSET_LESSONS.find((lesson) => lesson.id === id);
}

export function mindsetLessonHref(id = MINDSET_LESSONS[0]!.id) {
  return `/learn/mindset/${id}`;
}
