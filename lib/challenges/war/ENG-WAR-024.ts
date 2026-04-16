import type { Challenge } from '../types';

// ─── ENG-WAR-024 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-024',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Long-Running Transaction Causing Table Bloat',
          companies: ['Supabase', 'Railway'],
            timeEst: '~25 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `Postgres's MVCC (Multi-Version Concurrency Control) means old row versions are kept alive as long as any transaction might need them. A long-running analytics query can hold an open transaction for hours, preventing VACUUM from cleaning up dead rows. The result: table bloat — the table file grows to 100GB even though it only has 5GB of live data, causing full sequential scans to take 20x longer.`,
                    desc: `Your Postgres database has been slowly degrading for 2 weeks. A table that used to query in 50ms now takes 8 seconds for simple selects. Running VACUUM ANALYZE doesn't help. pg_stat_user_tables shows 15 million dead tuples in the orders table. pg_stat_activity shows a analytics reporting query that has been IDLE IN TRANSACTION for 18 hours.`,
                      solution: `Kill the long-running idle transaction immediately: SELECT pg_terminate_backend(<pid>). Then run VACUUM VERBOSE on the bloated table — now that the blocking transaction is gone, VACUUM can reclaim dead tuples. If the table is severely bloated, use VACUUM FULL (requires exclusive lock, heavy) or pg_repack (online, no lock) to reclaim disk space. Set idle_in_transaction_session_timeout to prevent future long-running idle transactions.`,
                        explanation: `Postgres MVCC keeps old row versions (dead tuples) until the VACUUM process can safely remove them. VACUUM cannot remove dead tuples if any open transaction has an XID older than when those tuples were deleted (the transaction might need to see them for read consistency). An IDLE IN TRANSACTION session holds its transaction ID open, blocking VACUUM indefinitely. Fix: kill the idle transaction, run VACUUM, set idle_in_transaction_session_timeout = '1hour' in postgresql.conf to auto-kill future offenders.`,
                          options: [
                            { label: 'A', title: 'Run VACUUM FULL ANALYZE on the orders table immediately', sub: 'VACUUM FULL ANALYZE orders; (will take a long exclusive lock)', isCorrect: false },
                            { label: 'B', title: 'Kill the idle-in-transaction session, then run VACUUM; set idle_in_transaction_session_timeout', sub: 'SELECT pg_terminate_backend(pid); VACUUM VERBOSE orders; SET idle_in_transaction_session_timeout=3600000', isCorrect: true },
                            { label: 'C', title: 'Increase shared_buffers to cache the bloated table in memory', sub: 'ALTER SYSTEM SET shared_buffers = \'16GB\'; SELECT pg_reload_conf()', isCorrect: false },
                            { label: 'D', title: 'Migrate to a new Postgres instance with a fresh orders table', sub: 'pg_dump orders | pg_restore on new instance, update connection string', isCorrect: false },
                          ]
};

export default challenge;
