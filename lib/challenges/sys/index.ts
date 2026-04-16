// ─── SYS Challenges barrel ─────────────────────────────────────────────────
//
// HOW TO ADD A NEW CHALLENGE:
//   1. Duplicate any existing file, e.g.:  cp ENG-SYS-001.ts ENG-SYS-011.ts
//   2. Update the id + all fields — TypeScript enforces the schema.
//   3. Add one import line below.
//   4. Add it to the array below.
//   5. Run `npx next build` to verify.
// ────────────────────────────────────────────────────────────────────

import c001 from './ENG-SYS-001';
import c002 from './ENG-SYS-002';
import c003 from './ENG-SYS-003';
import c004 from './ENG-SYS-004';
import c005 from './ENG-SYS-005';
import c006 from './ENG-SYS-006';
import c007 from './ENG-SYS-007';
import c008 from './ENG-SYS-008';
import c009 from './ENG-SYS-009';
import c010 from './ENG-SYS-010';

export const sysChallenges = [
  c001,
  c002,
  c003,
  c004,
  c005,
  c006,
  c007,
  c008,
  c009,
  c010,
];
