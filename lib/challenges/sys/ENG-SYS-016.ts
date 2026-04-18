import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-016',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Distributed Message Queue (Kafka)',
  companies: ['LinkedIn', 'Confluent', 'Amazon'],
  timeEst: '~55 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design a durable, distributed message queue that supports 1M messages/sec write throughput, ' +
    'at-least-once delivery guarantees, consumer groups with offset tracking, ' +
    'and message retention for 7 days.',
  solution:
    'A log-structured append-only storage (like Kafka topics/partitions). ' +
    'Each topic is split into partitions for parallelism. ' +
    'Producers write to the leader partition; followers replicate synchronously (ISR). ' +
    'Consumers track their offset per partition — replayable, scalable. ' +
    'Zookeeper (or KRaft) manages broker membership and leader election.',

  simulation: {
    constraints: [
      { label: 'Write throughput', value: '1M messages/sec' },
      { label: 'Avg message size', value: '1 KB' },
      { label: 'Write bandwidth', value: '~1 GB/sec' },
      { label: 'Retention', value: '7 days' },
      { label: 'Storage needed', value: '~600 TB' },
    ],
    levels: [
      {
        traffic: 10000,
        targetLatency: 10,
        successMsg: 'Single-partition queue running — producers and consumers connected.',
        failMsg: '[FATAL] No queue configured. Connect Producer → Kafka → Consumer.',
        failNode: 'api_server',
        failTooltip:
          'A message queue decouples producers from consumers. ' +
          'Producers write at their rate; consumers read at theirs. ' +
          'Add: Producer → Kafka Broker → Consumer.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'kafka' },
          { type: 'hasEdge', source: 'kafka', target: 'worker' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 30,
        successMsg: 'Partitioning active — 10 partitions across 3 brokers, 10x throughput gain.',
        failMsg:
          '[OVERLOAD] A single partition is a bottleneck at 100k msg/sec. ' +
          'Partition the topic across multiple brokers.',
        failNode: 'kafka',
        failTooltip:
          'Each partition is an ordered log on one broker. Multiple partitions = parallel writes. ' +
          'Kafka distributes partitions across brokers. 10 partitions × 100k msg/sec/partition = 1M/sec total.',
        checks: [
          { type: 'hasEdge', source: 'client', target: 'kafka' },
          { type: 'hasEdge', source: 'kafka', target: 'worker' },
        ],
      },
      {
        traffic: 1000000,
        targetLatency: 20,
        successMsg: 'SYSTEM STABLE — 1M msg/sec, 3x replication, consumer groups tracking offsets.',
        failMsg:
          '[FATAL] Broker crashed and 30 minutes of messages are lost. ' +
          'Enable replication factor 3 with in-sync replicas (ISR).',
        failNode: 'kafka',
        failTooltip:
          'ISR (In-Sync Replicas): producer waits for all ISR replicas to ack before confirming. ' +
          'If the leader crashes, a follower in ISR is elected — no data loss. ' +
          'Enable: acks=all + min.insync.replicas=2.',
        checks: [
          { type: 'hasEdge', source: 'client', target: 'kafka' },
          { type: 'hasEdge', source: 'kafka', target: 'worker' },
          { type: 'hasEdge', source: 'kafka', target: 'cassandra' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'What is the difference between at-most-once, at-least-once, and exactly-once delivery?',
      hint: 'Think about what happens on producer retry vs consumer re-read.',
      answer:
        'At-most-once: producer sends, doesn\'t retry on failure. Messages may be lost. ' +
        'At-least-once: producer retries on failure, consumer may receive duplicates. ' +
        'Exactly-once: requires idempotent producers (sequence numbers) + transactional consumers. ' +
        'Kafka supports all three. Exactly-once has ~5-10% performance overhead. ' +
        'Most systems choose at-least-once + idempotent consumers (deduplicate by message ID).',
    },
    {
      q: 'How does Kafka achieve such high write throughput (1M messages/sec)?',
      hint: 'Sequential I/O, zero-copy, batching.',
      answer:
        'Three key optimizations: ' +
        '(1) Sequential disk writes — logs are append-only. Sequential I/O is 1000x faster than random I/O on HDDs. ' +
        '(2) Zero-copy transfer — Kafka uses sendfile() syscall to transfer data from disk to network without copying to user space. ' +
        '(3) Batching — producers batch messages and send in bulk; brokers write batches atomically. ' +
        'Kafka can saturate a network card (10 Gbps) before the disk becomes a bottleneck.',
    },
    {
      q: 'A consumer is slow and falls 2 days behind. What happens? What are the risks?',
      hint: 'Lag, retention, and consumer group rebalance.',
      answer:
        'The consumer tracks its offset. If it\'s 2 days behind but retention is 7 days, it\'s fine — ' +
        'it can catch up. If it falls behind the retention period, messages are deleted and data is lost. ' +
        'Risks: if a slow consumer is in a group, it may trigger a rebalance, ' +
        'which pauses all consumers in the group. Monitor consumer lag as a key metric; ' +
        'alert at > 1 hour lag.',
    },
    {
      q: 'How do you guarantee message ordering?',
      hint: 'Ordering is guaranteed within a partition, not across partitions.',
      answer:
        'Kafka guarantees ordering within a single partition. ' +
        'If you need all messages from one user in order, use user_id as the partition key — ' +
        'all messages from the same user go to the same partition. ' +
        'If you need global ordering across all users, you\'re forced to use 1 partition — ' +
        'sacrificing throughput. In practice, per-entity ordering is sufficient.',
    },
    {
      q: 'How would you implement a dead letter queue (DLQ) in Kafka?',
      hint: 'What happens when a consumer throws an exception on a message?',
      answer:
        'When a consumer fails to process a message after N retries, ' +
        'it publishes the message to a dedicated DLQ topic (e.g., original-topic-DLQ). ' +
        'Include metadata: original topic, partition, offset, exception message, retry count. ' +
        'A separate DLQ consumer logs/alerts on these. Engineers can fix the root cause ' +
        'and replay from the DLQ. Never allow unhandled exceptions to halt the main consumer — ' +
        'that blocks the entire partition.',
    },
  ],
};

export default challenge;
