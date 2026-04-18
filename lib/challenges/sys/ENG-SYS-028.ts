import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-028',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design an Ad Click Aggregation System',
  companies: ['Google', 'Facebook', 'Amazon'],
  timeEst: '~55 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design a system to count ad clicks for billing and analytics. ' +
    'Ad networks must know clicks-per-ad-per-minute to charge advertisers and detect click fraud. ' +
    'Handle 1M click events/sec, deliver per-minute aggregates in < 2 minutes, ' +
    'and store historical data for 3 years for reporting.',
  solution:
    'A lambda architecture: clicks flow into Kafka (speed layer) and also land in S3 (batch layer). ' +
    'A Flink streaming job aggregates clicks per ad_id in 1-minute tumbling windows — feeds billing. ' +
    'A nightly Spark job reprocesses the full day\'s S3 data for accurate historical reports. ' +
    'Click fraud detection: per-IP, per-ad rate limiting checked in Redis Bloom filter.',

  simulation: {
    constraints: [
      { label: 'Click events/sec', value: '1,000,000' },
      { label: 'Unique ads', value: '100M' },
      { label: 'Aggregate granularity', value: '1-minute windows' },
      { label: 'Billing update SLA', value: '< 2 min lag' },
      { label: 'Historical retention', value: '3 years' },
    ],
    levels: [
      {
        traffic: 10000,
        targetLatency: 100,
        successMsg: 'Click events ingested — Kafka receiving and durably storing all clicks.',
        failMsg: '[FATAL] Clicks being dropped. Add Kafka between click API and processors.',
        failNode: 'api_server',
        failTooltip:
          'Kafka is a durable event buffer. Click events are fire-and-forget from the client — ' +
          'the API writes to Kafka and immediately responds 200 OK. ' +
          'Downstream processors (aggregation, fraud detection) consume asynchronously.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 500,
        successMsg: 'Stream aggregation running — 1-minute click counts updating in near real-time.',
        failMsg:
          '[BILLING DELAY] Click counts only updated hourly via batch job. ' +
          'Add a stream processor (Flink) for real-time 1-minute window aggregation.',
        failNode: 'kafka',
        failTooltip:
          'Flink tumbling window: GROUP BY ad_id, window(1 minute) → COUNT(*). ' +
          'Outputs one row per ad per minute. Write aggregated counts to Cassandra ' +
          '(partition by ad_id, cluster by minute_timestamp).',
        checks: [
          { type: 'hasEdge', source: 'kafka', target: 'worker' },
          { type: 'hasEdge', source: 'worker', target: 'cassandra' },
        ],
      },
      {
        traffic: 1000000,
        targetLatency: 200,
        successMsg: 'SYSTEM STABLE — 1M clicks/sec, 1-min billing aggregates, 3-year S3 archive.',
        failMsg:
          '[FRAUD] Same IP clicking an ad 1000 times in 60 seconds. ' +
          'Add Bloom filter rate limiting for click fraud detection.',
        failNode: 'api_server',
        failTooltip:
          'Redis Bloom filter: per-IP, per-ad, 1-minute window. ' +
          'BF.ADD ip_ad_bloom {ip}:{adId}:{minute}. If already present, mark as duplicate. ' +
          'Bloom filters use ~10 bits/element — 1B daily unique combinations ≈ 1.25 GB.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'kafka', target: 's3' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'What is the lambda architecture and why is it used for ad click aggregation?',
      hint: 'Speed layer vs batch layer.',
      answer:
        'Lambda architecture has two parallel pipelines: ' +
        '(1) Speed layer: stream processing (Flink/Kafka Streams) for low-latency, approximate results. ' +
        'For billing, we need clicks within 2 minutes. ' +
        '(2) Batch layer: periodic (daily) full reprocessing of all raw data for accurate, auditable results. ' +
        'The batch layer corrects any stream-processing errors (late-arriving events, network glitches). ' +
        'Final billing uses batch-layer numbers; real-time dashboards use speed-layer numbers.',
    },
    {
      q: 'How do you handle late-arriving click events? A click logged at 3:59PM might arrive at 4:02PM due to network latency.',
      hint: 'Event time vs processing time.',
      answer:
        'Use event time (when the click happened) not processing time (when Kafka receives it). ' +
        'Include a client-side timestamp in the click event. ' +
        'Flink watermarks: allow events up to 30 seconds late. ' +
        'The 3:59PM window stays open until 4:00:30PM before being finalized. ' +
        'For very late events (>30s), route to a "late data" topic — the batch layer picks them up in nightly reprocessing.',
    },
    {
      q: 'How would you design the click fraud detection to catch both simple (same IP) and sophisticated (botnet) fraud?',
      hint: 'Multiple signals, different latencies.',
      answer:
        'Tiered detection: ' +
        '(1) Real-time (< 1 sec): Bloom filter for same IP + ad + 1-minute window. ' +
        '(2) Near real-time (< 1 min): rate limiting per IP across all ads (>100 clicks/min flagged). ' +
        '(3) Offline (daily): ML model on click patterns — botnets show unusual timing patterns, ' +
        'geographic clusters, identical user agents. ' +
        'Mark clicks as "suspicious" — don\'t bill the advertiser, don\'t show in public stats.',
    },
    {
      q: 'Advertisers want to query: "show me my click-through rate by country for the past 30 days." How do you serve this?',
      hint: 'OLAP vs OLTP access patterns.',
      answer:
        'Store aggregated data in a columnar store like ClickHouse or BigQuery. ' +
        'Pre-aggregate daily: clicks per ad per country per day → small table. ' +
        '30-day query = 30 rows × N countries — sub-second even with 100M ads. ' +
        'Alternatively, use Cassandra for time-series aggregates partitioned by ad_id. ' +
        'Never run 30-day aggregate queries on raw click event data — billions of rows.',
    },
    {
      q: 'How do you ensure click counts are exactly correct for billing purposes, even with retries and duplicate events?',
      hint: 'Idempotent processing.',
      answer:
        'Each click event has a unique click_id (UUID generated client-side). ' +
        'On retry, the same click_id is resent. ' +
        'Before processing, check: SETNX processed:{clickId} 1 EX 86400. ' +
        'If the key already exists, skip (duplicate). ' +
        'This idempotency check ensures exactly-once counting despite at-least-once delivery. ' +
        'The batch layer also deduplicates on click_id for final billing accuracy.',
    },
  ],
};

export default challenge;
