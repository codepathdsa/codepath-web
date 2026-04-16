import type { Challenge } from '../types';

// ─── ENG-PR-006 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-PR-006',
    type: 'PR Review',
    badgeClass: 'badge-pr',
    title: 'Memory Leak in Node.js Event Listeners',
    companies: ['Discord', 'Netflix'],
    timeEst: '~25 min',
    level: 'Senior',
    status: 'Not Started',
    desc: 'A Senior Engineer optimized WebSocket connections. But load testing shows RAM usage climbing steadily until the container OOM crashes. Find the leak.',
    solution: 'Inside the connection handler, `emitter.on("data", callback)` is called, but `emitter.off()` is never called when the socket closes. The listeners accumulate infinitely in memory.'
  };

export default challenge;
