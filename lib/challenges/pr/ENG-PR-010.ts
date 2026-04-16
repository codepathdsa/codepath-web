import type { Challenge } from '../types';

// ─── ENG-PR-010 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-PR-010',
    type: 'PR Review',
    badgeClass: 'badge-pr',
    title: 'Unpaginated API Response',
    companies: ['GitHub', 'Atlassian'],
    timeEst: '~10 min',
    level: 'Junior',
    status: 'Not Started',
    desc: 'A new internal API returns `User.objects.all()`. It works perfectly in staging with 50 test users. Why will this take down production?',
    solution: 'Fetching millions of rows into memory will immediately crash the server. Require pagination (Limit/Offset or Cursor-based) before merging.'
  };

export default challenge;
