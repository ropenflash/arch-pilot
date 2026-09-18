export type CaseStudySpec = {
  apis: string[];
  entities: string[];
  primaryFlow: string;
  bottleneck: string;
};

export const CASE_STUDY_SPECS: Record<string, CaseStudySpec> = {
  "rate-limiter": {
    apis: ["check(key, rule) → allow | reject", "publishRule(rule, version)"],
    entities: ["Rule: key shape, algorithm, allowance", "Counter state: key, tokens/count, expiry"],
    primaryFlow: "request → load rule → atomic counter decision → API or 429",
    bottleneck: "A hot counter key or unavailable shared counter store.",
  },
  "consistent-hashing": {
    apis: ["locate(key) → owner + replicas", "updateMembership(version, nodes)"],
    entities: ["Node: id, weight, status", "Ring position: hash, physical node"],
    primaryFlow: "key → hash position → next virtual node → physical owner",
    bottleneck: "Membership disagreement or one popularity-hot key.",
  },
  "kv-store": {
    apis: ["PUT /keys/{key}", "GET /keys/{key}", "DELETE /keys/{key}"],
    entities: ["Value: key, bytes, version", "Replica state: partition, applied version"],
    primaryFlow: "client → coordinator → owning partition → replicas",
    bottleneck: "A hot partition, replica lag, or coordinator fan-out.",
  },
  "unique-ids": {
    apis: ["POST /ids → id", "leaseWorker(region, ttl) → workerId"],
    entities: ["Worker lease: region, worker, fencing token", "ID fields: time, worker, sequence"],
    primaryFlow: "request → local generator → time + worker + sequence",
    bottleneck: "Clock rollback, duplicate worker identity, or sequence exhaustion.",
  },
  "url-shortener": {
    apis: ["POST /links {url, expiry?}", "GET /{code} → redirect"],
    entities: ["Link: code, destination, createdAt, expiresAt", "Click event: code, time, coarse client data"],
    primaryFlow: "code → redirect service → cache → mapping store → 301/302",
    bottleneck: "A viral code at cache expiry or mapping-store overload.",
  },
  pastebin: {
    apis: ["POST /pastes {text, expiry?}", "GET /pastes/{id}"],
    entities: ["Paste: id, owner?, visibility, expiresAt", "Content: pasteId, text/blobKey, checksum"],
    primaryFlow: "id → read API → cache → metadata/content store",
    bottleneck: "Large body storage, viral reads, or expiration races.",
  },
  "web-crawler": {
    apis: ["submitSeed(url)", "getCrawlStatus(jobId)"],
    entities: ["URL state: canonical URL, host, nextFetchAt", "Page: content hash, blob key, fetchedAt"],
    primaryFlow: "frontier → polite fetcher → parser/store → dedupe → frontier",
    bottleneck: "One host dominating workers or an exploding duplicate frontier.",
  },
  notifications: {
    apis: ["publishNotification(event, recipients)", "updatePreferences(user, channels)"],
    entities: ["Notification: event, recipient, channel, state", "Preference: user, channel, opt-in"],
    primaryFlow: "product event → fan-out → channel queues → provider workers",
    bottleneck: "Mass fan-out, provider outage, or duplicate delivery retries.",
  },
  "news-feed": {
    apis: ["POST /posts", "GET /feed?cursor=…"],
    entities: ["Post: id, author, body, mediaKey", "Timeline entry: user, postId, rank/time"],
    primaryFlow: "publish → post store → fan-out queue → timelines → feed API",
    bottleneck: "Celebrity fan-out or timeline hydration at peak.",
  },
  chat: {
    apis: ["sendMessage(conversation, clientMessageId)", "GET /messages?after=…"],
    entities: ["Message: conversation, sequence, sender, body", "Presence: user, device, expiresAt"],
    primaryFlow: "socket → chat service → message store → delivery event → recipient",
    bottleneck: "Hot conversations, reconnect fan-in, or delivery duplication.",
  },
  autocomplete: {
    apis: ["GET /suggest?q=prefix", "recordQuery(query, selected?)"],
    entities: ["Prefix entry: prefix, top suggestions", "Query count: term, period, score"],
    primaryFlow: "keystroke → API → replicated prefix index → top-k",
    bottleneck: "Very hot prefixes or an index refresh that invalidates every node.",
  },
  "large-scale-search": {
    apis: ["GET /search?q=…&filters=…", "indexDocument(id, version)"],
    entities: ["Document source: id, fields, version", "Posting: term, document, score features"],
    primaryFlow: "query coordinator → index shards → top-k merge → results",
    bottleneck: "Query fan-out, a missing shard, or indexing lag.",
  },
  video: {
    apis: ["POST /uploads → signed parts", "GET /videos/{id}/manifest"],
    entities: ["Video: owner, state, manifestKey", "Rendition: video, bitrate, segment prefix"],
    primaryFlow: "upload → object storage → transcode queue → renditions → CDN",
    bottleneck: "Transcode backlog or origin overload on a globally cold release.",
  },
  "cloud-files": {
    apis: ["createUpload(path, version) → signed parts", "GET /changes?cursor=…"],
    entities: ["File metadata: id, parent, name, currentVersion", "Version: file, blobKey, checksum"],
    primaryFlow: "metadata transaction + direct blob transfer → change log → device sync",
    bottleneck: "Concurrent edits, large sync bursts, or metadata/blob inconsistency.",
  },
};

export function getCaseStudySpec(id: string) {
  return CASE_STUDY_SPECS[id];
}
