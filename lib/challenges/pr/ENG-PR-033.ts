import { Challenge } from "../types";
// ─── ENG-PR-033 ─────────────────────────────────────────────────────────────────

const challenge: Challenge = {
    id: 'ENG-PR-033',
    type: 'PR Review',
    badgeClass: 'badge-pr-lead',
    title: 'Redis Distributed Lock Flaw',
    companies: ['Uber', 'Airbnb'],
    timeEst: '~15 min',
    level: 'Senior',
    status: 'Not Started',
    desc: 'You implemented a distributed lock using Redis to prevent concurrent background jobs. However, logs show that occasionally, two workers are running the critical section at the exact same time, corrupting user balances.',
    solution: 'When releasing the lock, the code unconditionally calls `redis.del()`. If Worker A acquires the lock but experiences a large GC pause or CPU delay, the lock might expire via TTL. Worker B acquires the lock. Worker A then wakes up, finishes its work, and blindly deletes the lock—which now belongs to Worker B! Worker C then acquires the lock. Fix: When acquiring, store a UUID. When deleting, use a Lua script to check if the value matches the UUID before deleting.',
    prReview: {
        prNumber: 742,
        prBranch: 'feat/redis-distributed-lock',
        prBase: 'main',
        prAuthor: 'senior-dev-11',
        prFile: 'src/utils/redisLock.ts',
        background: 'Acquiring an exclusive lock before processing a financial transaction.',
        hints: [
            'What happens if `doCriticalWork()` takes 15 seconds to run?',
            'If the lock expires after 10s, and a second worker acquires it, what happens when the first worker finally calls `redis.del(lockKey)`?',
            'How can a worker ensure it only deletes the lock if it still owns it?'
        ],
        diff: [
            { lineNumL: 10, lineNumR: 10, type: 'normal', text: 'export async function withLock(key: string, fn: () => Promise<void>) {' },
            { lineNumL: 11, lineNumR: 11, type: 'normal', text: '  const lockKey = `lock:${key}`;' },
            { lineNumL: null, lineNumR: 12, type: 'addition', text: '  const acquired = await redis.set(lockKey, "locked", "NX", "EX", 10);' },
            { lineNumL: null, lineNumR: 13, type: 'addition', text: '  if (!acquired) throw new Error("Could not acquire lock");' },
            { lineNumL: 12, lineNumR: 14, type: 'normal', text: '' },
            { lineNumL: 13, lineNumR: 15, type: 'normal', text: '  try {' },
            { lineNumL: 14, lineNumR: 16, type: 'normal', text: '    await fn(); // doCriticalWork()' },
            { lineNumL: 15, lineNumR: 17, type: 'normal', text: '  } finally {' },
            { lineNumL: null, lineNumR: 18, type: 'addition', text: '    await redis.del(lockKey); // release lock' },
            { lineNumL: 17, lineNumR: 19, type: 'normal', text: '  }' },
            { lineNumL: 18, lineNumR: 20, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'lock_release_flaw', label: 'Unsafe Lock Release', sub: 'Worker blindly deletes another worker\'s lock' },
            { value: 'deadlock', label: 'Deadlock', sub: 'Lock is never released if fn() throws' },
            { value: 'missing_retry', label: 'Missing Retry', sub: 'Fails immediately if lock is taken' },
            { value: 'clock_skew', label: 'Clock Skew', sub: 'Redis TTL relies on unsynchronized clocks' },
        ],
        correctBugType: 'lock_release_flaw',
        successExplanation: "Perfect. This is the canonical distributed lock bug. If `fn()` takes longer than 10 seconds, Redis automatically expires the lock. Worker B takes the lock. Then Worker A finishes and blindly calls `del(lockKey)`, deleting Worker B's lock! Worker C steps in, and now B and C run concurrently. Fix: Generate a UUID, set it as the value, and use a Lua script to only delete if the value matches the UUID.",
        failExplanation: "The flaw is an unsafe lock release. If the execution of `fn()` exceeds the 10-second TTL, the lock is implicitly released and grabbed by another worker. The original worker's `finally` block then blindly deletes the *new* worker's lock. To fix this, you must store a unique ID in the lock and only delete it if the ID matches."
    },
};

export default challenge;