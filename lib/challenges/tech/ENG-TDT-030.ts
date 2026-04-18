import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-030',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'No Rate Limiting on Public API',
  companies: ['Cloudflare', 'Akamai'],
  timeEst: '~30 min',
  level: 'Senior',
  status: 'Not Started',
  desc: 'A public AI image generation API has no rate limiting. A single user sent 50,000 requests in one hour, running up $3,400 in GPU costs. Implement a sliding window rate limiter using Redis.',
  solution: 'Use Redis ZADD with current timestamp as score. On each request, count entries in the window (ZCOUNT now-windowMs now). If over limit, return 429. Use ZREMRANGEBYSCORE to clean up old entries.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The AI image API costs $0.068 per generation. Yesterday a single API key generated 50,000 images, costing $3,400 in 60 minutes. There is zero rate limiting.\n\nA sliding window rate limiter tracks request timestamps in a sorted set per user. Requests in the window are counted and old ones pruned atomically.\n\nYour mission: implement the sliding window rate limiter as Express middleware.`,
    folderPath: 'src/middleware',
    primaryFile: 'rateLimiter.ts',
    files: [
      {
        name: 'rateLimiter.ts',
        lang: 'typescript',
        code: `import { Request, Response, NextFunction } from 'express';
import { redis } from '../redis';

// TODO: Implement sliding window rate limiter using Redis sorted sets.
// Config: 100 requests per 60 seconds per API key
// Key: rate_limit:{apiKey}
// Algorithm:
//   1. ZREMRANGEBYSCORE — remove entries older than now - windowMs
//   2. ZCOUNT — count remaining entries
//   3. If count >= limit, return 429 with Retry-After header
//   4. ZADD — add current timestamp (score=timestamp, member=uuid)
//   5. EXPIRE — set TTL on the key to windowMs

export function rateLimit(limit: number, windowMs: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'] as string;
    if (!apiKey) return res.status(401).json({ error: 'Missing API key' });

    // TODO: implement sliding window check
    next();
  };
}`,
      },
      {
        name: 'server.ts',
        lang: 'typescript',
        readOnly: true,
        code: `import express from 'express';
import { rateLimit } from './middleware/rateLimiter';

const app = express();

// Apply: 100 requests per 60 seconds
app.post('/generate', rateLimit(100, 60_000), async (req, res) => {
  // ... AI generation logic
  res.json({ imageUrl: 'https://cdn.example.com/image.jpg' });
});`,
      },
    ],
    objectives: [
      {
        label: 'Remove old window entries with ZREMRANGEBYSCORE',
        check: { type: 'contains', file: 'rateLimiter.ts', pattern: 'zremrangebyscore' },
      },
      {
        label: 'Count requests in window with ZCOUNT',
        check: { type: 'contains', file: 'rateLimiter.ts', pattern: 'zcount' },
      },
      {
        label: 'Return 429 with Retry-After header when over limit',
        check: { type: 'contains', file: 'rateLimiter.ts', pattern: '429' },
      },
      {
        label: 'Add current request with ZADD',
        check: { type: 'contains', file: 'rateLimiter.ts', pattern: 'zadd' },
      },
    ],
    hints: [
      'Redis key: `rate_limit:${apiKey}`. Use `Date.now()` as the timestamp.',
      'Lua script ensures atomicity: ZREMRANGEBYSCORE + ZCOUNT + ZADD in one round-trip.',
      'Set `Retry-After: ${Math.ceil(windowMs / 1000)}` header with the 429 response.',
    ],
    totalTests: 20,
    testFramework: 'Jest + ioredis-mock',
    xp: 380,
    successMessage: `The API is protected. Individual keys are capped at 100 req/min. The $3,400 incident would now be capped at $6.80. The sliding window algorithm is more accurate than a fixed window — no burst at window boundaries.`,
  },
};

export default challenge;
