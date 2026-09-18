import type { ArchitectureNodeType } from "@/lib/architecture/validation";

export type BuildingBlock = {
  id: string;
  title: string;
  nodeType: ArchitectureNodeType;
  oneLine: string;
  problem: string;
  what: string;
  why: string;
  useWhen: string[];
  notWhen: string[];
  solves: string[];
  introduces: string[];
  benefits: string[];
  costs: string[];
  interviewQuestions: string[];
  example: { title: string; flow: string; explanation: string };
  exercise: {
    scenario: string;
    options: {
      id: string;
      label: string;
      good: boolean;
      why: string;
      assumption: string;
    }[];
  };
};

export const BUILDING_BLOCKS: BuildingBlock[] = [
  {
    id: "dns",
    title: "DNS",
    nodeType: "external",
    oneLine: "Turns a stable name into the network address a client should contact.",
    problem: "Clients know api.example.com, but servers move, fail, and exist in several regions.",
    what: "A distributed naming system that returns records such as IP addresses or aliases and caches them for a time-to-live.",
    why: "It separates the public name from changing infrastructure and can steer users toward regions or failover targets.",
    useWhen: ["Every public service needs a stable name", "Traffic must move between regions", "Services discover one another by name"],
    notWhen: ["You need instant failover—cached records respect TTLs", "You need per-request load balancing inside one connection"],
    solves: ["Stable naming", "Coarse traffic steering", "Provider or region migration"],
    introduces: ["TTL propagation delay", "Resolver caching differences", "A control-plane dependency"],
    benefits: ["Infrastructure can move behind one name", "Reads are globally cached", "Supports geo and weighted routing"],
    costs: ["Changes are not immediate", "Misconfiguration can make everything unreachable", "Health-aware routing is coarse"],
    interviewQuestions: ["What TTL fits the failover goal?", "Who is authoritative for the zone?", "What happens when one region is unhealthy?"],
    example: {
      title: "Two-region API",
      flow: "Mobile app → DNS → nearest healthy region",
      explanation: "DNS selects a regional entry point; a load balancer handles individual requests inside that region.",
    },
    exercise: {
      scenario: "A service changes IP during every deployment. Mobile apps currently store that IP.",
      options: [
        { id: "dns", label: "Give the service a DNS name", good: true, why: "The stable name decouples clients from deployment addresses.", assumption: "If clients must switch in under a second, add a stable proxy or load balancer too." },
        { id: "cache", label: "Add a database cache", good: false, why: "A cache does not solve service discovery.", assumption: "A cache helps only if repeated data reads are the bottleneck." },
        { id: "hardcode", label: "Ship a new app for every IP", good: false, why: "Release cycles are much slower than infrastructure changes.", assumption: "This is only acceptable in a throwaway local environment." },
      ],
    },
  },
  {
    id: "load-balancer",
    title: "Load Balancer",
    nodeType: "load_balancer",
    oneLine: "Distributes traffic across healthy service instances.",
    problem: "One application server is overloaded and is also a single point of failure.",
    what: "A network or application-layer proxy that chooses a healthy backend for each connection or request.",
    why: "It lets compute scale horizontally and removes unhealthy instances without changing clients.",
    useWhen: ["More than one service instance exists", "Instances fail or deploy independently", "TLS or routing should be centralized"],
    notWhen: ["A single small server is enough", "The real bottleneck is one database", "State is trapped inside one backend session"],
    solves: ["Traffic distribution", "Health-based failover", "Horizontal compute scaling"],
    introduces: ["Another hop", "Health-check and timeout tuning", "A critical entry-point dependency"],
    benefits: ["Add/remove servers without client changes", "Automatic unhealthy-host removal", "Can centralize TLS and routing"],
    costs: ["Must itself be redundant", "Bad health checks cause outages", "Session affinity reduces flexibility"],
    interviewQuestions: ["Layer 4 or layer 7?", "Round robin, least connections, or weighted?", "How are long-lived sockets drained?"],
    example: {
      title: "Checkout API",
      flow: "Client → regional load balancer → checkout instance A/B/C",
      explanation: "Stateless instances can be added for a sale and removed after connections drain.",
    },
    exercise: {
      scenario: "CPU on one stateless API is 95%, while identical servers are easy to launch.",
      options: [
        { id: "lb", label: "Add a load balancer and more API instances", good: true, why: "The work is stateless and parallelizable.", assumption: "If requests depend on local session state, move that state first." },
        { id: "shard", label: "Shard the database immediately", good: false, why: "No database bottleneck was identified.", assumption: "Shard only after storage or query load is the limiting resource." },
        { id: "cdn", label: "Add a CDN for all API writes", good: false, why: "Dynamic writes are not generally edge-cacheable.", assumption: "A CDN helps if most pressure is cacheable static or read content." },
      ],
    },
  },
  {
    id: "application-servers",
    title: "Application Servers",
    nodeType: "service",
    oneLine: "Own product behavior, authorization, validation, and orchestration.",
    problem: "Clients need a trusted place to apply business rules and coordinate data or services.",
    what: "Stateless or stateful compute processes that expose APIs and execute product logic.",
    why: "They protect internal systems, enforce behavior consistently, and create a scaling boundary for compute.",
    useWhen: ["Business rules must be trusted", "Several data sources are coordinated", "Clients need a stable API"],
    notWhen: ["Static content can be served directly", "Simple event transforms fit an existing pipeline", "Logic is duplicated only to wrap a database"],
    solves: ["Trusted business logic", "API boundary", "Coordination across dependencies"],
    introduces: ["Compute scaling", "Deployments and versioning", "Timeout and retry behavior"],
    benefits: ["Central authorization and validation", "Can scale independently", "Hides internal topology"],
    costs: ["Adds a network hop", "Can become a monolith or chatty mesh", "Needs observability and safe deployments"],
    interviewQuestions: ["Can instances be stateless?", "Where does session state live?", "What is the timeout budget for dependencies?"],
    example: {
      title: "Photo metadata API",
      flow: "App → API service → metadata DB + object storage grant",
      explanation: "The API authorizes the upload and records metadata; the large file bypasses the API.",
    },
    exercise: {
      scenario: "A browser connects directly to a production database with an admin password.",
      options: [
        { id: "app", label: "Put an application API between client and database", good: true, why: "The API becomes the trusted policy and validation boundary.", assumption: "A tightly controlled internal tool may use a database proxy, but not public credentials." },
        { id: "replica", label: "Add a database replica", good: false, why: "Replication does not fix exposed credentials or policy.", assumption: "A replica helps after the read workload becomes the issue." },
        { id: "queue", label: "Queue every browser query", good: false, why: "A queue does not provide synchronous API semantics or authorization.", assumption: "Queue only work that can complete asynchronously." },
      ],
    },
  },
  {
    id: "database",
    title: "Database",
    nodeType: "database",
    oneLine: "Stores durable structured state and answers queries over it.",
    problem: "Product state must survive process restarts and support consistent reads or writes.",
    what: "A durable data system with a model, query interface, indexes, and explicit consistency guarantees.",
    why: "It provides persistence and correctness primitives that in-memory application instances cannot.",
    useWhen: ["State must survive failures", "Records are queried by keys or relationships", "Writes need constraints or transactions"],
    notWhen: ["Large immutable blobs belong in object storage", "A transient queue is the real requirement", "A cache can be rebuilt and durability is unnecessary"],
    solves: ["Durability", "Querying and indexing", "Transactions or consistency"],
    introduces: ["Schema and index decisions", "Storage bottlenecks", "Backup, migration, and recovery work"],
    benefits: ["Reliable source of truth", "Powerful query patterns", "Integrity constraints"],
    costs: ["Harder to scale than stateless compute", "Indexes accelerate reads but tax writes", "Schema changes need care"],
    interviewQuestions: ["Relational, document, key-value, or wide-column—and why?", "What is the partition key?", "Which writes require a transaction?"],
    example: {
      title: "Orders",
      flow: "Checkout service → orders database → outbox event",
      explanation: "Order and payment-attempt state use transactions; large invoices live outside the row.",
    },
    exercise: {
      scenario: "Orders, line items, payments, and refunds must remain consistent and are queried together.",
      options: [
        { id: "relational", label: "Start with a relational database", good: true, why: "Relationships and transactional updates match the workload.", assumption: "If writes become globally partitioned, the transaction boundary may need redesign." },
        { id: "blob", label: "Put every order in object storage only", good: false, why: "Object storage is poor for transactional updates and indexed queries.", assumption: "It is useful for immutable invoice files." },
        { id: "cache", label: "Use only a cache", good: false, why: "A cache is not the durable source of truth.", assumption: "Add one later for repeated catalog or order-status reads." },
      ],
    },
  },
  {
    id: "replication",
    title: "Database Replication",
    nodeType: "database",
    oneLine: "Keeps copies of data on more than one database node.",
    problem: "One database node limits read throughput and its failure stops the product.",
    what: "A process that ships committed changes from a leader or peer to additional nodes.",
    why: "Copies can serve reads, survive hardware loss, and support recovery or regional placement.",
    useWhen: ["Read traffic exceeds one node", "Database availability matters", "Recovery time must be short"],
    notWhen: ["The first node is not measured as a bottleneck", "The application requires instant global writes without conflict design", "A backup alone is being confused with a live replica"],
    solves: ["Read scaling", "Node redundancy", "Faster failover"],
    introduces: ["Replication lag", "Failover coordination", "Read-after-write surprises"],
    benefits: ["More read capacity", "A warm failover target", "Copies in another failure domain"],
    costs: ["Writes still concentrate on a leader in common designs", "Lag can return stale data", "Promotion can split brain"],
    interviewQuestions: ["Synchronous or asynchronous?", "How does a client get read-after-write?", "Who elects/promotes a leader?"],
    example: {
      title: "Product catalog",
      flow: "Catalog writer → primary → read replicas → browse APIs",
      explanation: "Rare catalog writes go to the primary; many browse reads tolerate slight lag.",
    },
    exercise: {
      scenario: "Product browse reads saturate the primary. Writes are rare and a few seconds of staleness is acceptable.",
      options: [
        { id: "replica", label: "Add read replicas and route browse queries", good: true, why: "The workload and staleness tolerance fit asynchronous replicas.", assumption: "If inventory must be exact, keep that read on the primary or a stronger path." },
        { id: "queue", label: "Queue browser reads", good: false, why: "Interactive reads need a synchronous response.", assumption: "Queues help asynchronous catalog indexing." },
        { id: "shard", label: "Shard before measuring replicas", good: false, why: "Sharding is more invasive and may not be needed.", assumption: "Shard when write or total data pressure exceeds one replication group." },
      ],
    },
  },
  {
    id: "cache",
    title: "Cache",
    nodeType: "cache",
    oneLine: "Keeps reusable data closer to the request path for a limited time.",
    problem: "Repeated read-heavy queries make the database slow and expensive.",
    what: "A faster, usually less durable copy of data addressed by a key and governed by eviction and freshness rules.",
    why: "It can turn repeated expensive work into a fast lookup while shielding the source of truth.",
    useWhen: ["The same data is read repeatedly", "Some staleness is acceptable", "The source can rebuild the value"],
    notWhen: ["Almost every read is unique", "Values must always reflect the latest write", "The database is not the measured bottleneck"],
    solves: ["Read latency", "Database load", "Hot reusable computation"],
    introduces: ["Stale values", "Invalidation complexity", "Stampedes and hot keys"],
    benefits: ["Fast reads", "Lower source load", "Graceful reuse during spikes"],
    costs: ["Two places can disagree", "Cold starts and evictions hurt", "Another stateful service"],
    interviewQuestions: ["Cache-aside, read-through, or write-through?", "What is the TTL?", "How do you stop a miss stampede?"],
    example: {
      title: "Viral short link",
      flow: "Redirect API → mapping cache → mappings DB",
      explanation: "The hot code stays in cache; misses are coalesced before reaching the database.",
    },
    exercise: {
      scenario: "The same public product page is read 50,000 times per minute and changes twice per day.",
      options: [
        { id: "cache", label: "Cache the rendered/product data with an expiry", good: true, why: "High reuse and low change frequency make caching valuable.", assumption: "If price must update instantly, invalidate or separate that field." },
        { id: "shard", label: "Shard product rows first", good: false, why: "Sharding does not exploit repeated reads and adds routing complexity.", assumption: "It may be needed later if the full dataset or writes outgrow one group." },
        { id: "queue", label: "Put page reads in a queue", good: false, why: "Users need synchronous responses.", assumption: "A queue can precompute pages after catalog changes." },
      ],
    },
  },
  {
    id: "cdn",
    title: "CDN",
    nodeType: "cdn",
    oneLine: "Serves cacheable bytes from edge locations near users.",
    problem: "Global users fetch the same large static content from one distant origin.",
    what: "A geographically distributed cache for HTTP content, usually backed by object storage or an application origin.",
    why: "It reduces round-trip distance, origin bandwidth, and repeated transfer of popular content.",
    useWhen: ["Images, scripts, video segments, or public responses are reusable", "Users are geographically distributed", "Origin egress is high"],
    notWhen: ["Every response is private and unique", "Writes require the source of truth", "Cache rules cannot prevent data leakage"],
    solves: ["Global delivery latency", "Origin bandwidth", "Flash-crowd protection"],
    introduces: ["Purge and versioning behavior", "Regional cache misses", "Security-sensitive cache keys"],
    benefits: ["Lower latency near users", "Massive read fan-out", "Origin shielding"],
    costs: ["Content can be stale", "Cache configuration mistakes leak data", "Misses still reach origin"],
    interviewQuestions: ["Push or pull?", "What is in the cache key?", "How do you invalidate or version content?"],
    example: {
      title: "Video playback",
      flow: "Player → edge CDN → origin shield → object storage",
      explanation: "Popular segments stay at the edge; the shield coalesces regional misses.",
    },
    exercise: {
      scenario: "Users worldwide download the same 4 MB app bundle from one region.",
      options: [
        { id: "cdn", label: "Serve versioned bundles through a CDN", good: true, why: "The bytes are immutable and heavily reused.", assumption: "Dynamic personalized HTML may need separate cache rules." },
        { id: "replica", label: "Add database read replicas", good: false, why: "The bottleneck is static byte delivery, not database reads.", assumption: "Replicas help if page generation is query-bound." },
        { id: "queue", label: "Queue downloads", good: false, why: "Downloads are synchronous transfers.", assumption: "A queue may build the bundle, not serve it." },
      ],
    },
  },
  {
    id: "message-queue",
    title: "Message Queue",
    nodeType: "queue",
    oneLine: "Buffers work so producers and consumers do not have to succeed at the same moment.",
    problem: "Slow or bursty work blocks user requests and couples two services’ availability.",
    what: "A durable handoff where producers publish jobs/events and consumers process them asynchronously.",
    why: "It absorbs spikes, isolates failures, and lets worker capacity scale independently.",
    useWhen: ["The user need not wait for completion", "Traffic arrives faster than work can briefly finish", "Retries need a durable place"],
    notWhen: ["The caller needs an immediate answer", "Strict cross-service transactions are assumed", "Ordering semantics are undefined"],
    solves: ["Temporal decoupling", "Burst buffering", "Durable retries"],
    introduces: ["Duplicates", "Lag and backlogs", "Ordering and poison-message handling"],
    benefits: ["Fast request acknowledgement", "Independent worker scaling", "Failure isolation"],
    costs: ["Eventual completion", "At-least-once means idempotency", "Backlog visibility is required"],
    interviewQuestions: ["At-most-once or at-least-once?", "What is the partition/order key?", "Where do poison jobs go?"],
    example: {
      title: "Video processing",
      flow: "Upload complete → transcode queue → worker fleet",
      explanation: "Uploads finish quickly while expensive encoding scales with queue depth.",
    },
    exercise: {
      scenario: "Sending email takes 2 seconds and the vendor is sometimes unavailable. Signup should respond in 200 ms.",
      options: [
        { id: "queue", label: "Commit signup, enqueue email, return", good: true, why: "Email can complete asynchronously and retry safely.", assumption: "The job needs an idempotency key to avoid duplicate sends." },
        { id: "sync", label: "Retry the vendor inside signup forever", good: false, why: "Vendor availability now controls signup latency.", assumption: "A short synchronous attempt is only justified if email is required before success." },
        { id: "cdn", label: "Put email behind a CDN", good: false, why: "A CDN caches HTTP reads; it does not execute durable work.", assumption: "It could host email image assets." },
      ],
    },
  },
  {
    id: "object-storage",
    title: "Object Storage",
    nodeType: "storage",
    oneLine: "Durably stores large immutable blobs under keys.",
    problem: "Images, videos, backups, and documents are too large for application servers or database rows.",
    what: "A highly durable blob store accessed by object key, often with multipart upload and lifecycle policies.",
    why: "It separates huge byte traffic from metadata queries and scales capacity independently.",
    useWhen: ["Files are large", "Whole-object access is common", "Durability matters more than in-place updates"],
    notWhen: ["Rows need joins or transactions", "Tiny random updates dominate", "Low-latency key-value access is required"],
    solves: ["Durable blob storage", "Independent byte scaling", "Direct upload/download"],
    introduces: ["Metadata must live elsewhere", "Eventual workflows after upload", "Orphan cleanup and access grants"],
    benefits: ["Very high durability", "Elastic capacity", "Integrates with CDNs and lifecycle rules"],
    costs: ["Not a relational query engine", "Whole-object semantics", "Access control and signed URLs need care"],
    interviewQuestions: ["Direct or proxied upload?", "How are multipart uploads finalized?", "How do metadata and object versions stay consistent?"],
    example: {
      title: "Cloud files",
      flow: "Client → signed multipart upload → object storage; metadata → database",
      explanation: "The API coordinates identity and versions without carrying the file bytes.",
    },
    exercise: {
      scenario: "A photo app sends 20 MB images through API servers and stores them in SQL rows.",
      options: [
        { id: "object", label: "Direct-upload images to object storage", good: true, why: "Large bytes bypass compute and relational storage.", assumption: "Keep ownership, dimensions, and object key in the database." },
        { id: "cache", label: "Keep all images in an in-memory cache", good: false, why: "A cache is costly and not the durable source.", assumption: "Cache only hot transformed thumbnails if measured." },
        { id: "shard", label: "Shard the image table only", good: false, why: "It retains the wrong storage and transfer path.", assumption: "Shard metadata later if its workload demands it." },
      ],
    },
  },
  {
    id: "search",
    title: "Search",
    nodeType: "search",
    oneLine: "Builds a read-optimized index for relevance, text, filters, and retrieval.",
    problem: "Primary storage cannot answer full-text or ranked retrieval quickly enough.",
    what: "A derived index that tokenizes fields and organizes them for fast text, filter, or vector lookup.",
    why: "It serves query patterns that transactional databases are not optimized to rank.",
    useWhen: ["Full-text relevance matters", "Facets or typo tolerance are needed", "A derived eventually consistent view is acceptable"],
    notWhen: ["Exact primary-key lookup is enough", "Search results must be transactionally current", "The dataset is tiny and SQL search is sufficient"],
    solves: ["Text retrieval", "Ranking", "Faceting and filtering"],
    introduces: ["Indexing lag", "A second data representation", "Rebuild and relevance tuning"],
    benefits: ["Fast rich queries", "Relevance scoring", "Scales reads separately"],
    costs: ["Not usually the source of truth", "Updates are asynchronous", "Operational and tuning complexity"],
    interviewQuestions: ["How does the index receive changes?", "What consistency is acceptable?", "How are shards and replicas chosen?"],
    example: {
      title: "Marketplace search",
      flow: "Catalog DB → change stream → indexer → search cluster → API",
      explanation: "Product truth remains in the database; the search index is a rebuildable read model.",
    },
    exercise: {
      scenario: "Users need typo-tolerant product search with relevance and category facets.",
      options: [
        { id: "search", label: "Build a derived search index", good: true, why: "The query needs ranking, text analysis, and facets.", assumption: "If the catalog is tiny, database text search may be enough initially." },
        { id: "cache", label: "Cache every possible query", good: false, why: "The query space is huge and caching does not create relevance.", assumption: "Cache only the hottest completed searches later." },
        { id: "queue", label: "Return results from a queue", good: false, why: "Queues do not answer interactive retrieval.", assumption: "Use one to update the index asynchronously." },
      ],
    },
  },
  {
    id: "sharding",
    title: "Sharding",
    nodeType: "database",
    oneLine: "Splits one logical dataset across independently scalable partitions.",
    problem: "One database group cannot hold or process the full write and data volume.",
    what: "A routing rule maps each record or request to one of several storage partitions.",
    why: "It spreads storage and throughput beyond one machine or replication group.",
    useWhen: ["Data or write throughput exceeds vertical/replica limits", "A stable partition key exists", "Most operations stay within one partition"],
    notWhen: ["Read replicas or indexes solve the measured issue", "Transactions frequently cross the proposed key", "The team cannot operate rebalancing safely"],
    solves: ["Write scaling", "Dataset size", "Failure-domain isolation"],
    introduces: ["Routing and resharding", "Hot partitions", "Cross-shard queries and transactions"],
    benefits: ["Independent partition capacity", "Parallel writes", "Smaller indexes per shard"],
    costs: ["Hard migrations", "Global constraints are difficult", "Bad keys create hotspots"],
    interviewQuestions: ["What is the shard key?", "How do you add a shard?", "How are cross-shard reads aggregated?"],
    example: {
      title: "Tenant events",
      flow: "Event API → shard router → hash(tenant_id) → shard group",
      explanation: "Most tenant queries remain local; oversized tenants can receive dedicated partitions.",
    },
    exercise: {
      scenario: "A multi-tenant event store exceeds one database. Almost every query is for one tenant.",
      options: [
        { id: "tenant", label: "Shard by tenant ID", good: true, why: "The key matches query locality and spreads ordinary tenants.", assumption: "Very large tenants need splitting or dedicated shards." },
        { id: "time", label: "Shard only by event timestamp", good: false, why: "Current writes converge on one time partition and tenant reads fan out.", assumption: "Time partitions can help retention within a tenant-aware scheme." },
        { id: "random", label: "Choose a random shard per event", good: false, why: "Tenant reads must query every shard.", assumption: "Random placement fits only when reads already know exact object locations." },
      ],
    },
  },
  {
    id: "consistent-hashing",
    title: "Consistent Hashing",
    nodeType: "cache",
    oneLine: "Places keys so fleet changes move only a slice of them.",
    problem: "Modulo hashing remaps nearly every key when a cache or shard node is added.",
    what: "Keys and node positions share a hash space; a key is owned by the next eligible node, often through many virtual positions.",
    why: "It limits data movement and cache misses while a partition fleet changes.",
    useWhen: ["Nodes join/leave regularly", "Key placement can be computed", "Partial remapping matters"],
    notWhen: ["A managed datastore already owns partitioning", "Range scans are primary", "The problem is one globally hot key"],
    solves: ["Stable key placement", "Incremental rebalancing", "Decentralized routing"],
    introduces: ["Membership distribution", "Virtual-node tuning", "Temporary disagreement during changes"],
    benefits: ["Small remapped range", "Weighted nodes", "Natural successor replicas"],
    costs: ["More placement metadata", "Does not solve popularity skew", "Membership rollout affects correctness"],
    interviewQuestions: ["Why virtual nodes?", "Who owns membership?", "What happens when clients disagree on the ring?"],
    example: {
      title: "Cache fleet expansion",
      flow: "API hashes item key → ring → cache owner",
      explanation: "Adding two cache nodes moves nearby ranges rather than invalidating the full cache.",
    },
    exercise: {
      scenario: "Adding a ninth cache node makes an eight-node modulo cache miss almost every key.",
      options: [
        { id: "ring", label: "Use consistent hashing with virtual nodes", good: true, why: "Only neighboring ranges move when membership changes.", assumption: "A hot key still needs replication or request coalescing." },
        { id: "bigger", label: "Make every cache node larger forever", good: false, why: "It avoids one change but does not create elastic placement.", assumption: "Vertical scaling may be a short-term bridge." },
        { id: "queue", label: "Queue all cache reads", good: false, why: "It adds latency and does not stabilize placement.", assumption: "A queue may warm keys asynchronously after movement." },
      ],
    },
  },
  {
    id: "rate-limiter",
    title: "Rate Limiter",
    nodeType: "gateway",
    oneLine: "Makes a fast allow-or-reject decision to protect a scarce resource.",
    problem: "One caller or traffic spike can starve shared capacity, amplify abuse, or explode vendor cost.",
    what: "A policy and counter system that limits actions per identity over a window or refill model.",
    why: "It keeps overload predictable and divides capacity according to product or security rules.",
    useWhen: ["Shared APIs need fair use", "Expensive operations need a cap", "Abuse or retry storms are possible"],
    notWhen: ["It is being used instead of adding required capacity", "Caller identity is unreliable", "No fallback behavior is defined"],
    solves: ["Resource starvation", "Abuse containment", "Cost and fairness controls"],
    introduces: ["False rejection", "Counter consistency", "Fail-open versus fail-closed decisions"],
    benefits: ["Protects downstream systems", "Makes limits explicit", "Rejects work early"],
    costs: ["Adds latency to every checked request", "Distributed counters can overshoot", "Rules require tuning"],
    interviewQuestions: ["Token bucket or window—and why?", "What is the counter key?", "What happens when counter storage fails?"],
    example: {
      title: "Login protection",
      flow: "Client → gateway limiter → auth API; counters keyed by account + IP",
      explanation: "The limiter applies layered rules and returns a retry delay without invoking password verification.",
    },
    exercise: {
      scenario: "A password-reset vendor charges per call and bots trigger thousands of requests per account.",
      options: [
        { id: "limit", label: "Add account/IP rate limits before the vendor call", good: true, why: "The limiter rejects abusive work before cost is incurred.", assumption: "Support legitimate recovery with clear retry behavior and abuse review." },
        { id: "cache", label: "Cache every reset request as successful", good: false, why: "That breaks correctness and does not define fair use.", assumption: "Cache only safe, reusable metadata." },
        { id: "replica", label: "Add a database replica", good: false, why: "The scarce resource is the paid vendor call.", assumption: "A replica helps only if account lookup is separately read-bound." },
      ],
    },
  },
];

export function getBuildingBlock(id: string) {
  return BUILDING_BLOCKS.find((item) => item.id === id);
}

export function buildingBlockHref(id: string) {
  return `/learn/concepts/${id}`;
}
