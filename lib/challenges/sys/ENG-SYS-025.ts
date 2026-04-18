import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-025',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design DoorDash (Food Delivery)',
  companies: ['DoorDash', 'Uber Eats', 'Instacart'],
  timeEst: '~45 min',
  level: 'Mid',
  status: 'Not Started',
  desc:
    'Design the backend for a food delivery platform. Customers order from restaurants, ' +
    'dashers pick up and deliver. Handle 50M orders/day, real-time dasher tracking, ' +
    'and ETA estimation. Order must be assigned to a dasher within 30 seconds.',
  solution:
    'Separate services: Order Service (Postgres), Dasher Location Service (Redis geo), ' +
    'Assignment Service (match orders to nearby dashers), Notification Service. ' +
    'When an order is placed, the Assignment Service queries Redis GEORADIUS for nearby dashers, ' +
    'sends an offer, waits for acceptance, and retries if no response in 15 seconds. ' +
    'Real-time tracking updates via WebSocket.',

  simulation: {
    constraints: [
      { label: 'Orders/day', value: '50M' },
      { label: 'Peak orders/sec', value: '5,000' },
      { label: 'Active dashers', value: '500k' },
      { label: 'Assignment timeout', value: '30 sec' },
      { label: 'ETA accuracy target', value: '+/- 2 min' },
    ],
    levels: [
      {
        traffic: 5000,
        targetLatency: 200,
        successMsg: 'Order placement working — orders stored and acknowledged.',
        failMsg: '[FATAL] Order submission failing. Connect Customer → Order Service → Postgres.',
        failNode: 'api_server',
        failTooltip:
          'Order flow: place order → validate (restaurant open? items available?) → create order in Postgres → charge payment → emit order_placed event.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
        ],
      },
      {
        traffic: 50000,
        targetLatency: 500,
        successMsg: 'Dasher assignment active — nearest dasher matched within 20 seconds.',
        failMsg:
          '[SLOW] Dasher assignment taking 3 minutes. No geo-based matching configured.',
        failNode: 'api_server',
        failTooltip:
          'When order_placed fires, Assignment Service calls Redis GEORADIUS with restaurant location. ' +
          'Sends offer to nearest available dasher. If no response in 15s, tries the next. ' +
          'Track state: SETNX order:{id}:dasher {dasherId} EX 30 (atomic assignment lock).',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
        ],
      },
      {
        traffic: 500000,
        targetLatency: 100,
        successMsg: 'SYSTEM STABLE — 500k dashers tracked, real-time ETA updating every 30 sec.',
        failMsg:
          '[STALE ETA] Customer sees "20 min" ETA but dasher is 5 min away. ' +
          'Add real-time dasher location updates to ETA recalculation.',
        failNode: 'api_server',
        failTooltip:
          'Dasher app sends GPS location every 10 seconds → Redis GEOADD. ' +
          'ETA service recalculates: travel time from dasher → restaurant + prep time + restaurant → customer. ' +
          'ETA updates pushed to customer via WebSocket.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'redis', target: 'worker' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How does the assignment algorithm decide which dasher to offer an order to?',
      hint: 'It\'s not just proximity — consider efficiency.',
      answer:
        'A scoring function balances multiple factors: ' +
        '(1) Distance to restaurant (primary factor). ' +
        '(2) Dasher\'s current heading (a dasher already moving toward the restaurant costs less). ' +
        '(3) Multi-order batching: a dasher already carrying an order near the same restaurant. ' +
        '(4) Dasher ratings and delivery success rate. ' +
        'DoorDash\'s real algorithm also predicts delivery time using ML — ' +
        'not just distance, but actual travel time based on traffic.',
    },
    {
      q: 'How do you handle the case where a restaurant is slow and the food isn\'t ready when the dasher arrives?',
      hint: 'Idle time, compensation, re-assignment.',
      answer:
        'Dashers report "arrived at restaurant" in the app. ' +
        'If waiting > 10 minutes, alert the customer (updated ETA). ' +
        'After 20 minutes, offer the dasher the option to "unassign" — ' +
        'the order enters a re-assignment queue with higher priority (and higher pay). ' +
        'Track restaurant prep time metrics — slow restaurants get flagged. ' +
        'For scheduling: DoorDash predicts prep completion time per restaurant using historical data.',
    },
    {
      q: 'How do you prevent double-assigning the same order to two dashers?',
      hint: 'Race condition between two assignment service instances.',
      answer:
        'Use Redis atomic lock: SETNX order:{orderId}:assigned {dasherId} EX 3600. ' +
        'SETNX (set if not exists) is atomic — only one assignment service instance can set it. ' +
        'The winner proceeds with the assignment; others get a failure response and move on. ' +
        'Release the lock if the dasher declines (DEL order:{orderId}:assigned).',
    },
    {
      q: 'How do you scale the restaurant menu system? Menus can change dynamically (item sold out, price change).',
      hint: 'Read-heavy, write-rare, but time-sensitive writes.',
      answer:
        'Store menus in Postgres. Cache aggressively in Redis (TTL: 5 minutes). ' +
        'When a restaurant updates an item (e.g., marks pizza as sold out), ' +
        'write to Postgres and immediately invalidate the Redis cache key. ' +
        'The next read repopulates from Postgres. ' +
        'For real-time availability (sold out during order flow), validate at order submission time ' +
        'against the database to avoid caching stale availability.',
    },
  ],
};

export default challenge;
