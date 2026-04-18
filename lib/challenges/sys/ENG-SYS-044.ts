import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-044',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Twitter Trending Topics',
  companies: ['Twitter/X', 'TikTok', 'Reddit'],
  timeEst: '~40 min',
  level: 'Mid',
  status: 'Not Started',
  desc:
    'Design the trending topics feature for a social media platform. ' +
    'Identify the top-10 trending hashtags globally and by region in real-time. ' +
    'Trending is determined by velocity — how fast a hashtag\'s usage is accelerating, ' +
    'not absolute count. Update the trending list every 60 seconds.',
  solution:
    'A sliding window stream processor counts hashtag mentions and computes velocity. ' +
    'Velocity = (count in last 5 min) / (count in prior 5 min). ' +
    'A ratio > 2.0 indicates trending. ' +
    'Kafka carries the tweet stream. Flink computes windowed counts per hashtag per region. ' +
    'Top-10 per region written to Redis sorted sets. The UI polls every 60 seconds.',

  simulation: {
    constraints: [
      { label: 'Tweets/sec', value: '6,000' },
      { label: 'Hashtags/tweet', value: '1.5 avg' },
      { label: 'Hashtag events/sec', value: '~9,000' },
      { label: 'Update frequency', value: 'Every 60 sec' },
      { label: 'Regions', value: '20 (US, UK, IN, etc.)' },
    ],
    levels: [
      {
        traffic: 9000,
        targetLatency: 1000,
        successMsg: 'Hashtag extraction running — trending counts updating every minute.',
        failMsg: '[FATAL] No trending service configured. Connect tweet stream → aggregator.',
        failNode: 'api_server',
        failTooltip:
          'Extract hashtags from every tweet. Publish to Kafka. ' +
          'A streaming job counts mentions in sliding 5-minute windows. ' +
          'Output: {hashtag, region, count, window_start}.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
        ],
      },
      {
        traffic: 50000,
        targetLatency: 500,
        successMsg: 'Velocity-based trending active — slow-growing hashtags filtered out.',
        failMsg:
          '[WRONG RESULTS] "#superbowl" trending because it always has high count, not because it\'s accelerating.',
        failNode: 'kafka',
        failTooltip:
          'Velocity metric: count[t-5min to t] / count[t-10min to t-5min]. ' +
          'A hashtag always used 1000 times/min has velocity = 1.0 (not trending). ' +
          'A hashtag that went from 100 to 5000 times/min has velocity = 50.0 (trending).',
        checks: [
          { type: 'hasEdge', source: 'kafka', target: 'worker' },
          { type: 'hasEdge', source: 'worker', target: 'redis' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 200,
        successMsg: 'SYSTEM STABLE — 20 regional trending lists updated every 60 sec, < 200ms read.',
        failMsg:
          '[SPAM] "#BuyFollowers" trending because a botnet is spamming the hashtag.',
        failNode: 'redis',
        failTooltip:
          'Spam filtering: weight hashtag mentions by account quality score. ' +
          'New accounts (< 30 days old) and accounts with low follower counts contribute 0.1x weight. ' +
          'A botnet of 10k new accounts generates 1000x normal count but only 100x weighted count.',
        checks: [
          { type: 'hasEdge', source: 'worker', target: 'redis' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How do you compute trending per region if users don\'t always include their location?',
      hint: 'IP geolocation, profile location, content language.',
      answer:
        'Location signals in priority order: ' +
        '(1) User\'s profile location (set voluntarily). ' +
        '(2) Geo-tagged tweets (location shared in tweet). ' +
        '(3) IP geolocation (IP → country, fallback). ' +
        '(4) Language detection (Hindi text → likely India). ' +
        'A tweet without location data contributes to the global trending list only. ' +
        'If location is available, it contributes to both global and the regional list.',
    },
    {
      q: 'How do you prevent a single celebrity\'s mention of a hashtag from making it "trend"?',
      hint: 'Account weight and uniqueness.',
      answer:
        'Count unique users, not total mentions. ' +
        'A hashtag used by 1 person 10,000 times has unique_users=1. ' +
        'A hashtag used by 10,000 different people once has unique_users=10,000. ' +
        'The second is organic trending; the first is spam. ' +
        'Also apply a diminishing return: user\'s nth use of the same hashtag counts less. ' +
        'Track unique users per hashtag per window using HyperLogLog in Redis.',
    },
    {
      q: 'How would you filter out "evergreen" topics like "#MondayMotivation" that always trend on Mondays?',
      hint: 'Seasonal normalization.',
      answer:
        'Maintain a historical baseline for each hashtag by day-of-week and time-of-day. ' +
        '#MondayMotivation has a historical average of 5000 mentions every Monday at 9am. ' +
        'Trending score = (current count - historical baseline) / historical std deviation. ' +
        'This is the same "anomaly detection" approach used in time-series alerting. ' +
        'Twitter calls this approach "normalized trending" — it promotes truly unexpected spikes.',
    },
    {
      q: 'The trending API is called 600M times/day (every user refreshes every 60 sec). How do you serve it efficiently?',
      hint: 'Result caching.',
      answer:
        'The trending list only updates every 60 seconds — the same list serves all requests within that minute. ' +
        'Cache the top-10 list per region in Redis: GET trending:US → JSON string. ' +
        'TTL: 60 seconds. 20 regions × 1 cache entry each = trivial storage. ' +
        'The aggregation job writes the new list to Redis. All API servers read from the same cache. ' +
        '600M reads → 600M Redis GET calls at < 1ms each = manageable.',
    },
  ],
};

export default challenge;
