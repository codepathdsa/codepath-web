import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-047',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Real-Time Sports Score System',
  companies: ['ESPN', 'The Athletic', 'FanDuel'],
  timeEst: '~40 min',
  level: 'Mid',
  status: 'Not Started',
  desc:
    'Design a real-time sports score update system. During peak events (Super Bowl, World Cup), ' +
    'deliver score updates to 50M concurrent users within 5 seconds of the actual event. ' +
    'Support push notifications, WebSocket streams, and REST polling. ' +
    'Handle 10 major events simultaneously.',
  solution:
    'Scores are ingested from official data providers via their push APIs. ' +
    'Updates publish to Redis pub/sub channels (one per game). ' +
    'WebSocket connection servers subscribe to their users\' active game channels. ' +
    'For REST polling, scores are cached in Redis with a 1-second TTL. ' +
    'Push notifications route through APNs/FCM via a notification service consuming Kafka.',

  simulation: {
    constraints: [
      { label: 'Concurrent users', value: '50M' },
      { label: 'Simultaneous events', value: '10' },
      { label: 'Update frequency', value: 'Every 30-60 sec during play' },
      { label: 'Score delivery target', value: '< 5 sec from real event' },
      { label: 'Peak load time', value: 'Super Bowl = single-event 50M viewers' },
    ],
    levels: [
      {
        traffic: 50000,
        targetLatency: 5000,
        successMsg: 'Score ingestion running — official data feed updating scores.',
        failMsg: '[FATAL] Scores not updating. Connect Official Data Provider → Score Service.',
        failNode: 'api_server',
        failTooltip:
          'Connect to the official data provider (Sportradar, Stats Perform) via their push API (WebSocket/HTTP stream). ' +
          'Each score event: {game_id, timestamp, home_score, away_score, event_description}. ' +
          'Write to Redis: SET score:{game_id} {json} EX 86400.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
      {
        traffic: 5000000,
        targetLatency: 2000,
        successMsg: 'WebSocket fan-out active — 5M concurrent connections receiving updates.',
        failMsg:
          '[OVERLOAD] 50M clients polling REST endpoint every second. ' +
          'Switch to WebSocket + Redis pub/sub to push updates instead of polling.',
        failNode: 'api_server',
        failTooltip:
          'REST polling at 50M users × 1 req/sec = 50M RPS on the score API. ' +
          'WebSocket push: server sends updates only when scores change. ' +
          'At 1 score update per 30 seconds, 50M WebSocket connections receive 1 push/30 sec. ' +
          'Much lower load than REST polling.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'redis', target: 'worker' },
        ],
      },
      {
        traffic: 50000000,
        targetLatency: 1000,
        successMsg: 'SYSTEM STABLE — 50M concurrent users, < 2 sec delivery, push notifications sent.',
        failMsg:
          '[SPIKE] Super Bowl touchdown causes 50M simultaneous score requests. ' +
          'CDN caching the score response reduces origin load to near-zero.',
        failNode: 'api_server',
        failTooltip:
          'Score response is the same for all 50M users: {"home": 21, "away": 14}. ' +
          'Cache at CDN edge: Cache-Control: public, max-age=1 (1-second CDN TTL). ' +
          'CDN serves 50M requests from cache. Origin sees 1 request/second per edge PoP.',
        checks: [
          { type: 'hasEdge', source: 'client', target: 'cdn' },
          { type: 'hasEdge', source: 'cdn', target: 'api_server' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How do you handle data provider latency? The official score arrives 2 seconds after the actual event.',
      hint: 'You can\'t manufacture the data faster than the source provides it.',
      answer:
        'Data provider latency is outside your control — you can only minimize your own pipeline latency. ' +
        'Your pipeline: provider push → ingest service → Redis → WebSocket push. ' +
        'Target: < 500ms added latency in your system. ' +
        'For certain events (NFL RedZone, fantasy sports), 2-second delay is acceptable. ' +
        'For sports betting (FanDuel), sub-second is critical — they pay premium for faster data feeds.',
    },
    {
      q: 'How do you handle 50M push notifications in under 30 seconds when a major event happens?',
      hint: 'Batch notification fanout.',
      answer:
        'Do NOT call APNs/FCM 50M times sequentially. ' +
        'Fan-out: publish 1 score event to Kafka. ' +
        'N notification workers in parallel each handle a shard of subscribers. ' +
        'APNs/FCM support bulk notification APIs (send to 500 device tokens per request). ' +
        '50M / 500 = 100k API calls. With 1000 parallel workers: 100k / 1000 = 100 batches → ' +
        'complete in ~5 seconds if each batch call takes 50ms.',
    },
    {
      q: 'How do you send the right score to the right user? A user watching 3 games simultaneously.',
      hint: 'Subscription management.',
      answer:
        'User subscription tracking: when a user opens a game page, their WebSocket subscribes to game:{game_id}. ' +
        'If they open 3 games, they subscribe to 3 channels. ' +
        'Redis pub/sub: connection server subscribes to all channels its users are watching. ' +
        'When game_A scores, only users subscribed to game_A receive the update. ' +
        'On page close: unsubscribe from the channel to stop receiving updates.',
    },
    {
      q: 'What happens to your WebSocket connections when you deploy a new version of the connection server?',
      hint: 'Graceful shutdown of long-lived connections.',
      answer:
        'Naive deployment: kill the process → all connections drop → 50M clients reconnect simultaneously (thundering herd). ' +
        'Graceful shutdown: ' +
        '(1) Signal the load balancer to stop routing new connections to this instance. ' +
        '(2) Send a "reconnect" message to all existing WebSocket clients (they reconnect to other instances). ' +
        '(3) Wait for all connections to drain (max 30 seconds). ' +
        '(4) Shut down the process. ' +
        'Clients spread their reconnects across all healthy instances, avoiding a spike.',
    },
  ],
};

export default challenge;
