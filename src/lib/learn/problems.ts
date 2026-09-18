import {
  appServers,
  ofType,
  type DesignCheck,
} from "@/lib/learn/grade";
import { createBlankDesign } from "@/lib/architecture/mutations";
import type { SystemDesign } from "@/lib/architecture/validation";

export type PracticeProblem = {
  id: string;
  title: string;
  minutes: number;
  product: string;
  prompt: string;
  v1: string[];
  scale: string;
  deepDive: string;
  skip: string;
  checks: DesignCheck[];
};

const twoApps: DesignCheck = {
  id: "two-apps",
  label: "More than one app/service box (not just the client)",
  pass: (design) => appServers(design).length >= 1,
};

export const PRACTICE_PROBLEMS: PracticeProblem[] = [
  {
    id: "rate-limiter",
    title: "Rate limiter",
    minutes: 35,
    product: "Gate",
    prompt:
      "Public APIs are getting hammered. Design a rate limiter that sits in front of your services and enforces “N requests per key per window” without turning into a single point of failure.",
    v1: [
      "Per API key (or user id), cap requests in a time window",
      "Return a clear “slow down” when over the limit",
      "Works for many machines behind a balancer",
    ],
    scale: "100k requests/s at peak. Decide the window (1s vs 1 min) out loud.",
    deepDive: "Where the counters live, and what happens when that store dies.",
    skip: "A research paper on every algorithm. Pick one (fixed window, sliding, token bucket) and defend it.",
    checks: [
      twoApps,
      {
        id: "has-store",
        label: "A cache or database holds the counters",
        pass: (design) =>
          ofType(design, "cache").length + ofType(design, "database").length >= 1,
      },
    ],
  },
  {
    id: "consistent-hashing",
    title: "Consistent hashing",
    minutes: 30,
    product: "Ring",
    prompt:
      "You are spreading keys across cache (or shard) nodes. Adding or removing a node must not reshuffle the whole keyspace. Design the placement story.",
    v1: [
      "Keys map to a node in a way that mostly stays put when the fleet changes",
      "A dead node’s keys move somewhere",
      "Hot keys are called out as a remaining risk",
    ],
    scale: "Start with 8 nodes, then add 2. How much data moves?",
    deepDive: "Virtual nodes / copies on the ring, and what a hotspot still does.",
    skip: "Implementing SHA-1 on the whiteboard. The idea and the failure mode matter more.",
    checks: [
      {
        id: "many-nodes",
        label: "At least three cache or database nodes to place keys on",
        pass: (design) =>
          ofType(design, "cache").length + ofType(design, "database").length >= 3,
      },
    ],
  },
  {
    id: "kv-store",
    title: "Key-value store",
    minutes: 40,
    product: "Vault",
    prompt:
      "Design a distributed key-value store: put, get, delete. It has to survive a node dying and still answer a lot of small reads.",
    v1: [
      "put / get / delete by key",
      "More than one replica of a key",
      "A story for which node owns a key",
    ],
    scale: "Millions of keys, tens of thousands of QPS, values of a few KB.",
    deepDive: "Replication and what a client sees if a replica is behind.",
    skip: "SQL joins. This is not a relational database.",
    checks: [
      twoApps,
      {
        id: "replicas",
        label: "More than one database or cache node",
        pass: (design) =>
          ofType(design, "cache").length + ofType(design, "database").length >= 2,
      },
    ],
  },
  {
    id: "unique-ids",
    title: "Unique IDs",
    minutes: 30,
    product: "Mint",
    prompt:
      "Many services need unique ids — roughly sortable by time — without a single global database as the bottleneck. Design the id service.",
    v1: [
      "Mint ids at high QPS from more than one machine",
      "No collisions",
      "Roughly increasing with time (enough to sort)",
    ],
    scale: "10k ids/s today, 100k later, two data centers.",
    deepDive: "Clock skew, datacenter bits, and what happens if a node restarts.",
    skip: "UUIDs as the whole answer unless you explain why sort-by-time does not matter.",
    checks: [twoApps],
  },
  {
    id: "url-shortener",
    title: "URL shortener",
    minutes: 40,
    product: "TinyPath",
    prompt:
      "People paste long URLs and get a short one back. Clicks must redirect fast. Analytics can wait. A viral link is a single hot key.",
    v1: [
      "Create a short code",
      "Redirect to the original URL",
      "Count clicks (can be a little late)",
    ],
    scale: "100:1 reads to writes. Peak is a celebrity posting one link.",
    deepDive: "How you mint unique codes, and how the read path stays in cache.",
    skip: "A full analytics warehouse in v1.",
    checks: [
      twoApps,
      {
        id: "cache",
        label: "A cache on the redirect path",
        pass: (design) => ofType(design, "cache").length >= 1,
      },
      {
        id: "db",
        label: "A database for the mapping",
        pass: (design) => ofType(design, "database").length >= 1,
      },
    ],
  },
  {
    id: "pastebin",
    title: "Text sharing service",
    minutes: 35,
    product: "Slate",
    prompt:
      "People paste text, receive a short link, and open it later. Public pastes may go viral; private pastes require an unguessable link. Pastes can expire.",
    v1: [
      "Create a text paste and receive a link",
      "Read a paste by id",
      "Optional expiration and private visibility",
    ],
    scale: "5 million new pastes/day, 20:1 reads to writes, up to 1 MB each.",
    deepDive: "Metadata vs content storage, expiration, and a viral read.",
    skip: "Collaborative editing and full-text public search in v1.",
    checks: [
      twoApps,
      {
        id: "store",
        label: "Durable storage for paste content",
        pass: (design) =>
          ofType(design, "database").length + ofType(design, "storage").length >= 1,
      },
      {
        id: "cache-or-cdn",
        label: "A cache or CDN protects popular reads",
        pass: (design) =>
          ofType(design, "cache").length + ofType(design, "cdn").length >= 1,
      },
    ],
  },
  {
    id: "web-crawler",
    title: "Web crawler",
    minutes: 40,
    product: "Harvest",
    prompt:
      "Design a crawler that starts from a seed list, fetches pages, extracts links, and stores content — politely, and without fetching the same URL forever.",
    v1: [
      "Seed URLs in, pages and links out",
      "Do not hammer one host",
      "Remember what you already fetched",
    ],
    scale: "Billions of URLs over time. Freshness can be hours, not milliseconds.",
    deepDive: "The URL frontier (queue), politeness per host, and deduping.",
    skip: "A perfect ranking algorithm for search. You are fetching, not Google.",
    checks: [
      {
        id: "queue",
        label: "A queue for the URL frontier",
        pass: (design) => ofType(design, "queue").length >= 1,
      },
      {
        id: "store",
        label: "Storage or a database for fetched content",
        pass: (design) =>
          ofType(design, "storage").length + ofType(design, "database").length >= 1,
      },
    ],
  },
  {
    id: "notifications",
    title: "Notifications",
    minutes: 35,
    product: "Pingboard",
    prompt:
      "When something happens in the product, tell the user — push, email, or in-app. Events spike. The user-facing API should not wait on a push vendor.",
    v1: [
      "An event in, a notification out",
      "At least two channels (e.g. in-app + email)",
      "A way to not double-send on retry",
    ],
    scale: "A celebrity post can fan out to millions. The event write is small; the send is huge.",
    deepDive: "Queue + workers, and how you stop a vendor outage from blocking everything else.",
    skip: "Building the actual iOS push infrastructure.",
    checks: [
      {
        id: "queue",
        label: "A queue so sending is off the request path",
        pass: (design) => ofType(design, "queue").length >= 1,
      },
    ],
  },
  {
    id: "news-feed",
    title: "News feed",
    minutes: 45,
    product: "Pulse",
    prompt:
      "People post. Followers open a home grid of recent posts, with photos. v1 can be newest-first. A celebrity account is the scary case.",
    v1: [
      "Publish a post",
      "See a follow-grid of recent posts",
      "Photos stored as files, not in the post database",
    ],
    scale: "8 million DAU. Max ~2,000 follows. Media is common.",
    deepDive: "Fan-out on write vs pull on read, and what a celebrity does to a shard.",
    skip: "A personalization model. Newest-first is a legal v1.",
    checks: [
      twoApps,
      {
        id: "storage",
        label: "Object storage (or CDN) for media",
        pass: (design) =>
          ofType(design, "storage").length + ofType(design, "cdn").length >= 1,
      },
      {
        id: "cache",
        label: "A cache for the hot grid",
        pass: (design) => ofType(design, "cache").length >= 1,
      },
    ],
  },
  {
    id: "chat",
    title: "Chat",
    minutes: 45,
    product: "Relay",
    prompt:
      "1:1 chat with online/offline presence and photo attachments. Messages must not vanish. Presence can be a few seconds stale.",
    v1: [
      "Send and receive 1:1 messages",
      "Recent history on reconnect",
      "Rough online/offline",
    ],
    scale: "6 million weekday DAU. Groups of 1,000 are out of scope for v1.",
    deepDive: "Push vs persist-then-notify, and presence TTLs when a phone sleeps.",
    skip: "End-to-end crypto and custom CRDTs unless they insist.",
    checks: [
      twoApps,
      {
        id: "store",
        label: "A database for message history",
        pass: (design) => ofType(design, "database").length >= 1,
      },
      {
        id: "presence",
        label: "A cache for presence (or sessions)",
        pass: (design) => ofType(design, "cache").length >= 1,
      },
    ],
  },
  {
    id: "autocomplete",
    title: "Search autocomplete",
    minutes: 35,
    product: "Typeahead",
    prompt:
      "As the user types, show top query suggestions in well under 100ms. The suggestion list is tiny. The traffic is huge. Typos happen.",
    v1: [
      "Prefix → a short list of suggestions",
      "Update the dictionary as new popular queries appear (can lag)",
      "Survive a cache miss without melting storage",
    ],
    scale: "Every keystroke is a request. Think 50k+ QPS at peak, tiny payloads.",
    deepDive: "An in-memory prefix structure plus a cache, and how you refresh it.",
    skip: "Full-text search of the whole internet. This is prefix suggestions.",
    checks: [
      {
        id: "cache-or-search",
        label: "A cache or search box on the read path",
        pass: (design) =>
          ofType(design, "cache").length + ofType(design, "search").length >= 1,
      },
    ],
  },
  {
    id: "large-scale-search",
    title: "Large-scale search",
    minutes: 50,
    product: "Atlas",
    prompt:
      "Search a very large document corpus by text, filters, and relevance. New documents should appear within minutes. Query latency should stay low during indexing.",
    v1: [
      "Index documents from a durable source",
      "Search by terms with filters and ranked results",
      "Update or delete a document without rebuilding everything",
    ],
    scale: "Billions of documents, 80k query QPS at peak, continuous indexing.",
    deepDive: "Inverted index partitioning, replicas, fan-out, and result merging.",
    skip: "Inventing a perfect ranking model. Use a simple relevance score and focus on retrieval.",
    checks: [
      twoApps,
      {
        id: "search",
        label: "A search index serves queries",
        pass: (design) => ofType(design, "search").length >= 1,
      },
      {
        id: "queue",
        label: "Index updates are decoupled through a queue",
        pass: (design) => ofType(design, "queue").length >= 1,
      },
    ],
  },
  {
    id: "video",
    title: "Video platform",
    minutes: 45,
    product: "Framecast",
    prompt:
      "People upload videos. Other people play them. Playback should start fast worldwide. Processing the upload can happen after the HTTP response.",
    v1: [
      "Upload a video",
      "Process it into playable sizes",
      "Watch via an edge cache, not off the API box",
    ],
    scale: "25 million DAU, lots of views, few uploads. Bytes dwarf metadata.",
    deepDive: "CDN + object storage, and the transcode queue.",
    skip: "A recommendation research stack in v1.",
    checks: [
      {
        id: "cdn",
        label: "A CDN on the watch path",
        pass: (design) => ofType(design, "cdn").length >= 1,
      },
      {
        id: "storage",
        label: "Object storage for the files",
        pass: (design) => ofType(design, "storage").length >= 1,
      },
      {
        id: "queue",
        label: "A queue for processing uploads",
        pass: (design) => ofType(design, "queue").length >= 1,
      },
    ],
  },
  {
    id: "cloud-files",
    title: "Cloud files",
    minutes: 45,
    product: "Locker",
    prompt:
      "People upload files, browse folders, share a link, and edit from more than one device. Metadata is small. The blobs are not. Sync should not corrupt a file.",
    v1: [
      "Upload / download a file",
      "Folders and a share link",
      "A second device sees the new file (eventual is ok if you say so)",
    ],
    scale: "Storage grows every day. Sync traffic is spiky after a large upload.",
    deepDive: "Metadata vs blob path, and conflict/version story for two editors.",
    skip: "Rebuilding a full office suite.",
    checks: [
      {
        id: "storage",
        label: "Object storage for the bytes",
        pass: (design) => ofType(design, "storage").length >= 1,
      },
      {
        id: "db",
        label: "A database for names, folders, sharing",
        pass: (design) => ofType(design, "database").length >= 1,
      },
    ],
  },
];

export function getProblem(id: string) {
  return PRACTICE_PROBLEMS.find((item) => item.id === id);
}

export function starterForProblem(problem: PracticeProblem): SystemDesign {
  return createBlankDesign(problem.product, problem.prompt);
}

export function problemHref(id: string) {
  return `/learn/problems/${id}`;
}
