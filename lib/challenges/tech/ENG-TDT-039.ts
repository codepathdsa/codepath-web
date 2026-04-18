import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-039',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Chatty API — 12 Network Calls for One Page',
  companies: ['Facebook', 'Twitter'],
  timeEst: '~35 min',
  level: 'Mid',
  status: 'Not Started',
  desc: 'A profile page makes 12 sequential API calls to assemble user data: profile, posts, followers, following, badges, activity, pinned, drafts, scheduled, notifications, settings, preferences. Create a batch endpoint.',
  solution: 'Create GET /profile/:userId/summary that returns all data in one response. On the server side, run all 12 DB queries in parallel with Promise.all(). On the client, replace the 12 fetches with one.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The profile page was built incrementally — each feature team added their own API call. Today it makes 12 sequential fetch() calls. On a 100ms network (mobile), that's 1.2 seconds of pure latency before any data renders.\n\nThe fix is a BFF (Backend For Frontend) — a single endpoint that knows what the page needs, fetches everything in parallel server-side, and returns one JSON payload.\n\nYour mission: create the batch endpoint.`,
    folderPath: 'src/api',
    primaryFile: 'profileSummary.ts',
    files: [
      {
        name: 'profileSummary.ts',
        lang: 'typescript',
        code: `import { db } from '../db';

// TODO: Implement GET /profile/:userId/summary
// Fetch all 12 data points in PARALLEL using Promise.all.
// Return a single ProfileSummary object.

export interface ProfileSummary {
  profile: object;
  posts: object[];
  followers: number;
  following: number;
  badges: object[];
  recentActivity: object[];
  pinnedPost: object | null;
  drafts: number;
  notifications: object[];
  settings: object;
}

export async function getProfileSummary(userId: string): Promise<ProfileSummary> {
  // TODO: fetch all in parallel
  // Current anti-pattern (sequential):
  const profile = await db.query('SELECT * FROM users WHERE id=$1', [userId]);
  const posts = await db.query('SELECT * FROM posts WHERE user_id=$1 LIMIT 10', [userId]);
  const followers = await db.query('SELECT COUNT(*) FROM follows WHERE following_id=$1', [userId]);
  // ... etc, each sequential

  return { profile: {}, posts: [], followers: 0, following: 0, badges: [], recentActivity: [], pinnedPost: null, drafts: 0, notifications: [], settings: {} };
}`,
      },
      {
        name: 'profileRoute.ts',
        lang: 'typescript',
        readOnly: true,
        code: `import { Router } from 'express';
import { getProfileSummary } from './profileSummary';

const router = Router();

router.get('/profile/:userId/summary', async (req, res) => {
  const summary = await getProfileSummary(req.params.userId);
  res.json(summary);
});

export default router;`,
      },
    ],
    objectives: [
      {
        label: 'Use Promise.all to fetch all data in parallel',
        check: { type: 'contains', file: 'profileSummary.ts', pattern: 'Promise.all' },
      },
      {
        label: 'Remove sequential awaits (no separate await per query)',
        check: { type: 'not_contains', file: 'profileSummary.ts', pattern: 'await db.query' },
      },
      {
        label: 'Return a fully populated ProfileSummary object',
        check: { type: 'contains', file: 'profileSummary.ts', pattern: 'followers:' },
      },
    ],
    hints: [
      'Destructure from Promise.all: `const [profileRes, postsRes, followersRes, ...] = await Promise.all([db.query(...), db.query(...), ...])`',
      'All 12 queries run in parallel. Total latency = slowest single query (not sum of all).',
      'On the client side, replace 12 fetch() calls with one: `const summary = await fetch(\`/api/profile/\${id}/summary\`).then(r => r.json())`',
    ],
    totalTests: 14,
    testFramework: 'Jest + Supertest',
    xp: 280,
    successMessage: `Profile page load time: 1.2s → 80ms. 12 round-trips collapsed into 1. All 12 queries run in parallel on the server. Mobile users on poor connections now see the full profile in under 100ms.`,
  },
};

export default challenge;
