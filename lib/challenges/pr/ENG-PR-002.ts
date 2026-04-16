import type { Challenge } from '../types';

// ─── ENG-PR-002 ─────────────────────────────────────────────────────────────────

const challenge: Challenge = {
  id: 'ENG-PR-002',
  type: 'PR Review',
  badgeClass: 'badge-pr',
  title: 'SQL Injection via Template Literals',
  companies: ['Airbnb', 'Shopify'],
  timeEst: '~10 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'Security scan flagged this PR. A junior dev added audit logging to the login route — but left a critical vulnerability untouched. Find it before it ships.',
  solution: "The db.query call on the added line interpolates req.body.email directly into the SQL string using a template literal. An attacker can send email = \"' OR 1=1; DROP TABLE users; --\" to bypass auth or destroy the database. Use parameterized queries: db.query('SELECT * FROM users WHERE email = $1', [email]).",
  prReview: {
    prNumber: 312,
    prBranch: 'feature/login-audit-logging',
    prBase: 'main',
    prAuthor: 'junior-dev-99',
    prFile: 'src/routes/auth.js',
    prAge: '1 hour ago',
    background: 'The security team requested login audit logging to help trace suspicious access attempts. This PR adds a log line for each login request before the database query runs.',
    changes: 'Added a console.log to record the email address of each login attempt. No other logic was changed.',
    testing: 'Tested with a sample login flow, log lines appear correctly. No regressions in CI.',
    hints: [
      'Read the database query on the new line carefully. What value is being interpolated directly into the SQL string?',
      'If an attacker sends email = \'\' OR 1=1; -- what does the resulting SQL statement look like?',
      'Template literals inside SQL query strings are almost always wrong. What should be used instead?',
    ],
    diff: [
      { lineNumL: 4,    lineNumR: 4,    type: 'normal',   text: "router.post('/login', async (req, res) => {" },
      { lineNumL: 5,    lineNumR: 5,    type: 'normal',   text: '  const { email, password } = req.body;' },
      { lineNumL: 6,    lineNumR: 6,    type: 'normal',   text: '' },
      { lineNumL: null, lineNumR: 7,    type: 'addition', text: '  console.log(`Login attempt for: ${email}`);' },
      { lineNumL: null, lineNumR: 8,    type: 'addition', text: '' },
      { lineNumL: 7,    lineNumR: 9,    type: 'normal',   text: '  const result = await db.query(' },
      { lineNumL: 8,    lineNumR: null, type: 'deletion', text: "    `SELECT * FROM users WHERE email = '${email}'`" },
      { lineNumL: null, lineNumR: 10,   type: 'addition', text: "    `SELECT * FROM users WHERE email = '${email}' AND active = true`" },
      { lineNumL: 9,    lineNumR: 11,   type: 'normal',   text: '  );' },
      { lineNumL: 10,   lineNumR: 12,   type: 'normal',   text: '' },
      { lineNumL: 11,   lineNumR: 13,   type: 'normal',   text: '  if (!result.rows[0]) {' },
      { lineNumL: 12,   lineNumR: 14,   type: 'normal',   text: "    return res.status(401).json({ error: 'Invalid credentials' });" },
      { lineNumL: 13,   lineNumR: 15,   type: 'normal',   text: '  }' },
    ],
    bugOptions: [
      { value: 'sql_injection',   label: 'SQL Injection',      sub: 'Unsanitized input in query string' },
      { value: 'credential_log',  label: 'Credential Logging', sub: 'PII written to application logs' },
      { value: 'missing_auth',    label: 'Missing auth check', sub: 'No rate-limit / brute-force guard' },
      { value: 'logic_error',     label: 'Logic Error',        sub: 'Incorrect business logic' },
      { value: 'race_condition',  label: 'Race condition',     sub: 'Concurrent access issue' },
      { value: 'n_plus_one',      label: 'N+1 Query',          sub: 'Query executing in a loop' },
    ],
    correctBugType: 'sql_injection',
    successExplanation: "Correct! Line 10 interpolates email directly into the SQL string using a template literal. An attacker sending email = \"' OR '1'='1\" turns the WHERE clause into WHERE email = '' OR '1'='1' — which matches every row, bypassing auth entirely. The fix: db.query('SELECT * FROM users WHERE email = $1 AND active = true', [email]). Bonus: the console.log on line 7 also leaks PII to your log aggregator — worth flagging separately.",
    failExplanation: "The critical bug is on line 10: email is interpolated directly into the SQL string using a backtick template literal. An attacker who sends email = \"' OR '1'='1\" bypasses your WHERE clause entirely. Parameterized queries (db.query('... WHERE email = $1', [email])) are the only correct fix — the database driver handles escaping. Note: the console.log on line 7 also leaks PII to logs, a secondary issue worth raising.",
  },
};

export default challenge;
