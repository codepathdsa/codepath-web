import type { Challenge } from '../types';

// ─── ENG-WAR-025 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-025',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Redis maxmemory Evicting Hot Keys Mid-Traffic',
          companies: ['Amazon', 'Netflix'],
            timeEst: '~20 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `A Netflix engineering team documented a production incident where Redis hit its maxmemory limit and began evicting keys with the allkeys-lru policy. This evicted session tokens for active users — effectively logging everyone out simultaneously. The eviction policy was appropriate for a cache but catastrophic for a session store. Redis should never evict session data.`,
                    desc: `Users are being randomly logged out. Customer support tickets are flooding in. Redis memory usage shows 100% utilization. Redis INFO stats show evicted_keys increasing rapidly. The Redis instance stores both session tokens (must never be evicted) and product catalog cache (fine to evict). The Redis maxmemory-policy is set to allkeys-lru, which evicts any key regardless of type.`,
                      solution: `Immediately change maxmemory-policy to volatile-lru — this only evicts keys that have an expiry (TTL) set. Then ensure session tokens have NO TTL set (no expiry) so they become ineligible for volatile-lru eviction. Product catalog keys should have TTLs and will be evicted normally. Long term: separate sessions and cache into two different Redis instances.`,
                        explanation: `Redis maxmemory-policy options: allkeys-lru (evict anything, dangerous for sessions), volatile-lru (only evict keys with TTL set, safe for session+cache mixed use), noeviction (reject writes when full, safer for session-only store). The correct architecture: never mix session storage with cache in the same Redis instance. Sessions go in a dedicated noeviction Redis with sufficient memory. Cache goes in a separate allkeys-lru Redis.`,
                          options: [
                            { label: 'A', title: 'Increase Redis maxmemory to double the current value', sub: 'CONFIG SET maxmemory 16gb', isCorrect: false },
                            { label: 'B', title: 'Switch maxmemory-policy to volatile-lru; ensure sessions have no TTL', sub: 'CONFIG SET maxmemory-policy volatile-lru; remove EXPIRE on session keys', isCorrect: true },
                            { label: 'C', title: 'Flush all Redis data and restart the application to force re-login', sub: 'redis-cli FLUSHALL; pm2 restart all', isCorrect: false },
                            { label: 'D', title: 'Switch to noeviction policy to prevent any data loss', sub: 'CONFIG SET maxmemory-policy noeviction', isCorrect: false },
                          ]
};

export default challenge;
