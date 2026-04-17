import type { Challenge } from '../types';

// ─── ENG-PR-008 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

// ─── ENG-PR-008 ─────────────────────────────────────────────────────────────────

const challenge: Challenge = {
  id: 'ENG-PR-008',
  type: 'PR Review',
  badgeClass: 'badge-pr',
  title: 'Missing async on Express Route Handler',
  companies: ['Shopify', 'Twilio'],
  timeEst: '~10 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'After a junior dev added a new /users/:id endpoint, the Node.js server crashes entirely when the user is not found in the database. Other routes go down with it. No try/catch is failing — something more fundamental is wrong.',
  solution: 'The route callback is not declared async, but await is used inside it. In older Express (v4), a thrown error or rejected promise inside a non-async handler is an unhandled promise rejection that crashes the process. Additionally, there is no try/catch — an unhandled DB error propagates uncaught. Fix: add async to the handler and wrap in try/catch, calling next(err) on failure so Express\'s error middleware handles it.',
  prReview: {
    prNumber: 710,
    prBranch: 'feature/get-user-by-id',
    prBase: 'main',
    prAuthor: 'junior-dev-99',
    prFile: 'src/routes/users.js',
    prAge: '3 hours ago',
    background: 'The admin panel needs a REST endpoint to look up a single user by ID. The DB layer already has a getUserById(id) function that throws a NotFoundError if the user does not exist.',
    changes: 'Added a GET /users/:id route that calls db.getUserById and returns the user as JSON.',
    testing: 'Returns 200 with user data when a valid ID is passed. CI passes.',
    hints: [
      'Can you use await inside a function that is not declared async?',
      'In Express v4, what happens to a Promise rejection thrown inside a route handler if Express doesn\'t know the handler is async?',
      'Which Express mechanism is responsible for catching errors and returning a structured error response?',
    ],
    diff: [
      { lineNumL: 5, lineNumR: 5, type: 'normal', text: "router.get('/users/:id', (req, res, next) => {" },
      { lineNumL: null, lineNumR: 6, type: 'addition', text: '  const user = await db.getUserById(req.params.id);' },
      { lineNumL: null, lineNumR: 7, type: 'addition', text: '  res.json(user);' },
      { lineNumL: 6, lineNumR: 8, type: 'normal', text: '});' },
    ],
    bugOptions: [
      { value: 'missing_async', label: 'Missing async keyword', sub: 'await used in non-async function' },
      { value: 'missing_try_catch', label: 'No error handling', sub: 'Exceptions not caught or forwarded' },
      { value: 'missing_404', label: 'No 404 response', sub: 'Returns 200 when user not found' },
      { value: 'no_validation', label: 'No input validation', sub: 'ID not validated before DB call' },
      { value: 'blocking_call', label: 'Blocking DB call', sub: 'Synchronous query blocks event loop' },
      { value: 'cors_issue', label: 'Missing CORS header', sub: 'Browser blocks cross-origin request' },
    ],
    correctBugType: 'missing_async',
    successExplanation: "Right. The handler is a regular arrow function but uses await — that's a SyntaxError at parse time in strict mode, or results in an unhandled rejection at runtime in older environments. In Express v4, async errors that aren't passed to next() become unhandled promise rejections, which crash the process in Node.js 15+. Fixes needed: (1) declare the callback async, (2) wrap in try/catch and call next(err) so Express error middleware handles it gracefully.",
    failExplanation: "Two bugs: (1) Line 5 — the callback isn't async, but await is used on line 6. This is a SyntaxError. (2) Even if async is added, there's no try/catch — when db.getUserById throws NotFoundError, the unhandled rejection crashes Node.js (v15+). Correct form: router.get('/users/:id', async (req, res, next) => { try { const user = await db.getUserById(req.params.id); res.json(user); } catch (err) { next(err); } });",
  },
};
