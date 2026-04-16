import type { Challenge } from '../types';

// ─── ENG-SYS-001 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
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
  };

export default challenge;
