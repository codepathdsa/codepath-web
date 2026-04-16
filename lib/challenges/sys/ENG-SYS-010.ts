import type { Challenge } from '../types';

// ─── ENG-SYS-010 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
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
  };

export default challenge;
