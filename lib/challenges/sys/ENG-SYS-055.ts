import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-055',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Pub/Sub System',
  companies: ['Google', 'AWS', 'RabbitMQ'],
  timeEst: '~40 min',
  level: 'Mid',
  status: 'Not Started',
  desc:
    'Design a publish-subscribe messaging system. Publishers send messages to topics without ' +
    'knowing the subscribers. Subscribers declare interest in topics and receive all messages. ' +
    'Support at-least-once delivery, 1M messages/sec throughput, ' +
    'and message retention for 7 days (so a subscriber can catch up after being offline).',
  solution:
    'Each topic is a durable log (similar to Kafka). ' +
    'Publishers append messages to the log. ' +
    'Each subscriber has its own offset (cursor position) in the log — ' +
    'can independently read at its own pace. ' +
    'Message retention: keep messages for 7 days regardless of consumption. ' +
    'Delivery guarantee: the broker sends messages and waits for ACK — retries if no ACK.',

  simulation: {
    constraints: [
      { label: 'Messages/sec', value: '1,000,000' },
      { label: 'Topics', value: '100,000' },
      { label: 'Subscribers/topic', value: '1-1000' },
      { label: 'Message retention', value: '7 days' },
      { label: 'Delivery guarantee', value: 'At-least-once' },
    ],
    levels: [
      {
        traffic: 10000,
        targetLatency: 10,
        successMsg: 'Pub/sub working — publishers sending, subscribers receiving messages.',
        failMsg: '[FATAL] Messages not routing. Connect Publisher → Topic → Subscriber.',
        failNode: 'api_server',
        failTooltip:
          'Basic pub/sub: publisher writes to topic. ' +
          'All subscribers of that topic receive the message. ' +
          'Start with an in-memory routing table: {topic: [subscriber1, subscriber2, ...]}.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 50,
        successMsg: 'Per-subscriber offsets tracking — subscribers can replay messages independently.',
        failMsg:
          '[MESSAGE LOSS] Subscriber that was offline for 1 hour missed 1M messages. ' +
          'Add per-subscriber offset tracking for independent consumption.',
        failNode: 'kafka',
        failTooltip:
          'Each subscriber has an offset in each topic\'s log. ' +
          'On reconnect, subscriber sends: "I last received message offset 54321." ' +
          'Broker responds with messages from offset 54322 onwards. ' +
          'Retention (7 days) ensures old messages are still available.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'kafka', target: 'worker' },
        ],
      },
      {
        traffic: 1000000,
        targetLatency: 20,
        successMsg: 'SYSTEM STABLE — 1M msg/sec, per-subscriber offsets, 7-day retention.',
        failMsg:
          '[FANOUT OVERLOAD] A topic with 1000 subscribers causes 1M × 1000 = 1B deliveries/sec.',
        failNode: 'kafka',
        failTooltip:
          'Pull model vs push model for high-subscriber-count topics: ' +
          'Push: broker sends to each subscriber — scales poorly with many subscribers. ' +
          'Pull: subscribers read from the log at their own rate. ' +
          'The log is written once; each subscriber reads independently. ' +
          'Kafka uses pull model — that\'s why it scales to thousands of consumers.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
          { type: 'hasEdge', source: 'worker', target: 'cassandra' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'What is the difference between a topic (pub/sub) and a queue (point-to-point)?',
      hint: 'How many receivers get the message?',
      answer:
        'Queue (point-to-point): a message is consumed by exactly ONE consumer. ' +
        'Multiple consumers compete; each message goes to one worker. ' +
        'Used for: task distribution, work queues, load balancing. ' +
        'Topic (pub/sub): a message is delivered to ALL subscribers. ' +
        'Each subscriber gets their own copy. ' +
        'Used for: event broadcasting, fanout notifications, data pipelines. ' +
        'Kafka supports both: a consumer group acts like a queue; multiple consumer groups act like topics.',
    },
    {
      q: 'How do you handle a slow subscriber that is falling behind? Should it affect other subscribers?',
      hint: 'Per-subscriber offset — independent consumption.',
      answer:
        'In a well-designed pub/sub (Kafka), subscriber speed doesn\'t affect other subscribers. ' +
        'Each subscriber reads from the log at its own pace. ' +
        'A slow subscriber just falls further behind (larger offset lag). ' +
        'As long as the retention period (7 days) hasn\'t been exceeded, it can catch up. ' +
        'Monitoring: alert when a subscriber\'s lag exceeds a threshold (e.g., 1 hour). ' +
        'Scale the slow subscriber\'s consumer group horizontally to catch up.',
    },
    {
      q: 'How do you implement topic-level filtering (subscriber only wants messages where field="X")?',
      hint: 'Content-based routing.',
      answer:
        'Option 1: filter at the subscriber — subscriber receives all messages, discards non-matching. ' +
        'Simple, but wastes bandwidth for selective subscriptions. ' +
        'Option 2: filter at the broker (attribute-based routing). ' +
        'Publisher sets message attributes: {type: "order_shipped", region: "US"}. ' +
        'Subscriber declares filter: region = "US" AND type = "order_*". ' +
        'Broker only delivers matching messages. ' +
        'AWS SNS and Google Pub/Sub support filter policies.',
    },
    {
      q: 'A publisher sends 1M messages but a subscriber only processes 100k before crashing. On restart, does it receive the remaining 900k?',
      hint: 'Checkpoint and offset management.',
      answer:
        'At-least-once delivery with durable offsets: ' +
        'The subscriber periodically commits its offset ("I\'ve processed up to offset N"). ' +
        'On restart, it reads the last committed offset and resumes from N+1. ' +
        'The 900k unprocessed messages are between the last committed offset and the current log end. ' +
        'Key: commit offsets after processing, not before. ' +
        'Committing before processing risks losing messages if the subscriber crashes between commit and process.',
    },
  ],
};

export default challenge;
