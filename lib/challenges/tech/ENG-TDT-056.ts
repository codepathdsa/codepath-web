import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-056',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'No Connection Pooling — New DB Connection Per Request',
  companies: ['Supabase', 'PlanetScale'],
  timeEst: '~25 min',
  level: 'Mid',
  status: 'Not Started',
  desc: 'Every API request creates and destroys a new PostgreSQL connection. Under 500 concurrent users, the DB runs out of connections (max 100). Add connection pooling with pg-pool.',
  solution: 'Create a single Pool instance at module load time. Use pool.query() instead of client.query(). The pool manages connection reuse, queueing, and lifecycle automatically.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The DB helper was written as: \`new Client(); await client.connect(); await client.query(...); await client.end()\`. Each request opens and closes a Postgres connection — taking 20-80ms of handshake overhead.\n\nPostgres has a max_connections limit (default 100). At 500 concurrent users, connections queue, then error: "sorry, too many clients already."\n\nA connection pool maintains a set of ready connections. Requests borrow from the pool and return when done.\n\nYour mission: replace per-request connections with a shared pool.`,
    folderPath: 'src/db',
    primaryFile: 'database.ts',
    files: [
      {
        name: 'database.ts',
        lang: 'typescript',
        code: `import { Client, Pool } from 'pg';

// TODO: Replace per-request Client with a module-level Pool.
// The pool should be configured with:
//   max: 20 connections
//   idleTimeoutMillis: 30000
//   connectionTimeoutMillis: 2000

// BUG: Creates a new connection per query — does not scale
export async function query(sql: string, params?: unknown[]) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  try {
    return await client.query(sql, params);
  } finally {
    await client.end();
  }
}`,
      },
    ],
    objectives: [
      {
        label: 'Create a module-level Pool instance',
        check: { type: 'contains', file: 'database.ts', pattern: 'new Pool(' },
      },
      {
        label: 'Set max connections on the pool',
        check: { type: 'contains', file: 'database.ts', pattern: 'max:' },
      },
      {
        label: 'Replace per-request Client with pool.query()',
        check: { type: 'contains', file: 'database.ts', pattern: 'pool.query' },
      },
      {
        label: 'Remove new Client() from the query function',
        check: { type: 'not_contains', file: 'database.ts', pattern: 'new Client(' },
      },
    ],
    hints: [
      '`const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 20, idleTimeoutMillis: 30000 })`',
      '`export async function query(sql: string, params?: unknown[]) { return pool.query(sql, params); }`',
      'pg-pool handles connection lifecycle: borrows from pool, executes, returns. No connect/end per query.',
    ],
    totalTests: 12,
    testFramework: 'Jest',
    xp: 260,
    successMessage: `Per-request connection overhead eliminated. Connection time: 50ms → 0ms (connections are reused). DB max_connections are no longer breached. 500 concurrent users share 20 pooled connections efficiently.`,
  },
};

export default challenge;
