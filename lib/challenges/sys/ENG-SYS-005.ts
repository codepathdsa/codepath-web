import type { Challenge } from '../types';

// ─── ENG-SYS-005 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-SYS-005',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design a Global Chat App (WhatsApp)',
    companies: ['Meta', 'Discord'],
    timeEst: '~60 min',
    level: 'Senior',
    status: 'Not Started',
    desc:
      'Design 1-on-1 messaging for 1 billion users. ' +
      'Messages must be delivered in real-time, ' +
      'and read receipts must be supported.',
    solution:
      'Clients hold persistent WebSocket connections to a Gateway Server cluster. ' +
      'A Redis hash maps UserID → GatewayServerID so any server can find any user. ' +
      'When User A messages User B, the backend looks up B\'s active Gateway ' +
      'in Redis and pushes the message over B\'s open socket. ' +
      'Cassandra stores message history. Kafka handles async fan-out and receipts.',

    simulation: {
      constraints: [
        { label: 'Total users', value: '1 Billion' },
        { label: 'Daily active users', value: '500 Million' },
        { label: 'Messages per day', value: '100 Billion' },
        { label: 'Avg message size', value: '100 bytes' },
        { label: 'Storage per day', value: '~10 TB' },
      ],

      levels: [
        {
          // Lesson: HTTP polling is terrible for chat — need persistent connection
          traffic: 10000,
          targetLatency: 800,
          successMsg:
            'WebSocket gateway up. 10k persistent connections established.',
          failMsg:
            '[HIGH LATENCY] Using HTTP polling for chat. Every client polls every 1 second. ' +
            '10,000 users = 10,000 requests/sec for zero new messages. ' +
            'Switch to WebSocket persistent connections.',
          failNode: 'client',
          failTooltip:
            'Chat requires a persistent bidirectional connection. ' +
            'HTTP polling wastes bandwidth and adds latency. ' +
            'Add a WebSocket Gateway: Client → WebSocket Gateway. ' +
            'Each connection is maintained until the user closes the app.',
          checks: [
            { type: 'hasPath', source: 'client', target: 'websocket_gateway' },
          ],
        },
        {
          // Lesson: need to know WHICH gateway server a user is connected to
          traffic: 100000,
          targetLatency: 500,
          successMsg:
            'Routing map active. Any gateway can find any user in O(1).',
          failMsg:
            '[ROUTING FAILURE] Gateway Server A receives a message for User B, ' +
            'but User B is connected to Gateway Server C. ' +
            'Add Redis as a routing map: UserID → GatewayServerID.',
          failNode: 'websocket_gateway',
          failTooltip:
            'When a user connects to a Gateway, write UserID → ServerID to Redis. ' +
            'When a message arrives for User B, look up B\'s ServerID in Redis ' +
            'and forward the message to that specific Gateway Server. ' +
            'Connect: WebSocket Gateway → Redis.',
          checks: [
            { type: 'hasEdge', source: 'websocket_gateway', target: 'redis' },
          ],
        },
        {
          // Lesson: messages need to be stored persistently AND acknowledged
          traffic: 1000000,
          targetLatency: 80,
          successMsg:
            'SYSTEM STABLE — Messages delivered in real-time. History persisted. Read receipts working.',
          failMsg:
            '[DATA LOSS] Messages delivered in real-time but not stored anywhere. ' +
            'If User B\'s phone restarts, they lose all messages. ' +
            'Connect Gateway → Kafka → Cassandra for async persistence.',
          failNode: 'websocket_gateway',
          failTooltip:
            'After delivering a message to User B via WebSocket, also write it to Kafka. ' +
            'A consumer saves it to Cassandra (partitioned by conversation_id). ' +
            'This decouples delivery (real-time) from storage (async). ' +
            'Read receipts are also events published to Kafka.',
          checks: [
            { type: 'hasPath', source: 'websocket_gateway', target: 'kafka' },
            { type: 'hasPath', source: 'kafka', target: 'cassandra' },
          ],
        },
      ],
    },

    questions: [
      {
        q: 'What happens when User B is offline when User A sends a message?',
        hint: 'No WebSocket connection exists for offline users.',
        answer:
          'Check Redis: if UserID → ServerID mapping doesn\'t exist, User B is offline. ' +
          'Store the message in Cassandra under the conversation. ' +
          'Send a push notification via APNS/FCM. ' +
          'When User B comes online and opens the app, the client fetches missed messages ' +
          'from Cassandra using a "last_seen_message_id" cursor.',
      },
      {
        q: 'How do you implement message ordering? WhatsApp shows messages in the exact send order.',
        hint: 'Distributed systems have no global clock. How do you sequence messages?',
        answer:
          'Use a Lamport timestamp or a per-conversation sequence number. ' +
          'Simpler approach: each message gets a server-assigned timestamp from a single ' +
          'sequencer service (or Cassandra\'s TIMEUUID). ' +
          'Store messages partitioned by conversation_id, clustered by timestamp. ' +
          'Clients always display in timestamp order. ' +
          'Two messages with the same millisecond timestamp are broken by sender_id (arbitrary but consistent).',
      },
      {
        q: 'How do read receipts work at scale?',
        hint: 'A "read" event is just another message in the opposite direction.',
        answer:
          'When User B opens a conversation, the client sends a "read receipt" event ' +
          'to the Gateway. The Gateway publishes it to Kafka as a receipt event. ' +
          'A consumer updates the last_read_message_id for User B in Cassandra. ' +
          'User A\'s app, which has an open WebSocket, receives the receipt event ' +
          'pushed in real-time by the Gateway — the double tick turns blue.',
      },
      {
        q: 'How do you handle a Gateway Server crashing with 10,000 open connections?',
        hint: 'All those users just lost their real-time connection.',
        answer:
          'Clients implement exponential backoff reconnection (retry after 1s, 2s, 4s…). ' +
          'On reconnect, the client hits any available Gateway (load balanced). ' +
          'The new Gateway writes the new UserID → NewServerID mapping to Redis, ' +
          'overwriting the stale entry. The client fetches missed messages from Cassandra. ' +
          'Total downtime per user: 1–5 seconds — acceptable for a chat app.',
      },
      {
        q: 'WhatsApp uses end-to-end encryption. How does that affect the server architecture?',
        hint: 'The server must never see plaintext. What does it actually store?',
        answer:
          'With E2E encryption (Signal Protocol), the server only stores and routes ciphertext. ' +
          'The encryption key is derived from the recipient\'s public key — the server never has it. ' +
          'Architecture impact: the server cannot do server-side search of message content. ' +
          'All decryption happens on the client device. ' +
          'Cassandra stores encrypted blobs, not readable text. ' +
          'This also means if a user loses their device, their messages may be unrecoverable.',
      },
    ],
  };

export default challenge;
