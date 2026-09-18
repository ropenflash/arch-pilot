import type { SystemDesignInput } from "@/lib/architecture/validation";

export interface DesignTemplate {
  slug: string;
  title: string;
  subtitle: string;
  input: SystemDesignInput;
}

export const DESIGN_TEMPLATES: DesignTemplate[] = [
  {
    slug: "video-streaming",
    title: "Netflix-like video streaming platform",
    subtitle: "Upload, transcode, CDN playback, recommendations",
    input: {
      name: "StreamForge",
      description:
        "Design a Netflix-like video streaming platform. Creators upload videos that are transcoded into multiple bitrates. Viewers stream with low startup time worldwide. The system needs recommendations, watch history, and adaptive bitrate playback.",
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
          "Video upload",
          "Transcoding",
          "CDN playback",
          "Recommendations",
          "Watch history",
        ],
        nonFunctional: [
          "Global low-latency playback",
          "High availability",
          "Cost-efficient bandwidth",
          "Horizontal scalability",
        ],
      },
    },
  },
  {
    slug: "ride-sharing",
    title: "Uber-like ride sharing system",
    subtitle: "Matching, location, pricing, trip tracking",
    input: {
      name: "RideGrid",
      description:
        "Design an Uber-like ride sharing system. Riders request trips, nearby drivers are matched in seconds, pricing is dynamic, and trip location is tracked in real time until completion and payment.",
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
          "Ride requests",
          "Matching",
          "Pricing",
          "Trip tracking",
        ],
        nonFunctional: [
          "Matching p95 < 2s",
          "Location freshness < 3s",
          "Fault tolerance",
          "Geographic scalability",
        ],
      },
    },
  },
  {
    slug: "ecommerce",
    title: "E-commerce platform",
    subtitle: "Catalog, cart, checkout, payments, orders",
    input: {
      name: "Scalable E-commerce Platform",
      description:
        "Design an e-commerce platform capable of handling 1 million daily active users. Shoppers browse and search a catalog, manage a cart, check out with payments, and track orders.",
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
          "Product search",
          "Cart",
          "Checkout",
          "Payments",
          "Order tracking",
        ],
        nonFunctional: [
          "99.99% availability",
          "Low latency",
          "Horizontal scalability",
          "Fault tolerance",
        ],
      },
    },
  },
  {
    slug: "url-shortener",
    title: "URL shortener",
    subtitle: "Writes, redirects, analytics, uniqueness",
    input: {
      name: "ShortPath",
      description:
        "Design a URL shortener that creates unique short links, redirects with very low latency, and records click analytics. Writes are much rarer than reads.",
      scale: {
        dau: 10_000_000,
        peakTrafficMultiplier: 8,
        readWriteRatio: "100:1",
        averageRequestSizeBytes: 250,
        requestsPerUserPerDay: 8,
      },
      requirements: {
        functional: ["Create short URL", "Redirect", "Click analytics", "Custom aliases"],
        nonFunctional: ["Redirect p99 < 10ms", "High availability", "Idempotent writes"],
      },
    },
  },
  {
    slug: "realtime-chat",
    title: "Real-time chat application",
    subtitle: "Presence, delivery, fan-out, persistence",
    input: {
      name: "Relay Chat",
      description:
        "Design a real-time chat application for 1:1 and group messaging, with presence, read receipts, media attachments, and message history.",
      scale: {
        dau: 8_000_000,
        peakTrafficMultiplier: 5,
        readWriteRatio: "5:1",
        averageRequestSizeBytes: 400,
        requestsPerUserPerDay: 80,
      },
      requirements: {
        functional: ["1:1 chat", "Group chat", "Presence", "Message history", "Media"],
        nonFunctional: ["Delivery < 200ms p95", "Ordering per conversation", "Horizontal scalability"],
      },
    },
  },
  {
    slug: "payments",
    title: "Payment platform",
    subtitle: "Idempotency, ledger, webhooks, compliance",
    input: {
      name: "LedgerPay",
      description:
        "Design a payment platform that accepts card and wallet charges, maintains a double-entry ledger, handles refunds, and notifies merchants via webhooks. Correctness and idempotency are more important than raw throughput.",
      scale: {
        dau: 500_000,
        peakTrafficMultiplier: 4,
        readWriteRatio: "3:1",
        averageRequestSizeBytes: 900,
        requestsPerUserPerDay: 6,
      },
      requirements: {
        functional: ["Charges", "Refunds", "Ledger", "Payouts", "Webhooks"],
        nonFunctional: [
          "Exactly-once money movement semantics",
          "Strong consistency for balances",
          "Auditability",
          "PCI-aware isolation",
        ],
      },
    },
  },
];

export function getTemplate(slug: string): DesignTemplate | undefined {
  return DESIGN_TEMPLATES.find((template) => template.slug === slug);
}
