import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-013',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Magic Numbers & Dead Configuration',
  companies: ['Atlassian', 'Datadog'],
  timeEst: '~20 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'A rate limiter is hardcoded with magic numbers scattered across 3 files: 100, 60, 86400. Nobody knows what they mean. Extract them into a typed config object.',
  solution: 'Create a RateLimitConfig interface and a single RATE_LIMIT_CONFIG constant. Replace every magic number with a named field. Delete dead/commented config blocks.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The rate limiter was written fast. Limits like \`100\`, \`60\`, and \`86400\` are scattered across three files. Nobody knows if \`100\` means "requests per minute" or "requests per day."\n\nWhen the PM asks to change the burst limit, the engineer has to grep the codebase and pray they found all the copies.\n\nYour mission: centralise all magic numbers into a single typed config constant.`,
    folderPath: 'src/middleware',
    primaryFile: 'rateLimiter.ts',
    files: [
      {
        name: 'rateLimiter.ts',
        lang: 'typescript',
        code: `// TODO: Replace magic numbers with named constants from config.ts

export function isRateLimited(userId: string, requestCount: number): boolean {
  // 100 = max requests per minute
  if (requestCount > 100) return true;

  // 60 = window size in seconds
  const windowMs = 60 * 1000;

  return false;
}

export function getRetryAfter(): number {
  // 86400 = one day in seconds — why is this here?
  return 86400;
}`,
      },
      {
        name: 'config.ts',
        lang: 'typescript',
        code: `// TODO: Define a RateLimitConfig interface and export a RATE_LIMIT_CONFIG constant.
// Fields should include: maxRequestsPerWindow, windowSeconds, retryAfterSeconds

export interface RateLimitConfig {
  // TODO
}

export const RATE_LIMIT_CONFIG: RateLimitConfig = {
  // TODO
};`,
      },
      {
        name: 'headers.ts',
        lang: 'typescript',
        readOnly: true,
        code: `import { RATE_LIMIT_CONFIG } from './config';

export function getRateLimitHeaders() {
  return {
    'X-RateLimit-Limit': RATE_LIMIT_CONFIG.maxRequestsPerWindow,
    'X-RateLimit-Window': RATE_LIMIT_CONFIG.windowSeconds,
  };
}`,
      },
    ],
    objectives: [
      {
        label: 'Define RateLimitConfig interface with named fields',
        check: { type: 'contains', file: 'config.ts', pattern: 'maxRequestsPerWindow' },
      },
      {
        label: 'Export RATE_LIMIT_CONFIG with concrete values',
        check: { type: 'contains', file: 'config.ts', pattern: 'RATE_LIMIT_CONFIG' },
      },
      {
        label: 'Remove magic number 100 from rateLimiter.ts',
        check: { type: 'not_contains', file: 'rateLimiter.ts', pattern: '> 100' },
      },
    ],
    hints: [
      'Your interface needs at least: maxRequestsPerWindow, windowSeconds, retryAfterSeconds.',
      'Import RATE_LIMIT_CONFIG into rateLimiter.ts and replace each literal.',
      '`86400` is seconds in a day — name it `retryAfterSeconds` and explain why it\'s even in the rate limiter.',
    ],
    totalTests: 15,
    testFramework: 'Jest',
    xp: 180,
    successMessage: `The rate limiter is now self-documenting. Changing the burst limit is a one-line edit in config.ts — and TypeScript will catch any typos.`,
  },
};

export default challenge;
