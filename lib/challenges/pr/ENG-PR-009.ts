import type { Challenge } from '../types';

// â”€â”€â”€ ENG-PR-009 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

// â”€â”€â”€ ENG-PR-009 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const challenge: Challenge = {
  id: 'ENG-PR-009',
  type: 'PR Review',
  badgeClass: 'badge-pr',
  title: 'Broken TypeScript â€” `any` Cast Hiding a Type Error',
  companies: ['Palantir', 'Coinbase'],
  timeEst: '~10 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'A junior dev silenced a TypeScript error by casting to `any` rather than fixing the underlying mismatch. The code compiles and CI passes â€” but a runtime crash is now guaranteed in production under a specific, very common condition. Identify the issue.',
  solution: 'The API can return null when a user is not found, but the type was cast to `as any` to silence the TS error, then immediately accessed as user.email. At runtime, when the API returns null, this throws "Cannot read properties of null (reading \'email\')". Fix: type the response correctly as User | null, guard with if (!user) return res.status(404).json({ error: \'Not found\' }), and remove the any cast.',
  prReview: {
    prNumber: 556,
    prBranch: 'fix/ts-type-error-user-email',
    prBase: 'main',
    prAuthor: 'junior-dev-99',
    prFile: 'src/handlers/userHandler.ts',
    prAge: '2 hours ago',
    background: 'TypeScript was recently upgraded to strict mode. Several handlers started emitting type errors. This PR fixes the error in the user email lookup handler.',
    changes: 'The TS compiler was complaining that user might be null. Cast it to any to resolve the error and unblock the deploy.',
    testing: 'tsc passes. CI is green. Works fine in local dev where the test user always exists.',
    hints: [
      'What does casting to any actually guarantee about the runtime value?',
      'What will JavaScript do when you access .email on null?',
      'Instead of suppressing the error, what TypeScript-safe pattern should be used to handle a possibly-null value?',
    ],
    diff: [
      { lineNumL: 7, lineNumR: 7, type: 'normal', text: '  const user = await db.findUserById(req.params.id);' },
      { lineNumL: 8, lineNumR: null, type: 'deletion', text: '  if (!user) return res.status(404).json({ error: \'Not found\' });' },
      { lineNumL: 9, lineNumR: null, type: 'deletion', text: '  res.json({ email: user.email });' },
      { lineNumL: null, lineNumR: 8, type: 'addition', text: '  const safeUser = user as any;' },
      { lineNumL: null, lineNumR: 9, type: 'addition', text: '  res.json({ email: safeUser.email });' },
    ],
    bugOptions: [
      { value: 'any_cast_null', label: '`any` hiding null crash', sub: 'Type cast suppresses null guard' },
      { value: 'wrong_status', label: 'Wrong HTTP status code', sub: 'Should return 404, not 200' },
      { value: 'missing_validate', label: 'No input validation', sub: 'ID not validated before DB call' },
      { value: 'sql_injection', label: 'SQL injection risk', sub: 'ID interpolated into raw query' },
      { value: 'over_expose', label: 'Over-exposing user data', sub: 'Returning full user object' },
      { value: 'missing_auth', label: 'No auth check', sub: 'Endpoint lacks authentication' },
    ],
    correctBugType: 'any_cast_null',
    successExplanation: "Exactly. The original code had a correct null guard: if (!user) return res.status(404). This PR deleted that guard and replaced it with as any, which tells TypeScript 'trust me, I know what this is' â€” but guarantees nothing at runtime. When db.findUserById returns null (any user lookup for an unknown ID), safeUser.email throws TypeError: Cannot read properties of null. Casting to any is almost never the right fix; restoring the null guard is.",
    failExplanation: "The bug is the as any cast on line 8 combined with the removal of the null check. as any is a TypeScript-only construct â€” it has zero effect at runtime. The database can still return null, and accessing .email on null throws a TypeError that crashes the handler. The deleted if (!user) return res.status(404)... was the correct fix. When TypeScript complains about possible null, the answer is to handle null â€” not to hide the error.",
  },
};

export default challenge;