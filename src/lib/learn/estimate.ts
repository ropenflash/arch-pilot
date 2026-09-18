export const SECONDS_PER_DAY = 86_400;
/** Interview shortcut: treat a day as 10^5 seconds so the division stays in your head. */
export const INTERVIEW_SECONDS_PER_DAY = 100_000;
export const BYTES_PER_KIB = 1024;
export const BYTES_PER_MIB = 1024 ** 2;
export const BYTES_PER_GIB = 1024 ** 3;
export const BYTES_PER_TIB = 1024 ** 4;
export const BYTES_PER_PIB = 1024 ** 5;
export const DECIMAL_GB = 1e9;

export type ByteUnit = {
  powerOfTwo: number;
  approxCount: string;
  name: string;
  short: string;
  bytes: number;
  everyday: string;
};

export const BYTE_UNITS: ByteUnit[] = [
  {
    powerOfTwo: 10,
    approxCount: "thousand",
    name: "kibibyte",
    short: "KiB",
    bytes: BYTES_PER_KIB,
    everyday: "A short paragraph of text, or one ASCII character × 1024.",
  },
  {
    powerOfTwo: 20,
    approxCount: "million",
    name: "mebibyte",
    short: "MiB",
    bytes: BYTES_PER_MIB,
    everyday: "A mid-size photo, a small MP3, or a million-character document.",
  },
  {
    powerOfTwo: 30,
    approxCount: "billion",
    name: "gibibyte",
    short: "GiB",
    bytes: BYTES_PER_GIB,
    everyday: "A compressed movie, or about a thousand photos.",
  },
  {
    powerOfTwo: 40,
    approxCount: "trillion",
    name: "tebibyte",
    short: "TiB",
    bytes: BYTES_PER_TIB,
    everyday: "A small team’s object-store for a year of originals.",
  },
  {
    powerOfTwo: 50,
    approxCount: "quadrillion",
    name: "pebibyte",
    short: "PiB",
    bytes: BYTES_PER_PIB,
    everyday: "A large consumer product’s media archive.",
  },
];

export type LatencyOp = {
  id: string;
  label: string;
  ns: number;
  takeaway: string;
};

/** Order-of-magnitude teaching figures, not a lab benchmark. */
export const LATENCY_OPS: LatencyOp[] = [
  {
    id: "l1",
    label: "CPU cache hit",
    ns: 1,
    takeaway: "Treat this as free. Tight loops live here.",
  },
  {
    id: "ram",
    label: "Read from RAM",
    ns: 100,
    takeaway: "Still cheap — about a hundred cache hits.",
  },
  {
    id: "compress",
    label: "Squeeze a kilobyte",
    ns: 2_000,
    takeaway: "Compression is usually cheaper than shipping extra bytes across a WAN.",
  },
  {
    id: "nic",
    label: "Send 2 KB on a local network",
    ns: 20_000,
    takeaway: "Inside a rack, the network is microseconds, not milliseconds.",
  },
  {
    id: "ssd",
    label: "Random read from SSD",
    ns: 100_000,
    takeaway: "Fast storage is still ~1,000× slower than RAM. Chatty disk access adds up.",
  },
  {
    id: "dc",
    label: "Round trip in the same data center",
    ns: 500_000,
    takeaway: "A nearby hop is half a millisecond. Ten sequential hops are already a user-visible delay.",
  },
  {
    id: "seek",
    label: "Disk seek (spinning rust)",
    ns: 4_000_000,
    takeaway: "Random seeks are the enemy. Sequential scans hurt less than jumping around.",
  },
  {
    id: "disk-seq",
    label: "Read 1 MB from disk",
    ns: 20_000_000,
    takeaway: "Whole-file reads are milliseconds. Still slower than RAM by a lot.",
  },
  {
    id: "wan",
    label: "Packet across an ocean",
    ns: 150_000_000,
    takeaway: "Another continent is ~150 ms. That is a loading spinner, not a rounding error.",
  },
];

export const LATENCY_LESSONS = [
  "Memory is the fast path. Disk is the slow path. Design so hot data stays in memory.",
  "Random access (seeks, N+1 queries, per-row RPCs) hurts more than a sequential scan.",
  "A simple squeeze of the payload is often cheaper than sending it raw over the internet.",
  "A second region is not “the same computer with longer cables.” Budget the extra 50–150 ms.",
];

