import type { SystemDesignInput } from "@/lib/architecture/validation";

export interface DesignTemplate {
  slug: string;
  title: string;
  subtitle: string;
  domain: string;
  scaleLabel: string;
  focus: string;
  input: SystemDesignInput;
}

export const DESIGN_TEMPLATES: DesignTemplate[] = [
  {
    slug: "video-streaming",
    title: "Netflix-like video streaming platform",
    subtitle: "Upload, transcode, CDN playback, recommendations",
    domain: "Media",
    scaleLabel: "20M DAU",
    focus: "Bytes vs control plane",
    input: {
      name: "StreamForge",
      description: `Design a Netflix-like video streaming platform.

Creators upload master files that must be transcoded into multiple bitrates and packaged for adaptive playback. Viewers worldwide expect low startup time and smooth bitrate switching. The product also needs a catalog, personalized recommendations, and watch history.

Constraints that matter:
- Media bytes must never sit on the API or database path. Playback is a globally cached read of object storage.
- Transcoding is bursty and slow; uploads must succeed even when the encode farm is backlogged.
- Recommendations and homepage personalization must not block video start.
- Premium titles need DRM; free titles should keep playing if the license service is degraded.
- Watch-progress heartbeats are frequent and lossy; they must not drown the metadata database.`,
      scale: {
        dau: 20_000_000,
        peakTrafficMultiplier: 4,
        readWriteRatio: "1000:1",
        averageRequestSizeBytes: 800,
        expectedStorageGrowthGbPerDay: 80_000,
        requestsPerUserPerDay: 30,
      },
      requirements: {
        functional: [
          "Authenticated video upload with resumable multipart transfer",
          "Multi-bitrate transcoding and packaging",
          "Adaptive bitrate playback via CDN",
          "Catalog browse and title metadata",
          "Personalized recommendations",
          "Watch history and resume position",
          "Entitlement and DRM for premium titles",
        ],
        nonFunctional: [
          "Global low-latency playback (time-to-first-frame measured at the edge)",
          "High availability for ready titles even when transcoding is down",
          "Cost-efficient origin egress and CDN hit ratio",
          "Horizontal scalability of control plane independently from media path",
          "Prime-time traffic spikes without control-plane collapse",
        ],
      },
    },
  },
  {
    slug: "ride-sharing",
    title: "Uber-like ride sharing system",
    subtitle: "Matching, location, pricing, trip tracking",
    domain: "Mobility",
    scaleLabel: "5M DAU",
    focus: "Geo + matching latency",
    input: {
      name: "RideGrid",
      description: `Design an Uber-like ride sharing system.

Riders request trips. Nearby drivers are matched in seconds. Pricing is dynamic. Location is tracked until the trip completes and payment settles.

Constraints that matter:
- Driver location is a high-write stream. It cannot live on the trip/billing database.
- Matching p95 must stay under two seconds in a city cell; freshness of location under three seconds.
- Rush hour is a several-times multiplier, not a gentle diurnal curve.
- A matching outage must not cancel in-progress trips.
- Geographic scale is city/cell based. A partition between cells must not double-assign a driver.
- Location is PII. Read APIs are strictly authorized; pings are rate-limited per device.`,
      scale: {
        dau: 5_000_000,
        peakTrafficMultiplier: 6,
        readWriteRatio: "20:1",
        averageRequestSizeBytes: 512,
        requestsPerUserPerDay: 12,
      },
      requirements: {
        functional: [
          "Driver location updates",
          "Ride requests with pickup and destination",
          "Nearby-driver matching and offer",
          "Dynamic pricing quotes",
          "Real-time trip tracking",
          "Trip completion and payment capture",
        ],
        nonFunctional: [
          "Matching p95 < 2s within a city cell",
          "Location freshness < 3s for active drivers",
          "Fault isolation: tracking/pricing failures do not stall dispatch",
          "City-level geographic scalability and cell failover",
          "No double-assign of a driver across partitions",
        ],
      },
    },
  },
  {
    slug: "ecommerce",
    title: "E-commerce platform",
    subtitle: "Catalog, cart, checkout, payments, orders",
    domain: "Commerce",
    scaleLabel: "1M DAU",
    focus: "Checkout consistency",
    input: {
      name: "Scalable E-commerce Platform",
      description: `Design an e-commerce platform capable of handling 1 million daily active users.

Shoppers browse and search a large catalog, manage a cart, check out with a payment provider, and track orders. Marketing runs flash sales that multiply traffic for a few hours. Inventory must not oversell. Payment and order creation must be idempotent.

Constraints that matter:
- Browse and search are read-heavy and cacheable. Checkout is a strongly consistent money path.
- Search indexing, email, and inventory reservation after payment can be asynchronous. Charging the card cannot.
- PCI card data never touches this system; the PSP returns tokens and webhooks.
- Catalog publish should not require a dual-write to the search index on the request path.
- Flash-sale spikes should shed load on browse, not corrupt checkout.`,
      scale: {
        dau: 1_000_000,
        peakTrafficMultiplier: 5,
        readWriteRatio: "30:1",
        averageRequestSizeBytes: 1200,
        expectedStorageGrowthGbPerDay: 40,
        requestsPerUserPerDay: 50,
      },
      requirements: {
        functional: [
          "User authentication",
          "Product catalog",
          "Product search and facets",
          "Cart",
          "Checkout",
          "Payments via external PSP",
          "Order tracking",
        ],
        nonFunctional: [
          "99.99% availability for browse and checkout independently",
          "Low latency catalog browsing",
          "Horizontal scalability of read path",
          "Strong consistency and idempotency on payment and order creation",
          "Fault tolerance on non-checkout paths",
        ],
      },
    },
  },
  {
    slug: "url-shortener",
    title: "URL shortener",
    subtitle: "Writes, redirects, analytics, uniqueness",
    domain: "Infrastructure",
    scaleLabel: "10M DAU",
    focus: "Read-path latency",
    input: {
      name: "ShortPath",
      description: `Design a URL shortener that creates unique short links, redirects with very low latency, and records click analytics.

Writes are rare compared with reads. A viral link can produce a sharp redirect spike from a single key. Users may request custom aliases. Analytics can lag; redirects cannot.

Constraints that matter:
- Redirect p99 should stay in the low tens of milliseconds, ideally from cache or an in-memory replica.
- Code uniqueness is a correctness requirement, not a best-effort. Collisions must be detected, not overwritten.
- Click analytics are high-volume and lossy-tolerant; they must not sit on the redirect mutex.
- Custom aliases need a distinct uniqueness check from generated codes.
- 301 vs 302 is a product decision with cache implications; state it explicitly.`,
      scale: {
        dau: 10_000_000,
        peakTrafficMultiplier: 8,
        readWriteRatio: "100:1",
        averageRequestSizeBytes: 250,
        requestsPerUserPerDay: 8,
      },
      requirements: {
        functional: [
          "Create a unique short URL",
          "Optional custom alias",
          "Redirect to the original URL",
          "Click analytics (counts, coarse geo, referrer)",
        ],
        nonFunctional: [
          "Redirect p99 < 10ms at the edge or cache layer",
          "High availability of the read path",
          "Idempotent writes for the same long URL + owner",
          "Analytics eventually consistent; redirects strongly correct",
        ],
      },
    },
  },
  {
    slug: "realtime-chat",
    title: "Real-time chat application",
    subtitle: "Presence, delivery, fan-out, persistence",
    domain: "Messaging",
    scaleLabel: "8M DAU",
    focus: "Fan-out + ordering",
    input: {
      name: "Relay Chat",
      description: `Design a real-time chat application for 1:1 and group messaging, with presence, read receipts, media attachments, and message history.

Delivery should feel instant for online recipients. History must be durable. Group chats can have hundreds of members; naive per-recipient writes will not survive.

Constraints that matter:
- Per-conversation ordering is required. Global ordering across conversations is not.
- Online fan-out (websocket/connection layer) is a different problem from durable storage.
- Presence is ephemeral and approximate; it should not be a row update on every ping in Postgres.
- Media belongs in object storage with a scan/async pipeline; the chat path stores pointers.
- Read receipts and typing indicators are high-frequency and lossy-tolerant relative to the message body.`,
      scale: {
        dau: 8_000_000,
        peakTrafficMultiplier: 5,
        readWriteRatio: "5:1",
        averageRequestSizeBytes: 400,
        requestsPerUserPerDay: 80,
      },
      requirements: {
        functional: [
          "1:1 chat",
          "Group chat",
          "Presence",
          "Message history and catch-up",
          "Media attachments",
          "Read receipts",
        ],
        nonFunctional: [
          "Delivery < 200ms p95 for online recipients in-region",
          "Ordering per conversation",
          "Horizontal scalability of connection and storage tiers independently",
          "History durability; presence may be lossy",
        ],
      },
    },
  },
  {
    slug: "payments",
    title: "Payment platform",
    subtitle: "Idempotency, ledger, webhooks, compliance",
    domain: "Fintech",
    scaleLabel: "500K DAU",
    focus: "Correctness over throughput",
    input: {
      name: "LedgerPay",
      description: `Design a payment platform that accepts card and wallet charges, maintains a double-entry ledger, handles refunds, and notifies merchants via webhooks.

Correctness and idempotency are more important than raw throughput. Money movement must be explainable from the ledger. Duplicate retries from clients and from the card network must not double-charge.

Constraints that matter:
- Exactly-once money movement is a product invariant. At-least-once webhooks are acceptable if they are idempotent for the merchant.
- Balances are strongly consistent. Analytics can be derived asynchronously.
- PCI card data is isolated; this system stores tokens, not PANs.
- Ledger entries are immutable. Corrections are reversing entries, not updates.
- PSP timeouts require an explicit unknown state, not a guessed success.
- Payouts to merchants are a separate delayed path from capture.`,
      scale: {
        dau: 500_000,
        peakTrafficMultiplier: 4,
        readWriteRatio: "3:1",
        averageRequestSizeBytes: 900,
        requestsPerUserPerDay: 6,
      },
      requirements: {
        functional: [
          "Card and wallet charges",
          "Refunds",
          "Double-entry ledger",
          "Merchant payouts",
          "Webhook delivery with retries",
        ],
        nonFunctional: [
          "Exactly-once money movement semantics",
          "Strong consistency for balances",
          "Full auditability of ledger entries",
          "PCI-aware isolation of card data",
          "Idempotent APIs for charge, refund, and webhook replay",
        ],
      },
    },
  },
];

export function getTemplate(slug: string): DesignTemplate | undefined {
  return DESIGN_TEMPLATES.find((template) => template.slug === slug);
}
