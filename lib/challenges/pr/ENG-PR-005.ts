import type { Challenge } from '../types';

// ─── ENG-PR-005 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-PR-005',
    type: 'PR Review',
    badgeClass: 'badge-pr',
    title: 'Missing Database Transaction',
    companies: ['Square', 'Stripe'],
    timeEst: '~15 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'A money transfer feature subtracts from Account A and adds to Account B. What happens if the server crashes exactly between those two lines of code?',
    solution: 'The two SQL updates are not wrapped in a `BEGIN TRANSACTION` and `COMMIT` block. If step 2 fails, money is permanently lost. Flag for missing ACID compliance.'
  };

export default challenge;
