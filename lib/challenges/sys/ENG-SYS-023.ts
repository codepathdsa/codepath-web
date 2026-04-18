import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-023',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Live Leaderboard (Gaming)',
  companies: ['Riot Games', 'Steam', 'Activision'],
  timeEst: '~40 min',
  level: 'Mid',
  status: 'Not Started',
  desc:
    'Design a real-time gaming leaderboard that shows the top 100 players globally and ' +
    'each player\'s own rank. Handle 10M active players, score updates every second, ' +
    'and return the top-100 list in < 50ms.',
  solution:
    'Redis sorted sets (ZSET) are the ideal data structure: O(log n) insert/update, ' +
    'O(log n + k) for top-k query. ' +
    'Score updates: ZADD leaderboard {score} {userId}. ' +
    'Top 100: ZREVRANGE leaderboard 0 99 WITHSCORES. ' +
    'Player rank: ZREVRANK leaderboard {userId} (0-indexed, add 1 for display). ' +
    'For multiple time windows (daily/weekly/all-time), maintain separate ZSETs.',

  simulation: {
    constraints: [
      { label: 'Active players', value: '10M' },
      { label: 'Score updates/sec', value: '10,000' },
      { label: 'Leaderboard reads/sec', value: '100,000' },
      { label: 'Top-100 latency target', value: '< 50ms' },
      { label: 'Rank query latency', value: '< 10ms' },
    ],
    levels: [
      {
        traffic: 1000,
        targetLatency: 50,
        successMsg: 'Leaderboard live — top-100 list updating in real-time.',
        failMsg: '[FATAL] Leaderboard not configured. Add Redis ZSET to store player scores.',
        failNode: 'api_server',
        failTooltip:
          'Redis sorted set: each player has a score. ' +
          'ZADD, ZREVRANGE, ZREVRANK give you all the operations you need in O(log n).',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
      {
        traffic: 10000,
        targetLatency: 20,
        successMsg: 'Daily and weekly leaderboards active — score windows resetting on schedule.',
        failMsg:
          '[STALE] Leaderboard showing all-time scores only. Daily ranking reset not configured.',
        failNode: 'redis',
        failTooltip:
          'Maintain three ZSETs: leaderboard:all, leaderboard:weekly, leaderboard:daily. ' +
          'A cron job DELetes the daily ZSET at midnight and the weekly ZSET on Sunday. ' +
          'Score updates write to all three simultaneously.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'worker', target: 'redis' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 10,
        successMsg: 'SYSTEM STABLE — 100k reads/sec, rank queries < 5ms, 10M players tracked.',
        failMsg:
          '[OVERLOAD] Redis ZSET with 10M members running out of memory. ' +
          'Only cache top 100k active players in ZSET; archive inactive players to Postgres.',
        failNode: 'redis',
        failTooltip:
          'A 10M-member ZSET uses ~1 GB RAM. For inactive players (haven\'t played in 30 days), ' +
          'remove from ZSET and store in Postgres. On a rank query for an inactive player, ' +
          'compute approximate rank from Postgres (slower, but rare case).',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'What Redis data type is used for leaderboards and why is it ideal?',
      hint: 'O(log n) for all operations.',
      answer:
        'Redis Sorted Set (ZSET). Each member has a score (float64). ' +
        'ZADD: O(log n). ZREVRANGE (top k): O(log n + k). ZREVRANK (player\'s rank): O(log n). ' +
        'Internally implemented as a skip list + hash map — the skip list provides sorted access, ' +
        'the hash map provides O(1) member lookup. ' +
        'For 10M members: ZREVRANGE leaderboard 0 99 returns in ~1ms.',
    },
    {
      q: 'Two players finish a match simultaneously and both try to update their scores. How do you prevent race conditions?',
      hint: 'Redis operations are atomic.',
      answer:
        'Redis is single-threaded — all commands execute serially. ' +
        'ZADD leaderboard 1500 user123 is atomic — no race condition possible. ' +
        'For score increment (not absolute set): ZINCRBY leaderboard 50 user123 adds 50 to the current score atomically. ' +
        'If you need to read-then-write (e.g., only update if new score > current score), use a Lua script.',
    },
    {
      q: 'How would you show a player their "neighborhood" ranking — the 5 players above and below them?',
      hint: 'ZRANGE with offset.',
      answer:
        'First get the player\'s rank: rank = ZREVRANK leaderboard userId. ' +
        'Then fetch the window: ZREVRANGE leaderboard (rank - 5) (rank + 5) WITHSCORES. ' +
        'This returns the 11 players centered on the current player. ' +
        'Handle edge cases: rank 0 (can\'t go 5 above #1), and the last-place player.',
    },
    {
      q: 'How do you handle a cheater who submits a fraudulent high score?',
      hint: 'Validation and anomaly detection.',
      answer:
        'Score submissions should be signed by the game server, not the client. ' +
        'The game server validates the score (e.g., max score achievable in a session). ' +
        'Anomaly detection: flag scores that are statistically impossible ' +
        '(3 standard deviations above the player\'s historical average). ' +
        'Flagged scores go to a review queue before appearing on the public leaderboard.',
    },
  ],
};

export default challenge;
