import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-027',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'String Concatenation SQL — Classic SQL Injection',
  companies: ['OWASP', 'HackerOne'],
  timeEst: '~20 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'A search endpoint builds SQL by concatenating user input directly into the query string. A trivial injection bypass allows reading all user data. Fix it with parameterised queries.',
  solution: 'Replace the string-concatenated SQL with a parameterised query using $1 placeholder. Pass user input as a separate argument to db.query(). Never interpolate user data into SQL.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The product search endpoint was shipped with SQL built like this:\n\n\`"SELECT * FROM products WHERE name LIKE '%" + req.query.q + "%'"\`\n\nA pentester submitted: \`q='; DROP TABLE products; --\`. They also demonstrated full data exfiltration with a UNION-based payload in under 3 minutes.\n\nYour mission: fix the SQL injection with parameterised queries throughout the file.`,
    folderPath: 'src/routes',
    primaryFile: 'search.ts',
    files: [
      {
        name: 'search.ts',
        lang: 'typescript',
        code: `import { Router } from 'express';
import { db } from '../db';

const router = Router();

// SECURITY BUG: SQL Injection vulnerability on every query below.
// Fix ALL three endpoints with parameterised queries.

router.get('/products', async (req, res) => {
  const q = req.query.q as string || '';
  // INJECTION: user input interpolated directly into SQL
  const result = await db.query(
    \`SELECT id, name, price FROM products WHERE name ILIKE '%\${q}%'\`
  );
  res.json(result.rows);
});

router.get('/users/:id', async (req, res) => {
  // INJECTION: path param concatenated
  const sql = "SELECT id, email FROM users WHERE id = '" + req.params.id + "'";
  const result = await db.query(sql);
  res.json(result.rows[0] ?? null);
});

router.get('/orders', async (req, res) => {
  const status = req.query.status || 'pending';
  // INJECTION: query param concatenated
  const result = await db.query(
    'SELECT * FROM orders WHERE status = \'' + status + '\' ORDER BY created_at DESC'
  );
  res.json(result.rows);
});

export default router;`,
      },
    ],
    objectives: [
      {
        label: 'Fix the /products SQL injection with parameterised query',
        check: { type: 'not_contains', file: 'search.ts', pattern: '`%${q}%`' },
      },
      {
        label: 'Fix the /users/:id SQL injection',
        check: { type: 'not_contains', file: 'search.ts', pattern: "req.params.id + \"'\"" },
      },
      {
        label: 'Use $1 placeholders in all three queries',
        check: { type: 'contains', file: 'search.ts', pattern: '$1' },
      },
    ],
    hints: [
      'Parameterised query: `db.query("SELECT ... WHERE name ILIKE $1", [\`%${q}%\`])`',
      'The parameter is passed as a second array argument — Postgres handles escaping, not you.',
      'Never use string concatenation or template literals to build SQL with user data.',
    ],
    totalTests: 15,
    testFramework: 'Jest + Supertest',
    xp: 220,
    successMessage: `SQL injection eliminated. All three endpoints now use parameterised queries — user input is always treated as data, never as SQL. This is one of the most common critical vulnerabilities in production systems.`,
  },
};

export default challenge;
