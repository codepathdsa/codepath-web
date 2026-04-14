import { Challenge } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION DESIGN NOTES
// ─────────────────────────────────────────────────────────────────────────────
//
// Each simulation teaches ONE core insight per traffic level.
// Level 1 → "can you wire up the basic path?"
// Level 2 → "can you add persistence correctly?"
// Level 3 → "what breaks under real load, and how do you fix it?"
//
// Node IDs used across all simulations (palette the simulator knows about):
//   client, load_balancer, api_server, postgres, mysql, redis, kafka,
//   cassandra, dynamo, s3, cdn, worker, zookeeper, bloom_filter,
//   websocket_gateway, geohash_service, apns_fcm, rate_limiter,
//   trie_server, aggregator_server
//
// checks.type values:
//   hasPath  → any route from source to target (via intermediate nodes)
//   hasEdge  → direct single-hop edge source → target
//   hasNode  → node exists on canvas at all
// ─────────────────────────────────────────────────────────────────────────────

export const sysChallenges: Challenge[] = [

  // ── ENG-SYS-001 ─────────────────────────────────────────────────────────────
  {
    id: 'ENG-SYS-001',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design a URL Shortener (Bitly)',
    companies: ['Bitly', 'Google'],
    timeEst: '~45 min',
    level: 'Mid',
    status: 'Not Started',
    desc:
      'Design a system that takes long URLs and generates 7-character short links. ' +
      'It must handle 10,000 Read RPS and 100 Write RPS, and survive datacenter failures.',
    solution:
      'Use a base62 encoder on an auto-incrementing ID. ' +
      'Store mappings in a NoSQL DB (Cassandra/DynamoDB) for horizontal scale. ' +
      'Add a Redis cache in front of the DB — since redirects are 100:1 read-heavy, ' +
      'most lookups will be cache hits, keeping DB load under control.',

    // ── Constraint sidebar ───────────────────────────────────────────────────
    simulation: {
      constraints: [
        { label: 'Write RPS', value: '100' },
        { label: 'Read RPS', value: '10,000' },
        { label: 'Read/Write Ratio', value: '100:1' },
        { label: 'Data (5 yr)', value: '~1.5 TB' },
        { label: 'URL length', value: '7 chars (base62)' },
      ],

      // ── Traffic levels ───────────────────────────────────────────────────
      levels: [
        {
          // Lesson: basic request path exists
          traffic: 500,
          targetLatency: 30,
          successMsg: 'Traffic routing: 500 RPS — basic path established.',
          failMsg:
            '[FATAL] Client traffic has nowhere to go. ' +
            'Connect Client → Load Balancer → API Server.',
          failNode: 'client',
          failTooltip:
            'Add a Load Balancer between the client and your API Server. ' +
            'Even at low traffic, a LB lets you scale horizontally later.',
          checks: [
            // Allow: client → api_server OR client → load_balancer → api_server
            { type: 'hasPath', source: 'client', target: 'api_server' },
          ],
        },
        {
          // Lesson: writes must land in a database
          traffic: 2000,
          targetLatency: 80,
          successMsg: 'Traffic ramping: 2,000 RPS — persistence layer validated.',
          failMsg:
            '[FATAL] Shortened URLs are not being saved anywhere. ' +
            'Connect API Server → Database.',
          failNode: 'api_server',
          failTooltip:
            'Your API Server needs to write URL mappings somewhere permanent. ' +
            'For URL shorteners, Cassandra or DynamoDB scale better than ' +
            'Postgres because the access pattern is simple key-value lookups.',
          checks: [
            // Must persist to ANY database node
            { type: 'hasPath', source: 'api_server', target: 'cassandra' },
          ],
        },
        {
          // Lesson: relational DB cannot sustain 10k read RPS alone → add cache
          traffic: 11000,
          targetLatency: 480,
          successMsg:
            'SYSTEM STABLE at 11,000 RPS — Cache absorbing 95% of read traffic.',
          failMsg:
            '[OVERLOAD] Cassandra is melting at 10k reads/sec. ' +
            'Redirect lookups are 100× more frequent than writes. ' +
            'Add a Redis cache between the API Server and the DB.',
          failNode: 'cassandra',
          failTooltip:
            'Redis can answer a GET in ~0.2ms vs ~5ms from Cassandra. ' +
            'With a 99% cache-hit rate on popular URLs, your DB traffic ' +
            'drops from 10k RPS to ~100 RPS. Connect API Server → Redis → Cassandra.',
          checks: [
            { type: 'hasEdge', source: 'api_server', target: 'redis' },
            { type: 'hasPath', source: 'redis', target: 'cassandra' },
          ],
        },
      ],
    },

    // ── Guided challenge questions ──────────────────────────────────────────
    questions: [
      {
        q: 'How do you generate a unique 7-character short code?',
        hint: 'Think: auto-increment ID → base62 encode. Why not MD5/UUID?',
        answer:
          'Take a global auto-incrementing counter (can live in Zookeeper or a dedicated ID service). ' +
          'Encode it in base62 (a-z, A-Z, 0-9). 62^7 = ~3.5 trillion unique URLs. ' +
          'MD5/UUID risks collisions and wastes bytes. Counter encoding is deterministic and collision-free.',
      },
      {
        q: 'Why Cassandra over Postgres for this use case?',
        hint: 'Think about the access pattern: pure key-value, no joins, horizontal scale.',
        answer:
          'URL shortener reads are pure key-value: "give me the long URL for short code X". ' +
          'There are no joins, no transactions, no complex queries. ' +
          'Cassandra is a wide-column store that shards automatically and handles ' +
          'millions of RPS per node. Postgres would require careful sharding setup ' +
          'and struggles above ~5k write RPS without a lot of tuning.',
      },
      {
        q: 'What happens if the ID service (counter) goes down?',
        hint: 'Single point of failure. How do you eliminate it?',
        answer:
          'Run multiple ID generator instances, each pre-allocated a range ' +
          '(e.g., server A owns 1–1M, server B owns 1M–2M). ' +
          'Alternatively, use Twitter Snowflake IDs: 64-bit integers composed of ' +
          'timestamp + datacenter ID + sequence — no coordination needed.',
      },
      {
        q: 'A user pastes the same long URL twice. Should they get the same short code?',
        hint: 'This is a product decision, not a technical one. State your assumption.',
        answer:
          'Both are valid. If yes: store a reverse mapping (long URL → short code) and ' +
          'check it on every write — adds a DB lookup. ' +
          'If no: each create gets a new code, which is simpler but wastes namespace. ' +
          'At Bitly-scale, they de-duplicate to save storage and enable analytics per destination.',
      },
      {
        q: 'How do you handle link expiry (e.g., a link that expires after 30 days)?',
        hint: 'Think about TTL at the cache layer AND the DB layer.',
        answer:
          'Store an `expires_at` timestamp in Cassandra. On read, check `expires_at` — ' +
          'if past, return 404. Set a matching TTL on the Redis cache entry so expired ' +
          'links auto-evict. Run a daily batch job to clean expired rows from Cassandra ' +
          'to reclaim storage (Cassandra\'s tombstone compaction handles this cleanly).',
      },
    ],
  },

  // ── ENG-SYS-002 ─────────────────────────────────────────────────────────────
  {
    id: 'ENG-SYS-002',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design a Ticketmaster Waiting Room',
    companies: ['Ticketmaster', 'LiveNation'],
    timeEst: '~60 min',
    level: 'Senior',
    status: 'Not Started',
    desc:
      'Taylor Swift tickets drop at noon. 5 million users will hit the buy button ' +
      'at the exact same second for 50,000 tickets. If you write directly to the DB, it will melt.',
    solution:
      'Implement a queue-based async architecture. ' +
      'Users hit the API Gateway which drops a token into SQS/Kafka and immediately ' +
      'returns a "You\'re in the queue" UI (position + estimate). ' +
      'Worker nodes consume the queue at a rate the DB can safely handle, ' +
      'process one purchase at a time with optimistic locking, ' +
      'and notify users via WebSocket when it\'s their turn.',

    simulation: {
      constraints: [
        { label: 'Peak concurrent users', value: '5,000,000' },
        { label: 'Available tickets', value: '50,000' },
        { label: 'Spike duration', value: '< 5 seconds' },
        { label: 'Max DB write RPS', value: '~2,000 (safe)' },
        { label: 'Target checkout time', value: '< 10 min per user' },
      ],

      levels: [
        {
          // Lesson: you need an entry point that doesn't write to DB
          traffic: 100000,
          targetLatency: 200,
          successMsg:
            'Entry gate established. 100k RPS absorbed by API Gateway.',
          failMsg:
            '[FATAL] 100,000 requests/sec with nowhere to land. ' +
            'Add an API Gateway as the entry point.',
          failNode: 'client',
          failTooltip:
            'The API Gateway is a stateless HTTP layer that accepts all incoming ' +
            'connections and decides what to do with them — without touching the DB. ' +
            'Add: Client → Load Balancer → API Gateway.',
          checks: [
            { type: 'hasPath', source: 'client', target: 'api_server' },
          ],
        },
        {
          // Lesson: direct DB writes at 5M RPS = instant death → need a queue
          traffic: 500000,
          targetLatency: 5000,
          successMsg:
            'Queue buffer active. Traffic absorbed. DB safe at ~2k writes/sec.',
          failMsg:
            '[DB MELTDOWN] 500k purchase attempts hitting Postgres directly. ' +
            'DB can handle ~2k writes/sec. You\'re sending 500k. Add Kafka/SQS between API and DB.',
          failNode: 'postgres',
          failTooltip:
            'Add a message queue (Kafka) between the API Server and the database. ' +
            'The API drops a "purchase intent" message and returns 202 Accepted immediately. ' +
            'Workers consume the queue at the DB\'s safe write rate.',
          checks: [
            { type: 'hasPath', source: 'api_server', target: 'kafka' },
            { type: 'hasPath', source: 'kafka', target: 'worker' },
          ],
        },
        {
          // Lesson: workers must use locking to prevent double-selling
          traffic: 2000,
          targetLatency: 80,
          successMsg:
            'SYSTEM STABLE — Queue draining at 2k/sec. No double-sells. Tickets sold fairly.',
          failMsg:
            '[RACE CONDITION] Multiple workers are selling the same seat. ' +
            'Tickets are being double-booked. Add optimistic locking or a Redis seat lock.',
          failNode: 'worker',
          failTooltip:
            'Workers must claim a seat atomically before writing to the DB. ' +
            'Use Redis SETNX ("set if not exists") as a distributed lock: ' +
            'the first worker to claim seat #1042 wins. All others get a different seat. ' +
            'Connect Worker → Redis → Postgres.',
          checks: [
            { type: 'hasEdge', source: 'worker', target: 'redis' },
            { type: 'hasPath', source: 'worker', target: 'postgres' },
          ],
        },
      ],
    },

    questions: [
      {
        q: 'How do you prevent two users from buying the same seat simultaneously?',
        hint: 'Optimistic vs pessimistic locking. Which fits high-concurrency better?',
        answer:
          'Use a Redis distributed lock with SETNX (set-if-not-exists) and a short TTL. ' +
          'Worker A calls SETNX("seat:1042", workerA_id). If it returns 1, it won the lock. ' +
          'Worker B gets 0 and moves to the next available seat. ' +
          'After the DB write completes, the lock is released. ' +
          'TTL ensures locks are released if a worker crashes mid-purchase.',
      },
      {
        q: 'How do you fairly assign queue position to 5 million users who join in the same second?',
        hint: 'You cannot sort by arrival time if everyone arrives simultaneously.',
        answer:
          'Accept that "simultaneous" is a 500ms window, not truly the same millisecond. ' +
          'Assign queue positions using the Kafka partition offset — first message written ' +
          'to the partition is first. Within the same partition, order is guaranteed. ' +
          'For true fairness, generate a random UUID per user and sort by it — ' +
          'this creates a fair lottery rather than a speed-of-connection advantage.',
      },
      {
        q: 'How do you tell the user their position and estimated wait time?',
        hint: 'This requires a persistent connection — think real-time.',
        answer:
          'When the user joins the queue, open a WebSocket connection. ' +
          'Maintain a Redis sorted set where score = queue position. ' +
          'Every 5 seconds, broadcast updates to all connected users: ' +
          '"Position 4,231 → your estimated wait is ~12 minutes." ' +
          'When a user reaches position 1, push a checkout URL over the WebSocket.',
      },
      {
        q: 'A user\'s browser crashes at position 50. How do you handle re-entry?',
        hint: 'The queue token needs to survive browser restarts.',
        answer:
          'Issue a signed JWT token when the user enters the queue. ' +
          'The token contains their queue position and expiry. ' +
          'If they reconnect within the TTL, they rejoin at their original position. ' +
          'After TTL (e.g., 15 min), the position is forfeited and released back to the queue.',
      },
      {
        q: 'What happens to users who reach checkout but don\'t complete the purchase in time?',
        hint: 'Holding a seat forever kills availability for other users.',
        answer:
          'Give users a 10-minute checkout window with a visible countdown timer. ' +
          'The seat is locked in Redis with a 10-minute TTL. ' +
          'If payment is not completed, the TTL expires, the seat lock releases, ' +
          'and the seat is re-inserted into the available pool. ' +
          'The user sees "Your session expired — return to queue."',
      },
    ],
  },

  // ── ENG-SYS-003 ─────────────────────────────────────────────────────────────
  {
    id: 'ENG-SYS-003',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design an Autocomplete Typeahead',
    companies: ['Google', 'Amazon'],
    timeEst: '~45 min',
    level: 'Mid',
    status: 'Not Started',
    desc:
      'As a user types "S-A-M", suggest the top 5 most popular search terms. ' +
      'Must return results in < 50ms. Must scale to Google Search volume.',
    solution:
      'Store the suggestion dictionary in a Trie data structure where each node ' +
      'stores the top-5 most popular completions for that prefix. ' +
      'Cache the entire Trie in RAM on distributed edge servers (Trie servers). ' +
      'Run a Hadoop/Spark batch job nightly to recompute search term frequencies ' +
      'and update the Trie node weights.',

    simulation: {
      constraints: [
        { label: 'Max latency', value: '< 50ms' },
        { label: 'Query RPS (peak)', value: '100,000' },
        { label: 'Dictionary size', value: '~10 million terms' },
        { label: 'Trie RAM (in-memory)', value: '~10 GB' },
        { label: 'Update frequency', value: 'Daily batch' },
      ],

      levels: [
        {
          // Lesson: basic query path
          traffic: 1000,
          targetLatency: 50,
          successMsg:
            'Basic path working: 1,000 RPS hitting Trie servers at < 50ms.',
          failMsg:
            '[FATAL] No path from user to autocomplete service. ' +
            'Connect Client → API Server → Trie Server.',
          failNode: 'client',
          failTooltip:
            'The Trie server holds the in-memory prefix tree. ' +
            'It must be reachable from the client via an API server or directly via CDN edge.',
          checks: [
            { type: 'hasPath', source: 'client', target: 'trie_server' },
          ],
        },
        {
          // Lesson: single trie server cannot handle 100k RPS → need load balancing
          traffic: 50000,
          targetLatency: 200,
          successMsg:
            '50k RPS balanced across Trie servers. Latency still sub-50ms.',
          failMsg:
            '[OVERLOAD] Single Trie server saturated at 50k RPS. ' +
            'Add a Load Balancer in front of multiple Trie Server replicas.',
          failNode: 'trie_server',
          failTooltip:
            'Run 5–10 Trie server replicas. Since the Trie is read-only (updated nightly), ' +
            'all replicas can serve the same data. Add Load Balancer → Trie Server cluster.',
          checks: [
            { type: 'hasPath', source: 'load_balancer', target: 'trie_server' },
          ],
        },
        {
          // Lesson: need a Redis layer for "trending now" real-time boost
          traffic: 100000,
          targetLatency: 45,
          successMsg:
            'SYSTEM STABLE — 100k RPS. Real-time trending boosted by Redis.',
          failMsg:
            '[STALE DATA] Trie was built last night. "Taylor Swift" is trending right now ' +
            'but not in the top-5 results. Add Redis to inject real-time popularity signals.',
          failNode: 'trie_server',
          failTooltip:
            'Maintain a Redis sorted set of trending searches (sliding 1-hour window). ' +
            'After fetching Trie results, merge with the top-3 trending terms from Redis. ' +
            'Connect Trie Server → Redis for real-time boosting.',
          checks: [
            { type: 'hasEdge', source: 'trie_server', target: 'redis' },
          ],
        },
      ],
    },

    questions: [
      {
        q: 'Why use a Trie instead of a SQL LIKE query for prefix matching?',
        hint: 'Think about the time complexity of each approach.',
        answer:
          'SQL LIKE "sam%" requires a full or partial table scan — O(n) per query. ' +
          'A Trie finds all completions for a prefix in O(prefix_length) time, ' +
          'typically 3–8 characters. At 100k RPS, that\'s the difference between ' +
          '< 1ms and > 500ms per query. The Trie trades memory for speed — ' +
          'a 10M-term Trie fits in ~10GB RAM, which is cheap.',
      },
      {
        q: 'How do you handle a new viral search term that appears after the nightly Trie update?',
        hint: 'The Trie is stale by definition. What compensates for that?',
        answer:
          'Maintain a Redis sorted set of "trending searches" using a sliding window ' +
          '(e.g., last 1 hour, updated every minute via a stream processor like Kafka + Flink). ' +
          'After the Trie returns its top-5 for a prefix, merge with the top-3 Redis trending terms. ' +
          'If there\'s overlap, deduplicate. This gives you both historical accuracy and real-time freshness.',
      },
      {
        q: 'How do you decide which 5 completions to store at each Trie node?',
        hint: 'Not all completions are equally important. How do you rank them?',
        answer:
          'Store a frequency score at each Trie node — updated by the nightly Spark batch job ' +
          'that aggregates search log data. Each node stores only the top-5 most frequent ' +
          'completions for that prefix (not all descendants). This keeps memory bounded: ' +
          'storing the full subtree at every node would cause exponential memory growth. ' +
          'Use a min-heap of size 5 at each node during the build phase.',
      },
      {
        q: 'A user in Tokyo types "S-A-M". How do you serve them in < 50ms?',
        hint: 'Geography matters. Where does the Trie live?',
        answer:
          'Deploy Trie server replicas at CDN edge locations (PoPs) near major cities. ' +
          'The Trie is read-only after nightly updates, so replicating it globally is safe. ' +
          'A user in Tokyo hits the Tokyo edge node, which responds in ~5ms. ' +
          'The nightly update pipeline pushes new Trie snapshots to all edge nodes.',
      },
      {
        q: 'How do you handle personalized autocomplete (suggest terms based on my history)?',
        hint: 'This is a separate layer on top of the global Trie.',
        answer:
          'The global Trie handles population-level suggestions. ' +
          'Personal history lives in a per-user key in Redis (last 50 searches, stored as a sorted set). ' +
          'On each keypress, run both queries in parallel: Trie (global) + Redis (personal). ' +
          'Merge results, boosting personal history terms by a fixed weight. ' +
          'Personal results should never dominate — limit to 2 personal suggestions out of 5.',
      },
    ],
  },

  // ── ENG-SYS-004 ─────────────────────────────────────────────────────────────
  {
    id: 'ENG-SYS-004',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design a Live Viewership Counter',
    companies: ['Twitch', 'YouTube'],
    timeEst: '~45 min',
    level: 'Senior',
    status: 'Not Started',
    desc:
      'A livestream has 2 million concurrent viewers. Users join and leave constantly. ' +
      'Show an accurate viewer count on the screen updating every 2 seconds.',
    solution:
      'Never write a DB row on every join/leave event — that\'s 2M writes/sec. ' +
      'Instead, clients send heartbeat pings every 5 seconds to a fleet of ' +
      'stateless aggregation servers. Each server holds its local in-memory count. ' +
      'Every second, aggregators flush their partial counts to Redis via INCR/DECR. ' +
      'The Redis counter is the authoritative viewer count, read by all clients.',

    simulation: {
      constraints: [
        { label: 'Concurrent viewers', value: '2,000,000' },
        { label: 'Heartbeat interval', value: 'Every 5 sec per client' },
        { label: 'Display refresh', value: 'Every 2 sec' },
        { label: 'Heartbeat RPS', value: '400,000 RPS (2M / 5)' },
        { label: 'Accuracy tolerance', value: '± 2% acceptable' },
      ],

      levels: [
        {
          // Lesson: clients need to send heartbeats to something
          traffic: 50000,
          targetLatency: 100,
          successMsg:
            '50k heartbeats/sec received. Aggregation layer active.',
          failMsg:
            '[FATAL] 50,000 heartbeats/sec from clients with nowhere to go. ' +
            'Add Aggregation Servers to receive and buffer heartbeats.',
          failNode: 'client',
          failTooltip:
            'Clients must ping an Aggregation Server every 5 seconds. ' +
            'The aggregator holds an in-memory counter — no DB write per heartbeat. ' +
            'Connect: Client → Load Balancer → Aggregation Server.',
          checks: [
            { type: 'hasPath', source: 'client', target: 'aggregator_server' },
          ],
        },
        {
          // Lesson: writing each heartbeat to Postgres = instant death
          traffic: 400000,
          targetLatency: 5000,
          successMsg:
            '400k RPS absorbed. Aggregators batching in memory before Redis flush.',
          failMsg:
            '[DB OVERLOAD] Aggregators are writing every heartbeat to Postgres. ' +
            '400,000 writes/sec = instant crash. Aggregators must batch in memory ' +
            'and flush a single integer to Redis every second.',
          failNode: 'aggregator_server',
          failTooltip:
            'Each Aggregation Server should hold an in-memory counter. ' +
            'Every second, it sends one INCRBY command to Redis with its local count delta. ' +
            'Redis holds the global sum. No Postgres writes needed for the counter.',
          checks: [
            { type: 'hasEdge', source: 'aggregator_server', target: 'redis' },
          ],
        },
        {
          // Lesson: Redis SPOF → need persistence + client reads from Redis not DB
          traffic: 400000,
          targetLatency: 40,
          successMsg:
            'SYSTEM STABLE — 2M viewers tracked. Counter accurate to ± 1%. Latency 40ms.',
          failMsg:
            '[STALE DISPLAY] Clients are polling Postgres for the viewer count every 2 sec. ' +
            'Postgres doesn\'t have the count — Redis does. Read the counter from Redis.',
          failNode: 'postgres',
          failTooltip:
            'Clients (or the API layer) should read the viewer count from Redis, ' +
            'not Postgres. Redis answers in < 1ms. Separately, persist the Redis ' +
            'counter to Postgres every 60 seconds for analytics — but don\'t read from it live.',
          checks: [
            { type: 'hasPath', source: 'client', target: 'redis' },
            { type: 'hasEdge', source: 'redis', target: 'postgres' },
          ],
        },
      ],
    },

    questions: [
      {
        q: 'Why can\'t you just do a DB increment on every viewer join/leave?',
        hint: 'Do the math on writes per second at 2M concurrent users.',
        answer:
          '2 million viewers joining and leaving across a stream means potentially ' +
          '100k–400k DB writes per second during active periods. ' +
          'A well-tuned Postgres instance handles ~10k writes/sec. ' +
          'Even Cassandra tops out around 100k writes/sec per node. ' +
          'You\'d need a huge DB cluster just to track one number — wasteful and fragile. ' +
          'Aggregation + Redis reduces this to ~10 Redis commands per second globally.',
      },
      {
        q: 'A viewer\'s browser crashes. How do you detect they left and decrement the count?',
        hint: 'There\'s no "leave" event from a crashed browser.',
        answer:
          'Use heartbeat expiry. Each viewer sends a heartbeat every 5 seconds. ' +
          'The aggregator server tracks each viewer\'s last heartbeat timestamp. ' +
          'If a viewer hasn\'t pinged in 15 seconds (3 missed heartbeats), ' +
          'they are considered gone and the counter is decremented. ' +
          'This means counts can be ± a few seconds late on departures — acceptable.',
      },
      {
        q: 'What happens if the Redis instance storing the viewer count goes down?',
        hint: 'Redis is a SPOF here. How do you handle it?',
        answer:
          'Run Redis in Cluster mode or with a primary + replica setup. ' +
          'Redis Sentinel handles automatic failover in ~30 seconds. ' +
          'During the failover window, serve the last known count (stale but not zero). ' +
          'Alternatively, use Redis persistence (AOF) so the counter survives a restart. ' +
          'For a viewer count, 30-second staleness is acceptable — not so for financial data.',
      },
      {
        q: 'How do you display the count to 2 million clients every 2 seconds without overloading Redis?',
        hint: 'Don\'t let 2M clients all poll Redis directly.',
        answer:
          'Add an API layer that reads the Redis counter once per second and caches it locally. ' +
          'All 2M clients poll this API layer (behind a CDN or multiple replicas), ' +
          'not Redis directly. The API serves the cached value from memory. ' +
          'Redis gets one read per second per API server, not 2M reads per second.',
      },
      {
        q: 'How would you count unique viewers (not just concurrent connections)?',
        hint: 'Unique counting at scale is a different problem from incrementing.',
        answer:
          'Use a HyperLogLog data structure, which provides approximate unique counts ' +
          'using only ~12KB of memory regardless of cardinality. ' +
          'Redis has native HyperLogLog support (PFADD, PFCOUNT). ' +
          'On each heartbeat, PFADD the viewer\'s user ID or fingerprint. ' +
          'PFCOUNT returns the unique viewer estimate with ~0.81% error — acceptable for analytics.',
      },
    ],
  },

  // ── ENG-SYS-005 ─────────────────────────────────────────────────────────────
  {
    id: 'ENG-SYS-005',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design a Global Chat App (WhatsApp)',
    companies: ['Meta', 'Discord'],
    timeEst: '~60 min',
    level: 'Senior',
    status: 'Not Started',
    desc:
      'Design 1-on-1 messaging for 1 billion users. ' +
      'Messages must be delivered in real-time, ' +
      'and read receipts must be supported.',
    solution:
      'Clients hold persistent WebSocket connections to a Gateway Server cluster. ' +
      'A Redis hash maps UserID → GatewayServerID so any server can find any user. ' +
      'When User A messages User B, the backend looks up B\'s active Gateway ' +
      'in Redis and pushes the message over B\'s open socket. ' +
      'Cassandra stores message history. Kafka handles async fan-out and receipts.',

    simulation: {
      constraints: [
        { label: 'Total users', value: '1 Billion' },
        { label: 'Daily active users', value: '500 Million' },
        { label: 'Messages per day', value: '100 Billion' },
        { label: 'Avg message size', value: '100 bytes' },
        { label: 'Storage per day', value: '~10 TB' },
      ],

      levels: [
        {
          // Lesson: HTTP polling is terrible for chat — need persistent connection
          traffic: 10000,
          targetLatency: 800,
          successMsg:
            'WebSocket gateway up. 10k persistent connections established.',
          failMsg:
            '[HIGH LATENCY] Using HTTP polling for chat. Every client polls every 1 second. ' +
            '10,000 users = 10,000 requests/sec for zero new messages. ' +
            'Switch to WebSocket persistent connections.',
          failNode: 'client',
          failTooltip:
            'Chat requires a persistent bidirectional connection. ' +
            'HTTP polling wastes bandwidth and adds latency. ' +
            'Add a WebSocket Gateway: Client → WebSocket Gateway. ' +
            'Each connection is maintained until the user closes the app.',
          checks: [
            { type: 'hasPath', source: 'client', target: 'websocket_gateway' },
          ],
        },
        {
          // Lesson: need to know WHICH gateway server a user is connected to
          traffic: 100000,
          targetLatency: 500,
          successMsg:
            'Routing map active. Any gateway can find any user in O(1).',
          failMsg:
            '[ROUTING FAILURE] Gateway Server A receives a message for User B, ' +
            'but User B is connected to Gateway Server C. ' +
            'Add Redis as a routing map: UserID → GatewayServerID.',
          failNode: 'websocket_gateway',
          failTooltip:
            'When a user connects to a Gateway, write UserID → ServerID to Redis. ' +
            'When a message arrives for User B, look up B\'s ServerID in Redis ' +
            'and forward the message to that specific Gateway Server. ' +
            'Connect: WebSocket Gateway → Redis.',
          checks: [
            { type: 'hasEdge', source: 'websocket_gateway', target: 'redis' },
          ],
        },
        {
          // Lesson: messages need to be stored persistently AND acknowledged
          traffic: 1000000,
          targetLatency: 80,
          successMsg:
            'SYSTEM STABLE — Messages delivered in real-time. History persisted. Read receipts working.',
          failMsg:
            '[DATA LOSS] Messages delivered in real-time but not stored anywhere. ' +
            'If User B\'s phone restarts, they lose all messages. ' +
            'Connect Gateway → Kafka → Cassandra for async persistence.',
          failNode: 'websocket_gateway',
          failTooltip:
            'After delivering a message to User B via WebSocket, also write it to Kafka. ' +
            'A consumer saves it to Cassandra (partitioned by conversation_id). ' +
            'This decouples delivery (real-time) from storage (async). ' +
            'Read receipts are also events published to Kafka.',
          checks: [
            { type: 'hasPath', source: 'websocket_gateway', target: 'kafka' },
            { type: 'hasPath', source: 'kafka', target: 'cassandra' },
          ],
        },
      ],
    },

    questions: [
      {
        q: 'What happens when User B is offline when User A sends a message?',
        hint: 'No WebSocket connection exists for offline users.',
        answer:
          'Check Redis: if UserID → ServerID mapping doesn\'t exist, User B is offline. ' +
          'Store the message in Cassandra under the conversation. ' +
          'Send a push notification via APNS/FCM. ' +
          'When User B comes online and opens the app, the client fetches missed messages ' +
          'from Cassandra using a "last_seen_message_id" cursor.',
      },
      {
        q: 'How do you implement message ordering? WhatsApp shows messages in the exact send order.',
        hint: 'Distributed systems have no global clock. How do you sequence messages?',
        answer:
          'Use a Lamport timestamp or a per-conversation sequence number. ' +
          'Simpler approach: each message gets a server-assigned timestamp from a single ' +
          'sequencer service (or Cassandra\'s TIMEUUID). ' +
          'Store messages partitioned by conversation_id, clustered by timestamp. ' +
          'Clients always display in timestamp order. ' +
          'Two messages with the same millisecond timestamp are broken by sender_id (arbitrary but consistent).',
      },
      {
        q: 'How do read receipts work at scale?',
        hint: 'A "read" event is just another message in the opposite direction.',
        answer:
          'When User B opens a conversation, the client sends a "read receipt" event ' +
          'to the Gateway. The Gateway publishes it to Kafka as a receipt event. ' +
          'A consumer updates the last_read_message_id for User B in Cassandra. ' +
          'User A\'s app, which has an open WebSocket, receives the receipt event ' +
          'pushed in real-time by the Gateway — the double tick turns blue.',
      },
      {
        q: 'How do you handle a Gateway Server crashing with 10,000 open connections?',
        hint: 'All those users just lost their real-time connection.',
        answer:
          'Clients implement exponential backoff reconnection (retry after 1s, 2s, 4s…). ' +
          'On reconnect, the client hits any available Gateway (load balanced). ' +
          'The new Gateway writes the new UserID → NewServerID mapping to Redis, ' +
          'overwriting the stale entry. The client fetches missed messages from Cassandra. ' +
          'Total downtime per user: 1–5 seconds — acceptable for a chat app.',
      },
      {
        q: 'WhatsApp uses end-to-end encryption. How does that affect the server architecture?',
        hint: 'The server must never see plaintext. What does it actually store?',
        answer:
          'With E2E encryption (Signal Protocol), the server only stores and routes ciphertext. ' +
          'The encryption key is derived from the recipient\'s public key — the server never has it. ' +
          'Architecture impact: the server cannot do server-side search of message content. ' +
          'All decryption happens on the client device. ' +
          'Cassandra stores encrypted blobs, not readable text. ' +
          'This also means if a user loses their device, their messages may be unrecoverable.',
      },
    ],
  },

  // ── ENG-SYS-006 ─────────────────────────────────────────────────────────────
  {
    id: 'ENG-SYS-006',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design a Payment Gateway (Stripe)',
    companies: ['Stripe', 'Square'],
    timeEst: '~60 min',
    level: 'Senior',
    status: 'Not Started',
    desc:
      'Architect a B2B payment API. It must strictly guarantee 100% data consistency, ' +
      'no dropped payments, and absolute protection against double-charging ' +
      'due to network retries.',
    solution:
      'Use PostgreSQL with ACID transactions for all payment state. ' +
      'Enforce Idempotency Keys on every API endpoint — the key is stored in Postgres ' +
      'alongside the result, so retries return the cached response rather than re-executing. ' +
      'Implement a Saga pattern (or 2-Phase Commit) for cross-service distributed transactions ' +
      'to ensure bank and internal state stay synchronized.',

    simulation: {
      constraints: [
        { label: 'Consistency model', value: 'Strong (ACID required)' },
        { label: 'Double-charge rate', value: 'Must be 0%' },
        { label: 'Retry safety', value: 'All endpoints idempotent' },
        { label: 'Availability target', value: '99.999% (5.26 min/yr downtime)' },
        { label: 'Audit requirement', value: 'Every state change logged' },
      ],

      levels: [
        {
          // Lesson: payment APIs must be idempotent — retries can't double-charge
          traffic: 1000,
          targetLatency: 200,
          successMsg:
            'Idempotency layer active. Retry requests return cached result.',
          failMsg:
            '[DOUBLE CHARGE] A client retried a failed request. ' +
            'Two payment rows were created for the same transaction. ' +
            'You must enforce Idempotency Keys on the API endpoint.',
          failNode: 'api_server',
          failTooltip:
            'Every POST /charge request must include an idempotency_key in the header. ' +
            'Before processing, check if this key exists in Postgres. ' +
            'If yes, return the stored result — do NOT re-execute the charge. ' +
            'If no, execute and store the result atomically.',
          checks: [
            { type: 'hasPath', source: 'client', target: 'api_server' },
            { type: 'hasPath', source: 'api_server', target: 'postgres' },
          ],
        },
        {
          // Lesson: payment state must be in ACID-compliant DB, not eventually consistent
          traffic: 5000,
          targetLatency: 150,
          successMsg:
            'ACID transactions confirmed. Payment state consistent across all reads.',
          failMsg:
            '[DATA INCONSISTENCY] Cassandra\'s eventual consistency caused a payment to ' +
            'appear as "pending" to the merchant dashboard but "completed" in the ledger. ' +
            'Use PostgreSQL — payments require strong consistency, not eventual.',
          failNode: 'cassandra',
          failTooltip:
            'Cassandra is eventually consistent by default. For payments, ' +
            '"eventually" is not good enough — a charge must be atomically committed or rolled back. ' +
            'Replace Cassandra with PostgreSQL. Use SERIALIZABLE isolation for balance checks.',
          checks: [
            { type: 'hasEdge', source: 'api_server', target: 'postgres' },
          ],
        },
        {
          // Lesson: external bank API calls need async handling + Kafka for reliability
          traffic: 5000,
          targetLatency: 100,
          successMsg:
            'SYSTEM STABLE — Payments processed reliably. Saga pattern preventing partial failures.',
          failMsg:
            '[PARTIAL FAILURE] Internal DB was charged but the bank API call timed out. ' +
            'Your DB says the user paid; the bank says they didn\'t. ' +
            'Add Kafka + a Saga coordinator to manage distributed transaction state.',
          failNode: 'api_server',
          failTooltip:
            'Use the Saga pattern: split the transaction into steps ' +
            '(reserve funds → call bank API → confirm reservation). ' +
            'If the bank API fails, publish a compensating event to Kafka ' +
            'that reverses the DB reservation. This prevents the split-brain state.',
          checks: [
            { type: 'hasPath', source: 'api_server', target: 'kafka' },
            { type: 'hasPath', source: 'kafka', target: 'postgres' },
          ],
        },
      ],
    },

    questions: [
      {
        q: 'A client sends a charge request. Your server processes it but crashes before responding. The client retries. What happens?',
        hint: 'This is exactly what idempotency keys solve.',
        answer:
          'Without idempotency keys: the retry creates a second charge — the customer is double-billed. ' +
          'With idempotency keys: the client sends the same idempotency_key on retry. ' +
          'Your server checks the key in Postgres before executing. ' +
          'Finds the first charge result (committed before the crash). ' +
          'Returns that result without re-executing the charge. Customer billed exactly once.',
      },
      {
        q: 'Why is Postgres the right choice here when Cassandra handles higher throughput?',
        hint: 'CAP theorem: what do you sacrifice with eventual consistency in payments?',
        answer:
          'Cassandra sacrifices consistency for availability and partition tolerance. ' +
          'In a payment system, an inconsistent read could show a user has $500 when they have $0, ' +
          'allowing a fraudulent charge. ' +
          'Postgres provides SERIALIZABLE isolation: balance check and deduction happen atomically. ' +
          'No other transaction can read the intermediate state. ' +
          'For payment volumes (typically < 10k TPS), Postgres with connection pooling (PgBouncer) is sufficient.',
      },
      {
        q: 'What is the Saga pattern and how does it handle a bank API failure mid-transaction?',
        hint: 'Think of a Saga as a distributed transaction with compensating steps.',
        answer:
          'A Saga is a sequence of local transactions, each publishing an event on completion. ' +
          'Step 1: Reserve $100 from user balance (local Postgres write). ' +
          'Step 2: Call bank API to process payment (external). ' +
          'Step 3: Confirm reservation and mark payment complete. ' +
          'If Step 2 fails: publish a "payment_failed" event to Kafka. ' +
          'A compensating transaction runs Step 1 in reverse: release the $100 reservation. ' +
          'No money leaves the user\'s account. No orphaned state.',
      },
      {
        q: 'How do you prevent a race condition where two requests check a user\'s balance simultaneously and both see sufficient funds?',
        hint: 'Optimistic vs pessimistic locking in Postgres.',
        answer:
          'Use SELECT ... FOR UPDATE in Postgres to acquire a row-level lock on the user\'s balance row. ' +
          'The first transaction locks the row, checks the balance, deducts, and commits. ' +
          'The second transaction is blocked until the first commits. ' +
          'It then reads the updated balance and either proceeds or fails with "Insufficient funds". ' +
          'No two transactions can simultaneously see the same "available" balance.',
      },
      {
        q: 'Stripe achieves 99.999% uptime. How do you design for that level of availability?',
        hint: 'What are all the single points of failure in your design?',
        answer:
          '99.999% = 5.26 minutes downtime per year. Required: ' +
          '(1) Multi-AZ Postgres with synchronous replication — failover < 30 seconds. ' +
          '(2) Kafka with replication factor 3 — tolerates 2 broker failures. ' +
          '(3) Stateless API servers behind a load balancer — restart in seconds. ' +
          '(4) Circuit breakers on all external bank API calls — fail fast, queue for retry. ' +
          '(5) Regular chaos engineering (kill random nodes in staging). ' +
          'The biggest risk: the Postgres primary failing. Synchronous replication to a standby is mandatory.',
      },
    ],
  },

  // ── ENG-SYS-007 ─────────────────────────────────────────────────────────────
  {
    id: 'ENG-SYS-007',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design a Web Crawler',
    companies: ['Google', 'OpenAI'],
    timeEst: '~60 min',
    level: 'Senior',
    status: 'Not Started',
    desc:
      'Crawl 1 billion web pages a month to train an LLM. ' +
      'Avoid crawling the same page twice, respect robots.txt, ' +
      'and avoid getting blocked by anti-DDoS systems.',
    solution:
      'Seed URLs into a Kafka queue. Worker nodes pull URLs, resolve DNS (with caching), ' +
      'fetch HTML, and extract new links. ' +
      'Use a Bloom Filter to check if a URL has been visited (saves DB lookups at scale). ' +
      'Dedicate one Kafka partition per domain to enforce per-domain rate limiting ' +
      'and avoid triggering DDoS protection.',

    simulation: {
      constraints: [
        { label: 'Pages per month', value: '1 Billion' },
        { label: 'Avg page size', value: '100 KB' },
        { label: 'Total data', value: '~100 TB/month' },
        { label: 'Crawl rate needed', value: '~400 pages/sec' },
        { label: 'Unique URL store', value: '~200 GB (Bloom Filter)' },
      ],

      levels: [
        {
          // Lesson: need a queue to distribute work across many workers
          traffic: 100,
          targetLatency: 500,
          successMsg:
            'URL queue active. 100 workers pulling and fetching URLs.',
          failMsg:
            '[SERIAL CRAWL] Crawling URLs one at a time sequentially. ' +
            'At 400 pages/sec needed, this will take 80 years. ' +
            'Add Kafka as a URL work queue for parallel workers.',
          failNode: 'api_server',
          failTooltip:
            'Add Kafka as the URL frontier queue. ' +
            'Seed it with initial URLs. ' +
            'Hundreds of worker nodes consume from Kafka in parallel, ' +
            'each fetching and parsing a different page simultaneously.',
          checks: [
            { type: 'hasPath', source: 'api_server', target: 'kafka' },
            { type: 'hasPath', source: 'kafka', target: 'worker' },
          ],
        },
        {
          // Lesson: checking visited URLs in Postgres at 400 RPS → too slow
          traffic: 400,
          targetLatency: 2000,
          successMsg:
            'Bloom Filter active. Duplicate URL checks in < 1ms. No DB per-URL lookups.',
          failMsg:
            '[DUPLICATE OVERLOAD] Workers are querying Postgres to check if each URL ' +
            'has been visited before. 400 SQL lookups/sec just for deduplication. ' +
            'Replace with a Bloom Filter — probabilistic, in-memory, zero DB calls.',
          failNode: 'postgres',
          failTooltip:
            'A Bloom Filter can tell you "definitely not seen" or "probably seen" ' +
            'in O(k) hash operations, all in RAM — no network call. ' +
            '200GB Bloom Filter stores 10 billion URLs with 1% false positive rate. ' +
            'Connect Worker → Bloom Filter → Kafka (to decide whether to enqueue new URLs).',
          checks: [
            { type: 'hasPath', source: 'worker', target: 'bloom_filter' },
          ],
        },
        {
          // Lesson: hammering one domain = getting blocked → rate limit per domain
          traffic: 400,
          targetLatency: 100,
          successMsg:
            'SYSTEM STABLE — 400 pages/sec. Per-domain rate limiting. robots.txt respected.',
          failMsg:
            '[BLOCKED] 40 workers all crawling google.com simultaneously. ' +
            'Google\'s DDoS protection returned 429 Too Many Requests. ' +
            'Implement per-domain rate limiting via Kafka partition-per-domain.',
          failNode: 'worker',
          failTooltip:
            'Assign one Kafka partition per domain. ' +
            'A partition has exactly one consumer at a time. ' +
            'This naturally enforces "one worker per domain" — no domain gets hammered. ' +
            'Add a configurable delay (e.g., 1 request/sec per domain) at the consumer level.',
          checks: [
            { type: 'hasNode', source: 'bloom_filter' },
            { type: 'hasPath', source: 'worker', target: 's3' },
          ],
        },
      ],
    },

    questions: [
      {
        q: 'What is a Bloom Filter and why does a web crawler need one?',
        hint: 'Think about what you need to check millions of times per second.',
        answer:
          'A Bloom Filter is a probabilistic data structure that answers "have I seen this before?" ' +
          'in O(k) time using only in-memory bit operations. ' +
          'It has no false negatives (if it says "not seen", it definitely hasn\'t been) ' +
          'and a configurable false positive rate (say 1% — occasionally re-crawls a page). ' +
          'At 1 billion URLs, a Bloom Filter takes ~200GB of RAM. ' +
          'Checking Postgres for the same 1 billion URLs would require 1 billion index lookups — ' +
          'orders of magnitude slower and much more expensive.',
      },
      {
        q: 'How do you handle robots.txt?',
        hint: 'You need to check robots.txt before crawling any page on a domain.',
        answer:
          'Fetch and cache robots.txt for each domain at the start of crawling that domain. ' +
          'Store the parsed rules (Disallow: /admin) in Redis with a 24-hour TTL. ' +
          'Before fetching any URL, check the domain\'s cached robots.txt rules. ' +
          'If the path is disallowed, drop the URL and do not enqueue it. ' +
          'Respect Crawl-delay directives in robots.txt for rate limiting per domain.',
      },
      {
        q: 'How do you detect and handle duplicate content? Two different URLs with the same page.',
        hint: 'Hash the content, not the URL.',
        answer:
          'After fetching a page, compute a SHA-256 hash of the page content (not the URL). ' +
          'Store the hash in Postgres. Before saving a page, check if that hash already exists. ' +
          'If yes: the page is a duplicate (canonical vs non-canonical URL). ' +
          'Don\'t re-process it. Optionally, record the canonical URL mapping for SEO analysis. ' +
          'Bloom Filter stores URL-level deduplication; Postgres stores content-level deduplication.',
      },
      {
        q: 'How do you prioritize which URLs to crawl first?',
        hint: 'Not all pages are equally valuable.',
        answer:
          'Use multiple Kafka topics with different priority levels: ' +
          'PRIORITY_HIGH (news sites, known quality domains), PRIORITY_NORMAL, PRIORITY_LOW. ' +
          'Workers poll high-priority topics first (weighted round-robin). ' +
          'Compute priority based on: PageRank of the referring page, ' +
          'domain authority, recency of last modification (from sitemap.xml or HTTP Last-Modified header), ' +
          'and user-defined seed lists.',
      },
      {
        q: 'How do you store 100TB of crawled HTML per month cost-effectively?',
        hint: 'Block storage is expensive. Think object storage.',
        answer:
          'Write raw HTML to S3 (or GCS). Object storage costs ~$23/TB/month vs ~$100/TB for SSD. ' +
          'Store only the parsed/cleaned text in your training corpus. ' +
          'Keep a Postgres index of: URL, crawl timestamp, S3 path, content hash. ' +
          'Apply compression (gzip) before writing to S3 — HTML compresses ~10:1, ' +
          'reducing storage to ~10TB/month. Use S3 Intelligent-Tiering to auto-move ' +
          'old crawl data to Glacier for even cheaper long-term storage.',
      },
    ],
  },

  // ── ENG-SYS-008 ─────────────────────────────────────────────────────────────
  {
    id: 'ENG-SYS-008',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design a Proximity Service (Yelp)',
    companies: ['Yelp', 'Tinder'],
    timeEst: '~45 min',
    level: 'Mid',
    status: 'Not Started',
    desc:
      'Users open the app and need to see the 10 closest restaurants within a 5-mile radius. ' +
      'There are 50 million restaurants in the database.',
    solution:
      'Standard SQL WHERE lat > X AND lon > Y is too slow — it\'s a 2D range scan on two columns. ' +
      'Use Geohashing to encode 2D coordinates into a 1D string. ' +
      'Store geohashes in Redis (or Postgres with a B-Tree index) for fast prefix matching. ' +
      'To find restaurants within 5 miles, query the user\'s geohash cell and its 8 neighbors.',

    simulation: {
      constraints: [
        { label: 'Total restaurants', value: '50 Million' },
        { label: 'Search radius', value: '5 miles' },
        { label: 'Results to return', value: 'Top 10 by distance' },
        { label: 'Target latency', value: '< 100ms' },
        { label: 'Location update rate', value: '< 1/sec per user' },
      ],

      levels: [
        {
          // Lesson: naive SQL 2D query is too slow
          traffic: 1000,
          targetLatency: 2000,
          successMsg:
            'Geohash service active. Proximity queries returning in < 20ms.',
          failMsg:
            '[SLOW QUERY] Running WHERE lat BETWEEN X AND lat+5mi AND lon BETWEEN Y AND lon+5mi. ' +
            'Full table scan on 50M rows. Query taking 4 seconds. ' +
            'Add a Geohash Service to convert coordinates to 1D prefix keys.',
          failNode: 'postgres',
          failTooltip:
            'A 2D range query on lat/lon requires scanning millions of rows. ' +
            'Geohashing converts a 2D point to a 1D string (e.g., "9q8yy"). ' +
            'All points within a radius share the same prefix. ' +
            'This turns a 2D range query into a fast B-Tree prefix lookup. ' +
            'Add: API Server → Geohash Service → Postgres/Redis.',
          checks: [
            { type: 'hasPath', source: 'api_server', target: 'geohash_service' },
          ],
        },
        {
          // Lesson: geohash results in Postgres need indexing
          traffic: 5000,
          targetLatency: 500,
          successMsg:
            'Redis geospatial index active. 50M restaurants indexed. Lookups < 5ms.',
          failMsg:
            '[INDEX MISSING] Geohash prefix queries against Postgres are still slow. ' +
            '50M rows with no B-Tree index on the geohash column = full scan. ' +
            'Add Redis GEOADD/GEORADIUS or a Postgres index on the geohash column.',
          failNode: 'geohash_service',
          failTooltip:
            'Redis has native geospatial commands: GEOADD stores lat/lon, ' +
            'GEORADIUS returns all keys within a radius in O(N+log(M)) time. ' +
            'Pre-load all 50M restaurant coordinates into Redis. ' +
            'A GEORADIUS query returns the 10 nearest in ~10ms regardless of total count.',
          checks: [
            { type: 'hasEdge', source: 'geohash_service', target: 'redis' },
          ],
        },
        {
          // Lesson: CDN + caching for popular areas
          traffic: 50000,
          targetLatency: 80,
          successMsg:
            'SYSTEM STABLE — 50k RPS. Popular area results cached at CDN edge.',
          failMsg:
            '[CACHE MISS] Every user in downtown San Francisco is querying the same ' +
            '5-mile radius. 10,000 identical Redis GEORADIUS queries per second for the same result. ' +
            'Cache popular geohash results at the CDN layer.',
          failNode: 'redis',
          failTooltip:
            'Cache the result of a GEORADIUS query keyed by geohash prefix + radius. ' +
            'Restaurants don\'t move often — a 30-second CDN cache dramatically reduces Redis load. ' +
            'Restaurants that update their location invalidate the cache for their geohash cell only.',
          checks: [
            { type: 'hasPath', source: 'client', target: 'cdn' },
            { type: 'hasPath', source: 'cdn', target: 'redis' },
          ],
        },
      ],
    },

    questions: [
      {
        q: 'What is geohashing and how does it make proximity queries fast?',
        hint: 'Think about turning a 2D problem into a 1D problem.',
        answer:
          'Geohashing divides the world into a grid of rectangular cells, ' +
          'each encoded as a base32 string. Nearby locations share a common prefix. ' +
          '"9q8yy" and "9q8yz" are adjacent cells in San Francisco. ' +
          'A range query becomes a prefix lookup: "give me all restaurants where geohash LIKE \'9q8y%\'". ' +
          'A B-Tree index on the geohash string makes this O(log n) instead of O(n).',
      },
      {
        q: 'What is the edge case with geohashing near cell boundaries?',
        hint: 'Two points can be 10 meters apart but in different geohash cells.',
        answer:
          'A user standing on the border of geohash cell "9q8yy" is equidistant from ' +
          'restaurants in cells "9q8yy" and "9q8yz". ' +
          'If you only query one cell, you miss nearby restaurants in adjacent cells. ' +
          'Solution: always query the user\'s geohash cell PLUS its 8 neighboring cells (a 3x3 grid). ' +
          'Then filter the results by actual Euclidean distance and return the top 10.',
      },
      {
        q: 'Tinder shows people within a radius. How does the design change for moving users?',
        hint: 'Restaurants don\'t move. Users do.',
        answer:
          'For moving users (Tinder, Uber), you cannot cache geohash results. ' +
          'Users send location updates every 5 seconds via the mobile app. ' +
          'Write each update to Redis GEOADD, overwriting the previous position. ' +
          'For user privacy, round coordinates to the nearest 100m. ' +
          'To avoid showing stale locations, only include users whose last update was < 10 minutes ago. ' +
          'Store last_seen timestamp alongside coordinates.',
      },
      {
        q: 'How do you rank the 10 results? Nearest? Highest rated?',
        hint: 'Pure distance ranking is rarely what users want.',
        answer:
          'The database returns all restaurants within the radius (say 50 candidates). ' +
          'Rank by a weighted score: ' +
          '(0.4 × rating_score) + (0.3 × proximity_score) + (0.2 × review_count_score) + (0.1 × recency_score). ' +
          'proximity_score = 1 - (distance / max_radius). ' +
          'Return the top 10 by this score. ' +
          'Allow users to switch to "Sort by: Distance / Rating / Open Now" in the UI, ' +
          'which re-ranks client-side since the candidate set is already fetched.',
      },
      {
        q: 'How would you handle 50 million restaurant writes during an initial data import?',
        hint: 'Inserting 50M rows one at a time would take days.',
        answer:
          'Use Redis GEOADD with bulk pipeline: batch 10,000 restaurants per command, ' +
          'pipelined without waiting for acknowledgment between batches. ' +
          'A 50M import at 10k/batch = 5,000 pipeline batches. ' +
          'At ~50ms per batch, total import time = ~4 minutes. ' +
          'For Postgres, use COPY FROM (PostgreSQL\'s bulk loader) instead of INSERT — ' +
          '10–100× faster for large datasets.',
      },
    ],
  },

  // ── ENG-SYS-009 ─────────────────────────────────────────────────────────────
  {
    id: 'ENG-SYS-009',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design a Notification System',
    companies: ['Apple', 'Netflix'],
    timeEst: '~45 min',
    level: 'Mid',
    status: 'Not Started',
    desc:
      'Send out 10 million push notifications for a breaking news event within 1 minute. ' +
      'Handle user opt-outs and failed deliveries.',
    solution:
      'The API drops a "send" event into RabbitMQ/Kafka. ' +
      'Hundreds of worker nodes consume the queue in parallel, ' +
      'check user preferences in Redis (opt-out status), ' +
      'format the payload, and send asynchronously to APNS (Apple) or FCM (Google). ' +
      'Failed deliveries are retried with exponential backoff via a dead-letter queue.',

    simulation: {
      constraints: [
        { label: 'Target recipients', value: '10,000,000' },
        { label: 'Time budget', value: '60 seconds' },
        { label: 'Required throughput', value: '166,667 sends/sec' },
        { label: 'APNS max batch size', value: '5,000 per connection' },
        { label: 'Opt-out check', value: 'Per user, before every send' },
      ],

      levels: [
        {
          // Lesson: synchronous serial send is too slow
          traffic: 1000,
          targetLatency: 200,
          successMsg:
            'Kafka queue active. Workers consuming and dispatching notifications in parallel.',
          failMsg:
            '[TOO SLOW] Sending notifications synchronously, one at a time. ' +
            'At 1ms per send, 10M notifications = 2.7 hours. ' +
            'You have 60 seconds. Publish to Kafka, fan out to 200 parallel workers.',
          failNode: 'api_server',
          failTooltip:
            'The API should immediately publish a "send_campaign" event to Kafka and return 202. ' +
            'Worker nodes subscribe to Kafka, each handling a shard of the recipient list in parallel. ' +
            '200 workers × 833 sends/sec each = 166k sends/sec total.',
          checks: [
            { type: 'hasPath', source: 'api_server', target: 'kafka' },
            { type: 'hasPath', source: 'kafka', target: 'worker' },
          ],
        },
        {
          // Lesson: must check preferences before sending — opt-outs
          traffic: 50000,
          targetLatency: 300,
          successMsg:
            'Preference checks passing. Opted-out users skipped. Compliance maintained.',
          failMsg:
            '[COMPLIANCE FAILURE] Sending notifications to users who opted out. ' +
            'GDPR violation. Workers must check user notification preferences before each send.',
          failNode: 'worker',
          failTooltip:
            'Before calling APNS/FCM, each worker must check Redis for the user\'s ' +
            'notification preferences (opt-in status, quiet hours, device token validity). ' +
            'Cache preferences in Redis with a 5-minute TTL. ' +
            'Connect Worker → Redis → APNS/FCM.',
          checks: [
            { type: 'hasEdge', source: 'worker', target: 'redis' },
            { type: 'hasPath', source: 'worker', target: 'apns_fcm' },
          ],
        },
        {
          // Lesson: failed deliveries need retries via dead-letter queue
          traffic: 166000,
          targetLatency: 60,
          successMsg:
            'SYSTEM STABLE — 10M notifications sent in 58 seconds. Failed retried via DLQ.',
          failMsg:
            '[SILENT FAILURE] 300,000 notifications failed silently. ' +
            'APNS returned error but workers dropped the failure. ' +
            'Add a Dead-Letter Queue in Kafka for failed messages.',
          failNode: 'apns_fcm',
          failTooltip:
            'When APNS/FCM returns an error (expired device token, rate limit), ' +
            'publish the failed message to a Kafka DLQ topic. ' +
            'A separate retry consumer processes DLQ messages with exponential backoff. ' +
            'After 3 retries, mark the notification as permanently failed in Postgres and alert.',
          checks: [
            { type: 'hasPath', source: 'apns_fcm', target: 'kafka' },
            { type: 'hasPath', source: 'kafka', target: 'postgres' },
          ],
        },
      ],
    },

    questions: [
      {
        q: 'APNS and FCM have rate limits. How do you avoid hitting them?',
        hint: 'Each APNS connection has a max throughput. More connections = more throughput.',
        answer:
          'APNS supports up to 500 concurrent connections per certificate, each handling ~1,000 msgs/sec. ' +
          'To hit 100k sends/sec: maintain a connection pool of 100 APNS connections. ' +
          'Shard the recipient list by user_id % num_workers so each worker owns ' +
          'a non-overlapping slice of the recipient list. ' +
          'Use the HTTP/2 protocol to APNS — it multiplexes requests over a single connection.',
      },
      {
        q: 'How do you handle a user who has both an iOS and Android device?',
        hint: 'One user can have multiple device tokens.',
        answer:
          'Store device tokens in a Postgres table: ' +
          'user_id (FK), device_token (unique), platform (ios/android), last_active. ' +
          'One user can have N device tokens. ' +
          'When sending, fetch all active tokens for the user and send to all of them. ' +
          'On APNS error 410 (token expired), delete that token from Postgres. ' +
          'Clients register new tokens on app launch, so stale tokens self-resolve.',
      },
      {
        q: 'How do you implement "quiet hours" — don\'t send between 10pm and 8am in the user\'s timezone?',
        hint: 'You need to know the user\'s timezone and current local time.',
        answer:
          'Store the user\'s timezone in the user table (set during signup or inferred from IP). ' +
          'In Redis, cache a "suppressed_until" timestamp per user. ' +
          'Before sending, convert current UTC to user\'s local time. ' +
          'If within quiet hours, publish to a "scheduled" Kafka topic with a delay timestamp. ' +
          'A scheduler consumer re-enqueues the message at 8am local time. ' +
          'This requires a priority queue or time-sorted queue.',
      },
      {
        q: 'Netflix sends personalized notifications ("Season 3 of your show just dropped"). How do you personalize at 10M scale?',
        hint: 'Personalization data must be pre-computed, not generated at send time.',
        answer:
          'Personalization at send time (querying each user\'s watch history) is too slow. ' +
          'Run a nightly Spark batch job that pre-computes each user\'s top recommended shows. ' +
          'Store results in Redis: user_id → [show_1, show_2, ...]. ' +
          'At send time, the worker fetches the precomputed recommendation from Redis in ~1ms ' +
          'and injects it into the notification template. ' +
          'Total overhead: 1ms per notification, negligible.',
      },
      {
        q: 'How do you measure the success of a notification campaign?',
        hint: 'You need open rates, delivery rates, and opt-out rates.',
        answer:
          'Emit events at each stage to Kafka: ' +
          'notification_sent, notification_delivered (APNS confirmation), ' +
          'notification_opened (deep link click tracked in app), notification_dismissed. ' +
          'A Flink/Spark consumer aggregates these events into Postgres by campaign_id. ' +
          'Dashboard shows: delivery rate (sent vs confirmed), open rate (opened / delivered), ' +
          'opt-out rate (opt-outs triggered by this campaign). ' +
          'Store events in S3 for long-term analytics in Redshift.',
      },
    ],
  },

  // ── ENG-SYS-010 ─────────────────────────────────────────────────────────────
  {
    id: 'ENG-SYS-010',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Multi-Region Active-Active DB Replication',
    companies: ['Netflix', 'Uber'],
    timeEst: '~60 min',
    level: 'Senior',
    status: 'Not Started',
    desc:
      'A streaming service needs users in New York and Tokyo to both have ' +
      '< 50ms read/write latency. If the Tokyo datacenter burns down, ' +
      'New York must take over with zero data loss.',
    solution:
      'Deploy an Active-Active globally distributed database (CockroachDB or Cassandra). ' +
      'Use Quorum consensus (e.g., Paxos/Raft) for writes — a write must be acknowledged ' +
      'by a quorum of nodes across regions before confirming to the client. ' +
      'Handle conflict resolution using Vector Clocks or Last-Write-Wins (LWW) timestamps. ' +
      'For strict zero data loss, use synchronous replication (blocking) — ' +
      'accepting slightly higher write latency in exchange for durability guarantees.',

    simulation: {
      constraints: [
        { label: 'Regions', value: 'New York + Tokyo (active-active)' },
        { label: 'Read latency target', value: '< 50ms per region' },
        { label: 'Write latency target', value: '< 100ms cross-region' },
        { label: 'RPO (data loss)', value: '0 — zero data loss tolerated' },
        { label: 'RTO (recovery time)', value: '< 30 seconds on region failure' },
      ],

      levels: [
        {
          // Lesson: active-passive replication causes high write latency for Tokyo
          traffic: 5000,
          targetLatency: 300,
          successMsg:
            'Active-active routing live. Tokyo reads served locally in < 5ms.',
          failMsg:
            '[HIGH LATENCY] Tokyo users must send writes to New York (primary). ' +
            'Cross-Pacific round trip = 150ms. Target is 100ms. ' +
            'Move to Active-Active: Tokyo has its own writable primary.',
          failNode: 'postgres',
          failTooltip:
            'In Active-Passive, all writes route to the primary region (NY). ' +
            'Tokyo users get 150ms write latency. ' +
            'In Active-Active, each region has a primary that accepts local writes. ' +
            'Both NY and Tokyo can read and write with local latency. ' +
            'Use CockroachDB or Cassandra — both support multi-primary writes natively.',
          checks: [
            { type: 'hasNode', source: 'cassandra' },
          ],
        },
        {
          // Lesson: concurrent writes to same row in both regions = conflict
          traffic: 10000,
          targetLatency: 200,
          successMsg:
            'Conflict resolution active. Vector Clocks tracking causality. No data corruption.',
          failMsg:
            '[WRITE CONFLICT] User A updated their profile in New York and Tokyo simultaneously. ' +
            'Both writes committed locally. When replication ran, last-write overwrote the other. ' +
            'Implement Vector Clocks or LWW to handle this.',
          failNode: 'cassandra',
          failTooltip:
            'Write conflicts in active-active are inevitable. Resolution strategies: ' +
            '(1) Last-Write-Wins (LWW): highest timestamp wins — simple but can lose data. ' +
            '(2) Vector Clocks: track causality, detect concurrent writes, surface to application. ' +
            '(3) CRDT data structures: mathematically merge concurrent updates (good for counters/sets). ' +
            'CockroachDB uses serializable isolation + Raft to prevent conflicts entirely — ' +
            'writes are globally ordered, never conflicting.',
          checks: [
            { type: 'hasPath', source: 'api_server', target: 'cassandra' },
          ],
        },
        {
          // Lesson: Tokyo failure → all traffic to NY, need < 30s failover
          traffic: 20000,
          targetLatency: 80,
          successMsg:
            'SYSTEM STABLE — Tokyo failure simulated. NY took over in 18 seconds. Zero data loss.',
          failMsg:
            '[FAILOVER FAILURE] Tokyo datacenter offline. New York is not receiving Tokyo traffic. ' +
            'DNS TTL is 300 seconds — users are stuck for 5 minutes. ' +
            'Implement DNS-level failover with low TTL and health checks.',
          failNode: 'client',
          failTooltip:
            'Set DNS TTL to 30 seconds (not 300). ' +
            'Use a Global Load Balancer (AWS Route53, Cloudflare) that monitors regional health. ' +
            'On Tokyo failure: health check fails → DNS updates to NY in < 30 seconds. ' +
            'Client connections that were mid-request: retry with exponential backoff (3×). ' +
            'Pre-warm NY capacity so it can handle 2× traffic on Tokyo failure.',
          checks: [
            { type: 'hasPath', source: 'client', target: 'load_balancer' },
            { type: 'hasPath', source: 'load_balancer', target: 'cassandra' },
          ],
        },
      ],
    },

    questions: [
      {
        q: 'What is the difference between Active-Active and Active-Passive replication?',
        hint: 'Think about which nodes accept writes.',
        answer:
          'Active-Passive: only the primary (e.g., NY) accepts writes. ' +
          'Tokyo is a read replica — writes must round-trip to NY (150ms+). ' +
          'On NY failure, Tokyo is promoted to primary (manual or automated, 1–5 min). ' +
          'Active-Active: both NY and Tokyo accept reads AND writes locally (< 10ms). ' +
          'Writes replicate asynchronously (or synchronously with quorum). ' +
          'Both regions are always serving traffic — no promotion needed on failure.',
      },
      {
        q: 'If zero data loss is required (RPO=0), what replication strategy do you use?',
        hint: 'Synchronous vs asynchronous replication — what\'s the tradeoff?',
        answer:
          'Synchronous replication: the write is not confirmed to the client until ' +
          'it has been committed on a quorum of nodes (e.g., NY + Tokyo). ' +
          'This guarantees RPO=0 — if NY burns down after the write, Tokyo has it. ' +
          'Tradeoff: write latency = max(NY_commit_time, Tokyo_commit_time) = ~150ms cross-Pacific. ' +
          'Asynchronous replication is faster (confirm immediately, replicate in background) ' +
          'but risks losing in-flight writes if the primary fails before replication completes.',
      },
      {
        q: 'Two users update the same movie rating simultaneously — one in NY, one in Tokyo. Who wins?',
        hint: 'This is the classic write conflict problem in active-active.',
        answer:
          'Three resolution strategies: ' +
          '(1) LWW — wall clock timestamp determines winner. Simple but can discard a valid update. ' +
          '(2) Application-level merge — rating conflicts are resolved by averaging or taking the higher value. ' +
          '(3) Prevent conflicts via ownership sharding — each user\'s data is owned by one region. ' +
          'A Tokyo user always writes to Tokyo\'s shard; replication is unidirectional. ' +
          'NY never writes to Tokyo-owned data. This eliminates conflicts entirely for user data.',
      },
      {
        q: 'What is a Vector Clock and when would you use it over LWW?',
        hint: 'LWW loses data. Vector clocks detect when to ask the application to resolve.',
        answer:
          'A Vector Clock is a per-key counter per node: [NY:5, Tokyo:3] means ' +
          'this key has been written 5 times in NY and 3 times in Tokyo. ' +
          'When replicating: if NY\'s clock is strictly greater than Tokyo\'s, NY wins. ' +
          'If they diverged (NY:5, Tokyo:4 vs NY:3, Tokyo:6), it\'s a concurrent conflict — ' +
          'the application must resolve it (merge, ask user, or use a CRDT). ' +
          'Use LWW when losing occasional writes is acceptable (social media likes). ' +
          'Use Vector Clocks when correctness matters (shopping cart, financial data).',
      },
      {
        q: 'Netflix has users in 190 countries. How do you extend this to more than 2 regions?',
        hint: 'Quorum mathematics become important with N > 2 regions.',
        answer:
          'With N regions, a write quorum requires acknowledgment from (N/2 + 1) regions. ' +
          'With 3 regions: quorum = 2. A single region failure still allows writes. ' +
          'With 5 regions: quorum = 3. Two simultaneous failures still work. ' +
          'Netflix uses Cassandra with a consistency level of LOCAL_QUORUM for writes: ' +
          'the write must be acknowledged by a majority of nodes within the local region, ' +
          'then replicated asynchronously to other regions. ' +
          'This trades global consistency for lower write latency — acceptable for video metadata.',
      },
    ],
  },

];