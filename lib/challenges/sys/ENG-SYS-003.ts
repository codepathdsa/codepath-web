import type { Challenge } from '../types';

// ─── ENG-SYS-003  \u2014  SHOWPIECE CHALLENGE ─────────────────────────────────────────
//
// DESIGN PHILOSOPHY
// ─────────────────
// A great system design challenge has three layers:
//
//  1. AN INCIDENT, not a spec sheet.
//     Engineers remember the night Ticketmaster melted during Taylor Swift presale.
//     Anchor every challenge in a real, memorable event with real stakes.
//     "Scale to 10k RPS" is forgettable. "Super Bowl halftime, 100M people open Google" is not.
//
//  2. DECISION GATES, not just topology checks.
//     The simulation pauses after each level and asks a genuine trade-off question.
//     Three options — all viable — but one is optimal for THIS context.
//     Your choices affect your score, not whether you can proceed.
//     This is the thing interviewers actually care about: not "do you know Redis?"
//     but "WHEN do you use Redis, and why not Memcached, and what's the failure mode?"
//
//  3. A NARRATIVE ARC, not a flat list of requirements.
//     Each level introduces ONE villain (the failure mode) and ONE hero (the fix).
//     The failMsg should read like a real Slack incident thread.
//     The questions should make you justify the choices you just made.
//
// This format is what turns a quiz into the experience engineers want to replay.
// ─────────────────────────────────────────────────────────────────────────────────

