import type { Challenge } from '../types';

// ─── ENG-WAR-019 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-019',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Zero-Downtime Deployment Causes Database Schema Lock',
          companies: ['GitHub', 'Shopify'],
            timeEst: '~25 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `GitHub experienced multiple production incidents caused by database schema migrations that ran ALTER TABLE with full table locks. For a 200M-row table, MySQL's ALTER TABLE adds a column with a full exclusive lock — blocking all reads and writes for 30+ minutes. Shopify's engineering team pioneered the "ghost" migration approach (pt-online-schema-change and gh-ost) to run zero-lock migrations on huge tables.`,
                    desc: `A deployment ran a database migration: ALTER TABLE orders ADD COLUMN discount_code VARCHAR(255). The orders table has 400 million rows. The migration has been running for 22 minutes and shows no sign of completing. All write operations to the orders table are queued and timing out (Checkout is down). Read operations are also blocked. Killing the migration would roll back 22 minutes of work and the migration would need to re-run.`,
                      solution: `Kill the running ALTER TABLE (it will rollback cleanly). Use gh-ost (GitHub's online schema change tool) or pt-online-schema-change instead — these tools add the column by: (1) creating a shadow table with the new schema, (2) streaming binlog changes to keep it in sync, (3) doing a near-atomic swap of the tables. The migration runs with minimal locking.`,
                        explanation: `MySQL's ALTER TABLE acquires a metadata lock for the duration of the operation on tables without online DDL support. For huge tables, this means minutes or hours of complete unavailability. Online schema change tools work around this: gh-ost creates a shadow table, copies rows in chunks, tails the MySQL binlog to apply concurrent writes to the shadow table, then does a final atomic RENAME. The only locking is a microsecond-level RENAME at the very end.`,
                          options: [
                            { label: 'A', title: 'Wait for the migration to complete — it\'s safer than killing it', sub: 'Keep the ALTER TABLE running, put up a maintenance page', isCorrect: false },
                            { label: 'B', title: 'Kill the migration, re-run it using gh-ost for zero-lock online migration', sub: 'KILL <query_id>; gh-ost --alter "ADD COLUMN discount_code VARCHAR(255)" --table=orders', isCorrect: true },
                            { label: 'C', title: 'Kill the migration and re-run it immediately at 3am when traffic is lowest', sub: 'Schedule migration during off-peak: ALTER TABLE orders ADD COLUMN...', isCorrect: false },
                            { label: 'D', title: 'Increase MySQL max_allowed_packet and innodb_lock_wait_timeout', sub: 'SET GLOBAL innodb_lock_wait_timeout=3600', isCorrect: false },
                          ]
};

export default challenge;