export const AVAILABILITY_LEVELS = [
  { label: "99%", nines: 2, ratio: 0.99 },
  { label: "99.9%", nines: 3, ratio: 0.999 },
  { label: "99.99%", nines: 4, ratio: 0.9999 },
  { label: "99.999%", nines: 5, ratio: 0.99999 },
  { label: "99.9999%", nines: 6, ratio: 0.999999 },
] as const;

export const PERIODS = [
  { id: "day", label: "per day", seconds: SECONDS_PER_DAY },
  { id: "week", label: "per week", seconds: SECONDS_PER_DAY * 7 },
  { id: "month", label: "per 30-day month", seconds: SECONDS_PER_DAY * 30 },
  { id: "year", label: "per 365-day year", seconds: SECONDS_PER_DAY * 365 },
] as const;

export type ScenarioId = "lumen" | "pebble" | "tinypath" | "hop" | "clipwell";

export type EstimateScenario = {
  id: ScenarioId;
  name: string;
  product: string;
  minutes: number;
  story: string;
  why: string;
  tips: string[];
  fields: EstimateFields;
};

export type EstimateFields = {
  mau: number;
  dailyActiveRate: number;
  readsPerUserPerDay: number;
  writesPerUserPerDay: number;
  peakMultiplier: number;
  writeBytes: number;
  mediaBytes: number;
  mediaFraction: number;
  readBytes: number;
  retentionYears: number;
  qpsPerServer: number;
};

