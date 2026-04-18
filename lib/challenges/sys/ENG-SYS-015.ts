import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-015',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design Twitter/X (Tweet Feed)',
  companies: ['Twitter/X', 'Threads', 'Mastodon'],
  timeEst: '~55 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design a microblogging platform where users post 280-character tweets and see a chronological/ranked ' +
    'feed of accounts they follow. Handle 300M DAU, 6,000 tweets/sec written, ' +
    'and 600,000 timeline reads/sec.',
  solution:
    'Separate tweet storage (Cassandra, keyed by tweet_id) from timeline storage (Redis sorted sets per user). ' +
    'On write: fan-out-on-write for regular users — push tweet_id to every follower\'s Redis timeline list. ' +
    'For celebrities (Katy Perry has 150M followers): fan-out-on-read — merge at read time. ' +
    'Use Snowflake IDs to generate time-ordered tweet IDs without coordination.',

  simulation: {
    constraints: [
      { label: 'DAU', value: '300M' },
      { label: 'Tweets written/sec', value: '6,000' },
      { label: 'Timeline reads/sec', value: '600,000' },
      { label: 'Avg followers/user', value: '200' },
      { label: 'Fan-out writes/sec', value: '1.2M (avg)' },
    ],
    levels: [
      {
        traffic: 6000,
        targetLatency: 30,
        successMsg: 'Write path established — tweets persisting to Cassandra.',
        failMsg: '[FATAL] Tweets are not being stored. Connect API Server → Cassandra.',
        failNode: 'api_server',
        failTooltip:
          'Store tweets in Cassandra partitioned by tweet_id (Snowflake ID). ' +
          'The time-ordered IDs mean recent tweets are in the same partition — fast for timeline queries.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'cassandra' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 150,
        successMsg: 'Fan-out service active — timelines pre-computed in Redis.',
        failMsg:
          '[OVERLOAD] Timeline reads are querying Cassandra directly — joining follows + tweets. ' +
          'Pre-compute timelines into Redis sorted sets (fan-out-on-write).',
        failNode: 'cassandra',
        failTooltip:
          'Redis sorted set: ZADD timeline:{userId} {tweetId} {timestamp}. ' +
          'ZRANGE returns the user\'s timeline in order. O(log n) insert, O(k) read for k tweets.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
        ],
      },
      {
        traffic: 600000,
        targetLatency: 50,
        successMsg: 'SYSTEM STABLE — 600k timeline reads/sec, hybrid fan-out handling celebrities.',
        failMsg:
          '[OVERLOAD] A celebrity tweet caused 150M fan-out writes. ' +
          'Implement a flag to skip fan-out for accounts with > 1M followers.',
        failNode: 'redis',
        failTooltip:
          'The "celebrity problem": Justin Bieber\'s tweet would require 150M Redis writes in seconds. ' +
          'Mark high-follower accounts. For those, skip fan-out on write and merge at read time.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'api_server', target: 'cassandra' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'What is a Snowflake ID and why does Twitter use it instead of auto-increment?',
      hint: 'Think about distributed writes — no single DB to auto-increment.',
      answer:
        'A Snowflake ID is a 64-bit integer composed of: 41 bits timestamp (ms since epoch), ' +
        '10 bits machine ID, 12 bits sequence number. ' +
        'This generates ~4096 unique IDs per ms per machine — with zero coordination. ' +
        'IDs are time-ordered (sort by ID = sort by time), which makes timeline queries efficient in Cassandra. ' +
        'Auto-increment requires a single DB — impossible at Twitter\'s scale.',
    },
    {
      q: 'How does Twitter\'s "For You" algorithmic timeline differ architecturally from the chronological timeline?',
      hint: 'One is pre-computed, one requires ML scoring.',
      answer:
        'Chronological: pre-computed fan-out into Redis sorted sets. Pure key-value lookup. ' +
        'Algorithmic: candidate generation (pull ~2000 candidate tweets from followed accounts) + ' +
        'feature extraction (engagement signals, recency, user affinity) + ' +
        'ML scoring (a neural net ranks each candidate) + business rules (dedup, diversity). ' +
        'Twitter open-sourced their ranking algorithm — it runs in ~150ms per timeline request.',
    },
    {
      q: 'How do you handle a tweet going viral with 10M engagements in 5 minutes?',
      hint: 'Write amplification and hot key problem.',
      answer:
        'A viral tweet creates a "hot key" in Redis (likes/retweets hammering the same counter). ' +
        'Use Redis cluster sharding + counter aggregation: instead of incrementing one key, ' +
        'increment one of 100 shard keys randomly. Aggregate on read. ' +
        'For fan-out: a job queue absorbs the spike. Workers process fan-out at a controlled rate, ' +
        'with the tweet appearing in timelines within seconds (not milliseconds).',
    },
    {
      q: 'How do you implement search over tweets in real-time?',
      hint: 'Think about inverted indexes and freshness.',
      answer:
        'Tweets flow through Kafka → Elasticsearch indexing pipeline. ' +
        'Elasticsearch inverted index: term → sorted list of tweet IDs. ' +
        'A query for "Taylor Swift" returns tweet IDs from the index, ' +
        'then fetches tweet objects from Cassandra. ' +
        'For real-time freshness, tweets appear in search within ~5 seconds. ' +
        'Twitter calls this "Earlybird" — a custom Lucene-based search engine.',
    },
    {
      q: 'How do you implement the "trending topics" feature globally and by region?',
      hint: 'Real-time aggregation with time windows.',
      answer:
        'A Flink streaming job consumes all tweets from Kafka. ' +
        'It counts hashtag mentions in sliding 1-hour windows, partitioned by geo (from IP). ' +
        'The top-N hashtags per region are written to Redis sorted sets every minute. ' +
        'Trending is determined by rate-of-change (velocity), not absolute count — ' +
        'a hashtag with 10x normal volume in 10 minutes ranks higher than a stable popular hashtag.',
    },
  ],
};

export default challenge;
