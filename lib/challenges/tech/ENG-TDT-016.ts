import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-016',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Spaghetti Express Middleware (No Separation of Concerns)',
  companies: ['Twilio', 'SendGrid'],
  timeEst: '~30 min',
  level: 'Mid',
  status: 'Not Started',
  desc: 'A single server.ts file has auth, validation, business logic, and DB calls all tangled together in one 300-line route handler. Split it into proper middleware layers.',
  solution: 'Extract auth into an authenticate middleware, validation into a validateCreateUser middleware, business logic into a UserService class, and DB access into a UserRepository.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The user registration endpoint was written in one afternoon. Now it handles JWT verification, input validation, password hashing, DB insertion, email sending, and audit logging — all inside one anonymous function.\n\nEvery bug fix touches the same file. There are zero unit tests because nothing is injectable.\n\nYour mission: split the handler into proper layers with single responsibilities.`,
    folderPath: 'src/routes',
    primaryFile: 'server.ts',
    files: [
      {
        name: 'server.ts',
        lang: 'typescript',
        code: `import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { db } from '../db';
import { sendWelcomeEmail } from '../email';

const app = express();
app.use(express.json());

// TODO: This handler does 6 things. Split it into layers.
app.post('/users', async (req, res) => {
  // 1. Auth
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  let caller: any;
  try { caller = jwt.verify(token, process.env.JWT_SECRET!); }
  catch { return res.status(401).json({ error: 'Invalid token' }); }
  if (caller.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  // 2. Validation
  const { email, password, name } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Bad email' });
  if (!password || password.length < 8) return res.status(400).json({ error: 'Weak password' });
  if (!name) return res.status(400).json({ error: 'Name required' });

  // 3. Business logic
  const existing = await db.query('SELECT id FROM users WHERE email=$1', [email]);
  if (existing.rows.length > 0) return res.status(409).json({ error: 'Email taken' });
  const hash = await bcrypt.hash(password, 12);

  // 4. DB insert
  const result = await db.query(
    'INSERT INTO users(email,password_hash,name) VALUES($1,$2,$3) RETURNING id',
    [email, hash, name]
  );

  // 5. Side effect
  await sendWelcomeEmail(email, name);

  // 6. Audit log
  console.log(\`AUDIT: admin \${caller.sub} created user \${result.rows[0].id}\`);

  res.status(201).json({ id: result.rows[0].id });
});

app.listen(3000);`,
      },
      {
        name: 'middleware/authenticate.ts',
        lang: 'typescript',
        code: `import { Request, Response, NextFunction } from 'express';

// TODO: Extract JWT verification into a reusable middleware.
// Set req.user = decoded payload on success.
export function authenticate(req: Request, res: Response, next: NextFunction) {
  // TODO
}`,
      },
      {
        name: 'services/UserService.ts',
        lang: 'typescript',
        code: `// TODO: Move business logic (duplicate check, password hash) here.
export class UserService {
  async createUser(email: string, password: string, name: string): Promise<{ id: string }> {
    // TODO
    throw new Error('Not implemented');
  }
}`,
      },
    ],
    objectives: [
      {
        label: 'Move JWT verification out of the route handler into authenticate.ts',
        check: { type: 'contains', file: 'middleware/authenticate.ts', pattern: 'jwt.verify' },
      },
      {
        label: 'Remove jwt.verify from server.ts',
        check: { type: 'not_contains', file: 'server.ts', pattern: 'jwt.verify' },
      },
      {
        label: 'Implement UserService.createUser with the business logic',
        check: { type: 'contains', file: 'services/UserService.ts', pattern: 'bcrypt.hash' },
      },
    ],
    hints: [
      'Express middleware: `authenticate` calls `next()` on success, `res.status(401)` on failure.',
      'Extend `express.Request` with a `user` field to pass the decoded token downstream.',
      'UserService should only handle business rules — it should receive a UserRepository injected via constructor.',
    ],
    totalTests: 22,
    testFramework: 'Jest + Supertest',
    xp: 300,
    successMessage: `Each layer now has a single job. The route handler is 5 lines. The middleware and service are unit-testable in isolation. Adding a new route reuses the authenticate middleware without copy-paste.`,
  },
};

export default challenge;
