import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-011',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design Instagram (Photo Feed)',
  companies: ['Meta', 'Pinterest', 'Snapchat'],
  timeEst: '~60 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design a photo-sharing platform that lets 500M users upload images, follow others, ' +
    'and see a personalized feed of photos from people they follow. ' +
    'Handle 2M photo uploads/day and serve feed reads at 50,000 RPS.',
  solution:
    'Separate the write path (upload → S3 → CDN) from the feed read path. ' +
    'Use a fan-out-on-write strategy for users with < 10k followers: pre-compute feeds into Redis. ' +
    'For celebrities (> 10k followers), use fan-out-on-read to avoid write amplification. ' +
    'Store photo metadata in Cassandra partitioned by user_id. ' +
    'Serve images through a CDN — never from the origin directly.',

  simulation: {
    constraints: [
      { label: 'DAU', value: '500M' },
      { label: 'Photo uploads/day', value: '2M' },
      { label: 'Feed read RPS', value: '50,000' },
      { label: 'Avg photo size', value: '~3 MB (after compression)' },
      { label: 'Storage/year', value: '~2.2 PB' },
    ],
    levels: [
      {
        traffic: 1000,
        targetLatency: 50,
        successMsg: 'Upload path established — 1,000 photo uploads/sec routed correctly.',
        failMsg: '[FATAL] Photos have nowhere to go. Connect API Server → Object Storage (S3).',
        failNode: 'api_server',
        failTooltip:
          'Photos must be stored in object storage (S3), not in a relational DB. ' +
          'Store the photo URL/metadata in the DB, but the actual bytes in S3.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 's3' },
        ],
      },
      {
        traffic: 10000,
        targetLatency: 200,
        successMsg: 'CDN edge caching active — image delivery latency dropped 90%.',
        failMsg:
          '[OVERLOAD] All 50k feed reads are hitting the origin S3 bucket. ' +
          'Each image request crosses the Atlantic. Add a CDN in front of S3.',
        failNode: 's3',
        failTooltip:
          'A CDN caches images at ~200 edge locations globally. ' +
          'Users in Tokyo get images served from Tokyo, not us-east-1. ' +
          'Connect: S3 → CDN → Client.',
        checks: [
          { type: 'hasEdge', source: 's3', target: 'cdn' },
          { type: 'hasPath', source: 'cdn', target: 'client' },
        ],
      },
      {
        traffic: 50000,
        targetLatency: 100,
        successMsg: 'SYSTEM STABLE — Feed reads at 50k RPS, p99 < 100ms via Redis pre-computed feeds.',
        failMsg:
          '[OVERLOAD] Feed generation is querying the DB on every read — joining follows + photos. ' +
          'Pre-compute user feeds into Redis on write (fan-out-on-write).',
        failNode: 'cassandra',
        failTooltip:
          'Fan-out-on-write: when Alice posts a photo, push the photo ID into every follower\'s Redis feed list. ' +
          'Feed reads become O(1) Redis list pops instead of expensive DB joins.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'api_server', target: 'cassandra' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'You have 300M followers for a celebrity. Fan-out-on-write would require 300M Redis writes per post. How do you handle this?',
      hint: 'Think about a hybrid approach based on follower count.',
      answer:
        'Use a hybrid strategy. For regular users (< 10k followers), use fan-out-on-write — ' +
        'pre-compute the feed. For celebrities (> 10k followers), use fan-out-on-read — ' +
        'merge celebrity posts into the feed at read time. ' +
        'Instagram calls this the "celebrity problem" and maintains a separate hot user list.',
    },
    {
      q: 'How do you deduplicate photos so the same image uploaded by two users doesn\'t waste storage twice?',
      hint: 'Content-addressable storage.',
      answer:
        'Hash the photo bytes (SHA-256) before uploading. Use the hash as the S3 key. ' +
        'If the key already exists, skip the upload — just store the metadata pointing to the existing object. ' +
        'This is content-addressable storage. Pinterest saves ~30% storage costs this way.',
    },
    {
      q: 'How do you implement the "Explore" feed (trending photos from non-followed users)?',
      hint: 'This is a recommendation problem, not a social graph problem.',
      answer:
        'Run a batch job (Spark/Flink) every 10 minutes that aggregates engagement signals ' +
        '(likes, saves, shares, view time) per photo. Score photos using a ranking model. ' +
        'Store the top-N explore items in Redis sorted sets. The explore endpoint reads from Redis, ' +
        'not the DB. Real-time signals can be added via a streaming pipeline (Kafka + Flink).',
    },
    {
      q: 'A photo goes viral — 10M users try to view it in 60 seconds. How does your CDN handle this?',
      hint: 'Think about cache stampede (thundering herd) at the CDN edge.',
      answer:
        'CDN edge nodes use request coalescing: the first cache miss sends one request to origin; ' +
        'all other concurrent requests for the same object wait for that single response and are served from the result. ' +
        'Also enable CDN Shield (an intermediate caching tier between edge and origin) to protect the S3 origin.',
    },
    {
      q: 'How do you implement photo filters and compression without blocking the upload API?',
      hint: 'Async processing pipeline.',
      answer:
        'The upload API stores the raw photo in S3 and publishes a job to a queue (SQS). ' +
        'Worker services (triggered by SQS) apply compression (WebP), generate thumbnails, ' +
        'apply filters, and update the metadata DB. The user sees "processing" until the job completes. ' +
        'This decouples upload latency from processing latency.',
    },
  ],
};

export default challenge;
