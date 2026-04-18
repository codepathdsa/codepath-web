import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-054',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Multiplayer Game Matchmaking System',
  companies: ['Riot Games', 'Activision', 'Epic Games'],
  timeEst: '~50 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design a matchmaking system for an online multiplayer game (like League of Legends). ' +
    'Group 10 players into a balanced match based on their skill rating (MMR). ' +
    'Handle 5M concurrent players searching for a match, ' +
    'ensure matches are created within 60 seconds, and all 10 players have similar skill levels.',
  solution:
    'Each player in the queue has an MMR (matchmaking rating, 0-3000). ' +
    'A matchmaking service groups players into "lobbies" within an MMR range. ' +
    'The acceptable MMR spread expands over time (after 30 seconds, accept wider spread). ' +
    'Use Redis sorted sets to store the queue (score = MMR). ' +
    'A matching worker scans the sorted set for groups of 10 within a sliding MMR window.',

  simulation: {
    constraints: [
      { label: 'Concurrent players searching', value: '5M' },
      { label: 'Players per match', value: '10' },
      { label: 'Match creation time target', value: '< 60 sec' },
      { label: 'MMR window (initial)', value: '+/- 50 MMR' },
      { label: 'MMR window (after 60 sec)', value: '+/- 200 MMR' },
    ],
    levels: [
      {
        traffic: 50000,
        targetLatency: 60000,
        successMsg: 'Matchmaking queue running — players being grouped into balanced matches.',
        failMsg: '[FATAL] Matchmaking queue not working. Add players to Redis sorted set.',
        failNode: 'api_server',
        failTooltip:
          'Queue: ZADD matchmaking_queue {mmr} {playerId}. ' +
          'Find a match: ZRANGEBYSCORE matchmaking_queue {mmr-50} {mmr+50} LIMIT 0 10. ' +
          'If 10 players found: create a match, remove from queue.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
      {
        traffic: 500000,
        targetLatency: 30000,
        successMsg: 'Expanding MMR window active — longer-waiting players getting broader matches.',
        failMsg:
          '[HIGH MMR STUCK] Diamond players (top 1%) waiting 5 minutes — not enough high-MMR players.',
        failNode: 'redis',
        failTooltip:
          'Queue entry: {playerId, mmr, wait_time_sec}. ' +
          'For each player, effective window = base_window + (wait_time_sec / 30) * expansion_rate. ' +
          'After 30 sec: +50 MMR. After 60 sec: +100 MMR. After 120 sec: +200 MMR. ' +
          'High-MMR players have fewer peers — their window must expand more aggressively.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'worker', target: 'redis' },
        ],
      },
      {
        traffic: 5000000,
        targetLatency: 15000,
        successMsg: 'SYSTEM STABLE — 5M concurrent searchers, < 30 sec avg wait, 10-player matches.',
        failMsg:
          '[SCALE] 5M players in queue overwhelming a single matchmaking worker. ' +
          'Partition the queue by MMR range across multiple workers.',
        failNode: 'worker',
        failTooltip:
          'Shard the matchmaking queue by MMR range: ' +
          'Worker 1: MMR 0-999 (Bronze/Silver). ' +
          'Worker 2: MMR 1000-1999 (Gold/Platinum). ' +
          'Worker 3: MMR 2000-3000 (Diamond/Challenger). ' +
          'Each worker handles its shard independently.',
        checks: [
          { type: 'hasEdge', source: 'worker', target: 'redis' },
          { type: 'hasEdge', source: 'worker', target: 'postgres' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How does Elo/MMR work? How is a player\'s skill rating calculated after each match?',
      hint: 'Expected win probability and actual outcome.',
      answer:
        'Elo system: each player has a rating R. ' +
        'Expected score E_A = 1 / (1 + 10^((R_B - R_A) / 400)). ' +
        'After a match, actual score S_A = 1 (win) or 0 (loss). ' +
        'Rating change: new_R_A = R_A + K * (S_A - E_A). K = 32 (sensitivity factor). ' +
        'If you beat a much stronger player, you gain a lot. ' +
        'If you lose to a much weaker player, you lose a lot. ' +
        'League of Legends uses a variant with "performance score" adjustments per match.',
    },
    {
      q: 'How do you handle premade groups (5 friends queuing together in a 5v5 game)?',
      hint: 'Average MMR with a penalty for coordination advantage.',
      answer:
        'A group of 5 premades has a coordination advantage over a team of solos. ' +
        'Apply a "group MMR penalty": effective_MMR = avg_MMR + coordination_penalty(group_size). ' +
        'A 5-person premade might add +100 to their effective MMR for matchmaking. ' +
        'They match against similarly-skilled premade groups when possible. ' +
        'If wait time exceeds 3 minutes, match them against solo players of lower MMR ' +
        '(compensated by their coordination disadvantage).',
    },
    {
      q: 'How do you handle a player who dodges the champion select (refuses to start the match after being matched)?',
      hint: 'Penalties and queue management.',
      answer:
        'On dodge: the dodger receives a time penalty (e.g., 5 minutes → 15 minutes for repeated dodges). ' +
        'MMR penalty: -3 points per dodge to discourage abuse. ' +
        'The other 9 players are returned to the front of the queue (priority re-queue). ' +
        'The 9 non-dodgers get a small MMR bonus as compensation. ' +
        'Tracking: ZADD dodge_penalties {timestamp + penalty_duration} {playerId} in Redis.',
    },
    {
      q: 'How would you implement role/position-based matchmaking (each team needs 1 tank, 1 healer, 3 DPS)?',
      hint: 'Multi-dimensional matching.',
      answer:
        'Players declare their preferred roles before queuing: primary role + secondary role. ' +
        'The matchmaking queue becomes multi-dimensional: find 10 players where the resulting team has the right role distribution. ' +
        'For each candidate group of 10: check if valid role assignments exist (bipartite matching algorithm). ' +
        'If valid: create the match. ' +
        'Players who fill their secondary role get a small bonus reward (autofill penalty compensation). ' +
        'LoL\'s "Role Selection" system works exactly this way.',
    },
  ],
};

export default challenge;
