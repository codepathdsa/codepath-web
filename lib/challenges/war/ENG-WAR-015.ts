import type { Challenge } from '../types';

// ─── ENG-WAR-015 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-015',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Thundering Herd After Cache Warm-Up Failure',
          companies: ['Twitter', 'Reddit'],
            timeEst: '~25 min',
              level: 'Senior',
                status: 'Not Started',
                  realWorldContext: `When Twitter's cache clusters are restarted or warmed up after maintenance, every cache miss hits the database simultaneously. Facebook coined "cache stampede" for this — after a cache restart, thousands of requests simultaneously find the same key missing and all query the database at once. Reddit experienced a similar thundering herd during their Pi-Day 2023 Kubernetes upgrade when caches went cold.`,
                    desc: `After a Redis cluster failover to a fresh node, the cache is completely empty. Within seconds, your database CPU spikes to 100%, connections are exhausted, and APIs return 504s. The Redis cache is warming up, but every request is hitting the database simultaneously because all keys are expired. The issue is self-reinforcing — the database is so overloaded it can't respond, so cache misses keep piling up.`,
                      solution: `Immediately enable a Cache Stampede protection strategy: (1) apply a request coalescer (only 1 request per cache key hits the DB; others wait for the first result), or (2) implement probabilistic early recomputation (PER) to prevent simultaneous expiry. Short-term: use a circuit breaker to shed load and serve stale data. Long-term: pre-warm the cache from a backup before bringing a new Redis node into production.`,
                        explanation: `Thundering herd / cache stampede occurs when many cached keys expire simultaneously or a cache is emptied, sending all requests directly to the database. Three defense patterns: (1) Mutex/lock: only one process recomputes an expired key, others wait. (2) Probabilistic Early Recomputation: slightly before expiry, recompute early with some probability. (3) Stale-while-revalidate: serve the old (stale) value while a background process refreshes it.`,
                          options: [
                            { label: 'A', title: 'Scale database to a larger instance type immediately', sub: 'aws rds modify-db-instance --db-instance-class db.r6g.4xlarge', isCorrect: false },
                            { label: 'B', title: 'Restart the entire application fleet to clear in-flight requests', sub: 'kubectl rollout restart deployment --all', isCorrect: false },
                            { label: 'C', title: 'Apply request coalescing + serve stale data while cache repopulates', sub: 'Enable cache stampede protection (mutex/stale-while-revalidate)', isCorrect: true },
                            { label: 'D', title: 'Disable Redis and route all traffic to read replicas', sub: 'Swap CACHE_BACKEND from redis to database', isCorrect: false },
                          ]
};

export default challenge;
