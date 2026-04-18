import type { Challenge } from '../types';
// â”€â”€â”€ ENG-PR-029 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const challenge: Challenge = {
    id: 'ENG-PR-029',
    type: 'PR Review',
    badgeClass: 'badge-pr-lead',
    title: 'Cache Stampede (Thundering Herd)',
    companies: ['Meta', 'Discord'],
    timeEst: '~15 min',
    level: 'Senior',
    status: 'Not Started',
    desc: 'A high-traffic endpoint uses Redis to cache a heavy 5-second database query. The cache TTL is 10 minutes. Every 10 minutes, the database CPU spikes to 100% and triggers PagerDuty alerts, then recovers.',
    solution: 'This is a Cache Stampede. When the cache expires, all 5,000 concurrent requests miss the cache at the exact same millisecond. They all simultaneously execute the expensive DB query. Fix: Implement a "Promise Cache" (request coalescing) so only the first request queries the DB while others wait for its resolution, or use probabilistic early expiration / background refreshing.',
    prReview: {
        prNumber: 104,
        prBranch: 'perf/cache-heavy-query',
        prBase: 'main',
        prAuthor: 'senior-dev-11',
        prFile: 'src/services/analytics.ts',
        background: 'Caching a massive aggregate query that powers the main dashboard.',
        prAge: '2 hours ago',
        changes: 'See diff below for the specific lines introduced in this PR.',
        testing: 'No automated tests were added with this change.',
        hints: [
            'What happens when the cache TTL expires at exactly 12:00:00 and 1,000 users are on the dashboard?',
            'How many requests will pass the `if (!cached)` check before the first DB query finishes?',
            'How can we ensure that only ONE request triggers the DB rebuild while others wait?'
        ],
        diff: [
            { lineNumL: 15, lineNumR: 15, type: 'normal', text: 'export async function getDashboardStats() {' },
            { lineNumL: 16, lineNumR: 16, type: 'normal', text: '  const cached = await redis.get("dash_stats");' },
            { lineNumL: null, lineNumR: 17, type: 'addition', text: '  if (cached) return JSON.parse(cached);' },
            { lineNumL: null, lineNumR: 18, type: 'addition', text: '' },
            { lineNumL: null, lineNumR: 19, type: 'addition', text: '  // Cache miss, compute heavy aggregations' },
            { lineNumL: 17, lineNumR: 20, type: 'normal', text: '  const stats = await db.query("SELECT ... heavy math ...");' },
            { lineNumL: null, lineNumR: 21, type: 'addition', text: '  await redis.setex("dash_stats", 600, JSON.stringify(stats));' },
            { lineNumL: null, lineNumR: 22, type: 'addition', text: '' },
            { lineNumL: 18, lineNumR: 23, type: 'normal', text: '  return stats;' },
            { lineNumL: 19, lineNumR: 24, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'cache_stampede', label: 'Cache Stampede', sub: 'Concurrent misses overload the database' },
            { value: 'race_condition', label: 'Redis Race Condition', sub: 'Setex overwrites newer cache values' },
            { value: 'memory_leak', label: 'Memory Leak', sub: 'Stringifying large objects blocks V8' },
            { value: 'stale_read', label: 'Stale Read', sub: 'TTL is too long for realtime data' },
        ],
        correctBugType: 'cache_stampede',
        successExplanation: "Exactly. The code assumes requests happen sequentially. Under high load, 1,000 requests can hit the cache miss before the first DB query resolves. All 1,000 requests query the database, bringing it down. This is the Thundering Herd problem. You must implement request coalescing (storing the Promise in a local map) or a distributed lock so only one worker rebuilds the cache.",
        failExplanation: "The flaw is an architectural scaling issue: Cache Stampede. Because the DB query takes a long time, thousands of incoming requests will see `cached` as `null` and execute the DB query simultaneously. You need a mechanism to deduplicate inflight cache misses."
    },
};

export default challenge;
