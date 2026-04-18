import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-053',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Missing Cache Layer — Hot DB Queries',
  companies: ['Reddit', 'Stack Overflow'],
  timeEst: '~30 min',
  level: 'Mid',
  status: 'Not Started',
  desc: 'The top-10 trending posts are queried from the database on every page load — 50,000 times per minute. The result barely changes. Add a Redis cache with 5-minute TTL.',
  solution: 'Check Redis first. On cache miss, query DB, serialize result, store with EX 300. On subsequent requests, return from Redis without hitting the DB. Add cache invalidation on new post creation.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The trending posts query runs an expensive window function across 5M posts — taking 800ms per query. At 50,000 page loads/minute, the DB CPU is at 98%.\n\nThe data doesn't need to be real-time. Posts trending 5 minutes ago are good enough. A Redis cache with 5-minute TTL reduces DB queries from 50,000/min to ~1/min.\n\nYour mission: add a caching layer to the trending posts query.`,
    folderPath: 'src/posts',
    primaryFile: 'trendingPosts.ts',
    files: [
      {
        name: 'trendingPosts.ts',
        lang: 'typescript',
        code: `import { db } from '../db';
import { redis } from '../redis';

const CACHE_KEY = 'trending_posts';
const CACHE_TTL = 300; // 5 minutes

// TODO: Add Redis cache with read-through pattern.
// 1. Check Redis for cached result
// 2. On hit: parse and return
// 3. On miss: query DB, store in Redis, return
// 4. Add invalidateCache() function for when new posts are created

export async function getTrendingPosts(): Promise<Post[]> {
  // BUG: Queries DB on every call — no cache
  const result = await db.query(\`
    SELECT id, title, vote_count, comment_count,
           (vote_count * 2 + comment_count) as score
    FROM posts
    WHERE created_at > NOW() - INTERVAL '7 days'
    ORDER BY score DESC
    LIMIT 10
  \`);
  return result.rows;
}

interface Post {
  id: string;
  title: string;
  vote_count: number;
  comment_count: number;
  score: number;
}`,
      },
    ],
    objectives: [
      {
        label: 'Check Redis cache before querying DB',
        check: { type: 'contains', file: 'trendingPosts.ts', pattern: 'redis.get' },
      },
      {
        label: 'Store result in Redis with TTL on cache miss',
        check: { type: 'contains', file: 'trendingPosts.ts', pattern: 'redis.set' },
      },
      {
        label: 'Set the TTL when writing to cache',
        check: { type: 'contains', file: 'trendingPosts.ts', pattern: 'CACHE_TTL' },
      },
      {
        label: 'Export an invalidateCache function',
        check: { type: 'contains', file: 'trendingPosts.ts', pattern: 'invalidateCache' },
      },
    ],
    hints: [
      'Read-through: `const cached = await redis.get(CACHE_KEY); if (cached) return JSON.parse(cached);`',
      'Write: `await redis.set(CACHE_KEY, JSON.stringify(posts), "EX", CACHE_TTL);`',
      '`invalidateCache()`: `await redis.del(CACHE_KEY)` — call this when a new post is created or a post goes viral.',
    ],
    totalTests: 16,
    testFramework: 'Jest + ioredis-mock',
    xp: 280,
    successMessage: `DB query rate dropped from 50,000/min to ~12/min. DB CPU dropped from 98% to 4%. Cache hit rate is 99.98%. Trending posts are served from Redis in under 1ms instead of 800ms from DB.`,
  },
};

export default challenge;
