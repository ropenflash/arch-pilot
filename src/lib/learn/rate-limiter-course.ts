export type RateLimiterDiagram =
  | "contract"
  | "placement"
  | "algorithms"
  | "single-node"
  | "distributed"
  | "operations";

export type RateLimiterSection = {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  minutes: number;
  kicker: string;
  summary: string;
  intro: string[];
  keyPoints: { title: string; body: string }[];
  diagram: RateLimiterDiagram;
  checkpoint: {
    question: string;
    choices: { id: string; label: string; correct: boolean; why: string }[];
  };
};

export const RATE_LIMITER_SECTIONS: RateLimiterSection[] = [
  {
    id: "scope",
    number: 1,
    title: "Start with the contract",
    shortTitle: "Scope",
    minutes: 6,
    kicker: "What are we protecting?",
    summary:
      "Turn “design a rate limiter” into a rule, a key, and a client-visible outcome.",
    intro: [
      "A limiter protects a scarce thing: API capacity, an expensive vendor call, login attempts, or a user action that should not be spammed. Before drawing boxes, say what is scarce and who gets a quota.",
      "A complete rule has four parts: the action being limited, the identity used to count, the allowance, and the time or refill behavior. “100 requests” is incomplete; “100 search requests per API key per minute” is actionable.",
    ],
    keyPoints: [
      {
        title: "Functional contract",
        body: "Evaluate a request, allow or reject it, support several rule types, and tell the caller when to retry.",
      },
      {
        title: "Quality bar",
        body: "The decision must add very little latency, use bounded memory, work across many API instances, and degrade deliberately.",
      },
      {
        title: "Clarify early",
        body: "Ask whether limits are per IP, account, API key, device, endpoint, tenant, or global. One request may match more than one rule.",
      },
      {
        title: "Return a useful answer",
        body: "A rejected call should receive 429 plus enough metadata to back off instead of immediately retrying.",
      },
    ],
    diagram: "contract",
    checkpoint: {
      question: "Which statement is a complete first rule?",
      choices: [
        {
          id: "vague",
          label: "Limit abusive traffic.",
          correct: false,
          why: "It does not define an action, identity, allowance, or time behavior.",
        },
        {
          id: "complete",
          label: "Allow 20 login attempts per account every 10 minutes.",
          correct: true,
          why: "It names the action, key, allowance, and window.",
        },
        {
          id: "stack",
          label: "Put Redis in front of every service.",
          correct: false,
          why: "That chooses a tool before defining the product behavior.",
        },
      ],
    },
  },
  {
    id: "placement",
    number: 2,
    title: "Place the decision point",
    shortTitle: "Placement",
    minutes: 6,
    kicker: "One doorway, not one polite client",
    summary:
      "Enforce the rule on infrastructure you control, before expensive application work starts.",
    intro: [
      "Client-side throttling can improve user experience, but it cannot enforce a safety boundary: clients may be old, buggy, or hostile. The authoritative decision belongs on the server side.",
      "The limiter can live inside each API process, in a shared middleware layer, or at an API gateway. The best placement is the earliest trusted point that has the caller identity and route context required by the rule.",
    ],
    keyPoints: [
      {
        title: "Inside the API",
        body: "Easy to tailor to application semantics, but every service must implement and update the same behavior.",
      },
      {
        title: "Gateway or middleware",
        body: "One reusable doorway protects many services and rejects work early. It must remain fast and highly available.",
      },
      {
        title: "More than one layer",
        body: "An edge may protect IP floods while an application limiter enforces account- or operation-specific quotas.",
      },
      {
        title: "Do not trust the key blindly",
        body: "Derive account and tenant identifiers from authenticated context. Treat forwarded IP headers carefully.",
      },
    ],
    diagram: "placement",
    checkpoint: {
      question: "Why is client-side limiting not sufficient by itself?",
      choices: [
        {
          id: "latency",
          label: "It always adds a database round trip.",
          correct: false,
          why: "A local client limiter may add no network work at all.",
        },
        {
          id: "control",
          label: "The user controls the client and can bypass or modify it.",
          correct: true,
          why: "Enforcement has to happen on trusted infrastructure.",
        },
        {
          id: "headers",
          label: "Clients cannot read HTTP response headers.",
          correct: false,
          why: "Clients can read headers; trust is the actual issue.",
        },
      ],
    },
  },
  {
    id: "algorithms",
    number: 3,
    title: "Choose the traffic shape",
    shortTitle: "Algorithms",
    minutes: 12,
    kicker: "The algorithm is a product decision",
    summary:
      "Compare five common algorithms by burst behavior, accuracy, memory, and queueing—not by name recognition.",
    intro: [
      "Every algorithm answers the same question differently: how much past traffic matters right now? The answer changes what users experience at a boundary or during a burst.",
      "Use token bucket as a friendly default when short bursts are useful. Choose a queue-shaped leaky bucket when downstream work must leave at a stable rate. Choose a window method when its accuracy and memory profile fit the rule.",
    ],
    keyPoints: [
      {
        title: "Token bucket",
        body: "Tokens refill up to a cap; each accepted request spends one. It permits bounded bursts and needs only a token count plus refill time.",
      },
      {
        title: "Leaky bucket",
        body: "Requests enter a bounded queue and leave at a steady rate. It smooths traffic but old work can make fresh work wait.",
      },
      {
        title: "Fixed window",
        body: "A counter resets on fixed boundaries. It is simple and compact, but traffic can double-dip across an edge.",
      },
      {
        title: "Sliding log",
        body: "Store exact timestamps in the rolling interval. It is precise but memory grows with request volume.",
      },
      {
        title: "Sliding counter",
        body: "Blend adjacent fixed-window counts to estimate a rolling total. It is compact and smooth, but approximate.",
      },
    ],
    diagram: "algorithms",
    checkpoint: {
      question: "Which choice best supports a brief burst while enforcing a long-run rate?",
      choices: [
        {
          id: "token",
          label: "Token bucket with a deliberate bucket capacity.",
          correct: true,
          why: "The refill rate controls the long run; stored tokens define the allowed burst.",
        },
        {
          id: "log",
          label: "Keep every request timestamp forever.",
          correct: false,
          why: "That is unbounded and unnecessary.",
        },
        {
          id: "fixed",
          label: "A fixed window guarantees no boundary burst.",
          correct: false,
          why: "Fixed windows are specifically vulnerable at boundaries.",
        },
      ],
    },
  },
  {
    id: "single-node",
    number: 4,
    title: "Build the smallest working limiter",
    shortTitle: "First design",
    minutes: 8,
    kicker: "Rules in; atomic decision out",
    summary:
      "Connect a trusted limiter to rule configuration and a fast expiring counter store.",
    intro: [
      "The request path needs two kinds of data. Rules change relatively slowly and can be cached locally. Counter state changes on every request and needs a fast atomic update with expiry.",
      "A relational database is useful for managing rule definitions, but it is usually the wrong hot-path counter. An in-memory key-value store supports low-latency reads, atomic operations, and automatic expiration.",
    ],
    keyPoints: [
      {
        title: "Counter key",
        body: "Compose it from rule version, identity, operation, and time bucket or algorithm state—for example tenant + route + account.",
      },
      {
        title: "One atomic decision",
        body: "Read, refill or expire, increment, and decide in one server-side operation. Separate get/set calls race under concurrency.",
      },
      {
        title: "Rule lifecycle",
        body: "Validate rules before publication, version them, cache them briefly, and keep a known-good version for rollback.",
      },
      {
        title: "Fast rejection",
        body: "Rejected calls should never reach the protected API. Accepted calls continue with a small remaining-quota context.",
      },
    ],
    diagram: "single-node",
    checkpoint: {
      question: "Why should counter update and limit check be one atomic operation?",
      choices: [
        {
          id: "format",
          label: "It makes the counter key shorter.",
          correct: false,
          why: "Atomicity is about concurrent correctness, not key length.",
        },
        {
          id: "race",
          label: "Two requests must not both read the same old value and overwrite each other.",
          correct: true,
          why: "A single atomic operation prevents lost increments.",
        },
        {
          id: "ttl",
          label: "It prevents counters from ever expiring.",
          correct: false,
          why: "Counters should expire; the operation can set or preserve a TTL.",
        },
      ],
    },
  },
  {
    id: "distributed",
    number: 5,
    title: "Evolve it for many servers",
    shortTitle: "Distributed",
    minutes: 10,
    kicker: "Shared truth without a global bottleneck",
    summary:
      "Scale limiter instances horizontally while preserving a useful quota across concurrent requests and regions.",
    intro: [
      "Local in-process counters break as soon as traffic for one identity reaches different limiter instances. Sticky routing hides the problem temporarily but hurts balancing and failover.",
      "Stateless limiter instances should share partitioned counter state. A key always maps to one counter shard; replicas protect availability. The consistency model determines whether the limit is hard or may be exceeded briefly.",
    ],
    keyPoints: [
      {
        title: "Lost-update race",
        body: "Two workers read 3, each writes 4, and one request disappears from the count. Use an atomic increment, transaction, or server-side script.",
      },
      {
        title: "Partition by counter key",
        body: "Hash the full identity/rule key across counter shards. Watch for global rules or hot tenants that collapse onto one shard.",
      },
      {
        title: "Hard vs soft limits",
        body: "A hard global cap needs stronger coordination and higher latency. A soft cap can lease small local token batches and tolerate bounded overshoot.",
      },
      {
        title: "Multi-region",
        body: "Keep decisions near users. For strict global limits, pay coordination cost; otherwise divide quota by region and reconcile usage.",
      },
    ],
    diagram: "distributed",
    checkpoint: {
      question: "What is the main problem with sticky sessions as the final solution?",
      choices: [
        {
          id: "cookies",
          label: "They require every request to use a browser cookie.",
          correct: false,
          why: "Affinity can use several routing techniques; that is not the core issue.",
        },
        {
          id: "flex",
          label: "They couple correctness to routing and make rebalancing or failures awkward.",
          correct: true,
          why: "Shared keyed state lets any healthy limiter make the decision.",
        },
        {
          id: "atomic",
          label: "They make atomic counter operations impossible.",
          correct: false,
          why: "They do not prevent atomic operations, but they are fragile and inflexible.",
        },
      ],
    },
  },
  {
    id: "operations",
    number: 6,
    title: "Make overload predictable",
    shortTitle: "Operate",
    minutes: 9,
    kicker: "A limiter is only useful when failure is boring",
    summary:
      "Return actionable 429 responses, choose fail-open or fail-closed per rule, and monitor both protection and false rejection.",
    intro: [
      "The caller is part of the design. A 429 response should include a retry delay and quota context; clients should apply backoff and jitter instead of forming a synchronized retry wave.",
      "The limiter itself can fail. Decide by endpoint whether unavailable counter state should allow traffic, reject traffic, or use a conservative local fallback. Availability-sensitive reads and abuse-sensitive writes often make different choices.",
    ],
    keyPoints: [
      {
        title: "Client contract",
        body: "Return 429, Retry-After, the applicable limit, and remaining quota when useful. Document whether queued work is supported.",
      },
      {
        title: "Fail deliberately",
        body: "Fail-open favors product availability; fail-closed protects cost, security, and scarce capacity. Configure the choice per rule.",
      },
      {
        title: "Measure outcomes",
        body: "Track decision latency, allows, rejects by rule, counter-store errors, fallback decisions, hot keys, and cache saturation.",
      },
      {
        title: "Tune with evidence",
        body: "A limiter can be perfectly available and still wrong. Alert on sudden rejection changes and compare them with downstream saturation.",
      },
      {
        title: "Close the loop",
        body: "Load-test boundaries and bursts, canary rule changes, keep audit history, and give support a way to explain a rejection.",
      },
    ],
    diagram: "operations",
    checkpoint: {
      question: "Counter storage is unavailable for a password-reset endpoint. What is the best response?",
      choices: [
        {
          id: "always-open",
          label: "Always fail open because availability is the only goal.",
          correct: false,
          why: "This endpoint has abuse and cost risk; one policy does not fit every route.",
        },
        {
          id: "policy",
          label: "Use the endpoint’s explicit fallback policy and record that fallback decision.",
          correct: true,
          why: "Failure behavior should be designed per rule and observable.",
        },
        {
          id: "retry",
          label: "Retry the counter store without a limit until it recovers.",
          correct: false,
          why: "Unbounded retries amplify the outage.",
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
