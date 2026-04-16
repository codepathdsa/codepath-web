import type { Challenge } from '../types';

// ─── ENG-WAR-023 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-023',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'N+1 Query Kills Database After Feature Launch',
          companies: ['Stripe', 'HubSpot'],
            timeEst: '~20 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `A classic production incident pattern: a new feature ships with an N+1 query hidden in the ORM. In staging with 100 records it's imperceptible. In production with 500,000 records and high concurrency, it sends 500,000 individual SELECT queries instead of 1 JOIN, overwhelming the database. Stripe's engineering blog documents similar issues with their billing system.`,
                    desc: `A new "Customer Overview" dashboard feature launched 30 minutes ago. Database CPU went from 20% to 98% immediately after. Query logs show hundreds of thousands of tiny SELECT queries per second: SELECT * FROM invoices WHERE customer_id = $1 being called once per customer in a loop. Before the launch, load tests showed no issues (only 50 test customers). Production has 500,000 customers.`,
                      solution: `This is an N+1 query problem. The code fetches all customers, then runs 1 SQL query per customer to get their invoices. Fix: add an .includes(:invoices) eager load (Rails) or use a JOIN / dataloader pattern to fetch all invoices for all customers in a single query. Immediate mitigation: roll back or feature-flag the new dashboard, then fix the ORM eager loading.`,
                        explanation: `N+1 pattern: you query for N customers, then execute 1 query per customer for their invoices = N+1 total queries. Fix: use eager loading (ORM's includes/preload/eager_load in Rails, select_related/prefetch_related in Django) to fetch related records in 1-2 queries regardless of N. For APIs: use DataLoader pattern (Facebook's open-source batching library) to batch database calls. Detection: use tools like the Bullet gem (Rails), Django Debug Toolbar, or database query count assertions in tests.`,
                          options: [
                            { label: 'A', title: 'Add a database read replica to handle the load', sub: 'aws rds create-db-instance-read-replica --source-db-instance-identifier prod-db', isCorrect: false },
                            { label: 'B', title: 'Roll back the feature + fix N+1 with eager loading / batch queries', sub: 'Feature flag OFF; add .includes(:invoices) or JOIN query', isCorrect: true },
                            { label: 'C', title: 'Add a Redis cache layer for all customer invoice lookups', sub: 'Cache each invoice lookup in Redis with 5 min TTL', isCorrect: false },
                            { label: 'D', title: 'Increase database max_connections to absorb the extra queries', sub: 'ALTER SYSTEM SET max_connections = 5000', isCorrect: false },
                          ]
};

export default challenge;
