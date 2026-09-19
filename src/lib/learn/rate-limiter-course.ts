export type RateLimiterDiagram =
  | "why"
  | "brief"
  | "placement"
  | "algorithms"
  | "design";

export type RateLimiterSection = {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  teach: string[];
  takeaway: string;
  diagram: RateLimiterDiagram;
};

const ALIASES: Record<string, string> = {
  scope: "brief",
  requirements: "brief",
  "single-node": "design",
  distributed: "design",
  operations: "design",
};

export const RATE_LIMITER_SECTIONS: RateLimiterSection[] = [
  {
    id: "why",
    number: 1,
    title: "A limiter is a doorway",
    shortTitle: "The idea",
    teach: [
      "A busy API gets mixed traffic: real users, stuck retries, and bots. A rate limiter sits in front and answers one question: is this request still allowed right now?",
      "You already see this in products. A chat user can send 2 messages a second. A sign-up form allows 10 new accounts a day from one address. A rewards page allows 5 claims a week from one device.",
      "We build this for three reasons: keep servers healthy, stop wasting paid vendor calls, and turn “this feels too busy” into a clear rule. Toggle the doorway below. Extra requests stop here instead of landing on the API.",
    ],
    takeaway: "The limiter does not do the product work. It only says allow or wait.",
    diagram: "why",
  },
  {
    id: "brief",
    number: 2,
    title: "Here is what we will build",
    shortTitle: "The brief",
    teach: [
      "You do not have to invent the interview answers. For this lesson we lock a simple brief so the rest of the pictures have a job.",
      "We will build a server-side API limiter. The client can slow itself down for comfort, but it is not the lock — anyone can change an app on their phone. The limiter should accept different identities: user, IP, API key, or device.",
      "It must stay fast, use little memory, work when many servers see the same caller, tell that caller when they were limited, and fail without taking the whole product down.",
    ],
    takeaway: "We now know the product. Next we choose where the doorway sits.",
    diagram: "brief",
  },
  {
    id: "placement",
    number: 3,
    title: "Start with two boxes, then place the doorway",
    shortTitle: "Where it lives",
    teach: [
      "Do not start with a dozen services. Draw Client → Server. That is enough to ask: where does the check go?",
      "On the client is polite, but it is not enforcement. Inside the API is trusted and close to the product. A gateway is a shared doorway that can reject work before it reaches every service.",
      "Click through the four pictures. Watch the orange box move. We will keep the gateway as our main lock, and allow a deeper rule inside the API later if we need one.",
    ],
    takeaway: "The lock lives on infrastructure we control, as early as we still know who the caller is.",
    diagram: "placement",
  },
  {
    id: "algorithms",
    number: 4,
    title: "Now we need a way to count",
    shortTitle: "How we count",
    teach: [
      "The doorway needs a memory of recent traffic. That memory can be a jar of tickets, a funnel, a notebook page for this minute, or a short list of times.",
      "Do not memorize the names. Play with one idea at a time and watch what a user feels: can they burst, do they wait in line, or can they sneak extra requests when the clock flips?",
      "A public API that wants a short burst and then a steady pace usually starts with the ticket jar — token bucket. The other four are there when the product promise is different.",
    ],
    takeaway: "Pick the count by the feeling you want, not by a favorite name.",
    diagram: "algorithms",
  },
  {
    id: "design",
    number: 5,
    title: "One design, then grow it",
    shortTitle: "The design",
    teach: [
      "A request arrives. The limiter loads the rule, updates a fast counter in one step, and either forwards the call or says try later. Rules change slowly. Counts change on every request. Give them different homes.",
      "That works on one machine. The moment two servers see the same account, each has its own memory — so a limit of 5 can become 10. Keep the limiters stateless and share one count per rule and identity.",
      "A blocked caller should see a clear 429 and a time to wait. If the counter store is sick, decide in advance: some routes stay open, some stay closed. Click through the three pictures.",
    ],
    takeaway: "You now have the whole path: rule, doorway, count, shared store, and a planned bad day.",
    diagram: "design",
  },
];

export function getRateLimiterSection(id: string) {
  const resolved = ALIASES[id] ?? id;
  return RATE_LIMITER_SECTIONS.find((section) => section.id === resolved);
}

export function rateLimiterLessonHref(id = RATE_LIMITER_SECTIONS[0]!.id) {
  const resolved = ALIASES[id] ?? id;
  return `/learn/problems/rate-limiter/learn/${resolved}`;
}

export function rateLimiterStaticParams() {
  return [...RATE_LIMITER_SECTIONS.map((section) => section.id), ...Object.keys(ALIASES)].map(
    (section) => ({ section }),
  );
}
