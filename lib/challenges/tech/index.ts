// ─── TECH Challenges barrel ────────────────────────────────────────────────
//
// HOW TO ADD A NEW CHALLENGE:
//   1. Duplicate any existing file, e.g.:  cp ENG-TDT-001.ts ENG-TDT-011.ts
//   2. Update the id + all fields — TypeScript enforces the schema.
//   3. Add one import line below.
//   4. Add it to the array below.
//   5. Run `npx next build` to verify.
// ────────────────────────────────────────────────────────────────────

import c001 from './ENG-TDT-001';
import c002 from './ENG-TDT-002';
import c003 from './ENG-TDT-003';
import c004 from './ENG-TDT-004';
import c005 from './ENG-TDT-005';
import c006 from './ENG-TDT-006';
import c007 from './ENG-TDT-007';
import c008 from './ENG-TDT-008';
import c009 from './ENG-TDT-009';
import c010 from './ENG-TDT-010';

export const techChallenges = [
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
