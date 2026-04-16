import type { Challenge } from '../types';

// ─── ENG-SYS-004 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
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
  };

export default challenge;