export const ESTIMATE_SCENARIOS: EstimateScenario[] = [
  {
    id: "lumen",
    name: "Lumen",
    product: "Photo feed",
    minutes: 8,
    story:
      "Lumen is a photo feed. Forty million accounts exist. About one in four opens the app on a given day. Those people refresh the home grid a dozen times and upload a photo every few days. Most uploads are a couple of megabytes. You keep originals for three years.",
    why: "Feeds are read-heavy. Storage is dominated by the images, not the captions. Peak is dinner-time browsing, not midnight writes.",
    tips: [
      "Convert monthly accounts to daily actives before you touch QPS.",
      "Uploads are the storage problem. Refreshes are the QPS problem. Split them.",
      "A 2 MB original × millions of users is terabytes, even if text is tiny.",
    ],
    fields: {
      mau: 40_000_000,
      dailyActiveRate: 0.25,
      readsPerUserPerDay: 12,
      writesPerUserPerDay: 0.4,
      peakMultiplier: 3,
      writeBytes: 200,
      mediaBytes: 2 * BYTES_PER_MIB,
      mediaFraction: 0.8,
      readBytes: 80_000,
      retentionYears: 3,
      qpsPerServer: 500,
    },
  },
  {
    id: "pebble",
    name: "Pebble",
    product: "Group chat",
    minutes: 7,
    story:
      "Pebble is group chat for small teams. Six million people use it on a weekday. Each sends about fifty messages. Most messages are short text; a few attach a screenshot. You keep history for two years because people search old threads.",
    why: "Chat looks like low QPS until you multiply messages × group fan-out. Start with what is written to disk, then talk about fan-out as a later multiplier.",
    tips: [
      "Text is cheap. Images are not. Estimate metadata and attachments separately.",
      "Peak is evening in one or two timezones unless you are truly global.",
      "Fan-out (one send, many inboxes) can dwarf the write QPS. Call that out as an assumption.",
    ],
    fields: {
      mau: 6_000_000,
      dailyActiveRate: 1,
      readsPerUserPerDay: 80,
      writesPerUserPerDay: 50,
      peakMultiplier: 4,
      writeBytes: 180,
      mediaBytes: 400 * BYTES_PER_KIB,
      mediaFraction: 0.08,
      readBytes: 180,
      retentionYears: 2,
      qpsPerServer: 800,
    },
  },
  {
    id: "tinypath",
    name: "TinyPath",
    product: "Link shortener",
    minutes: 6,
    story:
      "TinyPath mints short links. About two hundred million new links land per year, almost evenly. Reads crush writes — roughly a hundred clicks for every new link. Each record is a few hundred bytes. The hottest fifth of links should sit in cache.",
    why: "This is a classic read-mostly key/value store. QPS is the story; storage is almost a footnote until you keep logs of every click.",
    tips: [
      "Turn “per year” into “per day” first, then into QPS.",
      "A 100:1 read/write ratio means the cache, not the disk, is the first box you size.",
      "Clicks can be sampled into analytics so you are not storing every redirect forever.",
    ],
    fields: {
      mau: 200_000_000,
      dailyActiveRate: 1 / 365,
      readsPerUserPerDay: 100,
      writesPerUserPerDay: 1,
      peakMultiplier: 5,
      writeBytes: 500,
      mediaBytes: 0,
      mediaFraction: 0,
      readBytes: 500,
      retentionYears: 5,
      qpsPerServer: 2000,
    },
  },
  {
    id: "hop",
    name: "Hop",
    product: "Ride hail pings",
    minutes: 8,
    story:
      "Hop is a ride app. 1.5 million people open it daily; about 12% actually take a trip. A trip lasts twenty minutes. While it is live, the phone sends a 200-byte location ping every four seconds (rider and driver both). Friday evening is about 2× a normal hour.",
    why: "The dangerous number is not “users.” It is pings per live trip. GPS telemetry is a write firehose with a short useful life.",
    tips: [
      "Only count people who are on a trip. The other 88% are not pinging.",
      "Pings per trip = duration / interval × senders (rider + driver).",
      "You can drop or downsample old pings. Do not keep every lat/lng forever unless the product requires it.",
    ],
    fields: {
      mau: 1_500_000,
      dailyActiveRate: 1,
      readsPerUserPerDay: 4,
      writesPerUserPerDay: 72,
      peakMultiplier: 2,
      writeBytes: 200,
      mediaBytes: 0,
      mediaFraction: 0,
      readBytes: 400,
      retentionYears: 0.25,
      qpsPerServer: 1000,
    },
  },
  {
    id: "clipwell",
    name: "Clipwell",
    product: "Short video",
    minutes: 8,
    story:
      "Clipwell plays short clips. Twenty-five million people open it daily and start about thirty videos each. A start pulls roughly 6 MB (adaptive). A small slice of users upload a 25 MB original. You keep originals a year. Dinner is a 4× traffic spike.",
    why: "Video is a bandwidth and object-storage problem first. API QPS still matters for the feed, but the pipe and the blob store dwarf it.",
    tips: [
      "Separate control-plane QPS (feed, likes) from data-plane bytes (the actual video).",
      "CDN hit ratio is the lever. Origin bandwidth is what you pay for on a miss.",
      "Uploads are rare but huge. Size object storage from uploads × retention, not from views.",
    ],
    fields: {
      mau: 25_000_000,
      dailyActiveRate: 1,
      readsPerUserPerDay: 30,
      writesPerUserPerDay: 0.003,
      peakMultiplier: 4,
      writeBytes: 256,
      mediaBytes: 25 * BYTES_PER_MIB,
      mediaFraction: 1,
      readBytes: 6 * BYTES_PER_MIB,
      retentionYears: 1,
      qpsPerServer: 400,
    },
  },
];

export type NapkinResult = {
  dau: number;
  dailyReads: number;
  dailyWrites: number;
  dailyRequests: number;
  avgReadQps: number;
  avgWriteQps: number;
  avgQps: number;
  interviewAvgQps: number;
  peakReadQps: number;
  peakWriteQps: number;
  peakQps: number;
  metadataBytesPerDay: number;
  mediaBytesPerDay: number;
  storageBytesPerDay: number;
  storageBytesPerYear: number;
  storageBytesRetained: number;
  readBandwidthMbps: number;
  writeBandwidthMbps: number;
  servers: number;
  serversWithHeadroom: number;
  steps: { title: string; detail: string; value: string }[];
  english: string[];
};

