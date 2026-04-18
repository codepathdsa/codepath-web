import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-018',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Rate Limiter',
  companies: ['AWS', 'Cloudflare', 'Stripe'],
  timeEst: '~40 min',
  level: 'Mid',
  status: 'Not Started',
  desc:
    'Design a rate limiter that enforces API quotas: 100 requests/minute per user, ' +
    '1000 requests/minute per API key, and global 10M requests/minute. ' +
    'The limiter must add < 5ms latency and work across a distributed fleet of 100 API servers.',
  solution:
    'Use the token bucket algorithm with Redis as the shared counter store. ' +
    'Each user has a bucket: capacity 100 tokens, refill rate 100/minute. ' +
    'Each request attempts to consume 1 token (Lua script for atomicity). ' +
    'A distributed rate limiter needs a shared state — Redis with a cluster for availability. ' +
    'For the global limit, use a sliding window counter in Redis.',

  simulation: {
    constraints: [
      { label: 'Per-user limit', value: '100 req/min' },
      { label: 'Per-API-key limit', value: '1,000 req/min' },
      { label: 'Global limit', value: '10M req/min' },
      { label: 'API servers', value: '100 nodes' },
      { label: 'Latency budget', value: '< 5ms overhead' },
    ],
    levels: [
      {
        traffic: 100,
        targetLatency: 5,
        successMsg: 'Per-user rate limiting active — 429 responses on exceeded limits.',
        failMsg: '[FATAL] Rate limiting not enforced. A single user is sending 10,000 req/sec.',
        failNode: 'api_server',
        failTooltip:
          'In-memory rate limiting (per server) doesn\'t work if the user has 100 servers to hit. ' +
          'A centralized Redis-based limiter is needed for distributed enforcement.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
      {
        traffic: 10000,
        targetLatency: 10,
        successMsg: 'Distributed rate limiter running — all 100 servers sharing Redis state.',
        failMsg:
          '[BUG] Race condition: two servers simultaneously read the counter as 99 and both allow ' +
          'request 100. Use an atomic Lua script to check-and-increment.',
        failNode: 'redis',
        failTooltip:
          'A Lua script in Redis executes atomically (single-threaded): ' +
          'INCR counter; if counter > limit, DECR and reject. ' +
          'Or use SETNX + EXPIRE for exact atomic token consumption.',
        checks: [
          { type: 'hasEdge', source: 'api_gateway', target: 'redis' },
          { type: 'hasEdge', source: 'api_gateway', target: 'api_server' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 3,
        successMsg: 'SYSTEM STABLE — < 2ms overhead, graceful degradation with local fallback.',
        failMsg:
          '[LATENCY] Redis is adding 8ms per request. Move rate limiting to the API gateway ' +
          'and use a local token bucket as a fast-path.',
        failNode: 'redis',
        failTooltip:
          'A local (in-process) token bucket handles 99% of cases (normal traffic). ' +
          'Only synchronize with Redis when a user is near their limit. ' +
          'This "local + remote sync" pattern cuts Redis calls by 99%.',
        checks: [
          { type: 'hasEdge', source: 'client', target: 'api_gateway' },
          { type: 'hasEdge', source: 'api_gateway', target: 'api_server' },
          { type: 'hasEdge', source: 'api_gateway', target: 'redis' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'Compare token bucket vs sliding window vs fixed window rate limiting algorithms.',
      hint: 'Think about burst allowance and boundary conditions.',
      answer:
        'Fixed window: count requests in 1-minute buckets. Problem: a burst at 00:59 and 01:00 allows 200 requests in 2 seconds. ' +
        'Sliding window log: store each request timestamp. Check if count in last 60 seconds > limit. Accurate but memory-heavy. ' +
        'Sliding window counter: hybrid — use the current window count + a fraction of the previous window count. ~0.003% error rate. ' +
        'Token bucket: allows burst up to capacity, then enforces a steady rate. Most flexible — Stripe uses this.',
    },
    {
      q: 'How do you handle rate limiting for shared API keys (e.g., 5 developers sharing one key)?',
      hint: 'Multiple users, one quota.',
      answer:
        'Rate limit at the API key level, not the user level. ' +
        'All requests using that key share the same token bucket. ' +
        'If the team exceeds 1000 req/min, every user gets 429s. ' +
        'To be fair: track per-user consumption within the key\'s quota. ' +
        'Alert the key owner when usage exceeds 80% of quota.',
    },
    {
      q: 'Your Redis rate limiter fails open (if Redis is down, all requests pass). Should it fail open or closed?',
      hint: 'Consider the user experience and business impact of each choice.',
      answer:
        'Fail open (allow all requests when Redis is down): better user experience, ' +
        'but an attacker can knock out Redis to bypass rate limiting. ' +
        'Fail closed (deny all requests when Redis is down): prevents abuse, ' +
        'but a Redis outage becomes a full API outage. ' +
        'Recommended middle ground: use local in-memory fallback rate limiting ' +
        '(less accurate, per-server) when Redis is unavailable. Log the degraded state.',
    },
    {
      q: 'How would you rate-limit at the IP level to prevent DDoS, given users are behind NATs (many users share one IP)?',
      hint: 'A single IP might represent 1000 users in a corporate network.',
      answer:
        'IP-based rate limiting should have higher thresholds (e.g., 10,000 req/min per IP). ' +
        'Combine with authenticated rate limits: authenticated users get higher limits. ' +
        'For DDoS specifically, IP-level blocking should happen at the network layer (CDN/WAF) ' +
        'before traffic reaches the application. ' +
        'Cloudflare and AWS Shield absorb volumetric attacks at the edge — ' +
        'application-level rate limiting handles application-layer abuse.',
    },
  ],
};

export default challenge;
