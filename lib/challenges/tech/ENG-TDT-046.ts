import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-046',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Overfetching GraphQL → DataLoader',
  companies: ['Shopify', 'GitHub'],
  timeEst: '~40 min',
  level: 'Senior',
  status: 'Not Started',
  desc: 'A GraphQL resolver for user posts triggers N database queries for N users — the classic N+1 in GraphQL. Each user.posts resolver fires independently. Implement DataLoader to batch and cache.',
  solution: 'Create a PostsByUserLoader using the DataLoader library. Load all posts for a batch of userIds in one SQL query (WHERE user_id = ANY($1)). Return posts grouped by userId.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The GraphQL query \`{ users { name posts { title } } }\` looks innocent. But when there are 50 users, the posts resolver fires 50 times — one query per user.\n\nDataLoader is Facebook's solution: it batches all calls made in the same tick into one, then distributes results back to each individual resolver.\n\nYour mission: implement a DataLoader for post fetching.`,
    folderPath: 'src/graphql',
    primaryFile: 'loaders.ts',
    files: [
      {
        name: 'loaders.ts',
        lang: 'typescript',
        code: `import DataLoader from 'dataloader';
import { db } from '../db';

interface Post {
  id: string;
  userId: string;
  title: string;
  body: string;
}

// TODO: Implement a DataLoader that batches post fetches by userId.
// The batch function receives an array of userIds.
// It must return an array of Post[] in the SAME ORDER as the input userIds.
// (DataLoader requires result[i] corresponds to keys[i])

export function createPostsLoader() {
  return new DataLoader<string, Post[]>(async (userIds) => {
    // TODO: fetch all posts for the given userIds in one query
    // SQL: SELECT * FROM posts WHERE user_id = ANY($1)
    // Then group by userId and return in the correct order
    throw new Error('Not implemented');
  });
}`,
      },
      {
        name: 'resolvers.ts',
        lang: 'typescript',
        code: `import { createPostsLoader } from './loaders';

// The loader is created per-request to avoid sharing cache between users
const postsLoader = createPostsLoader();

// TODO: Replace the N+1 pattern with the DataLoader.
export const resolvers = {
  User: {
    // N+1 BUG: each user fires a separate DB query
    posts: async (user: { id: string }) => {
      // ANTI-PATTERN: direct DB query per user
      // return await db.query('SELECT * FROM posts WHERE user_id=$1', [user.id]);
      
      // TODO: Replace with postsLoader.load(user.id)
      throw new Error('Not implemented');
    },
  },
};`,
      },
    ],
    objectives: [
      {
        label: 'Implement DataLoader batch function using WHERE user_id = ANY($1)',
        check: { type: 'contains', file: 'loaders.ts', pattern: 'ANY' },
      },
      {
        label: 'Group results by userId and return in input order',
        check: { type: 'contains', file: 'loaders.ts', pattern: 'map(' },
      },
      {
        label: 'Use postsLoader.load() in the User.posts resolver',
        check: { type: 'contains', file: 'resolvers.ts', pattern: 'postsLoader.load' },
      },
    ],
    hints: [
      'Batch function: `const result = await db.query("SELECT * FROM posts WHERE user_id = ANY($1)", [userIds])`',
      'Group: `const byUser = new Map(); result.rows.forEach(p => { byUser.set(p.userId, [...(byUser.get(p.userId) || []), p]) })`',
      'Return in order: `return userIds.map(id => byUser.get(id) || [])` — DataLoader requires this exact mapping.',
    ],
    totalTests: 18,
    testFramework: 'Jest',
    xp: 420,
    successMessage: `N+1 queries collapsed into 1. Fetching 50 users with their posts now uses 2 queries total: one for users, one batched for all posts. DataLoader also caches within the request — duplicate user lookups are free.`,
  },
};

export default challenge;
