import type { Challenge } from '../types';

// ─── ENG-PR-004 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-PR-004',
    type: 'PR Review',
    badgeClass: 'badge-pr',
    title: 'Goroutine Race Condition',
    companies: ['Uber', 'Twitch'],
    timeEst: '~20 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'This Go PR processes payments concurrently using goroutines. However, the total order value sometimes computes incorrectly under load. Spot the concurrency bug.',
    solution: 'Multiple goroutines are incrementing a shared `total_sales` integer without a Mutex lock or atomic operation. Flag the race condition and suggest `sync.Mutex` or `atomic.AddInt64`.'
  };

export default challenge;
