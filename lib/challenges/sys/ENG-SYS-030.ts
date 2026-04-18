import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-030',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Flash Sale System',
  companies: ['Amazon', 'Shopify', 'Alibaba'],
  timeEst: '~55 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design a flash sale system: 1000 PS5 consoles go on sale at exactly 9:00 AM. ' +
    '500,000 users rush the site simultaneously. Exactly 1000 units must be sold — ' +
    'no overselling, no duplicate orders, and the site must remain responsive under the load spike.',
  solution:
    'Pre-load inventory in Redis (DECR to atomically decrement). ' +
    'A waiting room queues excess traffic before the sale starts. ' +
    'At 9:00 AM, admit users from the queue at a controlled rate. ' +
    'Purchases use Redis atomic DECR — if counter goes negative, rollback and reject. ' +
    'Order confirmation is async (Kafka → write to Postgres) after the DECR succeeds.',

  simulation: {
    constraints: [
      { label: 'Inventory', value: '1,000 units' },
      { label: 'Concurrent users', value: '500,000' },
      { label: 'Request spike', value: '500k requests in first 5 sec' },
      { label: 'Oversell tolerance', value: 'Zero — must not sell > 1,000' },
      { label: 'Site availability', value: 'Must stay up under 500k RPS' },
    ],
    levels: [
      {
        traffic: 500000,
        targetLatency: 2000,
        successMsg: 'Waiting room absorbing traffic — users queued, site responsive.',
        failMsg:
          '[DOWN] 500k simultaneous requests crashed the API servers. ' +
          'Add a waiting room to queue excess traffic before it reaches the backend.',
        failNode: 'api_server',
        failTooltip:
          'A waiting room is a lightweight static page served by CDN. ' +
          'Users are assigned a random position in the queue. ' +
          'Only N users/second are admitted into the actual purchase flow. ' +
          'Backend never sees more than N RPS regardless of how many users are waiting.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'cdn' },
          { type: 'hasEdge', source: 'cdn', target: 'api_server' },
        ],
      },
      {
        traffic: 5000,
        targetLatency: 500,
        successMsg: 'Atomic inventory decrement working — zero oversell.',
        failMsg:
          '[OVERSOLD] 1,200 orders created for 1,000 units. ' +
          'Fix the race condition by using Redis atomic DECR for inventory.',
        failNode: 'postgres',
        failTooltip:
          'SELECT inventory WHERE > 0, then UPDATE inventory - 1 is NOT atomic. ' +
          'Two requests reading 1 unit left will both pass the check and both decrement. ' +
          'Redis DECR is atomic: if result < 0, INCR to rollback and reject the request.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
      {
        traffic: 10000,
        targetLatency: 200,
        successMsg: 'SYSTEM STABLE — exactly 1,000 orders confirmed, zero oversell, 0 duplicates.',
        failMsg:
          '[DUPLICATE ORDERS] A user\'s network timed out, they clicked "buy" again, ' +
          'and now have two orders. Add idempotency keys to prevent duplicate purchases.',
        failNode: 'api_server',
        failTooltip:
          'Idempotency key: client generates a unique key for each purchase attempt. ' +
          'Server: SETNX idempotency:{key} processing EX 300. If already exists, return cached response. ' +
          'Same key = same result. Double-click or retry returns the same order, not a new one.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
          { type: 'hasEdge', source: 'kafka', target: 'postgres' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How does the waiting room prevent the backend from being overwhelmed?',
      hint: 'CDN + token bucket admission.',
      answer:
        'The waiting room page is a static HTML file served by CDN (zero backend load). ' +
        'It polls a lightweight status endpoint: "your position in queue is 43,251". ' +
        'The admission controller releases N tokens per second (e.g., 500 users/sec). ' +
        'Users with a valid token proceed to checkout. ' +
        'The backend sees a steady 500 RPS instead of a 500k spike.',
    },
    {
      q: 'How do you implement the atomic inventory check using Redis?',
      hint: 'DECR and check the result.',
      answer:
        'Pre-load inventory: SET flash_sale:{saleId}:inventory 1000. ' +
        'On purchase attempt: DECR flash_sale:{saleId}:inventory → returns new value. ' +
        'If newValue >= 0: proceed with order. ' +
        'If newValue < 0: INCR (rollback), return "sold out" to user. ' +
        'This is atomic — Redis processes DECR serially. Exactly 1000 operations will succeed.',
    },
    {
      q: 'Payment processing takes 3 seconds. How do you handle inventory during that window?',
      hint: 'Reserve vs charge.',
      answer:
        'Two-phase inventory: ' +
        'Phase 1: DECR reserves a unit (immediately, before payment). ' +
        'Phase 2: If payment succeeds, confirm the order in Postgres. ' +
        'If payment fails, INCR to return the unit to inventory. ' +
        'Set a reservation TTL: if the user doesn\'t complete payment in 10 minutes, ' +
        'a background job returns reserved units. ' +
        'This prevents units from being "locked" indefinitely by users who don\'t complete checkout.',
    },
    {
      q: 'How would you handle the same user on multiple devices trying to buy simultaneously?',
      hint: 'Per-user purchase limit.',
      answer:
        'Per-user purchase limit: SETNX user:{userId}:flash_purchase:{saleId} 1 EX 86400. ' +
        'If the key already exists, the user already bought one unit — reject subsequent requests. ' +
        'This is atomic — two devices sending the request simultaneously, ' +
        'only one SETNX will succeed. ' +
        'Also validate server-side that a user hasn\'t already placed an order in Postgres.',
    },
    {
      q: 'Alibaba\'s Double 11 handles 400k orders per second at peak. What database optimizations are needed?',
      hint: 'Sharding, async writes, and CQRS.',
      answer:
        'At 400k orders/sec, no single Postgres instance can handle the write load. ' +
        'Solutions: ' +
        '(1) Order sharding: partition orders by user_id or order_id across 100+ DB nodes. ' +
        '(2) Async writes: confirm order via Redis first, write to Postgres asynchronously via Kafka. ' +
        '(3) CQRS: separate read DB (for order history queries) from write DB. ' +
        '(4) MySQL with InnoDB can handle ~10k writes/sec per shard — 400k/10k = 40 shards minimum.',
    },
  ],
};

export default challenge;
