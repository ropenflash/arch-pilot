export type GuideStep = {
  title: string;
  goal: string;
  questions: string[];
  nudge: string;
};

export type ProblemGuide = {
  concept: string;
  steps: [GuideStep, GuideStep, GuideStep, GuideStep];
  referenceFlow: string;
  decisions: string[];
  failureDrill: string;
};

const guide = (
  concept: string,
  steps: ProblemGuide["steps"],
  referenceFlow: string,
  decisions: string[],
  failureDrill: string,
): ProblemGuide => ({ concept, steps, referenceFlow, decisions, failureDrill });

export const PROBLEM_GUIDES: Record<string, ProblemGuide> = {
  "rate-limiter": guide(
    "A rate limiter is a very fast decision: allow this request now, or reject it predictably.",
    [
      {
        title: "Draw the doorway",
        goal: "Put the limiter where every protected request must pass.",
        questions: ["What identifies a caller?", "Is the limit global, per user, or per API key?"],
        nudge: "Start with Client → Gateway / limiter → API service.",
      },
      {
        title: "Choose the rule",
        goal: "Pick one algorithm and state what behavior the user sees.",
        questions: ["Do bursts count?", "When does capacity refill?", "What goes in the 429 response?"],
        nudge: "A token bucket is a friendly default when small bursts are acceptable.",
      },
      {
        title: "Share the counters",
        goal: "Make many limiter instances agree without one in-memory counter.",
        questions: ["Where are counters stored?", "Is the update atomic?", "How are keys expired?"],
        nudge: "Add a shared cache and label the counter update as atomic.",
      },
      {
        title: "Break it safely",
        goal: "Decide what happens when the counter store is slow or unavailable.",
        questions: ["Fail open or closed?", "Can one hot key overload a shard?", "How will you detect drops?"],
        nudge: "Different endpoints can choose differently: payments may fail closed; browsing may fail open.",
      },
    ],
    "Client → gateway with limiter → API. Limiter performs an atomic counter/token update in a sharded cache, then allows the request or returns 429.",
    [
      "Token bucket allows controlled bursts; a fixed window is simpler but has boundary spikes.",
      "A shared cache improves agreement but adds a network hop to every request.",
      "Fail-open protects availability; fail-closed protects the resource.",
    ],
    "The counter cache times out for 30 seconds. Explain which requests still pass and how you avoid a retry storm.",
  ),
  "consistent-hashing": guide(
    "Consistent hashing is a placement technique: fleet changes should move a small slice of keys, not all of them.",
    [
      {
        title: "Show ordinary hashing",
        goal: "Draw clients routing keys to several cache or shard nodes.",
        questions: ["What is the key?", "Who computes placement?", "Why does modulo hashing hurt?"],
        nudge: "Draw at least three nodes and a small routing layer.",
      },
      {
        title: "Place the ring",
        goal: "Explain how both keys and nodes land in one ordered hash space.",
        questions: ["Which node owns a key?", "What changes when a node joins?", "What changes when one leaves?"],
        nudge: "A key walks clockwise to its next node; only a neighboring range moves.",
      },
      {
        title: "Smooth the load",
        goal: "Prevent one physical node from owning one huge range.",
        questions: ["Why use virtual nodes?", "How many placements per machine?", "How do weights work?"],
        nudge: "Give each machine many small positions so ownership averages out.",
      },
      {
        title: "Handle reality",
        goal: "Cover replicas, membership changes, and hot keys.",
        questions: ["Where are replicas placed?", "Who publishes membership?", "Can hashing fix a celebrity key?"],
        nudge: "The ring balances ranges, not popularity. A hot key may still need replication or caching.",
      },
    ],
    "A routing library or proxy hashes the key, walks the ring to a virtual node, and sends the request to its physical cache/shard plus successor replicas.",
    [
      "Client-side routing removes a proxy hop but makes membership rollout harder.",
      "More virtual nodes improve balance but increase metadata and movement planning.",
      "Replication improves availability but requires a consistency choice.",
    ],
    "One node disappears while clients have two different membership versions. Explain temporary misses and recovery.",
  ),
  "kv-store": guide(
    "A distributed key-value store turns a key into placement, replication, and a consistency promise.",
    [
      {
        title: "Define the contract",
        goal: "Keep the API tiny and make the guarantees explicit.",
        questions: ["What do put, get, and delete return?", "How large is a value?", "Is overwrite allowed?"],
        nudge: "Write three API calls beside the client before adding infrastructure.",
      },
      {
        title: "Place each key",
        goal: "Route a key to an owning partition.",
        questions: ["Hash or range partitioning?", "Who knows the partition map?", "How does rebalancing work?"],
        nudge: "A router plus consistent hashing is a reasonable first sketch.",
      },
      {
        title: "Copy the data",
        goal: "Survive a node loss with replicas.",
        questions: ["How many replicas?", "Who coordinates writes?", "When is a write acknowledged?"],
        nudge: "Draw a leader and followers, or name quorum R/W values.",
      },
      {
        title: "Resolve disagreement",
        goal: "Say what clients observe during lag or a partition.",
        questions: ["Strong or eventual reads?", "How are conflicts detected?", "What repairs stale replicas?"],
        nudge: "Pick one clear consistency promise; do not claim every guarantee at once.",
      },
    ],
    "Client → routing/coordinator service → partition replicas. Writes are acknowledged after the chosen quorum; reads use a leader or read quorum and background repair.",
    [
      "Leader replication is easier to reason about; quorum writes can remain available through failures.",
      "Consistent hashing eases rebalancing; range partitioning supports scans.",
      "Strong reads reduce surprises but increase latency and reduce partition availability.",
    ],
    "A replica accepts traffic after being disconnected for five minutes. Explain stale reads, repair, and conflict handling.",
  ),
  "unique-ids": guide(
    "An ID service combines time and machine identity so many generators can mint sortable IDs without coordination.",
    [
      {
        title: "Write the requirements",
        goal: "Separate uniqueness, order, size, and privacy.",
        questions: ["Globally unique?", "Strictly or roughly ordered?", "May IDs reveal time or volume?"],
        nudge: "Rough ordering is much cheaper than one global sequence.",
      },
      {
        title: "Budget the bits",
        goal: "Divide a fixed-width ID into meaningful fields.",
        questions: ["How many timestamp bits?", "How many datacenters and workers?", "How many IDs per millisecond?"],
        nudge: "Sketch timestamp | region/worker | sequence.",
      },
      {
        title: "Issue worker IDs",
        goal: "Ensure two generators never use the same identity at once.",
        questions: ["Static config or leases?", "What happens on restart?", "How are duplicate leases prevented?"],
        nudge: "A small coordination service can lease worker IDs; it is not on every ID request.",
      },
      {
        title: "Face the clock",
        goal: "Handle clock rollback and sequence exhaustion.",
        questions: ["What if time moves backward?", "What if one millisecond fills up?", "What do you monitor?"],
        nudge: "Pause, reject, or keep a logical timestamp—but state which behavior you choose.",
      },
    ],
    "Clients call any ID generator. Each generator combines current time, its leased region/worker bits, and a per-tick sequence; no database is on the hot path.",
    [
      "Time-based IDs sort well but reveal creation time.",
      "Leased worker IDs reduce collisions but require safe lease fencing.",
      "Random UUIDs are simpler when ordering and compact indexes do not matter.",
    ],
    "A generator reboots with its clock 400 ms behind. Explain how it avoids issuing an ID smaller than or equal to one already minted.",
  ),
  "url-shortener": guide(
    "A shortener is a write-light mapping service with an extremely hot read path.",
    [
      {
        title: "Scope two APIs",
        goal: "Define create and redirect before adding analytics.",
        questions: ["Custom aliases?", "Expiration?", "Is deletion in v1?"],
        nudge: "Start with POST /links and GET /{code}.",
      },
      {
        title: "Mint the code",
        goal: "Choose how unique short codes are generated.",
        questions: ["Random code or encoded ID?", "How are collisions handled?", "Can users guess nearby links?"],
        nudge: "Either random + collision check or base62(unique ID) works—name the trade-off.",
      },
      {
        title: "Make redirects fast",
        goal: "Keep the hot mapping near the redirect service.",
        questions: ["What is cached?", "What is the TTL?", "How do you handle a miss?"],
        nudge: "Draw Client → redirect service → cache → mapping database.",
      },
      {
        title: "Separate the extras",
        goal: "Count clicks without slowing redirects and handle one viral key.",
        questions: ["Where do click events go?", "Can counts lag?", "How do you protect storage on cache failure?"],
        nudge: "Send analytics to a queue and replicate/cache the viral mapping.",
      },
    ],
    "Create service mints a code and stores code → URL in a database. Redirect service reads cache first, falls back to the database, and emits click events asynchronously.",
    [
      "Random codes hide traffic volume but require collision handling.",
      "Long cache TTLs improve latency but complicate edits and deletion.",
      "Synchronous analytics are fresh but make the redirect fragile.",
    ],
    "A viral code is requested 500k times per second just as its cache entry expires. Explain stampede protection.",
  ),
  pastebin: guide(
    "A text-sharing service separates small metadata from variable-size content and makes expiration part of storage lifecycle.",
    [
      {
        title: "Scope the paste",
        goal: "Define create, read, visibility, size, and expiration.",
        questions: ["Are edits allowed?", "How large can a paste be?", "Public id or private capability link?"],
        nudge: "Start with immutable create + read. An edit can create a new version later.",
      },
      {
        title: "Split metadata and bytes",
        goal: "Choose where ids, owners, expiry, and text content live.",
        questions: ["Does the text fit comfortably in database rows?", "When would object storage win?", "Who enforces size?"],
        nudge: "Small text can live in a database; large bodies can move to object storage behind metadata.",
      },
      {
        title: "Serve popular reads",
        goal: "Keep one viral paste from hammering the source of truth.",
        questions: ["What is cacheable?", "Can immutable content use a CDN?", "What happens at expiration?"],
        nudge: "Immutable public pastes are unusually cache-friendly; include expiry in the cache policy.",
      },
      {
        title: "Expire and protect",
        goal: "Delete safely and prevent guessable private links or abusive payloads.",
        questions: ["Lazy or scheduled deletion?", "How is a private id generated?", "What gets rate-limited?"],
        nudge: "Use unguessable capability ids, scan/limit input, and let lifecycle cleanup be asynchronous.",
      },
    ],
    "Create API validates content, mints an unguessable id, stores metadata plus text/blob location, and returns a link. Read API checks cache first and then durable storage; lifecycle workers remove expired content.",
    [
      "Database rows simplify small text but make large variable blobs expensive.",
      "Immutable pastes cache well but edits require versioning or invalidation.",
      "Capability links are simple sharing but anyone holding the link has access.",
    ],
    "A public paste becomes viral while its expiry time arrives. Explain cache behavior, source deletion, and the response after expiry.",
  ),
  "web-crawler": guide(
    "A crawler is a controlled work pipeline: discover, schedule, fetch, deduplicate, and store.",
    [
      {
        title: "Draw one loop",
        goal: "Show how a seed becomes a fetched page and more URLs.",
        questions: ["What enters the system?", "What is stored?", "What gets queued next?"],
        nudge: "Seed → frontier → fetcher → parser → storage, then discovered links return to the frontier.",
      },
      {
        title: "Be polite",
        goal: "Prevent workers from overwhelming one host.",
        questions: ["How is robots.txt used?", "What is the per-host delay?", "How are URLs grouped?"],
        nudge: "Schedule by hostname, not just one global FIFO queue.",
      },
      {
        title: "Avoid repeats",
        goal: "Canonicalize and deduplicate URLs and content.",
        questions: ["When is a URL marked seen?", "How are redirects handled?", "Do duplicate pages share content?"],
        nudge: "Keep a durable URL fingerprint set; content hashes catch different URLs with identical pages.",
      },
      {
        title: "Scale and retry",
        goal: "Partition work while keeping retries bounded.",
        questions: ["How is the frontier partitioned?", "What happens after timeouts?", "How is freshness scheduled?"],
        nudge: "Use retry counts, backoff, and a dead-letter path instead of infinite requeues.",
      },
    ],
    "Seeds enter a host-aware URL frontier. Fetch workers obey robots and rate limits, store content, parse links, canonicalize/dedupe them, and enqueue unseen URLs.",
    [
      "Marking seen before fetch prevents duplicates but needs a retry state for failed fetches.",
      "Partitioning by host makes politeness easier but can create uneven partitions.",
      "Freshness recrawls compete with discovering new pages.",
    ],
    "A large domain starts returning 503 for every request. Explain backoff without blocking other hosts.",
  ),
  notifications: guide(
    "A notification system turns product events into durable, preference-aware delivery across unreliable providers.",
    [
      {
        title: "Name the event",
        goal: "Separate the product action from notification delivery.",
        questions: ["Who produced the event?", "Who should receive it?", "Which channels are allowed?"],
        nudge: "Draw Product service → event queue → notification workers.",
      },
      {
        title: "Build the message",
        goal: "Apply preferences, templates, and recipient data.",
        questions: ["Where are opt-outs stored?", "When is the template rendered?", "How is locale selected?"],
        nudge: "A notification service can fan one event into channel-specific jobs.",
      },
      {
        title: "Deliver by channel",
        goal: "Isolate push, email, SMS, and in-app failures.",
        questions: ["One queue or one per channel?", "How are providers rate-limited?", "How are receipts tracked?"],
        nudge: "Use separate workers/queues so an email outage does not stop in-app delivery.",
      },
      {
        title: "Retry once, not twice",
        goal: "Make retries safe and handle giant fan-outs.",
        questions: ["What is the idempotency key?", "When do retries stop?", "How is a million-user audience batched?"],
        nudge: "Persist a delivery record keyed by event + recipient + channel.",
      },
    ],
    "Product events enter a durable queue. A notification service checks preferences and creates channel jobs; channel workers call vendors and record idempotent delivery state.",
    [
      "Precomputing recipients speeds delivery but makes preference changes race with queued work.",
      "Separate channel queues isolate failures but add operational surface.",
      "At-least-once queues require idempotent delivery records.",
    ],
    "The push vendor returns success but your worker times out before saving it. Explain how you limit duplicate sends.",
  ),
  "news-feed": guide(
    "A feed combines cheap post writes with expensive follower fan-out; celebrity accounts force a hybrid.",
    [
      {
        title: "Separate post and feed",
        goal: "Draw publishing and reading as two distinct flows.",
        questions: ["Where does post metadata live?", "Where do photos live?", "What does the home API return?"],
        nudge: "Keep blobs in object storage/CDN and metadata in a database.",
      },
      {
        title: "Choose fan-out",
        goal: "Decide when follower timelines are assembled.",
        questions: ["Push IDs on write or pull on read?", "How many followers is normal?", "What is the celebrity case?"],
        nudge: "Start with fan-out-on-write for ordinary users; call out the oversized account exception.",
      },
      {
        title: "Serve the grid",
        goal: "Build a low-latency read path with stable pagination.",
        questions: ["What is cached?", "Cursor or page number?", "How are deleted posts removed?"],
        nudge: "Cache a timeline of post IDs, then hydrate post metadata in batches.",
      },
      {
        title: "Make it recoverable",
        goal: "Handle queue lag, duplicate fan-out, and a dead shard.",
        questions: ["Can jobs retry safely?", "What if a timeline is stale?", "How is it rebuilt?"],
        nudge: "The source posts and follow graph should let you rebuild derived timelines.",
      },
    ],
    "Post API stores metadata and uploads media to object storage. Fan-out workers write post IDs into follower timelines; feed API reads timeline cache/store and hydrates posts. Celebrity posts merge on read.",
    [
      "Fan-out-on-write gives fast reads but amplifies celebrity writes.",
      "Pull-on-read keeps writes cheap but makes every feed request expensive.",
      "A hybrid is operationally harder but handles both shapes.",
    ],
    "Fan-out workers are two hours behind during a traffic spike. Explain what users see and how the system catches up.",
  ),
  chat: guide(
    "Reliable chat persists a message before notifying recipients; presence is a separate, deliberately softer promise.",
    [
      {
        title: "Draw the connection",
        goal: "Show how an online client keeps a live session.",
        questions: ["WebSocket or polling?", "Where does connection state live?", "How is a user routed?"],
        nudge: "Client → connection gateway → chat service.",
      },
      {
        title: "Persist then deliver",
        goal: "Give every message a durable home before it is pushed.",
        questions: ["Who assigns message IDs?", "What is the conversation partition key?", "When is send acknowledged?"],
        nudge: "Store first, then publish a delivery event; retries use a client-generated idempotency key.",
      },
      {
        title: "Reconnect cleanly",
        goal: "Fetch missed history in stable order.",
        questions: ["What cursor does the client send?", "How are read receipts stored?", "Where do attachments live?"],
        nudge: "Use conversation ID + sequence/message ID for cursor pagination.",
      },
      {
        title: "Keep presence soft",
        goal: "Let online status expire naturally without risking messages.",
        questions: ["What heartbeat interval?", "What TTL?", "What happens when a phone sleeps?"],
        nudge: "Presence belongs in an expiring cache; messages belong in durable storage.",
      },
    ],
    "Clients hold sockets to gateways. Chat service validates and persists each message, then publishes a delivery event. Gateways push to online devices; offline devices catch up from message history.",
    [
      "Acknowledge-after-persist protects messages but adds storage latency.",
      "Conversation partitioning preserves local order but hot groups need special handling.",
      "Presence can be stale to keep the reliable message path independent.",
    ],
    "The recipient receives a message, but the sender retries because its acknowledgement was lost. Explain deduplication.",
  ),
  autocomplete: guide(
    "Autocomplete serves tiny prefix lookups at keystroke speed while popularity updates happen off the read path.",
    [
      {
        title: "Define a lookup",
        goal: "Keep the response small, cancellable, and fast.",
        questions: ["Minimum prefix length?", "How many suggestions?", "How are old keystroke requests cancelled?"],
        nudge: "Client debounce → autocomplete API → in-memory/cache lookup.",
      },
      {
        title: "Pick the index",
        goal: "Map a prefix to top suggestions.",
        questions: ["Trie, sorted list, or search engine?", "Where are top-k scores stored?", "How much fits in memory?"],
        nudge: "Precompute top suggestions per popular prefix rather than ranking every query live.",
      },
      {
        title: "Learn popularity",
        goal: "Update suggestions asynchronously from search events.",
        questions: ["What events count?", "How often is the index rebuilt?", "How are abusive queries filtered?"],
        nudge: "Stream query counts, aggregate them, then publish versioned index snapshots.",
      },
      {
        title: "Protect the hot path",
        goal: "Handle hot prefixes, cache misses, and a bad index release.",
        questions: ["How is the index sharded?", "Can all nodes keep a copy?", "How do you roll back?"],
        nudge: "Small read-only snapshots can be replicated widely and swapped atomically.",
      },
    ],
    "Debounced client requests hit stateless APIs backed by a replicated in-memory prefix index/cache. Search events flow asynchronously into aggregation and versioned index builds.",
    [
      "Precomputed top-k makes reads fast but suggestions lag.",
      "A full in-memory copy simplifies routing but may not fit for every language/region.",
      "Fuzzy matching improves UX but costs more than exact prefixes.",
    ],
    "A malformed index snapshot crashes half the autocomplete fleet. Explain versioning, health checks, and rollback.",
  ),
  "large-scale-search": guide(
    "Large-scale search is a distributed read model: partition the index, query many partitions, and merge the best candidates.",
    [
      {
        title: "Define the query",
        goal: "Choose searchable fields, filters, freshness, and a simple relevance promise.",
        questions: ["Text only or filters too?", "How fresh must updates be?", "How many results are returned?"],
        nudge: "Keep ranking simple. Retrieval architecture is the first concern.",
      },
      {
        title: "Build the index",
        goal: "Transform durable documents into an inverted index asynchronously.",
        questions: ["What emits changes?", "How are deletes represented?", "Can indexing retry safely?"],
        nudge: "Source DB/store → change stream or queue → indexing workers → search partitions.",
      },
      {
        title: "Partition and query",
        goal: "Fan a query to index shards and merge top candidates.",
        questions: ["Partition by document or term?", "How many shards does one query touch?", "Where are top-k results merged?"],
        nudge: "Document partitioning makes indexing straightforward but queries fan out; replicas add query capacity.",
      },
      {
        title: "Operate freshness",
        goal: "Handle shard loss, indexing lag, and safe index rebuilds.",
        questions: ["Can a replica serve a missing shard?", "How is lag measured?", "How do versions switch?"],
        nudge: "Build versioned indexes, warm them, then atomically move query traffic.",
      },
    ],
    "Durable documents publish changes to a queue. Indexers update partitioned inverted indexes. Query coordinators fan out to one replica per shard, merge top-k candidates, and return ranked results.",
    [
      "More shards increase parallelism but add query fan-out and merge cost.",
      "More replicas improve query throughput but multiply index storage.",
      "Asynchronous indexing protects writes but makes search eventually consistent.",
    ],
    "One index shard is unavailable during peak search traffic. Explain replica routing, partial results, timeouts, and user-visible behavior.",
  ),
  video: guide(
    "Video systems separate a small metadata control plane from a huge media-byte data plane.",
    [
      {
        title: "Split bytes from metadata",
        goal: "Upload files directly to object storage while APIs hold metadata.",
        questions: ["Who issues an upload URL?", "Is upload resumable?", "When is a video visible?"],
        nudge: "Client asks API for a signed URL, then uploads straight to object storage.",
      },
      {
        title: "Process off-path",
        goal: "Transcode and package after upload succeeds.",
        questions: ["What event starts processing?", "How are retries tracked?", "Which output renditions are needed?"],
        nudge: "Object-created event → queue → transcode workers → processed storage.",
      },
      {
        title: "Play from the edge",
        goal: "Keep playback away from API servers.",
        questions: ["Where is the manifest?", "What does the CDN cache?", "How does adaptive bitrate work?"],
        nudge: "Player fetches a manifest and media segments through the CDN.",
      },
      {
        title: "Survive the backlog",
        goal: "Handle failed jobs, cache misses, and regional demand.",
        questions: ["Can uploads wait for processing?", "How do workers autoscale?", "What if the origin is overloaded?"],
        nudge: "Expose processing state; isolate retries; use origin shielding for cache misses.",
      },
    ],
    "API issues signed uploads to object storage and records metadata. A queue drives transcode workers. Processed manifests/segments return to storage and are served globally through a CDN.",
    [
      "Direct upload removes API bandwidth but requires secure short-lived upload grants.",
      "More renditions improve playback but multiply processing and storage cost.",
      "Long CDN caching lowers origin load but requires versioned media paths.",
    ],
    "A popular new video misses every regional CDN at once. Explain origin shielding and capacity protection.",
  ),
  "cloud-files": guide(
    "Cloud files keep blob bytes immutable and treat metadata, versions, and sync events as the coordination layer.",
    [
      {
        title: "Separate two stores",
        goal: "Put file bytes and file metadata on different paths.",
        questions: ["What belongs in metadata?", "How are uploads authorized?", "How is integrity checked?"],
        nudge: "Database: names, folders, owners, versions. Object storage: bytes.",
      },
      {
        title: "Make upload resumable",
        goal: "Handle large files without proxying through the API.",
        questions: ["Multipart upload?", "When does metadata commit?", "What cleans abandoned parts?"],
        nudge: "Create upload session → direct parts to blob storage → finalize metadata transaction.",
      },
      {
        title: "Sync devices",
        goal: "Let clients learn what changed after a cursor.",
        questions: ["Polling, push, or both?", "What is the change cursor?", "How are offline edits queued?"],
        nudge: "Write a durable change log and let each device advance its own cursor.",
      },
      {
        title: "Protect versions",
        goal: "Handle concurrent edits, shares, and deletes safely.",
        questions: ["Last-write-wins or conflict copy?", "How are share tokens revoked?", "Is delete recoverable?"],
        nudge: "Use immutable blob versions plus optimistic metadata version checks.",
      },
    ],
    "Metadata API stores folders, ownership, versions, and sharing. Clients transfer bytes directly to versioned object storage. A durable change log feeds device sync and notifications.",
    [
      "Immutable blob versions simplify recovery but increase storage cost.",
      "Push makes sync feel instant; cursor polling remains the reliable catch-up path.",
      "Conflict copies preserve data but ask the user to reconcile.",
    ],
    "Two offline laptops edit version 7 and reconnect together. Explain version checks and what each user sees.",
  ),
};

export function getProblemGuide(id: string): ProblemGuide {
  return PROBLEM_GUIDES[id] ?? PROBLEM_GUIDES["rate-limiter"]!;
}
