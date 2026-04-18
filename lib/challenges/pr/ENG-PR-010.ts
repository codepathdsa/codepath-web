import type { Challenge } from '../types';

// â”€â”€â”€ ENG-PR-010 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

// â”€â”€â”€ ENG-PR-010 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const challenge: Challenge = {
  id: 'ENG-PR-010',
  type: 'PR Review',
  badgeClass: 'badge-pr',
  title: 'Insecure Direct Object Reference (IDOR)',
  companies: ['Airbnb', 'Dropbox'],
  timeEst: '~12 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'A security researcher privately reported they can download any user\'s invoice by changing a number in the URL. A junior dev wrote this endpoint last sprint. It passed code review â€” but the bug is sitting in plain sight.',
  solution: 'The endpoint fetches an invoice by ID but never verifies that the invoice belongs to the requesting user. Any authenticated user can request /invoices/1, /invoices/2, etc. and retrieve other users\' billing data. Fix: add a WHERE clause that scopes the query to the current user: db.query("SELECT * FROM invoices WHERE id = $1 AND user_id = $2", [invoiceId, req.user.id]). If the result is empty, return 403 or 404.',
  prReview: {
    prNumber: 389,
    prBranch: 'feature/invoice-download',
    prBase: 'main',
    prAuthor: 'junior-dev-99',
    prFile: 'src/routes/invoices.js',
    prAge: '6 days ago',
    background: 'Users need to be able to download PDF copies of their past invoices from their account page. Auth middleware ensures all routes require a valid session.',
    changes: 'Added a GET /invoices/:id endpoint that fetches invoice data by ID and returns it. Auth is already enforced globally by middleware.',
    testing: 'Tested fetching own invoices â€” works correctly. Auth middleware rejects unauthenticated requests.',
    hints: [
      'The route checks that the user is authenticated â€” but does it check that this invoice belongs to this user?',
      'What does an attacker need to do to access invoice #1 if they are logged in as user #999?',
      'How would you modify the SQL query to ensure a user can only ever retrieve their own invoices?',
    ],
    diff: [
      { lineNumL: 3, lineNumR: 3, type: 'normal', text: "router.get('/invoices/:id', requireAuth, async (req, res) => {" },
      { lineNumL: 4, lineNumR: 4, type: 'normal', text: '  const { id } = req.params;' },
      { lineNumL: null, lineNumR: 5, type: 'addition', text: '  const invoice = await db.query(' },
      { lineNumL: null, lineNumR: 6, type: 'addition', text: "    'SELECT * FROM invoices WHERE id = $1', [id]" },
      { lineNumL: null, lineNumR: 7, type: 'addition', text: '  );' },
      { lineNumL: null, lineNumR: 8, type: 'addition', text: '  if (!invoice.rows[0]) return res.status(404).json({ error: \'Not found\' });' },
      { lineNumL: null, lineNumR: 9, type: 'addition', text: '  res.json(invoice.rows[0]);' },
      { lineNumL: 5, lineNumR: 10, type: 'normal', text: '});' },
    ],
    bugOptions: [
      { value: 'idor', label: 'IDOR', sub: 'No ownership check on resource' },
      { value: 'sql_injection', label: 'SQL injection', sub: 'Unsanitized ID in query' },
      { value: 'missing_auth', label: 'Missing authentication', sub: 'Endpoint not protected' },
      { value: 'over_fetching', label: 'Over-fetching', sub: 'SELECT * exposes excess fields' },
      { value: 'missing_pagination', label: 'No pagination', sub: 'Unbounded result set' },
      { value: 'no_rate_limit', label: 'No rate limiting', sub: 'Endpoint can be hammered' },
    ],
    correctBugType: 'idor',
    successExplanation: "Correct â€” this is a textbook IDOR (Insecure Direct Object Reference). The endpoint is authenticated (requireAuth), so anonymous users are blocked. But any logged-in user can request /invoices/1 through /invoices/N and retrieve every invoice in the database, because the query only filters on id â€” never on the requesting user's identity. Fix: AND user_id = $2 with req.user.id as the second parameter. Return 404 (not 403) so you don't leak whether an ID exists.",
    failExplanation: "The vulnerability is IDOR on line 6. The query fetches by id alone â€” any authenticated user who guesses or increments an invoice ID can access another customer's billing data. The fix is a one-word SQL change: add AND user_id = $2 to the query and pass req.user.id as the second parameter. This is one of the OWASP Top 10 (Broken Access Control) and a common junior mistake when auth middleware gives a false sense of security.",
  },
};

export default challenge;