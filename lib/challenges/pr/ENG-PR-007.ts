import type { Challenge } from '../types';

// ─── ENG-PR-007 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-PR-007',
    type: 'PR Review',
    badgeClass: 'badge-pr',
    title: 'Phantom Reads (Isolation Levels)',
    companies: ['Plaid', 'Coinbase'],
    timeEst: '~30 min',
    level: 'Senior',
    status: 'Not Started',
    desc: 'A monthly audit script calculates user balances. Despite using DB transactions, the math sometimes includes transactions that were rolled back by other concurrent processes.',
    solution: 'The database transaction isolation level is left at default (Read Committed). For financial audits requiring range locks, it must be elevated to `REPEATABLE READ` or `SERIALIZABLE`.'
  };

export default challenge;
