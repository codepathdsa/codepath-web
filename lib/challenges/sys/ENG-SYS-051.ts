import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-051',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Tinder-Style Swipe Matching App',
  companies: ['Tinder', 'Bumble', 'Hinge'],
  timeEst: '~45 min',
  level: 'Mid',
  status: 'Not Started',
  desc:
    'Design a dating app\'s core matching system. Users see a deck of candidate profiles and swipe ' +
    'left (pass) or right (like). When two users both swipe right, it\'s a match and they can chat. ' +
    'Handle 75M DAU, 1.6B swipes/day, and recommendation deck generation in < 200ms.',
  solution:
    'Profile candidates are pre-generated per user (recommendation deck) stored in Redis. ' +
    'Swipe events are written to Postgres (user_a, user_b, direction, timestamp). ' +
    'Match detection: when user A swipes right on user B, check if user B already liked user A. ' +
    'If yes: create a match and notify both. ' +
    'Deck refresh: a background ML job regenerates each user\'s recommendation deck hourly ' +
    'using location, age preferences, and collaborative filtering.',

  simulation: {
    constraints: [
      { label: 'DAU', value: '75M' },
      { label: 'Swipes/day', value: '1.6B (~18k/sec)' },
      { label: 'Deck size per user', value: '100 candidates' },
      { label: 'Deck generation latency', value: '< 200ms' },
      { label: 'Match check latency', value: '< 50ms' },
    ],
    levels: [
      {
        traffic: 18000,
        targetLatency: 50,
        successMsg: 'Swipe events recording — likes and passes stored correctly.',
        failMsg: '[FATAL] Swipes not recording. Connect Swipe API → Postgres.',
        failNode: 'api_server',
        failTooltip:
          'swipes(user_a_id, user_b_id, direction: LIKE|PASS, created_at). ' +
          'Index on (user_b_id, direction) for fast mutual like lookup. ' +
          'Also cache recent likes in Redis for faster match detection.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 100,
        successMsg: 'Match detection active — mutual likes triggering instant match notifications.',
        failMsg:
          '[SLOW MATCH] Match detection query scanning entire swipes table. ' +
          'Add Redis cache for recent likes to check in O(1).',
        failNode: 'postgres',
        failTooltip:
          'Redis set: SADD likes:{userId} {swipedUserId}. ' +
          'On like: SISMEMBER likes:{swipedUserId} {myUserId}. ' +
          'If true: it\'s a match! No DB query needed for the common case. ' +
          'Write to Postgres asynchronously for durability.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
        ],
      },
      {
        traffic: 1000000,
        targetLatency: 50,
        successMsg: 'SYSTEM STABLE — 18k swipes/sec, recommendation deck served < 100ms.',
        failMsg:
          '[EMPTY DECK] User swiped through all 100 candidates — deck is empty and not refreshing.',
        failNode: 'redis',
        failTooltip:
          'Deck management: LLEN deck:{userId}. When deck length < 20, trigger async deck refresh. ' +
          'Don\'t wait for the deck to be empty — pre-generate next batch while user is still swiping. ' +
          'Background ML job adds new candidates to the deck: RPUSH deck:{userId} {candidateId}.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'worker', target: 'redis' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How does Tinder\'s recommendation algorithm decide who to show you?',
      hint: 'Multiple signals: location, preferences, desirability score.',
      answer:
        'Tinder\'s "Elo score" (they officially moved away from this, but the concept remains): ' +
        'each user has a desirability score based on who likes them. ' +
        'Being liked by highly-desirable users increases your score. ' +
        'The recommendation deck combines: ' +
        '(1) Hard filters: distance (within 50km), age range, gender preferences. ' +
        '(2) Soft ranking: Elo/desirability score, activity recency (show active users first), ' +
        '(3) Collaborative filtering: users similar to people who already liked you.',
    },
    {
      q: 'A user has already swiped on 10,000 people. How do you ensure they never see the same profile twice?',
      hint: 'Exclusion set.',
      answer:
        'Store all swiped user IDs in a Bloom filter per user: BF.ADD seen:{userId} {swipedId}. ' +
        'When generating the recommendation deck: filter out all candidates that are in the user\'s Bloom filter. ' +
        'Bloom filters have false positives (may exclude someone who wasn\'t actually seen) — ' +
        'acceptable trade-off vs the engineering cost of exact exclusion. ' +
        'After 10k swipes, the exclusion set in Postgres is also used for exact filtering.',
    },
    {
      q: 'How do you handle a "super like" feature — a user can super-like someone to get special attention?',
      hint: 'Different interaction type + quota.',
      answer:
        'Add direction: LIKE | PASS | SUPER_LIKE to the swipes table. ' +
        'Super likes have a daily quota (3/day for free users). ' +
        'Quota tracking: Redis INCR super_likes:{userId}:{date} with TTL = end of day. ' +
        'When user B sees user A\'s super like in their deck, the card is visually highlighted. ' +
        'Match priority: super likes are surfaced first in the recommendation deck of the target user.',
    },
    {
      q: 'How do you prevent a user from creating multiple fake profiles to increase their chances?',
      hint: 'Device fingerprinting and phone verification.',
      answer:
        'Phone number verification: required for signup, one account per phone number. ' +
        'Device fingerprinting: track device hardware IDs. Flag if the same device registers multiple accounts. ' +
        'Photo verification: liveness check (smile, turn head) to prevent using someone else\'s photos. ' +
        'ML behavior analysis: bots swipe right on everyone — flag accounts with > 95% like rate. ' +
        'Shadow ban: don\'t inform the user they\'re banned — they continue to use the app but are never shown to others.',
    },
  ],
};

export default challenge;
