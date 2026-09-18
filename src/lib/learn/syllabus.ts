export type LessonChoice = {
  id: string;
  label: string;
  correct: boolean;
  feedback: string;
};

export type LessonSection = {
  heading: string;
  body: string;
  bullets?: string[];
};

export type Lesson = {
  slug: string;
  title: string;
  minutes: number;
  summary: string;
  sections: LessonSection[];
  takeaways: string[];
  check?: {
    question: string;
    choices: LessonChoice[];
  };
  practiceStepIds?: string[];
  diagram: "single" | "split" | "fleet" | "replica" | "cache" | "cdn" | "stateless" | "regions" | "queue" | "shards" | "ops";
};

export type SyllabusModule = {
  id: string;
  title: string;
  summary: string;
  lessons: Lesson[];
};

export const SYLLABUS: SyllabusModule[] = [
  {
    id: "one-machine",
    title: "One machine",
    summary: "Ship the smallest thing that works: a user, DNS, and a single process.",
    lessons: [
      {
        slug: "single-server",
        title: "Everything on one box",
        minutes: 5,
        summary:
          "A new product can live on one computer. You still need to know how a request finds that computer.",
        diagram: "single",
        practiceStepIds: ["one-box"],
        sections: [
          {
            heading: "Start smaller than you think",
            body: "Before load balancers and shards, a working system is often one process that serves pages and stores data on the same disk. That is allowed. It is also a single place to fail, so you treat it as a starting point, not a destination.",
          },
          {
            heading: "How a request arrives",
            body: "People type a hostname, not an IP. A DNS lookup turns the name into an address. The browser or mobile app then speaks HTTP to whatever is listening there. The server answers with HTML for a page or JSON for an API.",
            bullets: [
              "DNS is usually someone else’s service. Your box does not have to host it.",
              "Web clients mix server-rendered pages with browser code. Mobile clients usually talk HTTP and parse JSON.",
              "One public IP means every user, web or mobile, shares the same failure domain.",
            ],
          },
          {
            heading: "What this does not solve",
            body: "CPU, memory, and disk are capped by that one machine. A reboot takes the product offline. You will add pieces later — but only when this design actually hurts.",
          },
        ],
        takeaways: [
          "One box is a valid v1 if you understand the request path.",
          "DNS maps names to IPs; HTTP carries the actual work.",
          "Web and mobile can share the same origin. They still share the same outage.",
        ],
        check: {
          question: "A user opens photos.example.com. What happens first?",
          choices: [
            {
              id: "dns",
              label: "The hostname is resolved to an IP, then HTTP talks to that machine",
              correct: true,
              feedback: "Yes. Name first, then the protocol. The box never sees a request until DNS answers.",
            },
            {
              id: "lb",
              label: "A load balancer picks a healthy server automatically",
              correct: false,
              feedback: "There is no balancer yet. One IP, one process.",
            },
            {
              id: "cdn",
              label: "A CDN always terminates the request before it reaches origin",
              correct: false,
              feedback: "An edge cache is a later optimization. v1 can skip it.",
            },
          ],
        },
      },
    ],
  },
  {
    id: "split-stack",
    title: "Split compute from data",
    summary: "Pages and rows should not share a process — or a public network.",
    lessons: [
      {
        slug: "split-web-db",
        title: "Give data its own machine",
        minutes: 5,
        summary:
          "When queries stall page renders, move storage off the app process and off the public internet.",
        diagram: "split",
        practiceStepIds: ["split-data"],
        sections: [
          {
            heading: "Why the split",
            body: "A heavy query should not freeze HTML. A crashed app should not take the only copy of user data with it. Separate the web tier from the data tier so each can scale, fail, and be secured on its own.",
          },
          {
            heading: "Keep the database private",
            body: "Browsers talk to the app. The app talks to the database. If clients can open a SQL port, you have both a security hole and a coupling you cannot evolve. Private IPs (or a VPC) are part of the architecture, not an ops afterthought.",
          },
        ],
        takeaways: [
          "App servers are the public door. Databases are not.",
          "Independent scaling starts with independent processes.",
          "A direct browser-to-database line is a failed check, not a shortcut.",
        ],
        check: {
          question: "After the split, who is allowed to open a connection to the database?",
          choices: [
            {
              id: "app",
              label: "Only the application servers, on a private network",
              correct: true,
              feedback: "That is the whole point of the split: one public surface, one private store.",
            },
            {
              id: "clients",
              label: "Browsers, so the app can stay thin",
              correct: false,
              feedback: "Then every user is a DBA. Do not do this.",
            },
            {
              id: "dns",
              label: "DNS, because it already knows the IPs",
              correct: false,
              feedback: "DNS answers names. It should not be on the data path.",
            },
          ],
        },
      },
      {
        slug: "sql-or-not",
        title: "Pick a store that matches the data",
        minutes: 6,
        summary:
          "Relational, document, and object stores are not interchangeable. Match the queries you will actually run.",
        diagram: "split",
        practiceStepIds: ["sql-vs-docs"],
        sections: [
          {
            heading: "Ask what you query together",
            body: "Users, posts, comments, and likes are related records that you will join and that should succeed or fail as a unit. A relational database is a strong default there. A document store shines when a blob is mostly self-contained. Object storage is for files — photos, videos — not for “did this user like that post?”",
          },
          {
            heading: "You can mix later",
            body: "Many production systems keep relational data for the core graph and put large media in object storage. That is a split of concerns, not a religion. Do not pick a store because the API happens to return JSON.",
          },
        ],
        takeaways: [
          "Relationships + transactions → start with SQL.",
          "Self-contained documents can live in a document store.",
          "Blobs belong in object storage. They are not your source of truth for likes.",
        ],
        check: {
          question: "Comments and likes must apply once and be queried with the post. First store?",
          choices: [
            {
              id: "rel",
              label: "A relational database",
              correct: true,
              feedback: "Joins and a unique constraint are boring — and correct.",
            },
            {
              id: "obj",
              label: "Object storage only, because the product is photos",
              correct: false,
              feedback: "Keep the bytes in object storage. Keep the graph in a real database.",
            },
            {
              id: "mem",
              label: "In-process memory until you have traffic",
              correct: false,
              feedback: "A restart wipes the product. Durability is not a luxury at v1.",
            },
          ],
        },
      },
    ],
  },
  {
    id: "web-tier",
    title: "Scale the web tier",
    summary: "A bigger box has a ceiling. More boxes need something in front.",
    lessons: [
      {
        slug: "up-then-out",
        title: "A bigger box, then more boxes",
        minutes: 5,
        summary:
          "Vertical scaling is a valid first move. Horizontal scaling is how you get past one machine’s limits.",
        diagram: "fleet",
        practiceStepIds: ["up-or-out"],
        sections: [
          {
            heading: "Scale up",
            body: "Buying more CPU, RAM, or disk on the same host is simple. No new topology. It still leaves you with one machine to patch, one machine to reboot, and a price/performance wall.",
          },
          {
            heading: "Scale out",
            body: "Run more app processes. Traffic can spread. A dead box is no longer the whole site — if something in front of the fleet can stop sending it work. DNS round-robin is a blunt substitute: weak health checks, ugly caches, ugly failover.",
          },
        ],
        takeaways: [
          "Vertical scaling is a tactic, not an architecture.",
          "Horizontal scaling needs a way to pick a healthy server.",
          "One larger disk does not retire sharding forever.",
        ],
        check: {
          question: "The only app server is pegged. Why isn’t “buy a larger one” the whole answer?",
          choices: [
            {
              id: "ceiling",
              label: "Hardware and cost hit a ceiling, and you still have one failure domain",
              correct: true,
              feedback: "Scale up until it is awkward, then scale out on purpose.",
            },
            {
              id: "dns",
              label: "Two A records are always better than a load balancer",
              correct: false,
              feedback: "DNS is not a health-checked proxy.",
            },
            {
              id: "never",
              label: "You should never scale up; always start with ten services",
              correct: false,
              feedback: "A bigger box is a fine first move. Just know its limit.",
            },
          ],
        },
      },
      {
        slug: "load-balancer",
        title: "Put a balancer in front",
        minutes: 6,
        summary:
          "Clients should hit one public door. App servers should live on private IPs and come and go.",
        diagram: "fleet",
        practiceStepIds: ["balance-the-fleet"],
        sections: [
          {
            heading: "One public address",
            body: "The load balancer owns the public IP. It fans out to app servers, skips the sick ones, and lets you add capacity without telling every client. App servers get private addresses so the internet cannot poke them directly.",
          },
          {
            heading: "What it is not",
            body: "A balancer does not make a stateful server safe. If sessions live in one process’s memory, you will be tempted to pin users to that process — and then that process dying logs them out. Shared state comes next.",
          },
        ],
        takeaways: [
          "Public traffic → balancer → private app servers.",
          "Health checks matter more than “two DNS records.”",
          "The web tier still needs to be interchangeable.",
        ],
        check: {
          question: "Where should a browser send HTTPS after you add a fleet?",
          choices: [
            {
              id: "lb",
              label: "To the load balancer, which picks a private app server",
              correct: true,
              feedback: "One door. Many rooms. Clients never learn the private IPs.",
            },
            {
              id: "each",
              label: "Straight to each app server, round-robin in the client",
              correct: false,
              feedback: "Then every app is public, and clients become your balancer.",
            },
            {
              id: "db",
              label: "To the database, to skip the extra hop",
              correct: false,
              feedback: "Never.",
            },
          ],
        },
      },
    ],
  },
  {
    id: "data-copies",
    title: "Copies of the database",
    summary: "Reads can spread. Writes still need a story when the primary dies.",
    lessons: [
      {
        slug: "replicas",
        title: "Primary and replicas",
        minutes: 6,
        summary:
          "Replication helps read throughput and disaster recovery. It is not a partition of the data.",
        diagram: "replica",
        practiceStepIds: ["replica"],
        sections: [
          {
            heading: "Who takes writes",
            body: "In the usual primary/replica setup, changes go to one primary. Replicas replay those changes and serve reads. That spreads query load and gives you another copy if a disk dies — after you actually fail over.",
          },
          {
            heading: "What you still owe",
            body: "Replication lag is real. A read-your-writes user may see yesterday’s profile if you send them to a replica too soon. Failover is an operation, not a diagram arrow. And two copies of the same dataset are high availability, not sharding.",
          },
        ],
        takeaways: [
          "Writes → primary. Reads can fan out to replicas.",
          "Replicas improve parallelism. They do not split the keyspace.",
          "Plan lag and failover before you celebrate “we have slaves.”",
        ],
        check: {
          question: "You added two replicas. Where do profile updates go?",
          choices: [
            {
              id: "primary",
              label: "To the primary; replicas catch up and help with reads",
              correct: true,
              feedback: "That is the contract until you change the model.",
            },
            {
              id: "any",
              label: "To any replica, because they are all databases",
              correct: false,
              feedback: "Uncoordinated writes to replicas is how you get split brains.",
            },
            {
              id: "cache-only",
              label: "Only to cache, so the database stays quiet",
              correct: false,
              feedback: "Cache is not durable truth.",
            },
          ],
        },
      },
    ],
  },
  {
    id: "faster-reads",
    title: "Faster reads",
    summary: "Cache what is hot. Keep static bytes near users. Remember the new failure modes.",
    lessons: [
      {
        slug: "cache-layer",
        title: "A cache in front of the database",
        minutes: 7,
        summary:
          "Hot keys should not hit disk every time. TTL, invalidation, eviction, and “what if cache dies” are part of the design.",
        diagram: "cache",
        practiceStepIds: ["cache", "cache-miss"],
        sections: [
          {
            heading: "Read path",
            body: "The app asks the cache first. A hit returns immediately. A miss loads the database and fills the cache. This only helps if the same keys come back — profiles, feeds, session blobs — not unique writes.",
          },
          {
            heading: "Stale data is a choice",
            body: "A time-to-live (TTL) expires keys automatically. On write you can also delete or overwrite the key so the next read is fresh. If you do neither, users will see ghosts. If you do both poorly, you will stampede the database.",
          },
          {
            heading: "Eviction and SPOF",
            body: "When memory is full, a policy such as least-recently-used (LRU) drops cold keys. That is normal. A dead cache is not: every request falls through to the database at once. Treat cache as optional speed. The durable copy still lives on disk. Have a plan for the thundering herd.",
          },
        ],
        takeaways: [
          "Cache sits on the read path, not as the source of truth.",
          "TTL and explicit invalidation are how you live with copies.",
          "A missing cache is a load spike. Design the fallback.",
        ],
        check: {
          question: "The cache cluster vanishes. The next profile read should…",
          choices: [
            {
              id: "db",
              label: "Hit the database, accept extra latency, and watch for overload",
              correct: true,
              feedback: "Cache is speed. Disk is truth. Protect the disk if everyone misses.",
            },
            {
              id: "wait",
              label: "Wait until cache returns, to avoid ever serving stale data",
              correct: false,
              feedback: "That turns a cache outage into a total outage.",
            },
            {
              id: "ttl",
              label: "Do nothing — a TTL means cache cannot be a single point of failure",
              correct: false,
              feedback: "TTL expires keys. It does not keep the process alive.",
            },
          ],
        },
      },
      {
        slug: "edge-cdn",
        title: "Static bytes at the edge",
        minutes: 6,
        summary:
          "Photos, CSS, and scripts should not ride your origin around the world. Invalidation and versioning keep the edge honest.",
        diagram: "cdn",
        practiceStepIds: ["cdn"],
        sections: [
          {
            heading: "What a CDN is for",
            body: "An edge cache stores copies of files close to users. Origin keeps dynamic HTML and APIs. Object storage is a common origin for uploads; the CDN is the public face.",
          },
          {
            heading: "When a file changes",
            body: "You can purge an object through the vendor’s API, or you can change the URL (a version query or a new filename) so caches treat it as a different object. Purging is precise and easy to get wrong globally. Versioning is simple and leaves old URLs cached until they age out.",
          },
        ],
        takeaways: [
          "Dynamic API traffic still hits your balancer. Static assets need not.",
          "Purge or version — pick one on purpose.",
          "A CDN does not replace cache in front of the database.",
        ],
        check: {
          question: "A user updates their avatar. How do you stop the edge from serving the old file?",
          choices: [
            {
              id: "purge-or-version",
              label: "Purge that object, or publish it under a new URL/version",
              correct: true,
              feedback: "Those are the two honest tools. Hope is not a third.",
            },
            {
              id: "reboot",
              label: "Restart the app servers so memory is clean",
              correct: false,
              feedback: "The edge does not live in your app process.",
            },
            {
              id: "sql",
              label: "DELETE FROM photos; the CDN will notice",
              correct: false,
              feedback: "The CDN will notice nothing until you invalidate or change the URL.",
            },
          ],
        },
      },
    ],
  },
  {
    id: "interchangeable",
    title: "Interchangeable servers",
    summary: "If any app box can handle any request, you can autoscale. Sticky sessions fight that.",
    lessons: [
      {
        slug: "stateless-web",
        title: "Keep session state out of the web tier",
        minutes: 6,
        summary:
          "Sticky sessions pin a user to one box. A shared store makes every box cattle.",
        diagram: "stateless",
        practiceStepIds: ["stateless"],
        sections: [
          {
            heading: "The sticky trap",
            body: "If login state lives in one server’s RAM, the balancer has to send that user back to the same server. That box dying logs a slice of users out. You also cannot add or remove servers freely — the new box has no memory of anyone.",
          },
          {
            heading: "Shared session store",
            body: "Put sessions in a cache or database every app server can reach. Then any process can serve the next request. Autoscaling becomes “add a box, take a box away.” Signed session ids in cookies are fine. Passwords in cookies are not.",
          },
        ],
        takeaways: [
          "Stateless web tier = any server, any request.",
          "Shared cache/DB for sessions beats sticky routing.",
          "Autoscaling only works after state has left the process.",
        ],
        check: {
          question: "Sessions are in one app server’s memory. The better next step is…",
          choices: [
            {
              id: "shared",
              label: "Move them to a shared cache or database",
              correct: true,
              feedback: "Then the balancer can treat servers as interchangeable.",
            },
            {
              id: "stickier",
              label: "Make sticky sessions stricter",
              correct: false,
              feedback: "That makes the outage worse.",
            },
            {
              id: "one",
              label: "Go back to one app server",
              correct: false,
              feedback: "That throws away the fleet you just built.",
            },
          ],
        },
      },
    ],
  },
  {
    id: "regions",
    title: "More than one region",
    summary: "A second data center is latency and disaster recovery — and a data-sync problem.",
    lessons: [
      {
        slug: "multi-dc",
        title: "Traffic and data across data centers",
        minutes: 7,
        summary:
          "GeoDNS can send users to a nearby region. Failover only works if the data they need is actually there.",
        diagram: "regions",
        sections: [
          {
            heading: "Why a second site",
            body: "One building still burns, floods, or loses power. A second data center lets you fail away from that building and serve people closer to where they live. That is a different problem from “two app servers in one rack.”",
          },
          {
            heading: "Sending traffic",
            body: "GeoDNS (or anycast) can answer a hostname with the address of a nearby healthy site. If a region dies, you want a control that shifts 100% of traffic to the living one — on purpose, not by accident.",
          },
          {
            heading: "Sending data",
            body: "Users in different regions may have been writing to local databases and caches. Fail over blindly and they will read empty or stale state. Replication across sites, conflict rules, and “what is allowed to be local” are the hard part. The diagram is the easy part.",
          },
        ],
        takeaways: [
          "Multi-DC is failover and latency, not just more boxes.",
          "DNS can steer traffic. It cannot invent missing rows.",
          "Caches and databases must have a cross-region story before you cut over.",
        ],
        check: {
          question: "US-West is down. You steer every user to US-East. What must already be true?",
          choices: [
            {
              id: "synced",
              label: "The data those users need is already in East, or you accept what is missing",
              correct: true,
              feedback: "Traffic steering without data is a well-lit empty room.",
            },
            {
              id: "dns-only",
              label: "GeoDNS alone copies the databases during the outage",
              correct: false,
              feedback: "DNS changes answers. It does not replicate disks.",
            },
            {
              id: "sticky",
              label: "Sticky sessions will keep each user on their original region",
              correct: false,
              feedback: "The original region is gone. Stickiness cannot resurrect it.",
            },
          ],
        },
      },
    ],
  },
  {
    id: "async",
    title: "Work that can wait",
    summary: "The HTTP response should not wait on thumbnails, emails, or other slow jobs.",
    lessons: [
      {
        slug: "queues",
        title: "Queue the slow path",
        minutes: 6,
        summary:
          "Producers enqueue. Consumers work. Each side scales on its own. Jobs are not free.",
        diagram: "queue",
        practiceStepIds: ["queue"],
        sections: [
          {
            heading: "Off the request path",
            body: "Uploading a photo should return quickly. Generating sizes, notifying followers, or sending mail can happen after. The web tier publishes a job; workers pull jobs and do the heavy lifting.",
          },
          {
            heading: "Independent scale",
            body: "If the queue grows, add workers. If it is empty, run fewer. The web fleet does not have to match the worker fleet. At-least-once delivery is the usual contract — make handlers idempotent so a retry does not double-send mail.",
          },
        ],
        takeaways: [
          "User-facing HTTP should not wait on slow, retryable work.",
          "Queue length is a scaling signal for workers.",
          "Retries happen. Design for at-least-once.",
        ],
        check: {
          question: "Thumbnails make uploads slow. Where does that work belong?",
          choices: [
            {
              id: "queue",
              label: "On a queue, consumed by workers after the HTTP response returns",
              correct: true,
              feedback: "The user asked to upload, not to stare at a transcode.",
            },
            {
              id: "inline",
              label: "In the upload handler, so the file is definitely ready",
              correct: false,
              feedback: "Then peak hour makes every upload wait on CPU you could scale separately.",
            },
            {
              id: "browser",
              label: "In the browser, so the server stays simple",
              correct: false,
              feedback: "You cannot trust the client to finish, and phones should not transcode your catalog.",
            },
          ],
        },
      },
    ],
  },
  {
    id: "partition",
    title: "Partition the data",
    summary: "When one primary cannot hold the writes, you split the keyspace — carefully.",
    lessons: [
      {
        slug: "sharding",
        title: "Shard keys, hotspots, and joins",
        minutes: 8,
        summary:
          "A shard is a slice of the data, not another replica. The key you pick will haunt resharding.",
        diagram: "shards",
        practiceStepIds: ["shards"],
        sections: [
          {
            heading: "What sharding is",
            body: "You split rows across several databases so no single disk owns everything. Each shard has its own primary (and maybe its own replicas). This is how you grow writes, not just reads.",
          },
          {
            heading: "Pick a key that spreads",
            body: "A user id often distributes load. A monotonic timestamp, “status = active”, or a celebrity creator id can pin almost all traffic to one shard — a hotspot. Once a key is in production, moving rows between shards (resharding) is a migration, not a config flag.",
          },
          {
            heading: "Queries get harder",
            body: "Joins across shards are expensive or impossible. You either denormalize, query in two steps, or keep related rows on the same shard on purpose. Secondary indexes, unique constraints, and transactions also stop being global.",
          },
        ],
        takeaways: [
          "Replicas copy. Shards split.",
          "The shard key must spread load and match how you look data up.",
          "Cross-shard joins, uniqueness, and resharding are the cost of the split.",
        ],
        check: {
          question: "Which key is most likely to create a hotspot?",
          choices: [
            {
              id: "time",
              label: "Created-at timestamp, so new rows always land on “the latest” shard",
              correct: true,
              feedback: "New activity piles onto one partition. Spread with something like user id instead.",
            },
            {
              id: "userid",
              label: "A well-distributed user id",
              correct: false,
              feedback: "That is a common, boring, good default — celebrity users aside.",
            },
            {
              id: "random",
              label: "A random UUID, when you always look up by email",
              correct: false,
              feedback: "Random spreads writes but can make the lookup path worse. Hotspot is the timestamp pattern.",
            },
          ],
        },
      },
    ],
  },
  {
    id: "operate",
    title: "Operate it",
    summary: "If you cannot see it, you cannot improve it. A short checklist keeps the board honest.",
    lessons: [
      {
        slug: "observability",
        title: "Logs, metrics, traces, and automation",
        minutes: 6,
        summary:
          "At this size, SSH and print statements are not a strategy. Invest in signals and in catching breakage on check-in.",
        diagram: "ops",
        practiceStepIds: ["observe"],
        sections: [
          {
            heading: "Logs",
            body: "Structured error logs, in one place, let you search across the fleet. Per-box files you have to SSH into do not.",
          },
          {
            heading: "Metrics",
            body: "Watch the host (CPU, memory, disk), the tier (database latency, cache hit rate, queue depth), and the business (signups, uploads, errors on checkout). Alerts belong on error rate and latency, not on “a machine feels slow.”",
          },
          {
            heading: "Traces and CI",
            body: "A trace follows one request across balancer, app, cache, and database so you can see the slow hop. Continuous integration runs tests on every check-in so the next deploy is not the first time a change meets production.",
          },
        ],
        takeaways: [
          "Metrics find the fire. Logs explain it. Traces show the path.",
          "Alert on user-visible pain, not only on host CPU.",
          "Automation (CI, deploy) is part of the architecture at this scale.",
        ],
        check: {
          question: "Which set belongs in a production architecture at this scale?",
          choices: [
            {
              id: "full",
              label: "Metrics, structured logs, traces, and alerts on errors and latency",
              correct: true,
              feedback: "Detection is a design decision, not an appendix.",
            },
            {
              id: "ssh",
              label: "SSH and top when something feels off",
              correct: false,
              feedback: "That starts after users already felt it, and it does not scale past one box.",
            },
            {
              id: "later",
              label: "Skip it until the first outage, to save cost",
              correct: false,
              feedback: "The first outage is the most expensive time to learn you are blind.",
            },
          ],
        },
      },
      {
        slug: "production-checklist",
        title: "A production-ish checklist",
        minutes: 5,
        summary:
          "You earned each piece when the previous design broke. Before you leave the whiteboard, confirm they are still on the board.",
        diagram: "ops",
        practiceStepIds: ["ship-it"],
        sections: [
          {
            heading: "Walk the board",
            body: "This is not a shopping list to dump on a v1. It is a review after you have scaled: each line should be there because a real bottleneck asked for it.",
            bullets: [
              "Web servers hold no unique session state.",
              "Redundancy: more than one app server, and a story when a database primary dies.",
              "Cache for hot reads, with a fallback when it is empty.",
              "More than one data center if you claim regional failover.",
              "CDN (or equivalent) for static bytes.",
              "Shards if a single primary cannot hold the writes.",
              "Split services where a queue or worker earned its place.",
              "Monitoring: metrics, logs, traces, alerts.",
            ],
          },
          {
            heading: "How to use it",
            body: "If a line is missing, either add it or say out loud why this product does not need it yet. Silence is how cargo-cult diagrams get Kafka “just in case.”",
          },
        ],
        takeaways: [
          "The checklist is a review, not a v1 bill of materials.",
          "Every component should be able to answer “what broke without you?”",
          "Practice is drawing the board until the checklist goes green.",
        ],
        check: {
          question: "When do you apply this checklist?",
          choices: [
            {
              id: "after",
              label: "After you have scaled, as a review of what the bottlenecks required",
              correct: true,
              feedback: "Start tiny. Add what broke. Then audit.",
            },
            {
              id: "day-one",
              label: "On day one, so the first commit includes Kafka, CDN, and six shards",
              correct: false,
              feedback: "That is a cargo cult, not a design.",
            },
            {
              id: "never",
              label: "Never — diagrams are decorative",
              correct: false,
              feedback: "The board is how you notice a missing failure domain.",
            },
          ],
        },
      },
    ],
  },
];

export function allLessons(): Lesson[] {
  return SYLLABUS.flatMap((module) => module.lessons);
}

export function getLesson(slug: string): Lesson | undefined {
  return allLessons().find((lesson) => lesson.slug === slug);
}

export function lessonIndex(slug: string) {
  return allLessons().findIndex((lesson) => lesson.slug === slug);
}

export function nextLesson(slug: string): Lesson | undefined {
  const index = lessonIndex(slug);
  return index >= 0 ? allLessons()[index + 1] : undefined;
}

export function previousLesson(slug: string): Lesson | undefined {
  const index = lessonIndex(slug);
  return index > 0 ? allLessons()[index - 1] : undefined;
}

export function moduleForLesson(slug: string): SyllabusModule | undefined {
  return SYLLABUS.find((module) =>
    module.lessons.some((lesson) => lesson.slug === slug),
  );
}

export function lessonForPractice(stepId: string): Lesson | undefined {
  return allLessons().find((lesson) => lesson.practiceStepIds?.includes(stepId));
}
