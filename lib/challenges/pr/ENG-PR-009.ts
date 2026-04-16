import type { Challenge } from '../types';

// ─── ENG-PR-009 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-PR-009',
    type: 'PR Review',
    badgeClass: 'badge-pr',
    title: 'Floating Point Math for Currency',
    companies: ['Robinhood', 'Adyen'],
    timeEst: '~10 min',
    level: 'Junior',
    status: 'Not Started',
    desc: 'A frontend PR calculates a 15% discount on a shopping cart using standard Javascript numbers (`price * 0.85`). Why will this upset accounting?',
    solution: 'Floating point arithmetic is imprecise (e.g., 0.1 + 0.2 = 0.30000000000000004). Flag it and require using integers (cents) or a specialized Decimal library for financial math.'
  };

export default challenge;
