import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-037',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Log Aggregation System',
  companies: ['Splunk', 'Elastic', 'Datadog'],
  timeEst: '~50 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design a centralized log aggregation system for a microservices fleet. ' +
    '1000 services each emit 100 log lines/sec. Logs must be searchable in < 5 seconds of emission, ' +
    'retained for 30 days, and support full-text search, filtering by service/level/time range, ' +
    'and correlation by trace ID.',
  solution:
    'Log agents (Filebeat/Fluentd) on each host ship logs to Kafka. ' +
    'A pipeline (Logstash/Flink) parses, enriches, and indexes logs into Elasticsearch. ' +
    'Raw logs are also archived to S3 (cheap long-term storage). ' +
    'Elasticsearch provides the search and filter capabilities. ' +
    'For trace correlation, logs include a trace_id that links to distributed traces (Jaeger).',

  simulation: {
    constraints: [
      { label: 'Services', value: '1,000' },
      { label: 'Log rate', value: '100 lines/sec/service = 100k total/sec' },
      { label: 'Avg log line size', value: '500 bytes' },
      { label: 'Ingest bandwidth', value: '50 MB/sec' },
      { label: 'Retention', value: '30 days = ~130 TB' },
    ],
    levels: [
      {
        traffic: 10000,
        targetLatency: 5000,
        successMsg: 'Log collection running — agents shipping logs to central store.',
        failMsg: '[FATAL] Logs not being collected. Deploy log agents → Kafka pipeline.',
        failNode: 'api_server',
        failTooltip:
          'Filebeat runs as a sidecar on each host. Tails log files, ships to Kafka. ' +
          'Never have services write logs directly to a centralized store — agent decouples service from pipeline.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 2000,
        successMsg: 'Elasticsearch indexing live — logs searchable within 3 seconds of emission.',
        failMsg:
          '[SLOW SEARCH] Log search scanning raw files. Add Elasticsearch for indexed search.',
        failNode: 'kafka',
        failTooltip:
          'Kafka → Logstash → Elasticsearch. ' +
          'Logstash parses JSON logs, extracts fields (level, service, trace_id), ' +
          'indexes into Elasticsearch daily indices (logs-2024.01.15). ' +
          'Inverted index enables full-text search in milliseconds.',
        checks: [
          { type: 'hasEdge', source: 'kafka', target: 'worker' },
          { type: 'hasEdge', source: 'worker', target: 'cassandra' },
        ],
      },
      {
        traffic: 1000000,
        targetLatency: 500,
        successMsg: 'SYSTEM STABLE — 100k logs/sec indexed, traces correlated, S3 archive active.',
        failMsg:
          '[COST] Elasticsearch storing 130 TB for 30-day retention is extremely expensive. ' +
          'Move cold logs (>7 days old) to S3 and only search warm logs in Elasticsearch.',
        failNode: 'cassandra',
        failTooltip:
          'Tiered storage: last 7 days in Elasticsearch (fast, expensive). ' +
          'Days 8-30 in S3 Glacier (slow, cheap). ' +
          'For historical search on S3, use Athena (SQL on S3) — slower but 10x cheaper.',
        checks: [
          { type: 'hasEdge', source: 'worker', target: 's3' },
          { type: 'hasEdge', source: 'worker', target: 'cassandra' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'What is the ELK stack and how does each component contribute?',
      hint: 'Elasticsearch, Logstash, Kibana.',
      answer:
        'Elasticsearch: distributed search and analytics engine. Stores and indexes logs. ' +
        'Logstash: data pipeline — ingests from Kafka/files, parses (Grok patterns), enriches, outputs to ES. ' +
        'Kibana: visualization layer — dashboards, log search UI, alerts on top of Elasticsearch. ' +
        'Modern stack often replaces Logstash with Fluent Bit (lower overhead) and ' +
        'adds Kafka between collection agents and Logstash for buffering.',
    },
    {
      q: 'A service is logging at 10x its normal rate due to a bug. How do you prevent it from overwhelming the pipeline?',
      hint: 'Rate limiting and sampling.',
      answer:
        'Log rate limiting per service: Kafka quota per producer (service has a max publish rate). ' +
        'Exceeding the quota causes backpressure to the service (blocks the log write call). ' +
        'Adaptive sampling: in the pipeline, if a service exceeds N logs/sec, ' +
        'sample 1-in-10 logs above the threshold. ' +
        'Alert on log rate spikes — a 10x rate might indicate an error loop (log storm).',
    },
    {
      q: 'How do you correlate a user\'s request across 10 different microservices?',
      hint: 'Distributed tracing with trace IDs.',
      answer:
        'On the first API gateway request, generate a trace_id (UUID). ' +
        'Pass it as an HTTP header (X-Trace-ID) to every downstream service call. ' +
        'Every service logs with the trace_id included. ' +
        'Search: trace_id:abc123 → shows all 10 services\' logs for that request in time order. ' +
        'Full distributed tracing (Jaeger, Zipkin) also records parent/child span relationships and timing.',
    },
    {
      q: 'Elasticsearch indices can run out of shards. How do you manage index lifecycle for log data?',
      hint: 'Rollover, ILM policies.',
      answer:
        'Index Lifecycle Management (ILM) policy in Elasticsearch: ' +
        'Hot phase (0-2 days): index is active, accepting writes, replicas=1. ' +
        'Warm phase (3-7 days): no new writes, read-only, force merge to 1 segment per shard (read optimization). ' +
        'Cold phase (8-30 days): move to cheaper hardware (frozen tier). ' +
        'Delete phase (31+ days): automatically delete indices. ' +
        'Daily index rotation (logs-2024.01.15) ensures indices are manageable in size.',
    },
  ],
};

export default challenge;
