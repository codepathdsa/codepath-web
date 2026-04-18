import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-033',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design LinkedIn (Professional Network)',
  companies: ['LinkedIn', 'Xing', 'Indeed'],
  timeEst: '~50 min',
  level: 'Mid',
  status: 'Not Started',
  desc:
    'Design the connection graph and feed for a professional social network. ' +
    'Users have a 1st/2nd/3rd degree connection graph. ' +
    'Handle 875M members, 500M connection queries/day (who is a 2nd degree connection of user X?), ' +
    'and a news feed from connections and followed companies.',
  solution:
    'Store the connection graph in a graph database (or adjacency list in Postgres). ' +
    '2nd-degree connections: BFS with depth 2 from user node. ' +
    'For feed: fan-out-on-write into Redis sorted sets (same pattern as Twitter). ' +
    '"People You May Know" (PYMK): run offline graph algorithms daily to find users ' +
    'with many mutual connections.',

  simulation: {
    constraints: [
      { label: 'Members', value: '875M' },
      { label: 'Avg connections/member', value: '~400' },
      { label: 'Connection graph edges', value: '~350B' },
      { label: '2nd degree connections', value: '~50,000 per user' },
      { label: 'Feed reads/sec', value: '200,000' },
    ],
    levels: [
      {
        traffic: 5000,
        targetLatency: 100,
        successMsg: 'Profile and connections loading — graph stored in adjacency list.',
        failMsg: '[FATAL] Connection data not loading. Connect API → Connections DB.',
        failNode: 'api_server',
        failTooltip:
          'Store connections as an adjacency list: connections(user_a_id, user_b_id, connected_at). ' +
          '1st degree query: SELECT user_b_id FROM connections WHERE user_a_id = X. ' +
          'Index on user_a_id for fast lookup.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
        ],
      },
      {
        traffic: 50000,
        targetLatency: 500,
        successMsg: '2nd degree connection queries running in < 100ms via graph cache.',
        failMsg:
          '[SLOW] "People You May Know" calculation taking 30 seconds. ' +
          'Pre-compute 2nd degree connections offline and cache in Redis.',
        failNode: 'postgres',
        failTooltip:
          'Real-time 2nd degree BFS on 350B edges is too slow. ' +
          'A nightly Spark job computes 2nd-degree sets for all users, stores in Redis. ' +
          'At query time, set intersection (SINTERSTORE) finds mutual connections instantly.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'worker', target: 'redis' },
        ],
      },
      {
        traffic: 200000,
        targetLatency: 100,
        successMsg: 'SYSTEM STABLE — feed, connections, and PYMK all performing within SLA.',
        failMsg:
          '[STALE FEED] Users not seeing posts from recently added connections for 10 minutes.',
        failNode: 'api_server',
        failTooltip:
          'When a new connection is added, trigger a Kafka event. ' +
          'A feed worker retroactively fetches the new connection\'s recent posts ' +
          'and merges them into the user\'s feed. ' +
          'Similar to Twitter\'s "welcome to @user" timeline injection.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
          { type: 'hasEdge', source: 'kafka', target: 'worker' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How does LinkedIn compute "500+ connections" and "2nd degree: 1,234,567 people" efficiently?',
      hint: 'Exact count vs approximate count.',
      answer:
        '1st degree: exact count from the connections table WHERE user_a_id = X (indexed scan, fast). ' +
        '2nd degree: exact BFS on 350B edges is prohibitively expensive. ' +
        'LinkedIn uses HyperLogLog (probabilistic counting) for approximate 2nd-degree counts. ' +
        'Error rate ~0.81% — acceptable. ' +
        'LinkedIn also caches this value and recomputes nightly, not on every query.',
    },
    {
      q: 'How does LinkedIn\'s "People You May Know" (PYMK) algorithm work?',
      hint: 'Graph analysis: common connections.',
      answer:
        'PYMK scores users by: ' +
        '(1) Mutual connections count (primary signal). ' +
        '(2) Shared employers (from profile). ' +
        '(3) Shared schools. ' +
        '(4) Profile viewing history. ' +
        'Offline: a Spark job computes mutual connections via a matrix factorization / graph join. ' +
        'Stores top-N PYMK candidates per user in Redis. ' +
        'Refreshed daily. Real-time signals (profile view) can boost a candidate\'s score.',
    },
    {
      q: 'How would you design the LinkedIn feed differently from Twitter\'s feed, given that posts are less frequent but much longer?',
      hint: 'Content density and post size.',
      answer:
        'LinkedIn posts are longer (up to 3000 chars) vs Twitter (280 chars). ' +
        'Fan-out-on-write: same as Twitter, but store post_ids in Redis feed, not full post content. ' +
        'Fetch full post content from Cassandra when rendering the feed. ' +
        'Ranking: LinkedIn\'s feed uses an ML model (EdgeRank equivalent) to score posts by: ' +
        'engagement rate, poster relationship strength, content recency, and content type (video > text).',
    },
    {
      q: 'How would you implement LinkedIn\'s InMail feature (messaging non-connections)?',
      hint: 'Separate from regular messaging, quota-based.',
      answer:
        'InMail is a premium feature with a monthly credit quota (e.g., 30 messages/month). ' +
        'Deduct 1 credit per sent InMail (Redis DECR inmail_credits:{userId}). ' +
        'Refund 1 credit if the recipient responds (incentivizes quality messages). ' +
        'Store InMail messages in the same messages table, but with a flag: is_inmail = true. ' +
        'Recipients can decline InMail without it affecting their regular inbox.',
    },
  ],
};

export default challenge;
