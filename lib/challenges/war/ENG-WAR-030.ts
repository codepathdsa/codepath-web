import type { Challenge } from '../types';

// ─── ENG-WAR-030 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-030',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Zombie Prepared Statements Filling Connection Pool',
          companies: ['PlanetScale', 'Neon'],
            timeEst: '~20 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `A common serverless database incident: Lambda functions using persistent prepared statements (DEALLOCATE not called on function timeout) leave "zombie" prepared statements on Postgres connections. When PgBouncer recycles these connections in transaction mode, the prepared statements are orphaned. In session-pool mode, each Lambda invocation may get a different connection, finding unexpected prepared statements.`,
                    desc: `Your serverless Lambda functions connect to Postgres via PgBouncer in transaction pooling mode. After a traffic spike, API latency spiked and the database is throwing: 'ERROR: prepared statement "stmt_1" already exists'. Lambda function logs show 500 errors on the first query after a cold start. The prepared statement cache appears to be leaking across connections.`,
                      solution: `PgBouncer in transaction mode does not support named prepared statements — the connection is returned to the pool after each transaction, and Postgres's prepared statement namespace is per-connection. Fix: disable named prepared statements in your Postgres driver, or switch PgBouncer to session pooling mode (less efficient) for workloads that require prepared statements. In psycopg2: use cursor.execute() without PREPARE; in Node pg: don't use the name parameter in query().`,
                        explanation: `PgBouncer transaction pooling: a connection is checked out from the pool at BEGIN, returned at COMMIT/ROLLBACK. Named prepared statements (PREPARE stmt AS ...) are scoped to the Postgres connection, not the PgBouncer transaction. When the next client gets the same connection, the statement already exists → error. Solutions: (1) Use simple queries without PREPARE, (2) Switch to session mode pooling, (3) Use Pgpool-II which understands prepared statements, (4) Use a driver that issues DEALLOCATE ALL on connection return.`,
                          options: [
                            { label: 'A', title: 'Restart PgBouncer to clear all connection state', sub: 'systemctl restart pgbouncer', isCorrect: false },
                            { label: 'B', title: 'Disable named prepared statements in the Postgres driver; use simple queries', sub: 'pg driver: remove name from query({text, name}); use unnamed queries only', isCorrect: true },
                            { label: 'C', title: 'Increase PgBouncer pool_size to 500 connections', sub: 'pgbouncer.ini: pool_size = 500', isCorrect: false },
                            { label: 'D', title: 'Switch from Lambda to EC2 to maintain persistent connections', sub: 'Migrate serverless functions to persistent EC2 process', isCorrect: false },
                          ]
};

export default challenge;
