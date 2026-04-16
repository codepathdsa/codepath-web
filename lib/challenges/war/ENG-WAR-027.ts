import type { Challenge } from '../types';

// ─── ENG-WAR-027 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-027',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Missing Database Index Causes Full Table Scan in Production',
          companies: ['LinkedIn', 'Glassdoor'],
            timeEst: '~15 min',
              level: 'Junior',
                status: 'Not Started',
                  realWorldContext: `LinkedIn's job search went down after a deployment removed an index migration by accident. A query that used to take 2ms via index scan now does a full sequential scan of 50M rows, taking 30 seconds and holding locks that cascade into deadlocks. This pattern — missing index causing full table scan — is one of the most common production database incidents.`,
                    desc: `A deployment was pushed 20 minutes ago. Since then, the job search API has 30-second response times and is timing out. Database CPU is at 100%. EXPLAIN ANALYZE shows a critical query doing a Seq Scan (full table scan) on the jobs table (50M rows) instead of an Index Scan. The query is: SELECT * FROM jobs WHERE company_id = $1 AND status = 'active'. The jobs table previously had a compound index on (company_id, status) that appears to have been dropped.`,
                      solution: `Create the missing index CONCURRENTLY to avoid locking the table during creation: CREATE INDEX CONCURRENTLY idx_jobs_company_status ON jobs(company_id, status). The CONCURRENTLY option builds the index without blocking reads or writes. The index creation will take several minutes for 50M rows, but the application can continue serving requests (slowly) during that time.`,
                        explanation: `CREATE INDEX without CONCURRENTLY locks the entire table for the duration of the build — on a 50M row table this could be 10-20 minutes of complete unavailability. CREATE INDEX CONCURRENTLY performs multiple scans of the table, acquiring row-level locks only briefly, allowing concurrent reads and writes throughout. Downside: takes 2-3x longer to build. Always use CONCURRENTLY in production. Also: add index existence checks to your deployment scripts and test with production-scale data.`,
                          options: [
                            { label: 'A', title: 'Roll back the deployment immediately', sub: 'kubectl rollout undo deployment/job-service', isCorrect: false },
                            { label: 'B', title: 'Create the missing index using CREATE INDEX CONCURRENTLY', sub: 'CREATE INDEX CONCURRENTLY idx_jobs_company_status ON jobs(company_id, status)', isCorrect: true },
                            { label: 'C', title: 'Add a Redis cache for all company job queries', sub: 'Cache SELECT results in Redis with company_id as key, 5min TTL', isCorrect: false },
                            { label: 'D', title: 'Rewrite the query to use OR instead of AND to reduce rows scanned', sub: 'SELECT * FROM jobs WHERE company_id=$1 OR status=\'active\'', isCorrect: false },
                          ]
};

export default challenge;
