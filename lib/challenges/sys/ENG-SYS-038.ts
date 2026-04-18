import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-038',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Stock Ticker Feed',
  companies: ['Bloomberg', 'Nasdaq', 'Robinhood'],
  timeEst: '~50 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design a real-time stock price distribution system. ' +
    'Market exchanges publish 1M price updates/sec across 10,000 symbols. ' +
    'Distribute these updates to 5M concurrent subscribers with < 50ms latency. ' +
    'Subscribers subscribe to specific symbols (e.g., AAPL, TSLA). ' +
    'Price history queryable for the last 30 years.',
  solution:
    'A pub/sub fanout system: exchange feed → Kafka (partitioned by symbol) → ' +
    'fanout workers → WebSocket connection servers. ' +
    'Each connection server subscribes to the symbols its clients are watching (Redis pub/sub). ' +
    'For price history: time-series database (Cassandra partitioned by symbol + year). ' +
    'Data normalization: different exchanges use different formats — a normalizer standardizes before publishing.',

  simulation: {
    constraints: [
      { label: 'Price updates/sec', value: '1M (across 10k symbols)' },
      { label: 'Concurrent subscribers', value: '5M' },
      { label: 'Avg subscriptions/user', value: '5 symbols' },
      { label: 'Delivery latency target', value: '< 50ms' },
      { label: 'Price history retention', value: '30 years' },
    ],
    levels: [
      {
        traffic: 100000,
        targetLatency: 50,
        successMsg: 'Price feed ingesting — symbol prices updating in real-time.',
        failMsg: '[FATAL] Price feed not connected. Add Kafka between exchange feed and subscribers.',
        failNode: 'api_server',
        failTooltip:
          'Exchange protocols (FIX, ITCH) → Ingest service → Kafka partitioned by symbol. ' +
          'Each Kafka partition handles one symbol → ordered, sequential updates per symbol.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
        ],
      },
      {
        traffic: 1000000,
        targetLatency: 30,
        successMsg: 'Fan-out active — 5M subscribers receiving subscribed symbol updates.',
        failMsg:
          '[OVERLOAD] Fanout service pushing 1M updates/sec to 5M subscribers directly. ' +
          'Use a pub/sub layer (Redis) between fanout workers and connection servers.',
        failNode: 'kafka',
        failTooltip:
          'Redis pub/sub channel per symbol: AAPL, TSLA, etc. ' +
          'Kafka consumer publishes to AAPL channel when AAPL updates. ' +
          'Connection server subscribes to channels its clients are watching. ' +
          'Only one Redis message per symbol update, regardless of how many subscribers.',
        checks: [
          { type: 'hasEdge', source: 'kafka', target: 'redis' },
          { type: 'hasEdge', source: 'redis', target: 'api_server' },
        ],
      },
      {
        traffic: 5000000,
        targetLatency: 20,
        successMsg: 'SYSTEM STABLE — 5M subscribers, 1M updates/sec, < 30ms delivery globally.',
        failMsg:
          '[HISTORICAL QUERY SLOW] Querying 30 years of AAPL prices taking 45 seconds. ' +
          'Pre-compute OHLC aggregates (daily/weekly/monthly) for fast chart rendering.',
        failNode: 'cassandra',
        failTooltip:
          'Pre-aggregate: daily OHLC (Open, High, Low, Close) stored separately from tick data. ' +
          'A 10-year chart renders 3650 daily candles — milliseconds to query. ' +
          'Raw tick data (30 years × 10k symbols × 1M updates/day) stays in Cassandra for compliance.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'cassandra' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How do you ensure subscribers receive price updates in the correct sequence?',
      hint: 'Ordering within a symbol, not across symbols.',
      answer:
        'Kafka partition by symbol_id: all updates for AAPL go to the same partition. ' +
        'Within a partition, Kafka guarantees order. ' +
        'Each price update has a sequence_number from the exchange. ' +
        'If a subscriber misses sequence 5 (gap detected: received 4 then 6), ' +
        'they can request the missed update from a gap-fill service ' +
        'that keeps a short buffer of recent prices per symbol.',
    },
    {
      q: 'How do you handle market close? On weekends, there are no price updates for 48 hours.',
      hint: 'State management and stale data.',
      answer:
        'WebSocket connections can remain open over the weekend (keep-alive pings every 30 seconds). ' +
        'The last known price is cached in Redis — no price update = serve cached price with a "market closed" flag. ' +
        'On market open (9:30 AM ET Monday), the exchange feed resumes. ' +
        'The UI shows a "CLOSED" badge and the last closing price. ' +
        'Pre-market and after-hours data (4 AM – 9:30 AM and 4 PM – 8 PM) is handled the same way — ' +
        'a separate "extended hours" feed from different venues.',
    },
    {
      q: 'How would you implement price alerts ("notify me when AAPL drops below $150")?',
      hint: 'Evaluate alert conditions against the live price stream.',
      answer:
        'Store alerts in Postgres: alerts(user_id, symbol, condition: above|below, price). ' +
        'Load active alerts into Redis per symbol: alerts:AAPL → sorted set of trigger prices. ' +
        'As each AAPL price update flows through the pipeline, check: ' +
        'ZRANGEBYSCORE alerts:AAPL 0 currentPrice → these alerts have triggered. ' +
        'Fire notification (push, email, SMS) via a Kafka event to the notification service. ' +
        'Delete the triggered alert (one-time) or mark as notified (recurring).',
    },
    {
      q: 'How do you handle the "quote stuffing" attack where a malicious firm sends millions of fake orders to slow down competitors\' systems?',
      hint: 'Rate limiting at ingestion.',
      answer:
        'Quote stuffing is a real market manipulation tactic. ' +
        'Defenses: ' +
        '(1) Rate limit order updates per exchange participant (exchange-level enforcement). ' +
        '(2) Deduplicate: if a symbol receives > 10k updates/sec, sample to a manageable rate (keep every 10th). ' +
        '(3) Circuit breaker: if a symbol\'s update rate exceeds 100x normal, ' +
        'flag it and alert the operations team. ' +
        '(4) Exchanges now have regulatory "stub quoting" rules to prevent this.',
    },
  ],
};

export default challenge;
