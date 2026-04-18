import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-027',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Distributed Counter',
  companies: ['Facebook', 'Reddit', 'YouTube'],
  timeEst: '~30 min',
  level: 'Junior',
  status: 'Not Started',
  desc:
    'Design a system to count likes on posts. The count is displayed publicly and must be ' +
    'approximate within 1%. Handle 1M like events/sec at peak (viral posts), ' +
    'support reading the count in < 10ms, and survive server failures without losing data.',
  solution:
    'Redis INCR for in-memory counting (atomic, fast). Batch-write to Postgres periodically for durability. ' +
    'For very high-traffic posts (hot keys), use sharded counters: split into N Redis keys, ' +
    'read all N and sum. ' +
    'Use write buffering: collect 1000 likes, then INCRBY 1000 once — reduces Redis calls by 1000x.',

  simulation: {
    constraints: [
      { label: 'Like events/sec (peak)', value: '1,000,000' },
      { label: 'Accuracy requirement', value: '~1% (approximate)' },
      { label: 'Read latency target', value: '< 10ms' },
      { label: 'Durability', value: 'Persist to DB every 10 sec' },
      { label: 'Hot key risk', value: 'Viral post: 100k likes/sec on 1 key' },
    ],
    levels: [
      {
        traffic: 1000,
        targetLatency: 10,
        successMsg: 'Like counting working — Redis INCR atomic, no race conditions.',
        failMsg: '[RACE CONDITION] Two servers read 99, both write 100. Real count should be 101.',
        failNode: 'api_server',
        failTooltip:
          'Use Redis INCR — it\'s atomic. INCR post:{id}:likes returns the new value. ' +
          'Never read-modify-write a counter from application code.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 5,
        successMsg: 'Batch writes to Postgres active — counter durable on restart.',
        failMsg:
          '[DATA LOSS] Redis restarted and all like counts reset to 0. ' +
          'Persist counter to Postgres periodically.',
        failNode: 'redis',
        failTooltip:
          'Redis is in-memory — data is lost on restart by default (without AOF/RDB). ' +
          'A background job reads counters from Redis every 10 seconds and writes to Postgres. ' +
          'On startup, load the last persisted count from Postgres into Redis.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'worker', target: 'postgres' },
        ],
      },
      {
        traffic: 1000000,
        targetLatency: 3,
        successMsg: 'SYSTEM STABLE — 1M likes/sec with sharded counters and write buffering.',
        failMsg:
          '[HOT KEY] One viral post receiving 100k likes/sec on a single Redis key. ' +
          'Shard the counter across 10 keys to distribute the load.',
        failNode: 'redis',
        failTooltip:
          'Sharded counter: post:{id}:likes:0, post:{id}:likes:1, ..., post:{id}:likes:9. ' +
          'Each like increments a random shard. Read: sum all 10 shards. ' +
          '10x the throughput per post. Netflix and Facebook use this pattern.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'redis', target: 'postgres' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'Is the INCR command in Redis truly atomic? How does it prevent race conditions?',
      hint: 'Redis execution model.',
      answer:
        'Redis is single-threaded — it processes one command at a time. ' +
        'INCR reads and increments a key in a single indivisible operation on the server. ' +
        'Two clients can both call INCR — the server processes them sequentially: ' +
        'first INCR returns 100, second INCR returns 101. ' +
        'No two clients ever see the same value (unlike read-modify-write from application code).',
    },
    {
      q: 'You have 1M like events/sec. The Redis INCR handles 500k ops/sec. What do you do?',
      hint: 'Batch the writes.',
      answer:
        'Write buffering: application servers collect likes in a local in-memory counter for 100ms. ' +
        'Then send one INCRBY N to Redis for the batch. ' +
        'At 1M events/sec, 100ms batching → 100k events/batch → 10 Redis writes/sec instead of 1M. ' +
        'Trade-off: counts are slightly delayed (up to 100ms). Acceptable for like counters.',
    },
    {
      q: 'How would you implement a "has the current user liked this post?" check efficiently?',
      hint: 'Per-user, per-post boolean.',
      answer:
        'Redis Set: SADD post:{postId}:likers {userId}. SISMEMBER post:{postId}:likers {userId} → O(1). ' +
        'But storing all likers in Redis uses too much memory for popular posts (millions of userIds). ' +
        'Bloom filter (probabilistic): SETBIT post:{postId}:liked {userId%N} 1. ' +
        'Fast but has false positives (may say "liked" when not). ' +
        'For exact accuracy: store likes in Postgres and cache recent checks in Redis with a short TTL.',
    },
    {
      q: 'How does YouTube show "1.2M views" instead of the exact number? Why?',
      hint: 'Approximate counts reduce write contention.',
      answer:
        'Exact counts on viral videos would require every view to update the same counter synchronously. ' +
        'YouTube uses approximate counting: ' +
        'periodically aggregate view counts from server logs (Kafka → Flink → batch count). ' +
        'The displayed count is refreshed every few minutes, not per-view. ' +
        'The rounding to "1.2M" also signals to users that the exact number is approximate. ' +
        'This reduces the counter bottleneck from "per-view write" to "per-minute write".',
    },
  ],
};

export default challenge;
