import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-049',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design Discord (Voice + Text Channels)',
  companies: ['Discord', 'Teamspeak', 'Mumble'],
  timeEst: '~55 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design a platform combining persistent text channels (with full message history) and ' +
    'real-time voice channels (low-latency audio for gaming). ' +
    'Handle 500M registered users, 19M active servers, 150M DAU, ' +
    'and voice calls with up to 100,000 simultaneous participants per event.',
  solution:
    'Text channels: Cassandra for message storage (partition by channel_id, order by message_id). ' +
    'WebSocket for real-time delivery. Same architecture as Slack messaging. ' +
    'Voice channels: WebRTC SFU (Selective Forwarding Unit) for audio routing. ' +
    'Proximity voice: spatial audio where volume depends on distance in-game. ' +
    'Server discovery: Etcd for guild-to-node routing in Discord\'s architecture.',

  simulation: {
    constraints: [
      { label: 'Registered users', value: '500M' },
      { label: 'DAU', value: '150M' },
      { label: 'Active servers (guilds)', value: '19M' },
      { label: 'Max voice channel participants', value: '100,000 (Stage events)' },
      { label: 'Voice latency target', value: '< 50ms' },
    ],
    levels: [
      {
        traffic: 100000,
        targetLatency: 100,
        successMsg: 'Text channels live — messages persisting and delivering in real-time.',
        failMsg: '[FATAL] Text messages not loading. Connect API → Cassandra + WebSocket.',
        failNode: 'api_server',
        failTooltip:
          'Discord messages: Cassandra with (channel_id, message_id) primary key. ' +
          'message_id is a Snowflake (time-ordered). ' +
          'Load history: last 50 messages per channel on open. ' +
          'Real-time: WebSocket for new messages.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'cassandra' },
        ],
      },
      {
        traffic: 1000000,
        targetLatency: 50,
        successMsg: 'Voice channels active — SFU routing audio, < 30ms latency.',
        failMsg:
          '[AUDIO LAG] Voice call with 100ms+ latency. ' +
          'Switch from TURN relay to direct WebRTC SFU for audio routing.',
        failNode: 'api_server',
        failTooltip:
          'TURN server relays audio (like a proxy). Good for NAT traversal but adds 50ms+. ' +
          'SFU: audio streams go directly from senders to the SFU, which forwards to receivers. ' +
          'SFU is in a datacenter close to participants — much lower latency than TURN.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'load_balancer', target: 'api_server' },
        ],
      },
      {
        traffic: 150000000,
        targetLatency: 30,
        successMsg: 'SYSTEM STABLE — 150M DAU, 19M servers, Stage events with 100k voice participants.',
        failMsg:
          '[OVERLOAD] A Stage event (100k voice listeners) is overwhelming the voice server. ' +
          'Scale SFU horizontally — cascade SFUs to handle 100k simultaneous participants.',
        failNode: 'load_balancer',
        failTooltip:
          'SFU cascade: a single SFU handles ~1000 participants. ' +
          'For 100k listeners: a root SFU receives speaker streams, ' +
          'forwards to 100 regional SFUs, each handling 1000 listeners. ' +
          'Speakers → Root SFU → Regional SFUs (100x) → Listeners.',
        checks: [
          { type: 'hasEdge', source: 'client', target: 'load_balancer' },
          { type: 'hasEdge', source: 'load_balancer', target: 'api_server' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'Discord serves "nitro" users with higher quality audio. How do you differentiate service levels in the voice pipeline?',
      hint: 'Bitrate and codec selection per user.',
      answer:
        'Audio quality is determined by the codec and bitrate. ' +
        'Standard users: Opus codec at 64 kbps. ' +
        'Nitro users: Opus at 128 kbps or 384 kbps for server boosted guilds. ' +
        'The SFU checks the user\'s subscription level and selects the appropriate bitrate. ' +
        'Different bitrate streams can coexist in the same voice channel — ' +
        'each receiver gets the stream matching their subscription tier.',
    },
    {
      q: 'How does Discord handle the case where a user is in 100 servers — each server has events that need to be pushed to that user?',
      hint: 'Fan-out on write for guild events.',
      answer:
        'Discord\'s architecture routes each guild to a single "guild shard" server. ' +
        'The guild shard knows which users are currently online and connected. ' +
        'When an event happens in the guild (message, member join), the shard ' +
        'fans out to all connected users\' gateway servers. ' +
        'A user in 100 guilds has 100 shards that can push events to them. ' +
        'Gateway servers (WebSocket) receive events from multiple shards and relay to the client.',
    },
    {
      q: 'How do you implement message reactions efficiently? A meme message can have 50k people reacting with the same emoji.',
      hint: 'Counter per emoji per message.',
      answer:
        'Store reactions as: reactions(message_id, emoji, user_id). ' +
        'For reading: aggregate count per emoji per message. ' +
        'For a message with 50k reactions, SELECT COUNT(*) WHERE message_id = X AND emoji = "fire". ' +
        'Cache reaction counts in Redis: HINCRBY reactions:{message_id} {emoji} 1. ' +
        'The reaction list (who reacted) is paginated — you don\'t need to show all 50k users at once. ' +
        'For the "did I react?" check: SISMEMBER user_reactions:{messageId}:{emoji} {userId}.',
    },
    {
      q: 'Discord had an outage when Cassandra ran out of storage for message IDs. How would you design a sharding strategy for message storage?',
      hint: 'Partition the Cassandra keyspace.',
      answer:
        'Cassandra partition key: (channel_id, bucket). ' +
        'A bucket is a time-based integer: floor(message_timestamp / BUCKET_SIZE). ' +
        'Each bucket contains N messages. When a bucket fills, a new one starts. ' +
        'This prevents any single partition from growing unboundedly. ' +
        'Query for recent messages: fetch the current bucket for the channel. ' +
        'Loading history: fetch older buckets in reverse order. ' +
        'Discord calls this the "snowflake bucket" partition strategy.',
    },
  ],
};

export default challenge;
