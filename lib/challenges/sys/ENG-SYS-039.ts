import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-039',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Recommendation Engine',
  companies: ['Netflix', 'Spotify', 'Amazon'],
  timeEst: '~55 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design a recommendation engine for a streaming platform. ' +
    'Recommend the top-10 most relevant items (movies, songs, products) for each user. ' +
    'Recommendations must update within 24 hours of new user activity. ' +
    'Handle 100M users, 10M items, real-time event tracking, and a/b testing of recommendation algorithms.',
  solution:
    'Collaborative filtering: users who liked the same items as you → recommend what they liked next. ' +
    'Matrix factorization (ALS): decompose user × item matrix into latent factors. ' +
    'Offline training pipeline (Spark) runs nightly on user interaction logs. ' +
    'Pre-computed recommendations stored in Redis per user (top-100 candidates). ' +
    'A reranking service applies real-time signals (trending, fresh content, diversity) before serving.',

  simulation: {
    constraints: [
      { label: 'Users', value: '100M' },
      { label: 'Items', value: '10M' },
      { label: 'User interaction events/day', value: '5B' },
      { label: 'Recommendation latency', value: '< 50ms' },
      { label: 'Update cadence', value: 'Within 24 hours of activity' },
    ],
    levels: [
      {
        traffic: 100000,
        targetLatency: 50,
        successMsg: 'Recommendation serving working — pre-computed candidates served from Redis.',
        failMsg: '[FATAL] Recommendations not loading. Connect API → Redis → Pre-computed results.',
        failNode: 'api_server',
        failTooltip:
          'At 100M users, you cannot compute recommendations at request time. ' +
          'Pre-compute top-100 candidates per user daily. ' +
          'Serve: GET /recommendations/{userId} → Redis lookup → return top-10 after reranking.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
      {
        traffic: 1000000,
        targetLatency: 30,
        successMsg: 'Offline training pipeline active — recommendations updated nightly from interaction logs.',
        failMsg:
          '[STALE] New user with 50 interactions seeing generic "Popular" recommendations. ' +
          'Add a real-time user event pipeline to update candidates faster for active users.',
        failNode: 'redis',
        failTooltip:
          'For new users (cold start), fall back to popularity-based recommendations. ' +
          'A near-real-time pipeline (Kafka → Spark Streaming) updates candidates for users ' +
          'who interacted in the last hour. Nightly batch covers the rest.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
          { type: 'hasEdge', source: 'kafka', target: 'worker' },
        ],
      },
      {
        traffic: 10000000,
        targetLatency: 20,
        successMsg: 'SYSTEM STABLE — 10M recommendation requests/sec, A/B testing active.',
        failMsg:
          '[NO AB TEST] Unable to compare recommendation algorithms. ' +
          'Add A/B testing layer to split traffic between algorithm variants.',
        failNode: 'api_server',
        failTooltip:
          'A/B test: bucket users into groups (hash(userId) % 100 < 20 → experiment group). ' +
          'Serve different recommendation models per bucket. ' +
          'Log which model served each recommendation. ' +
          'After 7 days: compare CTR, watch time per bucket. Ship the winning model.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'api_server', target: 'cassandra' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'What is collaborative filtering and what are its limitations?',
      hint: 'Cold start and scalability.',
      answer:
        'User-based CF: find users similar to you (same rating patterns), recommend what they liked. ' +
        'Item-based CF: find items similar to what you liked, recommend similar items. ' +
        'Limitations: ' +
        '(1) Cold start: new users (no history) or new items (no ratings) cannot be recommended effectively. ' +
        '(2) Scalability: computing user-user similarity for 100M users is O(n²). ' +
        '(3) Long tail: unpopular items rarely get recommended even if they\'re a great fit. ' +
        'Modern systems combine CF + content-based + contextual signals.',
    },
    {
      q: 'How does Netflix decide whether to recommend a movie you already watched?',
      hint: 'Re-watch rate and content type.',
      answer:
        'For some content (documentaries, kids movies), re-watches are common. ' +
        'Track re-watch rate per content type. ' +
        'If a movie has a 30% re-watch rate and the user\'s last watch was > 6 months ago, ' +
        'include it in candidates. ' +
        'Otherwise, explicitly filter out already-watched items from the recommendation list. ' +
        'User preference can be learned: some users re-watch favorite movies, others never do.',
    },
    {
      q: 'How would you handle the cold start problem for a completely new user with zero history?',
      hint: 'Onboarding, popularity, and context signals.',
      answer:
        'Cold start strategies: ' +
        '(1) Onboarding: ask the user to rate 5 items or select genres they like. ' +
        '(2) Context: new user from India watching at 9pm on mobile? Recommend Bollywood films. ' +
        '(3) Popularity fallback: recommend globally trending content. ' +
        '(4) Demographic signals: similar to other new users in same region/age group. ' +
        'After 10-20 interactions, collaborative filtering kicks in. ' +
        'Netflix estimates that 80% of watched content comes from recommendations.',
    },
    {
      q: 'How do you ensure recommendation diversity? A user who likes action movies shouldn\'t see only action movies.',
      hint: 'Post-processing the candidate list.',
      answer:
        'The candidate list may have 100 action movies ranked 1-100. ' +
        'A diversity post-processor applies Maximum Marginal Relevance (MMR): ' +
        'select the highest-scoring item that is "different enough" from already-selected items. ' +
        'Genre diversity: max 3 items per genre in top-10. ' +
        'Serendipity: occasionally insert a high-quality out-of-profile item ' +
        '(something the user would never search for but might love). ' +
        'Spotify\'s Discover Weekly is a masterclass in serendipitous recommendations.',
    },
  ],
};

export default challenge;
