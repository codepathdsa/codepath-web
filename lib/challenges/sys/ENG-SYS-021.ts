import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-021',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design Slack (Team Messaging)',
  companies: ['Slack', 'Microsoft', 'Discord'],
  timeEst: '~50 min',
  level: 'Mid',
  status: 'Not Started',
  desc:
    'Design a team chat application where users send messages in channels and DMs. ' +
    'Support 10M DAU, 1M concurrent connections, message history with search, ' +
    'and real-time delivery in < 100ms.',
  solution:
    'WebSocket connections for real-time delivery, maintained by a connection service. ' +
    'Messages are stored in Cassandra (partitioned by channel_id, ordered by timestamp). ' +
    'When a message is sent, the connection service fans out to all members of the channel. ' +
    'A Kafka pipeline handles async notifications, push alerts, and search indexing.',

  simulation: {
    constraints: [
      { label: 'DAU', value: '10M' },
      { label: 'Concurrent connections', value: '1M' },
      { label: 'Messages/day', value: '1B' },
      { label: 'Message delivery target', value: '< 100ms' },
      { label: 'Max channel members', value: '10,000' },
    ],
    levels: [
      {
        traffic: 10000,
        targetLatency: 100,
        successMsg: 'WebSocket connections live — messages delivering in real-time.',
        failMsg: '[FATAL] No real-time delivery. Users must refresh to see new messages.',
        failNode: 'api_server',
        failTooltip:
          'Long-polling adds 1-3 second delay and wastes bandwidth. ' +
          'WebSocket keeps a persistent bidirectional connection — server can push instantly.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 50,
        successMsg: 'Message persistence active — Cassandra storing messages, history loadable.',
        failMsg:
          '[DATA LOSS] Messages not persisted. After server restart, all messages are gone.',
        failNode: 'api_server',
        failTooltip:
          'Store messages in Cassandra: partition by channel_id, cluster by message_id (time-ordered). ' +
          'Load history: SELECT * FROM messages WHERE channel_id = X ORDER BY message_id DESC LIMIT 50.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'cassandra' },
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
        ],
      },
      {
        traffic: 1000000,
        targetLatency: 30,
        successMsg: 'SYSTEM STABLE — 1M concurrent WebSocket connections, fan-out < 50ms.',
        failMsg:
          '[OVERLOAD] A message to a 10,000-member channel requires 10,000 WebSocket sends ' +
          'from a single server. Fan-out exceeding capacity.',
        failNode: 'api_server',
        failTooltip:
          'Connection servers are stateful — each holds N WebSocket connections. ' +
          'Use a pub/sub system (Redis pub/sub) per channel. ' +
          'Each connection server subscribes to channels it has members for. ' +
          'Broadcast once per channel; each connection server fans out to its local members.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'redis', target: 'worker' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How do you know which WebSocket server a user is connected to, so you can route messages to them?',
      hint: 'Presence registry.',
      answer:
        'A presence service (Redis hash): { userId: serverId }. ' +
        'When a WebSocket connects, the connection server writes userId → serverId. ' +
        'On disconnect, it deletes the entry. With a TTL as a heartbeat, stale entries expire. ' +
        'When routing a message, look up userId → serverId, then route to that server via internal RPC.',
    },
    {
      q: 'How do you handle message ordering — ensuring messages appear in the order they were sent?',
      hint: 'Clock skew between servers.',
      answer:
        'Client timestamps are unreliable (clock skew, users changing their clock). ' +
        'Use server-assigned Snowflake IDs (time-ordered) as the primary sort key. ' +
        'For true ordering in a single channel, use a per-channel sequence counter (Redis INCR). ' +
        'Clients re-sort messages by server_timestamp on receipt.',
    },
    {
      q: 'How do you implement "message read receipts" at scale?',
      hint: 'Millions of reads per second for active channels.',
      answer:
        'Store per-user, per-channel last_read_message_id. ' +
        'In Redis: HSET channel:{channelId}:read {userId} {messageId}. ' +
        'Unread count = count(messages with id > last_read_message_id in channel). ' +
        'Flush to Postgres periodically for durability. ' +
        'Slack approximates unread counts — exact counts aren\'t critical.',
    },
    {
      q: 'How would you implement full-text search over message history?',
      hint: 'Message content is in Cassandra — not indexed for text search.',
      answer:
        'On every message write, publish to Kafka. ' +
        'An indexing consumer writes to Elasticsearch (inverted index on message content). ' +
        'Search index: channel_id + message content + metadata. ' +
        'A search query: workspace_id:X channel_id:Y text:"deployment failure". ' +
        'Elasticsearch returns matching message IDs, then fetch full messages from Cassandra.',
    },
  ],
};

export default challenge;
