import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-035',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'No Graceful Shutdown — In-Flight Requests Killed',
  companies: ['Google', 'Kubernetes'],
  timeEst: '~30 min',
  level: 'Senior',
  status: 'Not Started',
  desc: 'When Kubernetes sends SIGTERM, the Node.js server exits immediately — killing all in-flight requests. Some of those are financial transactions mid-write. Implement graceful shutdown.',
  solution: 'Listen for SIGTERM/SIGINT. Stop accepting new connections. Wait for in-flight requests to complete (max 30s). Drain the database connection pool. Then exit with code 0.',
  lang: 'TypeScript',
  tribunalData: {
    background: `When Kubernetes rolls out a new version, it sends SIGTERM to the old pod. The Node.js process exits in ~10ms — immediately dropping all active connections.\n\nFor long-running financial write operations (up to 5s), this means partial commits, lost transactions, and data corruption.\n\nGraceful shutdown means: stop accepting new requests, wait for active ones to finish, then exit cleanly.\n\nYour mission: implement graceful shutdown.`,
    folderPath: 'src',
    primaryFile: 'server.ts',
    files: [
      {
        name: 'server.ts',
        lang: 'typescript',
        code: `import express from 'express';
import { db } from './db';

const app = express();
app.use(express.json());

app.post('/transfer', async (req, res) => {
  await db.query('BEGIN');
  await db.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [req.body.amount, req.body.from]);
  await db.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [req.body.amount, req.body.to]);
  await db.query('COMMIT');
  res.json({ success: true });
});

const server = app.listen(3000, () => console.log('Server started on :3000'));

// TODO: Implement graceful shutdown.
// 1. Listen for SIGTERM and SIGINT
// 2. Stop accepting new connections with server.close()
// 3. Wait up to 30s for in-flight requests to complete
// 4. Close the DB connection pool
// 5. process.exit(0)`,
      },
    ],
    objectives: [
      {
        label: 'Listen for SIGTERM signal',
        check: { type: 'contains', file: 'server.ts', pattern: 'SIGTERM' },
      },
      {
        label: 'Call server.close() to stop accepting new connections',
        check: { type: 'contains', file: 'server.ts', pattern: 'server.close' },
      },
      {
        label: 'Add a timeout (30s max) for in-flight requests',
        check: { type: 'contains', file: 'server.ts', pattern: '30' },
      },
      {
        label: 'Close the DB connection pool before exit',
        check: { type: 'contains', file: 'server.ts', pattern: 'db' },
      },
    ],
    hints: [
      '`server.close(callback)` stops accepting new TCP connections but keeps existing ones open until they close naturally.',
      'Set a hard timeout: `setTimeout(() => { console.error("Forced shutdown"); process.exit(1); }, 30_000);`',
      'After `server.close()` callback fires: `await db.end(); process.exit(0);`',
    ],
    totalTests: 14,
    testFramework: 'Jest',
    xp: 380,
    successMessage: `The server now drains gracefully before exiting. Kubernetes rolling deployments no longer kill in-flight financial transactions. Zero partial commits. Zero data corruption on deploy.`,
  },
};

export default challenge;
