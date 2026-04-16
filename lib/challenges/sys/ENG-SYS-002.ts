import type { Challenge } from '../types';

// ─── ENG-SYS-002 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-SYS-002',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design a Ticketmaster Waiting Room',
    companies: ['Ticketmaster', 'LiveNation'],
    timeEst: '~60 min',
    level: 'Senior',
    status: 'Not Started',
    desc:
      'Taylor Swift tickets drop at noon. 5 million users will hit the buy button ' +
      'at the exact same second for 50,000 tickets. If you write directly to the DB, it will melt.',
    solution:
      'Implement a queue-based async architecture. ' +
      'Users hit the API Gateway which drops a token into SQS/Kafka and immediately ' +
      'returns a "You\'re in the queue" UI (position + estimate). ' +
      'Worker nodes consume the queue at a rate the DB can safely handle, ' +
      'process one purchase at a time with optimistic locking, ' +
      'and notify users via WebSocket when it\'s their turn.',

    simulation: {
      constraints: [
        { label: 'Peak concurrent users', value: '5,000,000' },
        { label: 'Available tickets', value: '50,000' },
        { label: 'Spike duration', value: '< 5 seconds' },
        { label: 'Max DB write RPS', value: '~2,000 (safe)' },
        { label: 'Target checkout time', value: '< 10 min per user' },
      ],

      levels: [
        {
          // Lesson: you need an entry point that doesn't write to DB
          traffic: 100000,
          targetLatency: 200,
          successMsg:
            'Entry gate established. 100k RPS absorbed by API Gateway.',
          failMsg:
            '[FATAL] 100,000 requests/sec with nowhere to land. ' +
            'Add an API Gateway as the entry point.',
          failNode: 'client',
          failTooltip:
            'The API Gateway is a stateless HTTP layer that accepts all incoming ' +
            'connections and decides what to do with them — without touching the DB. ' +
            'Add: Client → Load Balancer → API Gateway.',
          checks: [
            { type: 'hasPath', source: 'client', target: 'api_server' },
          ],
        },
        {
          // Lesson: direct DB writes at 5M RPS = instant death → need a queue
          traffic: 500000,
          targetLatency: 5000,
          successMsg:
            'Queue buffer active. Traffic absorbed. DB safe at ~2k writes/sec.',
          failMsg:
            '[DB MELTDOWN] 500k purchase attempts hitting Postgres directly. ' +
            'DB can handle ~2k writes/sec. You\'re sending 500k. Add Kafka/SQS between API and DB.',
          failNode: 'postgres',
          failTooltip:
            'Add a message queue (Kafka) between the API Server and the database. ' +
            'The API drops a "purchase intent" message and returns 202 Accepted immediately. ' +
            'Workers consume the queue at the DB\'s safe write rate.',
          checks: [
            { type: 'hasPath', source: 'api_server', target: 'kafka' },
            { type: 'hasPath', source: 'kafka', target: 'worker' },
          ],
        },
        {
          // Lesson: workers must use locking to prevent double-selling
          traffic: 2000,
          targetLatency: 80,
          successMsg:
            'SYSTEM STABLE — Queue draining at 2k/sec. No double-sells. Tickets sold fairly.',
          failMsg:
            '[RACE CONDITION] Multiple workers are selling the same seat. ' +
            'Tickets are being double-booked. Add optimistic locking or a Redis seat lock.',
          failNode: 'worker',
          failTooltip:
            'Workers must claim a seat atomically before writing to the DB. ' +
            'Use Redis SETNX ("set if not exists") as a distributed lock: ' +
            'the first worker to claim seat #1042 wins. All others get a different seat. ' +
            'Connect Worker → Redis → Postgres.',
          checks: [
            { type: 'hasEdge', source: 'worker', target: 'redis' },
            { type: 'hasPath', source: 'worker', target: 'postgres' },
          ],
        },
      ],
    },

    questions: [
      {
        q: 'How do you prevent two users from buying the same seat simultaneously?',
        hint: 'Optimistic vs pessimistic locking. Which fits high-concurrency better?',
        answer:
          'Use a Redis distributed lock with SETNX (set-if-not-exists) and a short TTL. ' +
          'Worker A calls SETNX("seat:1042", workerA_id). If it returns 1, it won the lock. ' +
          'Worker B gets 0 and moves to the next available seat. ' +
          'After the DB write completes, the lock is released. ' +
          'TTL ensures locks are released if a worker crashes mid-purchase.',
      },
      {
        q: 'How do you fairly assign queue position to 5 million users who join in the same second?',
        hint: 'You cannot sort by arrival time if everyone arrives simultaneously.',
        answer:
          'Accept that "simultaneous" is a 500ms window, not truly the same millisecond. ' +
          'Assign queue positions using the Kafka partition offset — first message written ' +
          'to the partition is first. Within the same partition, order is guaranteed. ' +
          'For true fairness, generate a random UUID per user and sort by it — ' +
          'this creates a fair lottery rather than a speed-of-connection advantage.',
      },
      {
        q: 'How do you tell the user their position and estimated wait time?',
        hint: 'This requires a persistent connection — think real-time.',
        answer:
          'When the user joins the queue, open a WebSocket connection. ' +
          'Maintain a Redis sorted set where score = queue position. ' +
          'Every 5 seconds, broadcast updates to all connected users: ' +
          '"Position 4,231 → your estimated wait is ~12 minutes." ' +
          'When a user reaches position 1, push a checkout URL over the WebSocket.',
      },
      {
        q: 'A user\'s browser crashes at position 50. How do you handle re-entry?',
        hint: 'The queue token needs to survive browser restarts.',
        answer:
          'Issue a signed JWT token when the user enters the queue. ' +
          'The token contains their queue position and expiry. ' +
          'If they reconnect within the TTL, they rejoin at their original position. ' +
          'After TTL (e.g., 15 min), the position is forfeited and released back to the queue.',
      },
      {
        q: 'What happens to users who reach checkout but don\'t complete the purchase in time?',
        hint: 'Holding a seat forever kills availability for other users.',
        answer:
          'Give users a 10-minute checkout window with a visible countdown timer. ' +
          'The seat is locked in Redis with a 10-minute TTL. ' +
          'If payment is not completed, the TTL expires, the seat lock releases, ' +
          'and the seat is re-inserted into the available pool. ' +
          'The user sees "Your session expired — return to queue."',
      },
    ],
  };

export default challenge;
