import type { Challenge } from '../types';

// ─── ENG-PR-008 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-PR-008',
    type: 'PR Review',
    badgeClass: 'badge-pr',
    title: 'Cache Stampede (Thundering Herd)',
    companies: ['Twitter', 'Reddit'],
    timeEst: '~20 min',
    level: 'Senior',
    status: 'Not Started',
    desc: 'This PR caches the "Viral Tweets Feed" for 60 seconds. What happens at second 61 when the cache expires and 50,000 requests hit the server simultaneously?',
    solution: 'When the key expires, all 50k requests bypass the cache and hit the database at once, causing a crash. Suggest implementing a lock/mutex so only one thread recomputes the cache while others wait.'
  };

export default challenge;
