import type { Challenge } from '../types';

// ─── ENG-PR-003 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-PR-003',
    type: 'PR Review',
    badgeClass: 'badge-pr',
    title: 'The ORM N+1 Query Problem',
    companies: ['Instagram', 'Gusto'],
    timeEst: '~15 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'A PR added authors to the Blog Feed endpoint. It passed unit tests. But in production with 1,000 posts, it will make 1,001 database calls. Find the N+1 bug.',
    solution: 'The code iterates over `posts` and calls `post.getAuthor()` inside the loop. Flag it and suggest using `.select_related()` (Django) or `.includes()` (Rails/Prisma) to perform a SQL JOIN instead.'
  };

export default challenge;
