import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-013',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Ride-Sharing App (Uber)',
  companies: ['Uber', 'Lyft', 'Grab'],
  timeEst: '~60 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design the core matching system for a ride-sharing app. Drivers broadcast their location every 4 seconds. ' +
    'Riders request a ride and must be matched with the nearest available driver in under 500ms. ' +
    'Handle 1M active drivers and 500k concurrent ride requests.',
  solution:
    'Store driver locations in Redis geospatial index (GEOADD) for O(log n) nearest-neighbor queries. ' +
    'When a rider requests, GEORADIUS returns nearby drivers; send an offer to the closest one via WebSocket. ' +
    'Use a state machine in Redis to track ride states (idle → offered → accepted → in_progress). ' +
    'Location updates flow through Kafka — high-throughput, ordered, replayable.',

  simulation: {
    constraints: [
      { label: 'Active drivers', value: '1,000,000' },
      { label: 'Location update rate', value: 'Every 4 sec per driver' },
      { label: 'Location update RPS', value: '250,000' },
      { label: 'Ride requests/sec', value: '5,000' },
      { label: 'Match latency target', value: '< 500ms' },
    ],
    levels: [
      {
        traffic: 5000,
        targetLatency: 50,
        successMsg: 'WebSocket gateway live — drivers maintaining persistent connections.',
        failMsg:
          '[FATAL] Drivers cannot maintain persistent connections. ' +
          'Add a WebSocket gateway to handle long-lived driver connections.',
        failNode: 'api_server',
        failTooltip:
          'Location updates every 4 seconds require persistent connections, not HTTP polling. ' +
          'A WebSocket gateway handles millions of long-lived connections efficiently. ' +
          'Add: Driver App → WebSocket Gateway → Kafka.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
        ],
      },
      {
        traffic: 50000,
        targetLatency: 200,
        successMsg: 'Location updates flowing — Redis geospatial index populated.',
        failMsg:
          '[OVERLOAD] 250k location writes/sec are hitting the DB directly. ' +
          'Route location updates through Kafka before writing to Redis.',
        failNode: 'api_server',
        failTooltip:
          'Kafka buffers 250k location events/sec. Consumer workers batch-write to Redis GEOADD. ' +
          'This decouples the write burst from storage. Connect: WebSocket Gateway → Kafka → Worker → Redis.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
          { type: 'hasEdge', source: 'kafka', target: 'redis' },
        ],
      },
      {
        traffic: 500000,
        targetLatency: 100,
        successMsg: 'SYSTEM STABLE — 1M drivers tracked, matches completing in < 300ms via Redis geo queries.',
        failMsg:
          '[OVERLOAD] Matching service is querying a relational DB for nearby drivers. ' +
          'Swap to Redis GEORADIUS for sub-millisecond geospatial queries.',
        failNode: 'postgres',
        failTooltip:
          'Redis GEORADIUS with a 2km radius query returns in ~0.5ms. ' +
          'A Postgres geo query with PostGIS takes ~50ms. At 5k match requests/sec, the difference is catastrophic.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasPath', source: 'api_server', target: 'postgres' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How do you handle the case where the nearest driver declines the ride offer?',
      hint: 'Think about timeouts and fallback matching.',
      answer:
        'Each offer has a 10-second acceptance window. If the driver declines or doesn\'t respond, ' +
        'mark them as "temporarily unavailable" and offer to the next nearest driver. ' +
        'This is handled by a state machine (Redis + TTL): offer sent → timeout → next driver. ' +
        'Track acceptance rate per driver; after 3 consecutive declines, ' +
        'temporarily deprioritize them in the matching queue.',
    },
    {
      q: 'The city has 1M drivers but they\'re not evenly distributed. Manhattan has 50k drivers, a rural area has 10. How does your geo index handle density extremes?',
      hint: 'Think about geohashing grid cells.',
      answer:
        'Use geohash to divide the city into grid cells. High-density areas use smaller cells (finer geohash precision). ' +
        'For rural areas, search expands from 1km → 5km → 20km radius automatically if no drivers are found. ' +
        'Redis GEORADIUS handles variable-radius queries efficiently. ' +
        'Uber\'s H3 hexagonal indexing system provides more uniform cell sizes than square geohashes.',
    },
    {
      q: 'How do you prevent two riders from being matched with the same driver?',
      hint: 'Atomic operations.',
      answer:
        'Use a Redis atomic operation. When the matching service selects a driver, ' +
        'it executes: SETNX driver:{id}:lock {riderId} EX 30. ' +
        'SETNX (Set if Not eXists) is atomic — only one rider can acquire the lock. ' +
        'If the lock fails, try the next driver. The TTL prevents dead locks if the ride is cancelled.',
    },
    {
      q: 'Surge pricing needs to be computed in real-time. How do you calculate demand/supply ratio per zone?',
      hint: 'Streaming aggregation.',
      answer:
        'A Flink streaming job consumes the Kafka location feed. ' +
        'It counts drivers per geohash cell every 30 seconds (supply). ' +
        'It counts ride requests per cell (demand). ' +
        'Surge multiplier = f(demand / supply). Write the surge map to Redis with a 30-second TTL. ' +
        'The pricing API reads from Redis. If the key is missing, fallback to 1.0x surge.',
    },
    {
      q: 'How do you store and query ride history for a user (e.g., "show me my last 50 rides")?',
      hint: 'Access pattern is user_id → sorted list of rides.',
      answer:
        'Store completed rides in Cassandra partitioned by user_id, ordered by completed_at DESC. ' +
        'The last 50 rides are a simple partition scan — no cross-partition queries needed. ' +
        'For fraud/audit purposes, also stream completed rides to a data warehouse (S3 + Athena) ' +
        'for long-term analytics without impacting the operational DB.',
    },
  ],
};

export default challenge;
