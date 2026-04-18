import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-035',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Time Series Database',
  companies: ['InfluxDB', 'Prometheus', 'Datadog'],
  timeEst: '~55 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design a time series database for metrics and monitoring. ' +
    'Ingest 1M data points/sec from 100k IoT sensors and servers. ' +
    'Support range queries (CPU% for server X over the last hour), ' +
    'downsampling (1-minute averages from 1-second raw data), ' +
    'and automatic data retention (delete raw data after 30 days, keep hourly aggregates for 1 year).',
  solution:
    'Column-oriented storage with time-based partitioning. ' +
    'Data is sorted by (metric_name, tags, timestamp) — all writes are sequential. ' +
    'Compression: timestamps (delta-of-delta encoding) and values (XOR encoding from Gorilla paper). ' +
    'A write-ahead buffer (in-memory) absorbs write spikes. ' +
    'Compaction merges chunks and downsample old data. ' +
    'Indexes: inverted index on tags for fast series lookups.',

  simulation: {
    constraints: [
      { label: 'Ingestion rate', value: '1M points/sec' },
      { label: 'Unique time series', value: '100M (high cardinality)' },
      { label: 'Raw retention', value: '30 days' },
      { label: 'Hourly aggregate retention', value: '1 year' },
      { label: 'Query range', value: 'Up to 1 year' },
    ],
    levels: [
      {
        traffic: 10000,
        targetLatency: 100,
        successMsg: 'Metrics ingesting — time-series data storing and queryable.',
        failMsg: '[FATAL] Metrics not persisting. Connect Ingest API → Time Series Store → Cassandra.',
        failNode: 'api_server',
        failTooltip:
          'Store metrics in Cassandra with compound partition key: (metric_name, time_bucket), ' +
          'cluster column: timestamp. One partition = one metric for one time window. ' +
          'Efficient range scan within a partition.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'cassandra' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 500,
        successMsg: 'Write buffering active — in-memory WAL absorbing 1M writes/sec.',
        failMsg:
          '[WRITE OVERLOAD] 1M writes/sec overwhelming the storage layer. ' +
          'Add an in-memory write buffer that flushes to disk periodically.',
        failNode: 'cassandra',
        failTooltip:
          'Write buffer: accumulate points in memory, flush every 5 seconds or when buffer is full. ' +
          'Incoming writes = in-memory. Reads = merge in-memory + disk. ' +
          'This is the LSM-tree (Log-Structured Merge-tree) pattern — used by Cassandra, RocksDB, InfluxDB.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'redis', target: 'cassandra' },
        ],
      },
      {
        traffic: 1000000,
        targetLatency: 50,
        successMsg: 'SYSTEM STABLE — 1M points/sec, queries < 100ms, automatic downsampling active.',
        failMsg:
          '[QUERY SLOW] A 30-day range query on raw 1-second data is scanning 2.6M data points. ' +
          'Add a downsampling job to pre-aggregate hourly summaries.',
        failNode: 'cassandra',
        failTooltip:
          'A compaction job runs hourly: read raw 1-second data → compute min/max/avg per minute → ' +
          'write to the hourly_aggregates table. Queries for ranges > 1 hour use the aggregate table. ' +
          'Query planner automatically selects the right granularity based on the time range.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'cassandra' },
          { type: 'hasEdge', source: 'worker', target: 'cassandra' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'What is delta-of-delta encoding for timestamps, and why does it achieve > 90% compression?',
      hint: 'Timestamps are nearly regular — they don\'t change much.',
      answer:
        'A sensor reports every 1 second: [1000, 1001, 1002, 1003, ...]. ' +
        'Delta: [1, 1, 1, 1, ...]. Delta-of-delta: [0, 0, 0, ...]. ' +
        'Gorilla (Facebook\'s TSDB paper) encodes these near-zero deltas in 1-2 bits. ' +
        'A timestamp that would take 64 bits uncompressed takes 1-2 bits when encoded as delta-of-delta. ' +
        'Combined with XOR value compression, Gorilla achieves 1.37 bytes/point vs 16 bytes raw.',
    },
    {
      q: 'What is high-cardinality and why is it problematic for time series databases?',
      hint: 'Think about the number of unique time series.',
      answer:
        'A time series is identified by metric name + tags. ' +
        'Low cardinality: cpu.usage{host=web1} — a few thousand series. ' +
        'High cardinality: request.duration{user_id=uuid, endpoint=..., trace_id=uuid} — ' +
        'billions of unique series if user_id or trace_id is used as a tag. ' +
        'Problem: each unique series requires its own index entry and write path. ' +
        'With 10B series, the inverted index itself becomes gigabytes of memory. ' +
        'Prometheus recommends < 10M active series per node.',
    },
    {
      q: 'How does Prometheus\' pull model differ from InfluxDB\'s push model? Which is better?',
      hint: 'Who initiates the data transfer?',
      answer:
        'Push model (InfluxDB, StatsD): agents push metrics to the TSDB. ' +
        'Works well for short-lived jobs (push before dying). ' +
        'Pull model (Prometheus): the TSDB scrapes endpoints on a schedule (GET /metrics). ' +
        'Advantages of pull: Prometheus knows if a target is down (scrape fails vs silence). ' +
        'Pull requires targets to be reachable — harder in cloud-native environments. ' +
        'Most modern systems use both: push for events, pull for resource metrics.',
    },
    {
      q: 'How would you implement alerting on top of a time series database?',
      hint: 'Evaluate rules continuously against recent data.',
      answer:
        'An alert rule is a query + threshold: "CPU > 90% for 5 minutes". ' +
        'An alert evaluator runs every 30 seconds: execute the PromQL/InfluxQL query for the last 5 minutes. ' +
        'If the condition is met: transition alert state to PENDING (first occurrence) or FIRING (repeated). ' +
        'Pending→Firing threshold prevents flapping. ' +
        'Alerts route through an alert manager (deduplicate, group, route to PagerDuty/Slack).',
    },
  ],
};

export default challenge;
