export type RateLimiterDiagram =
  | "why"
  | "scope"
  | "requirements"
  | "placement"
  | "algorithms"
  | "single-node"
  | "distributed"
  | "operations";

export type RateLimiterExample = {
  title: string;
  rule: string;
  meaning: string;
};

export type RateLimiterInterviewTurn = {
  ask: string;
  answer: string;
  takeaway: string;
};

export type RateLimiterRequirement = {
  title: string;
  meaning: string;
  ifSkipped: string;
};

export type RateLimiterSection = {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  minutes: number;
  kicker: string;
  summary: string;
  intro: string[];
  examples?: RateLimiterExample[];
  benefits?: { title: string; body: string }[];
  interview?: RateLimiterInterviewTurn[];
  requirements?: RateLimiterRequirement[];
  decided?: { title: string; body: string }[];
  keyPoints: { title: string; body: string }[];
  diagram: RateLimiterDiagram;
  checkpoint: {
    question: string;
    choices: { id: string; label: string; correct: boolean; why: string }[];
  };
};

export const RATE_LIMITER_SECTIONS: RateLimiterSection[] = [
  {
    id: "why",
    number: 1,
    title: "What a rate limiter does",
    shortTitle: "What it is",
    minutes: 5,
    kicker: "Start with everyday rules",
    summary:
      "A rate limiter is a doorway. It counts how often someone does something, then lets the request through or asks them to wait.",
    intro: [
      "Imagine a busy API. Most callers behave normally. Some retry too fast. Some are bots. A rate limiter answers one question for every request: is this still allowed right now?",
      "You already know the idea from products you use. A chat user cannot send a message every millisecond. A sign-up form cannot create unlimited accounts from one address. A rewards page cannot be farmed all week from one phone.",
    ],
    examples: [
      {
        title: "Chat",
        rule: "2 messages / second / user",
        meaning: "Stops a stuck client from flooding the room.",
      },
      {
        title: "Sign-up",
        rule: "10 accounts / day / IP",
        meaning: "Makes it expensive to create fake users in bulk.",
      },
      {
        title: "Rewards",
        rule: "5 claims / week / device",
        meaning: "Keeps a bonus from being collected over and over.",
      },
    ],
    benefits: [
      {
        title: "Keep servers healthy",
        body: "Extra traffic is stopped before it burns CPU, database connections, and worker threads that other users need.",
      },
      {
        title: "Spend money on real work",
        body: "Paid vendor calls — payments, SMS, credit checks — should not be wasted on retries, scrapers, or a buggy loop.",
      },
      {
        title: "Stop abuse without guessing",
        body: "A written quota turns “this feels too busy” into a clear rule: this identity has used its allowance.",
      },
    ],
    keyPoints: [
      {
        title: "It is a decision, not a product feature",
        body: "The limiter does not send the chat message or create the account. It only says allow or wait.",
      },
      {
        title: "Every rule has four parts",
        body: "Name the action, the identity you count, how many are allowed, and the time window or refill speed.",
      },
      {
        title: "Over the limit is a normal answer",
        body: "A good limiter rejects predictably. It does not crash, hang, or silently drop the request.",
      },
      {
        title: "Do not draw architecture yet",
        body: "First agree what “too many” means. Boxes come after the rule is clear.",
      },
    ],
    diagram: "why",
    checkpoint: {
      question: "What is the first job of a rate limiter?",
      choices: [
        {
          id: "boxes",
          label: "Pick Redis and draw the final architecture.",
          correct: false,
          why: "Tools come later. First decide what is being limited.",
        },
        {
          id: "decide",
          label: "Decide whether this request is still allowed right now.",
          correct: true,
          why: "Allow or wait is the whole product. Everything else supports that decision.",
        },
        {
          id: "queue",
          label: "Store every request forever so we can audit it later.",
          correct: false,
          why: "History can help later. The live decision is what protects the system.",
        },
      ],
    },
  },
  {
    id: "scope",
    number: 2,
    title: "Ask before you draw boxes",
    shortTitle: "Ask first",
    minutes: 7,
    kicker: "The interview starts with questions",
    summary:
      "A strong design begins as a short conversation. You lock the kind of limiter, the identity, the scale, and what the caller sees.",
    intro: [
      "“Design a rate limiter” is incomplete. There are many kinds: a polite delay in an app, a login throttle, or a shared service in front of many APIs.",
      "Walk through the questions below. Each answer removes a wrong design. At the end you will have a brief you can actually build.",
    ],
    interview: [
      {
        ask: "Is this a client-side helper or a server-side API limiter?",
        answer:
          "We will design a server-side limiter. The client can slow itself down for comfort, but it cannot be the only lock.",
        takeaway: "Enforcement lives on machines you control.",
      },
      {
        ask: "Do we throttle by IP, user id, API key, or something else?",
        answer:
          "The limiter should support more than one rule. One route may limit by IP. Another may limit by account or API key.",
        takeaway: "Do not hard-code a single identity.",
      },
      {
        ask: "Is this a small prototype or a system that must take a lot of traffic?",
        answer: "Plan for a large request volume. A design that only works on one laptop will not survive the interview or production.",
        takeaway: "The hot path must stay cheap.",
      },
      {
        ask: "Will many servers handle the same callers?",
        answer: "Yes. Requests for one user can land on different machines, so the count cannot live only in one process.",
        takeaway: "Local memory is not the final answer.",
      },
      {
        ask: "Is the limiter its own service, or code inside each application?",
        answer:
          "Either can work. A shared doorway is easier to reuse. In-app code can see richer business context. You will choose after the first design.",
        takeaway: "Placement is a later decision, not a guess on minute one.",
      },
      {
        ask: "Should we tell the caller they were limited?",
        answer:
          "Yes. A rejected request needs a clear error and a time to retry. Silent drops make clients retry harder.",
        takeaway: "The user is part of the design.",
      },
    ],
    decided: [
      { title: "Kind", body: "Server-side API limiter" },
      { title: "Identity", body: "Flexible: IP, user, key, or device" },
      { title: "Scale", body: "High traffic, many servers" },
      { title: "Feedback", body: "Tell the caller they were limited" },
    ],
    keyPoints: [
      {
        title: "Questions are design work",
        body: "If you skip this step, two engineers will build different products and both think they are right.",
      },
      {
        title: "Write the answers down",
        body: "The brief becomes the test: does this architecture still match what we asked?",
      },
      {
        title: "Leave one door open",
        body: "Service vs in-app code can wait. You only need enough scope to start a simple picture.",
      },
      {
        title: "Say what you will not build",
        body: "A first version does not need billing dashboards, per-partner contracts, or every algorithm on earth.",
      },
    ],
    diagram: "scope",
    checkpoint: {
      question: "Which statement is a complete first rule?",
      choices: [
        {
          id: "vague",
          label: "Limit abusive traffic.",
          correct: false,
          why: "It does not name the action, the identity, the allowance, or the time.",
        },
        {
          id: "complete",
          label: "Allow 20 login attempts per account every 10 minutes.",
          correct: true,
          why: "It names the action, who is counted, how many, and the window.",
        },
        {
          id: "stack",
          label: "Put a cache in front of every service.",
          correct: false,
          why: "That chooses a tool before the product behavior is clear.",
        },
      ],
    },
  },
  {
    id: "requirements",
    number: 3,
    title: "Write the quality bar",
    shortTitle: "Requirements",
    minutes: 6,
    kicker: "What “good” means before we add boxes",
    summary:
      "These six requirements turn a vague limiter into something you can judge. If a design misses one, say so out loud.",
    intro: [
      "After the interview questions, write the bar. Functional needs say what the limiter does. Quality needs say how it must feel under load and under failure.",
      "Keep this list short and visible. You will use it again when you choose an algorithm, pick a store, and decide what happens if that store dies.",
    ],
    requirements: [
      {
        title: "Limit accurately",
        meaning: "If the rule says 20 per 10 minutes, a 21st request should not sneak through because two servers disagreed.",
        ifSkipped: "The quota is a suggestion. Busy or hostile callers still get through.",
      },
      {
        title: "Stay fast",
        meaning: "The check is on every request. It should add almost no waiting to a healthy call.",
        ifSkipped: "You protected the API by making the API feel slow for everyone.",
      },
      {
        title: "Use little memory",
        meaning: "Counters and timestamps should stay small. A limiter that stores every request forever will not scale.",
        ifSkipped: "The limiter becomes more expensive than the service it was meant to protect.",
      },
      {
        title: "Work across many servers",
        meaning: "One user’s requests can hit different machines. They must share the same quota.",
        ifSkipped: "Each server has its own limit, so the real allowance is multiplied by the fleet size.",
      },
      {
        title: "Explain the rejection",
        meaning: "When a request is blocked, return a clear error and a time to try again.",
        ifSkipped: "Clients retry immediately and make the overload worse.",
      },
      {
        title: "Fail without taking the product down",
        meaning: "If the limiter’s store is sick, the rest of the system should still have a planned answer.",
        ifSkipped: "A cache outage becomes a site outage.",
      },
    ],
    keyPoints: [
      {
        title: "Accuracy and speed pull in opposite directions",
        body: "A perfectly global count can cost a network hop. A local count is faster and can overshoot. Say which you need.",
      },
      {
        title: "Memory is part of the algorithm choice",
        body: "Storing every timestamp is exact. Storing one counter is cheap. That is already a trade-off.",
      },
      {
        title: "Distributed is a requirement, not a later surprise",
        body: "If many servers will see the same user, in-process memory cannot be the whole design.",
      },
      {
        title: "Fault tolerance is a product decision",
        body: "Some routes should fail closed when counts are unknown. Some should fail open. Write that per rule.",
      },
    ],
    diagram: "requirements",
    checkpoint: {
      question: "The counter store goes offline. Which requirement is being tested?",
      choices: [
        {
          id: "memory",
          label: "Use as little memory as possible.",
          correct: false,
          why: "Memory size is not the issue. The store is unavailable.",
        },
        {
          id: "fault",
          label: "A limiter problem should not take the whole product down.",
          correct: true,
          why: "You need a planned fallback: fail open, fail closed, or a conservative local limit.",
        },
        {
          id: "explain",
          label: "Always return 429 to every caller.",
          correct: false,
          why: "That is one possible policy, not the requirement itself. Some routes should stay available.",
        },
      ],
    },
  },
  {
    id: "placement",
    number: 4,
    title: "Where should the limiter live?",
    shortTitle: "Placement",
    minutes: 7,
    kicker: "Start with a simple picture, then choose the doorway",
    summary:
      "Draw Client → Server first. Then decide whether the limiter sits on the client, inside the API, or in a shared doorway.",
    intro: [
      "Do not start with a dozen boxes. A rate limiter is easier to discuss on a basic client and server picture.",
      "You can put a check in the client, in each API process, or in a gateway that every request already passes. Only one of those is a real lock.",
    ],
    keyPoints: [
      {
        title: "The client can help, but it cannot enforce",
        body: "A local delay makes the app feel polite. A modified, old, or hostile client can skip it.",
      },
      {
        title: "Inside the API is trusted",
        body: "The service can use rich context such as the logged-in account. Every team must keep the same logic up to date.",
      },
      {
        title: "A gateway is a shared doorway",
        body: "One place can protect many services and reject work early. It must stay fast and highly available.",
      },
      {
        title: "Layers can work together",
        body: "An edge rule can stop IP floods. An application rule can enforce “5 rewards per device per week.”",
      },
    ],
    diagram: "placement",
    checkpoint: {
      question: "Why is a client-only limiter not enough?",
      choices: [
        {
          id: "latency",
          label: "It always adds a database round trip.",
          correct: false,
          why: "A local client check may add no network work at all.",
        },
        {
          id: "control",
          label: "The user controls the client and can bypass or change it.",
          correct: true,
          why: "The lock has to live on infrastructure you trust.",
        },
        {
          id: "headers",
          label: "Clients cannot read HTTP error responses.",
          correct: false,
          why: "Clients can read errors. Trust is the problem, not headers.",
        },
      ],
    },
  },
  {
    id: "algorithms",
    number: 5,
    title: "How should we count?",
    shortTitle: "Algorithms",
    minutes: 12,
    kicker: "One idea: remember recent traffic, then decide",
    summary:
      "Every algorithm answers the same question: how much of the recent past still counts? Play with each one. There is no universal winner.",
    intro: [
      "The limiter needs a memory of recent traffic. That memory can be a handful of tokens, a small queue, a counter that resets each minute, or a list of timestamps.",
      "Do not memorize names. Watch what a user feels: can they burst, do they wait in line, and can they sneak extra requests at a clock boundary?",
    ],
    keyPoints: [
      {
        title: "Token bucket",
        body: "Think of tickets in a jar. Tickets refill at a steady pace, up to a cap. A request spends one ticket. Saved tickets become a short burst.",
      },
      {
        title: "Leaky bucket",
        body: "Think of a queue with a hole in the bottom. Requests enter and leave at a fixed pace. Extra arrivals wait. When the queue is full, they are dropped.",
      },
      {
        title: "Fixed window",
        body: "Think of a notebook page labeled 3:00–3:01. You allow 5 marks on that page, then flip to a new page. Two pages in a row can allow a burst at the flip.",
      },
      {
        title: "Sliding log",
        body: "Think of keeping the exact time of each allowed request. Anything older than the window is forgotten. Precise, but memory grows with traffic.",
      },
      {
        title: "Sliding counter",
        body: "Think of blending this minute’s count with part of last minute’s count. Cheap and smoother than a hard reset, but it is an estimate.",
      },
    ],
    diagram: "algorithms",
    checkpoint: {
      question: "A public API wants a short burst, then a steady long-run rate. What fits?",
      choices: [
        {
          id: "token",
          label: "Token bucket, with a chosen jar size and refill speed.",
          correct: true,
          why: "The refill is the long-run rate. The jar size is the burst you are willing to allow.",
        },
        {
          id: "log",
          label: "Keep every request timestamp forever.",
          correct: false,
          why: "That uses unbounded memory and is not required for a bursty public API.",
        },
        {
          id: "fixed",
          label: "A fixed window never allows a burst.",
          correct: false,
          why: "Fixed windows are the ones that surprise you at the clock boundary.",
        },
      ],
    },
  },
  {
    id: "single-node",
    number: 6,
    title: "The first working design",
    shortTitle: "First design",
    minutes: 8,
    kicker: "One request, one rule, one counter",
    summary:
      "A request arrives. The limiter loads the matching rule, updates a fast counter, and either forwards the call or returns “try later.”",
    intro: [
      "Now the picture can grow — but only by two stores. Rules change slowly: “20 logins per account per 10 minutes.” Counters change on every request: “this account has used 7.”",
      "Keep rules in a small cache. Keep counters in a fast store that can increment and expire a key in one step. A regular database is a poor hot-path counter.",
    ],
    keyPoints: [
      {
        title: "The path is short",
        body: "Client → limiter → API. Rejected work should never reach the expensive service.",
      },
      {
        title: "The counter key is a sentence",
        body: "It names the rule, the identity, and the time bucket. Example: login + account 42 + current 10-minute slot.",
      },
      {
        title: "Read and write must be one step",
        body: "If two requests both read “3” and both write “4”, one request vanished. Increment in one atomic operation.",
      },
      {
        title: "Rules are not counters",
        body: "You can edit a rule in a config service. You should not open a ticket to change a live count.",
      },
    ],
    diagram: "single-node",
    checkpoint: {
      question: "Why must “read the count, add one, decide” be one atomic step?",
      choices: [
        {
          id: "format",
          label: "It makes the counter key shorter.",
          correct: false,
          why: "Atomicity is about two requests at the same time, not key length.",
        },
        {
          id: "race",
          label: "Two requests must not both read the same old number and overwrite each other.",
          correct: true,
          why: "A single increment keeps the count honest under concurrency.",
        },
        {
          id: "ttl",
          label: "It prevents counters from ever expiring.",
          correct: false,
          why: "Counters should expire. The same operation can set a time-to-live.",
        },
      ],
    },
  },
  {
    id: "distributed",
    number: 7,
    title: "Then make it work on many servers",
    shortTitle: "Many servers",
    minutes: 9,
    kicker: "The same user can land anywhere",
    summary:
      "If each limiter keeps its own count, the real limit is multiplied by the number of servers. Share one counter per rule and identity.",
    intro: [
      "The first design works on one machine. The moment two healthy limiters see the same account, each one thinks the user is only halfway through their quota.",
      "The fix is simple to say: keep the limiter processes stateless, and put the count in a shared store. Any server can decide, because they all update the same key.",
    ],
    keyPoints: [
      {
        title: "Local memory lies at scale",
        body: "Five servers with a limit of 5 can allow 25. Sticky routing hides this until a server dies or load shifts.",
      },
      {
        title: "Share the key, not the whole world",
        body: "Hash the full counter key onto shards. Most keys are independent, so they do not need one giant lock.",
      },
      {
        title: "Hard vs soft limits",
        body: "A hard global cap needs stronger agreement and can be slower. A soft cap can overshoot a little to stay fast.",
      },
      {
        title: "Regions are a later question",
        body: "Keep the decision near the user when you can. A strict world-wide cap costs a cross-region check.",
      },
    ],
    diagram: "distributed",
    checkpoint: {
      question: "What is the main problem with “pin each user to one server” as the final fix?",
      choices: [
        {
          id: "cookies",
          label: "It only works if every client is a browser.",
          correct: false,
          why: "Affinity can use several routing tricks. That is not the core issue.",
        },
        {
          id: "flex",
          label: "Correctness now depends on routing, so failover and rebalancing get awkward.",
          correct: true,
          why: "Shared keyed state lets any healthy limiter make the same decision.",
        },
        {
          id: "atomic",
          label: "It makes atomic increments impossible.",
          correct: false,
          why: "You can still increment locally. The design is just brittle.",
        },
      ],
    },
  },
  {
    id: "operations",
    number: 8,
    title: "Tell the user, survive failure",
    shortTitle: "When it fails",
    minutes: 8,
    kicker: "A limiter is useful only when bad days are planned",
    summary:
      "A blocked caller should know when to retry. A sick counter store should not become an unplanned outage.",
    intro: [
      "The last part of the design is the conversation with the caller. A 429 response should include a wait time. Clients should wait, then retry with jitter, not all at once.",
      "The limiter can fail too. For each rule, decide: if we cannot read the count, do we allow the request, reject it, or use a small local fallback? Login and browse often choose differently.",
    ],
    keyPoints: [
      {
        title: "Rejected means “try later”",
        body: "Return 429, a retry delay, and the limit that was hit. Guessing makes people retry harder.",
      },
      {
        title: "Fail on purpose",
        body: "Fail-open keeps the product up. Fail-closed protects a scarce or dangerous action. Write the choice on the rule.",
      },
      {
        title: "Watch both sides",
        body: "Measure allows, rejects, decision time, and store errors. A limiter can be “up” and still be wrong.",
      },
      {
        title: "Change rules carefully",
        body: "Version a rule, roll it out to a slice of traffic, and keep a way to explain a rejection to support.",
      },
    ],
    diagram: "operations",
    checkpoint: {
      question: "The counter store is down for a password-reset route. What should you do?",
      choices: [
        {
          id: "always-open",
          label: "Always allow everything, because availability is the only goal.",
          correct: false,
          why: "This route can be abused. One policy does not fit every endpoint.",
        },
        {
          id: "policy",
          label: "Follow that route’s written fallback and record that you used it.",
          correct: true,
          why: "Failure behavior is part of the design, and it should be visible.",
        },
        {
          id: "retry",
          label: "Retry the store with no limit until it returns.",
          correct: false,
          why: "Unbounded retries make a sick store sicker.",
        },
      ],
    },
  },
];

export function getRateLimiterSection(id: string) {
  return RATE_LIMITER_SECTIONS.find((section) => section.id === id);
}

export function rateLimiterLessonHref(id = RATE_LIMITER_SECTIONS[0]!.id) {
  return `/learn/problems/rate-limiter/learn/${id}`;
}