const challenge: Challenge = {
  id: 'ENG-SYS-003',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design Google Search Autocomplete',
  companies: ['Google', 'LinkedIn', 'Twitter'],
  timeEst: '~45 min',
  level: 'Senior',
  status: 'Not Started',

  // ── The Incident ───────────────────────────────────────────────────────────
  // This is what appears in the Brief tab's red banner. Make it feel real.
  realWorldContext:
    "It's Super Bowl Sunday. Patrick Mahomes just threw a 65-yard TD at halftime. " +
    "100 million people simultaneously open Google and type 'Super Bowl score'. " +
    "Your autocomplete is returning zero results for the most searched phrase in the country. " +
    "The Trie was last rebuilt at 2am. 'Super Bowl score' had only 1,200 searches yesterday. " +
    "It didn't make the top-5 cutoff. Your pager fired 47 seconds ago.",

  desc:
    "Design an autocomplete system that returns the top-5 suggestions for any prefix " +
    "in under 50ms, handles 100,000 requests/second at peak, and reflects trending " +
    "searches in near-real-time — even if they weren't in last night's Trie build.",

  solution:
    "Core path: Client → Load Balancer → Trie Server cluster (Trie is read-only, fully in RAM, " +
    "safe to replicate to N nodes behind a load balancer). " +
    "Real-time layer: every keypress event is also sent to an Aggregator Server which batches " +
    "writes in 500ms windows into a Redis sorted set of trending queries. " +
    "The Trie Server merges its top-5 static results with the top-3 Redis trending terms, " +
    "deduplicates, and returns the final 5. " +
    "Global distribution: Trie snapshots are pushed to CDN edge nodes nightly via a " +
    "blue-green deployment — new snapshot staged, health-checked, then promoted atomically.",

  whyItMatters:
    "Autocomplete fires on every single keystroke. At Google's scale, that's ~3 billion " +
    "requests per day just from autocomplete — more than most services handle total. " +
    "The 50ms SLA is non-negotiable because it must return before the user types the next " +
    "character (~200ms on a fast typist). Any DB call (SQL, Cassandra) is off the table " +
    "at this latency — everything must be in RAM.",

  approach:
    "The Trie is your foundation: an in-memory prefix tree where every node stores only " +
    "the top-5 most popular completions for that prefix (not the full subtree — that would " +
    "be exponential). Built nightly by a Spark job over the day's search logs. " +
    "Redis sorted set handles the real-time 'trending now' layer with a 1-hour sliding window. " +
    "The Aggregator Server is the key insight most candidates miss: you cannot write every " +
    "100k keypress/sec directly to Redis — Redis can handle ~100k writes/sec but only if " +
    "that's its entire load. The aggregator batches 100k events into ~200 ZADD calls/sec.",

  simulation: {
    constraints: [
      { label: 'Max latency (p99)',         value: '< 50ms'           },
      { label: 'Peak query RPS',            value: '100,000'          },
      { label: 'Dictionary size',           value: '~10 million terms' },
      { label: 'Trie size (in RAM)',        value: '~10 GB per node'  },
      { label: 'Trending window',           value: '1-hour sliding'   },
      { label: 'Trie rebuild frequency',   value: 'Nightly (2am)'    },
    ],

    levels: [
      {
        // ── Level 1: Establish the basic path ──────────────────────────────
        // Villain: no path from client to autocomplete service
        // Hero: Trie Server — RAM-resident prefix tree, O(prefix_length) lookup
        traffic: 1000,
        targetLatency: 50,
        successMsg:
          'Basic path confirmed. 1,000 RPS hitting Trie server, p99 = 8ms. ' +
          'The entire 10GB Trie is in RAM \u2014 no disk I/O, no DB calls.',
        failMsg:
          '[FATAL] 100 million users are typing and your autocomplete returns nothing. ' +
          'There is no path from the client to the Trie server. ' +
          'Connect: Client \u2192 API Server \u2192 Trie Server (or Client \u2192 directly).',
        failNode: 'client',
        failTooltip:
          'The Trie Server holds the entire 10-million-term dictionary in RAM as a prefix tree. ' +
          'A lookup for "sup" traverses 3 nodes and returns in < 1ms. ' +
          'No DB call, no network hop to slow storage. Connect Client \u2192 Trie Server.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'trie_server' },
        ],
      },
      {
        // ── Level 2: Horizontal scale ───────────────────────────────────────
        // Villain: single Trie node saturates at 50k RPS
        // Hero: Load Balancer + replica Trie nodes (Trie is read-only = safe to replicate)
        traffic: 50000,
        targetLatency: 50,
        successMsg:
          '50k RPS distributed across Trie replicas. Since the Trie is read-only ' +
          '(rebuilt nightly), every replica serves identical data \u2014 no sync complexity.',
        failMsg:
          '[OVERLOAD] 50,000 requests/sec hitting a single Trie server. ' +
          'CPU at 100%. p99 latency climbed to 2,400ms. Users see a blank dropdown. ' +
          'One Trie node handles ~5,000 RPS safely. You need 10 replicas behind a Load Balancer.',
        failNode: 'trie_server',
        failTooltip:
          'The Trie is read-only between nightly rebuilds \u2014 so replicating it is free. ' +
          'All 10 replicas serve the same 10GB snapshot. No leader election, no sync. ' +
          'Add: Client \u2192 Load Balancer \u2192 Trie Server cluster.',
        checks: [
          { type: 'hasPath', source: 'load_balancer', target: 'trie_server' },
          { type: 'hasPath', source: 'client', target: 'load_balancer' },
        ],
      },
      {
        // ── Level 3: Stale data crisis ──────────────────────────────────────
        // Villain: "Super Bowl score" not in the Trie (0 searches yesterday)
        // Hero: Redis sorted set for real-time trending signals
        traffic: 100000,
        targetLatency: 50,
        successMsg:
          'Real-time trending layer active. "Super Bowl score" now appears as suggestion #1. ' +
          'Redis sorted set reflects last 60 minutes of queries, updated every 500ms.',
        failMsg:
          '[STALE TRIE] 100 million people are searching "Super Bowl score" and your ' +
          'autocomplete is suggesting "Subway sandwiches" and "S\u00e3o Paulo weather" \u2014 ' +
          'the top-5 for prefix "s" from the 2am Trie rebuild. ' +
          '"Super Bowl score" had 1,200 searches yesterday. It didn\'t make the cutoff. ' +
          'Add a Redis sorted set to inject real-time trending signals into the Trie results.',
        failNode: 'trie_server',
        failTooltip:
          'Redis ZADD "trending" <score> "super bowl score" \u2014 where score = query count in last hour. ' +
          'After the Trie returns its top-5, merge with the top-3 Redis trending terms. ' +
          'Deduplicate and return final 5. "Super Bowl score" rises from rank 0 to rank 1 in seconds. ' +
          'Connect Trie Server \u2192 Redis.',
        checks: [
          { type: 'hasEdge', source: 'trie_server', target: 'redis' },
        ],
      },
      {
        // ── Level 4: Write amplification crisis ────────────────────────────
        // Villain: 100k keypress/sec all writing directly to Redis = Redis melts
        // Hero: Aggregator Server batches N writes into 1 ZADD per 500ms window
        traffic: 100000,
        targetLatency: 50,
        successMsg:
          'SYSTEM STABLE \u2014 100k RPS handled end-to-end. ' +
          'Aggregator batching reduces Redis write load from 100k/sec to ~200 ZADD calls/sec. ' +
          'Architecture: Client \u2192 LB \u2192 [Trie Server \u2192 Redis] + [Aggregator \u2192 Redis].',
        failMsg:
          '[REDIS OVERLOAD] You just routed 100,000 keypress events/sec directly at Redis. ' +
          'Redis tops out at ~100k operations/sec \u2014 but that\u2019s its TOTAL capacity. ' +
          'With Trie read queries AND direct writes both hitting Redis, it\u2019s saturated. ' +
          'Add an Aggregator Server to batch-write trending counts into Redis in 500ms windows.',
        failNode: 'redis',
        failTooltip:
          'The Aggregator Server collects events in a local in-memory counter for 500ms, ' +
          'then flushes with a single Redis ZADD pipeline of ~50,000 increments. ' +
          'This reduces Redis write operations from 100,000/sec to ~2/sec. ' +
          'Connect: API Server \u2192 Aggregator Server \u2192 Redis.',
        checks: [
          { type: 'hasPath', source: 'api_server', target: 'aggregator_server' },
          { type: 'hasEdge', source: 'aggregator_server', target: 'redis' },
        ],
      },
    ],

    // \u2550\u2550 Decision Gates \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
    // Fired after a level passes \u2014 simulation pauses, candidate makes a judgment call.
    // All options are defensible; optimal choices earn score points.
    // The explanation appears after the choice is locked in.
    decisions: [
      {
        // After level 2 passes (10 replicas working)
        afterLevel: 1,
        situation:
          "Your Trie handles 50k RPS with 10 replicas. Each replica holds the full 10GB Trie in RAM. " +
          "Your CTO asks: 'That\u2019s 100GB of RAM total. Can we do better?'",
        question: "How do you store the 10GB Trie across multiple replica nodes?",
        options: [
          {
            id: 'full_replica',
            label: 'Full replica on each node',
            sublabel: '10 GB RAM \u00b7 $400/mo per node \u00b7 Any node can answer any query',
            isOptimal: true,
            consequence:
              "Correct call. The Trie is read-only between nightly rebuilds \u2014 replication is free. " +
              "Any node answers any prefix without routing logic. Simple load balancer round-robins. " +
              "Yes, 100GB total, but RAM is $10/GB/month. 100GB = $1,000/mo. " +
              "Engineering simplicity at that cost is a bargain.",
          },
          {
            id: 'alphabetical_shard',
            label: 'Shard alphabetically (A\u2013M / N\u2013Z)',
            sublabel: '5 GB RAM per node \u00b7 Half the RAM cost \u00b7 Load balancer must route by prefix',
            isOptimal: false,
            consequence:
              "Looks clever but creates a hotspot problem. " +
              "During the Super Bowl, ALL traffic is prefix 's' (Super Bowl, score, stats). " +
              "Your 'S\u2013Z' shard handles 80% of traffic. 'A\u2013M' shard is idle. " +
              "Alphabetical sharding is fine for key-value stores with uniform key distribution. " +
              "Search prefixes are not uniformly distributed \u2014 common letters dominate.",
          },
          {
            id: 'redis_cache',
            label: 'Store Trie in Redis, cache hot prefixes in application memory',
            sublabel: 'Lower RAM per Trie node \u00b7 Redis becomes the bottleneck',
            isOptimal: false,
            consequence:
              "A Redis lookup at 50k RPS adds ~0.5ms network RTT per query. " +
              "You've gone from 1ms (RAM lookup) to 1.5ms. Not fatal, but you just introduced " +
              "a new single point of failure. Redis is better suited for the trending layer " +
              "where you need sorted sets and atomic increments \u2014 not as a Trie store.",
          },
        ],
        explanation:
          "For read-only data that fits in RAM, full replication is almost always right. " +
          "The cost argument (100GB RAM) sounds scary but rarely is in practice \u2014 " +
          "Google serves 8.5 billion autocomplete requests per day with Trie nodes that cost " +
          "orders of magnitude more in hardware. The real complexity budget should go into " +
          "the hard problems: real-time trending, personalization, and global distribution. " +
          "Sharding the Trie is premature optimization that creates a routing problem.",
      },
      {
        // After level 3 passes (Redis trending working)
        afterLevel: 2,
        situation:
          "'Super Bowl score' is now appearing correctly. Your VP of Engineering asks: " +
          "'Redis is a single node. What happens when Redis goes down at peak?'",
        question: "How do you make the Redis trending layer fault-tolerant?",
        options: [
          {
            id: 'async_replica',
            label: 'Redis primary + async read replica',
            sublabel: 'Automatic failover via Redis Sentinel \u00b7 Max ~200ms of write lag',
            isOptimal: true,
            consequence:
              "Solid production choice. Redis Sentinel monitors the primary and promotes a " +
              "replica within 15\u201330 seconds on failure. During that window, your Trie Server " +
              "falls back to static Trie results (you catch the Redis connect exception and serve " +
              "Trie-only results). Users see slightly stale trending, not an outage. " +
              "Most companies run exactly this setup.",
          },
          {
            id: 'redis_cluster',
            label: 'Redis Cluster (6 nodes, automatic sharding + replication)',
            sublabel: 'Fully distributed \u00b7 No single point of failure \u00b7 Complex ops',
            isOptimal: false,
            consequence:
              "Technically sound but over-engineered for this use case. " +
              "Your trending dataset is tiny (~100k keys in the sorted set). " +
              "Redis Cluster is designed for datasets that exceed a single node's RAM " +
              "(which is 256GB on modern hardware). Operating a 6-node cluster for 100MB of data " +
              "is operational overhead without benefit. Reserve Redis Cluster for key-value stores " +
              "at Twitter/Slack scale where you actually need multi-node capacity.",
          },
          {
            id: 'skip_redis',
            label: 'Make Redis optional \u2014 serve Trie-only if Redis is down',
            sublabel: 'Zero Redis dependency \u00b7 Stale trending on failure \u00b7 Simplest code',
            isOptimal: false,
            consequence:
              "Valid as a resilience pattern (circuit breaker on Redis), but this alone is not " +
              "fault tolerance \u2014 it's graceful degradation. You still lose trending when Redis fails. " +
              "For a Super Bowl-scale event, that degradation happens at exactly the worst moment. " +
              "You want to combine this (circuit breaker) WITH async replication, not instead of it.",
          },
        ],
        explanation:
          "The right answer depends on your SLA. If 'trending may be stale for 30 seconds ' +\n" +
          "'during a Redis failover' is acceptable (it usually is), async replica + Sentinel is the " +
          "right operational trade-off. The key technique is the circuit breaker: your Trie Server " +
          "should catch Redis connection errors and gracefully degrade to Trie-only results " +
          "rather than failing the entire autocomplete request. Never let a trending feature " +
          "take down your core search path.",
      },
    ],

    // \u2550\u2550 Score Rubric \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
    scoreMetrics: [
      {
        label: 'Speed bonus',
        maxPoints: 300,
        description: 'Solve all 4 levels in under 8 minutes',
      },
      {
        label: 'Component efficiency',
        maxPoints: 200,
        description: 'Fewer total nodes used (minimum viable architecture)',
      },
      {
        label: 'Decision quality',
        maxPoints: 300,
        description: 'Optimal choices at both decision gates',
      },
      {
        label: 'Completion',
        maxPoints: 200,
        description: 'All 4 levels cleared',
      },
    ],
  },

  // \u2550\u2550 Interview Questions \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  // These questions should force you to JUSTIFY the decisions you just made in the sim.
  // Good questions ask "why not X?" and "what breaks if Y?", not "describe a Trie."
  questions: [
    {
      q: 'Why is a SQL LIKE query unusable for autocomplete at this scale?',
      hint: 'Run the math: 100,000 RPS \u00d7 how many rows does LIKE scan?',
      answer:
        'LIKE "sup%" on a 10-million-row table requires the DB to scan every row until it finds ' +
        "matches, even with a B-tree index (which only helps if the wildcard is at the END). " +
        "That's O(n) per query in the worst case. At 100k RPS, you'd need a server farm just for " +
        'SQL. A Trie finds all completions for a 3-char prefix in 3 pointer dereferences \u2014 O(k) ' +
        "where k = prefix length. It's the difference between sub-1ms and 500ms at scale. " +
        "The Trie also stores top-5 completions AT each node, so you don't even need to " +
        "traverse children \u2014 the answer is pre-computed.",
    },
    {
      q: 'The Aggregator Server batches writes every 500ms. When does "Super Bowl score" first appear in suggestions?',
      hint: 'Trace the exact path: user searches \u2192 aggregator buffer \u2192 Redis \u2192 Trie merge.',
      answer:
        'Worst case: ~1 second. A user searches "Super Bowl score" at t=0. ' +
        "The API Server sends the event to the Aggregator. The Aggregator's current 500ms window " +
        "closes at t=499ms and flushes to Redis (ZADD trending +1 'super bowl score'). " +
        "The next Trie Server query for prefix 's' reads from Redis and sees the new trending term. " +
        "That Trie query happens within the 500ms window after the flush. " +
        "Total worst-case delay: 500ms (aggregator window) + 1 Trie query cycle = ~600ms. " +
        "For a trending topic with millions of concurrent searchers, the sorted set score " +
        "accumulates so fast that it dominates within the first batch flush.",
    },
    {
      q: "How do you push a new nightly Trie snapshot to 200 CDN edge nodes without serving stale data during the update?",
      hint: 'Think blue-green deployment, but for in-memory data instead of running services.',
      answer:
        'Use a blue-green Trie slot on each edge node: every node keeps TWO Trie instances in ' +
        "memory (blue = active, green = staging). The nightly pipeline: " +
        '(1) Upload new Trie snapshot to S3. ' +
        "(2) Send a 'stage new Trie' signal to all edge nodes via a control plane message (Kafka/SQS). " +
        "(3) Each node downloads the snapshot and loads it into the 'green' slot while still " +
        "serving traffic from 'blue'. " +
        "(4) Once loaded + health-checked, the control plane sends 'promote green'. " +
        "Each node atomically swaps the active pointer. Zero-downtime, no query sees a half-loaded Trie. " +
        "If a node fails to load the new snapshot, it stays on blue \u2014 serving yesterday's data " +
        "is better than returning nothing.",
    },
    {
      q: "10 million concurrent users each type 3 characters. How many autocomplete RPS does that generate?",
      hint: 'A keypress fires a request. How fast does a human type?',
      answer:
        'Each character typed = 1 autocomplete request. A fast typist types ~5 chars/sec. ' +
        "With debouncing (20ms delay between requests), you reduce fired requests to ~1 per " +
        "200ms burst, or ~5 requests/second per active user. " +
        "10 million users \u00d7 5 RPS = 50 million autocomplete RPS at peak. " +
        "In practice, not all users type simultaneously. A 10% concurrency rate is realistic: " +
        "1 million active typists \u00d7 5 RPS = 5 million RPS. " +
        "This is why Google serves autocomplete from edge CDN nodes \u2014 no datacenter can " +
        "handle 5M RPS with sub-50ms latency across continents.",
    },
    {
      q: 'How do you add personalized suggestions without rebuilding the Trie per user?',
      hint: "The global Trie is shared. Personal history isn't. Keep them separate.",
      answer:
        "Never mix personal history into the shared Trie \u2014 it would require per-user Trie " +
        "variants or real-time Trie mutations, both of which are engineering nightmares. " +
        "Instead: run TWO lookups in parallel on every keypress: " +
        "(1) Global Trie lookup \u2192 top-5 global completions. " +
        "(2) Redis lookup for user's personal search history: ZREVRANGEBYSCORE user:{id}:history prefix* 0 2 \u2192 top-3 personal matches. " +
        "Merge the two result sets, boost personal matches by a fixed weight factor (e.g., 2\u00d7), " +
        "deduplicate, and return the final 5. Cap personal suggestions at 2 out of 5 \u2014 " +
        "users trust autocomplete more when it shows what others are searching, not just their own history.",
    },
  ],
};

export default challenge;