export function clampNonNegative(value: number) {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

export function dailyActiveUsers(mau: number, dailyActiveRate: number) {
  return clampNonNegative(mau) * clampNonNegative(dailyActiveRate);
}

export function averageQps(dailyCount: number, seconds = SECONDS_PER_DAY) {
  if (seconds <= 0) return 0;
  return clampNonNegative(dailyCount) / seconds;
}

export function peakQps(average: number, multiplier: number) {
  return clampNonNegative(average) * clampNonNegative(multiplier);
}

export function downtimeSeconds(availabilityRatio: number, periodSeconds: number) {
  const ratio = Math.min(1, Math.max(0, availabilityRatio));
  return (1 - ratio) * clampNonNegative(periodSeconds);
}

export function hopWritesPerUserPerDay(options?: {
  tripRate?: number;
  tripMinutes?: number;
  pingSeconds?: number;
  senders?: number;
}) {
  const tripRate = options?.tripRate ?? 0.12;
  const tripMinutes = options?.tripMinutes ?? 20;
  const pingSeconds = options?.pingSeconds ?? 4;
  const senders = options?.senders ?? 2;
  const pingsPerTrip = ((tripMinutes * 60) / pingSeconds) * senders;
  return tripRate * pingsPerTrip;
}

export function computeNapkin(fields: EstimateFields): NapkinResult {
  const dau = dailyActiveUsers(fields.mau, fields.dailyActiveRate);
  const writesPerUser = fields.writesPerUserPerDay;
  const dailyReads = dau * fields.readsPerUserPerDay;
  const dailyWrites = dau * writesPerUser;
  const dailyRequests = dailyReads + dailyWrites;
  const avgReadQps = averageQps(dailyReads);
  const avgWriteQps = averageQps(dailyWrites);
  const avgQps = averageQps(dailyRequests);
  const interviewAvgQps = averageQps(dailyRequests, INTERVIEW_SECONDS_PER_DAY);
  const peakReadQps = peakQps(avgReadQps, fields.peakMultiplier);
  const peakWriteQps = peakQps(avgWriteQps, fields.peakMultiplier);
  const peak = peakQps(avgQps, fields.peakMultiplier);
  const metadataBytesPerDay = dailyWrites * fields.writeBytes;
  const mediaBytesPerDay = dailyWrites * fields.mediaFraction * fields.mediaBytes;
  const storageBytesPerDay = metadataBytesPerDay + mediaBytesPerDay;
  const storageBytesPerYear = storageBytesPerDay * 365;
  const storageBytesRetained = storageBytesPerDay * 365 * fields.retentionYears;
  const readBandwidthMbps = (peakReadQps * fields.readBytes * 8) / 1_000_000;
  const writeBandwidthMbps = (peakWriteQps * (fields.writeBytes + fields.mediaFraction * fields.mediaBytes) * 8) / 1_000_000;
  const servers = fields.qpsPerServer > 0 ? Math.ceil(peak / fields.qpsPerServer) : 0;
  const serversWithHeadroom = Math.ceil(servers * 1.2) || servers;

  const steps = [
    {
      title: "Daily actives",
      detail: `${fmtCount(fields.mau)} monthly × ${pct(fields.dailyActiveRate)} open the product today`,
      value: fmtCount(dau),
    },
    {
      title: "Reads and writes per day",
      detail: `${fmtCount(dau)} people × ${fmtNum(fields.readsPerUserPerDay)} reads and ${fmtNum(writesPerUser)} writes`,
      value: `${fmtCount(dailyReads)} reads · ${fmtCount(dailyWrites)} writes`,
    },
    {
      title: "Average QPS",
      detail: `Total daily requests ÷ ${SECONDS_PER_DAY.toLocaleString()} seconds (a real day)`,
      value: `${fmtQps(avgQps)} QPS`,
    },
    {
      title: "Interview shortcut",
      detail: `Same requests ÷ ${INTERVIEW_SECONDS_PER_DAY.toLocaleString()} (10⁵). Slightly pessimistic, easy arithmetic.`,
      value: `${fmtQps(interviewAvgQps)} QPS`,
    },
    {
      title: "Peak QPS",
      detail: `Average × ${fmtNum(fields.peakMultiplier)} for the busy hour`,
      value: `${fmtQps(peak)} QPS (reads ${fmtQps(peakReadQps)} · writes ${fmtQps(peakWriteQps)})`,
    },
    {
      title: "New bytes per day",
      detail: `Metadata ${fmtBytes(metadataBytesPerDay)} + media ${fmtBytes(mediaBytesPerDay)}`,
      value: fmtBytes(storageBytesPerDay),
    },
    {
      title: "Kept on disk",
      detail: `${fmtBytes(storageBytesPerDay)}/day × 365 × ${fmtNum(fields.retentionYears)} years`,
      value: fmtBytes(storageBytesRetained),
    },
    {
      title: "Peak pipe",
      detail: `Peak reads × ${fmtBytes(fields.readBytes)} × 8 bits, plus writes`,
      value: `${fmtNum(readBandwidthMbps, 1)} Mbps reads · ${fmtNum(writeBandwidthMbps, 1)} Mbps writes`,
    },
    {
      title: "App servers (order of magnitude)",
      detail: `Peak QPS ÷ ${fmtCount(fields.qpsPerServer)} handled per box, then +20% headroom`,
      value: `${servers} boxes · ${serversWithHeadroom} with headroom`,
    },
  ];

  const english = [
    `About ${fmtCount(dau)} people show up on a typical day.`,
    `That is roughly ${fmtQps(avgQps)} requests per second, and around ${fmtQps(peak)} when it is busy.`,
    `You add about ${fmtBytes(storageBytesPerDay)} of new data each day, or ${fmtBytes(storageBytesRetained)} if you keep it ${fmtNum(fields.retentionYears)} year(s).`,
    `The busy-hour pipe is about ${fmtNum(readBandwidthMbps + writeBandwidthMbps, 1)} Mbps unless a CDN eats the reads.`,
    `If one app process comfortably does ${fmtCount(fields.qpsPerServer)} QPS, budget ~${serversWithHeadroom} processes — not a precise buy order, a sanity check.`,
  ];

  return {
    dau,
    dailyReads,
    dailyWrites,
    dailyRequests,
    avgReadQps,
    avgWriteQps,
    avgQps,
    interviewAvgQps,
    peakReadQps,
    peakWriteQps,
    peakQps: peak,
    metadataBytesPerDay,
    mediaBytesPerDay,
    storageBytesPerDay,
    storageBytesPerYear,
    storageBytesRetained,
    readBandwidthMbps,
    writeBandwidthMbps,
    servers,
    serversWithHeadroom,
    steps,
    english,
  };
}

export function getScenario(id: string) {
  return ESTIMATE_SCENARIOS.find((item) => item.id === id) ?? ESTIMATE_SCENARIOS[0]!;
}

export function isEstimateScenario(id: string): id is ScenarioId {
  return ESTIMATE_SCENARIOS.some((item) => item.id === id);
}

export function gradeQpsGuess(guess: number, actual: number) {
  if (!Number.isFinite(guess) || guess < 0 || actual <= 0) {
    return { rank: "miss" as const, ratio: 0, blurb: "Enter a non-negative number to compare." };
  }
  const ratio = guess / actual;
  if (ratio >= 0.8 && ratio <= 1.25) {
    return {
      rank: "tight" as const,
      ratio,
      blurb: "Interview-ready. You are inside ~25% — plenty close for napkin math.",
    };
  }
  if (ratio >= 0.5 && ratio <= 2) {
    return {
      rank: "order" as const,
      ratio,
      blurb: "Right order of magnitude. Tighten the arithmetic (day → seconds, then peak).",
    };
  }
  if (ratio >= 0.1 && ratio <= 10) {
    return {
      rank: "far" as const,
      ratio,
      blurb: "Same neighborhood, wrong zeros. Check DAU vs MAU, and 86,400 vs 3,600.",
    };
  }
  return {
    rank: "miss" as const,
    ratio,
    blurb: "Off by more than 10×. Start from “how many people today?” then divide by a day of seconds.",
  };
}

export function humanTimeFromNs(ns: number) {
  if (ns < 1_000) return `${fmtNum(ns, ns < 10 ? 1 : 0)} ns`;
  if (ns < 1_000_000) return `${fmtNum(ns / 1_000, ns < 10_000 ? 1 : 0)} µs`;
  if (ns < 1_000_000_000) return `${fmtNum(ns / 1_000_000, ns < 10_000_000 ? 1 : 0)} ms`;
  return `${fmtNum(ns / 1_000_000_000, 2)} s`;
}

/** If 1 ns were 1 second, how long is this wait in human time? */
export function scaledToHuman(ns: number) {
  const seconds = ns; // 1 ns → 1 s
  return formatDuration(seconds);
}

export function formatDuration(seconds: number) {
  const abs = Math.abs(seconds);
  if (abs < 0.001) return `${fmtNum(abs * 1_000_000, 0)} µs`;
  if (abs < 1) return `${fmtNum(abs * 1_000, 1)} ms`;
  if (abs < 60) return `${fmtNum(abs, abs < 10 ? 1 : 0)} seconds`;
  if (abs < 3600) return `${fmtNum(abs / 60, abs < 600 ? 1 : 0)} minutes`;
  if (abs < 86400) return `${fmtNum(abs / 3600, abs < 36_000 ? 1 : 0)} hours`;
  if (abs < 86400 * 365) return `${fmtNum(abs / 86400, abs < 86400 * 10 ? 1 : 0)} days`;
  return `${fmtNum(abs / (86400 * 365), 1)} years`;
}

export function fmtBytes(bytes: number) {
  const abs = Math.abs(bytes);
  if (abs >= BYTES_PER_PIB) return `${fmtNum(bytes / BYTES_PER_PIB, 2)} PiB`;
  if (abs >= BYTES_PER_TIB) return `${fmtNum(bytes / BYTES_PER_TIB, 2)} TiB`;
  if (abs >= BYTES_PER_GIB) return `${fmtNum(bytes / BYTES_PER_GIB, 2)} GiB`;
  if (abs >= BYTES_PER_MIB) return `${fmtNum(bytes / BYTES_PER_MIB, 1)} MiB`;
  if (abs >= BYTES_PER_KIB) return `${fmtNum(bytes / BYTES_PER_KIB, 0)} KiB`;
  return `${fmtNum(bytes, 0)} B`;
}

export function fmtCount(value: number) {
  const abs = Math.abs(value);
  const scaled = (n: number, suffix: string) => {
    const round = Math.abs(n - Math.round(n)) < 1e-9;
    const digits = round ? 0 : n >= 10 ? 1 : 2;
    return `${fmtNum(n, digits)}${suffix}`;
  };
  if (abs >= 1_000_000_000) return scaled(value / 1_000_000_000, "B");
  if (abs >= 1_000_000) return scaled(value / 1_000_000, "M");
  if (abs >= 10_000) return scaled(value / 1_000, "K");
  return fmtNum(value, abs >= 100 ? 0 : abs >= 10 ? 1 : 2);
}

export function fmtQps(value: number) {
  if (value >= 100) return fmtNum(value, 0);
  if (value >= 10) return fmtNum(value, 1);
  return fmtNum(value, 2);
}

export function fmtNum(value: number, digits = 0) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

export function pct(rate: number) {
  const percent = rate * 100;
  const digits = percent >= 10 || percent === Math.round(percent) ? 0 : 1;
  return `${fmtNum(percent, digits)}%`;
}

export function decimalVsBinaryGb(bytes: number) {
  return {
    binaryGiB: bytes / BYTES_PER_GIB,
    decimalGB: bytes / DECIMAL_GB,
  };
}

export const NAPKIN_TIPS = [
  {
    title: "Round on purpose",
    body: "Interviews are not a calculator exam. 86,400 seconds in a day is close to 100,000. Using 10⁵ keeps the zeros honest and is usually within 20%.",
  },
  {
    title: "Write the assumptions",
    body: "DAU, requests per person, payload size, peak factor, retention. If a number did not come from the prompt, say you invented it. That is the job.",
  },
  {
    title: "Label every number",
    body: "“5” is not an estimate. 5 KB, 5 MB, and 5 million QPS are different architectures. Units catch most mistakes.",
  },
  {
    title: "Order of magnitude beats three decimals",
    body: "Knowing you need ~4,000 QPS and ~20 TB/day is enough to pick RAM vs disk, one region vs two, and whether a cache earns its keep.",
  },
];
