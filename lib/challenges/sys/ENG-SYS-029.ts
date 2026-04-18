import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-029',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Feature Flag Service',
  companies: ['LaunchDarkly', 'Optimizely', 'Unleash'],
  timeEst: '~40 min',
  level: 'Mid',
  status: 'Not Started',
  desc:
    'Design a feature flag service used by 100 microservices. Flags can be toggled ' +
    'on/off instantly with no redeployment. Support percentage rollouts (enable for 10% of users), ' +
    'user targeting (enable for specific user IDs), and A/B testing. ' +
    'Flag evaluation must add < 1ms overhead per request.',
  solution:
    'Flags are stored in a central DB (Postgres). Each service loads all flags into local memory ' +
    'via a streaming connection (SSE or WebSocket). Flag evaluation happens in-process with ' +
    'zero network calls. When a flag changes, the central service pushes the update to all connected clients ' +
    'within 5 seconds. Consistent hashing maps user IDs to buckets for percentage rollouts.',

  simulation: {
    constraints: [
      { label: 'Microservices', value: '100' },
      { label: 'Flags', value: '1,000' },
      { label: 'Flag evaluations/sec', value: '10M (distributed)' },
      { label: 'Evaluation latency', value: '< 1ms (in-process)' },
      { label: 'Flag update propagation', value: '< 5 sec' },
    ],
    levels: [
      {
        traffic: 1000,
        targetLatency: 5,
        successMsg: 'Feature flag service live — flags loading and evaluating correctly.',
        failMsg: '[FATAL] Service calling flag API on every request (10M calls/sec to 1 server).',
        failNode: 'api_server',
        failTooltip:
          'Evaluate flags locally, not via remote API call. ' +
          'SDK loads flags into local memory at startup. Zero network overhead per evaluation.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
        ],
      },
      {
        traffic: 10000,
        targetLatency: 1,
        successMsg: 'In-process evaluation working — flag checks taking < 0.1ms per call.',
        failMsg:
          '[STALE FLAGS] Flag updated in dashboard but services see old value for 5 minutes.',
        failNode: 'api_server',
        failTooltip:
          'Use SSE (Server-Sent Events) to push flag updates to all SDK instances instantly. ' +
          'Service → Flag Service: GET /flags/stream. ' +
          'On flag change: push new flag definition to all connected clients.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'redis', target: 'worker' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 1,
        successMsg: 'SYSTEM STABLE — instant flag propagation, consistent percentage rollouts.',
        failMsg:
          '[INCONSISTENT ROLLOUT] Same user seeing a flag enabled on one server but disabled on another.',
        failNode: 'api_server',
        failTooltip:
          'For a 10% rollout: hash(userId + flagKey) % 100 < 10 → enabled. ' +
          'The hash is deterministic — same user always gets the same result. ' +
          'No shared state needed. All SDK instances compute the same result independently.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How do you implement a percentage rollout that\'s consistent for the same user across requests?',
      hint: 'Deterministic hash.',
      answer:
        'Consistent bucket assignment: bucket = murmurhash(userId + flagKey) % 100. ' +
        'If bucket < rolloutPercentage, flag is enabled. ' +
        'Same userId + flagKey always produces the same bucket. ' +
        'The rolloutPercentage is stored in the flag definition and loaded locally. ' +
        'Changing the rolloutPercentage from 10% to 20% adds users in buckets 10-19 to the enabled set.',
    },
    {
      q: 'How do you implement A/B testing with feature flags?',
      hint: 'You need to track which variant each user saw.',
      answer:
        'A/B testing = feature flag + analytics. ' +
        'Flag has two variants: "control" (0) and "treatment" (1). ' +
        'User assignment: bucket < 50% → control, otherwise → treatment. ' +
        'Log each flag evaluation: {userId, flagKey, variant, timestamp}. ' +
        'After N days, analyze: did treatment users convert at a higher rate? ' +
        'LaunchDarkly integrates with analytics tools (Segment, Amplitude) for this.',
    },
    {
      q: 'What happens if the Flag Service is down? Can services still evaluate flags?',
      hint: 'Bootstrap cache and default values.',
      answer:
        'SDK behavior on Flag Service outage: ' +
        '(1) Serve from local in-memory cache (loaded at startup, updated via SSE). ' +
        '(2) If the SDK just started and can\'t reach the Flag Service, use default values ' +
        '(defined in code: isEnabled("new-feature", defaultValue: false)). ' +
        '(3) Flag values are also persisted to a local file (bootstrap file) — if the SDK restarts ' +
        'and the Flag Service is unreachable, load from the file. ' +
        'Goal: no single point of failure. Flag Service outage should not affect production traffic.',
    },
    {
      q: 'How do you handle flag dependencies? Flag B should only be enabled if Flag A is enabled.',
      hint: 'Prerequisite flags.',
      answer:
        'Support prerequisite flags in the flag definition: ' +
        '{ flagKey: "flag-b", prerequisites: [{ flagKey: "flag-a", variation: "on" }] }. ' +
        'During evaluation, check all prerequisites first. If any prerequisite fails, ' +
        'return the off variation regardless of the primary flag\'s target rules. ' +
        'Be careful about circular dependencies (A depends on B, B depends on A) — ' +
        'validate for cycles when saving flag definitions.',
    },
  ],
};

export default challenge;
