import { Challenge } from "../types";
// â”€â”€â”€ ENG-PR-031 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const challenge: Challenge = {
    id: 'ENG-PR-031',
    type: 'PR Review',
    badgeClass: 'badge-pr-lead',
    title: 'Microtask Queue Starvation',
    companies: ['Netflix', 'Vercel'],
    timeEst: '~15 min',
    level: 'Senior',
    status: 'Not Started',
    desc: 'A developer wrote an async recursive function to poll a queue until itâ€™s empty. Under high load, the function loops infinitely. The strange part? The Node.js server stops answering HTTP requests, and `setTimeout` callbacks never fire. The event loop is completely frozen, despite using `async/await`.',
    solution: 'Promises resolve on the V8 "microtask" queue. Microtasks are processed exhaustively before the event loop is allowed to move on to the "macrotask" queue (timers, I/O, network requests). A recursive `await Promise.resolve()` chain creates an infinite loop in the microtask queue, entirely starving the event loop. Fix: Add a `await new Promise(r => setImmediate(r))` to yield back to the event loop.',
    prReview: {
        prNumber: 66,
        prBranch: 'perf/queue-drainer',
        prBase: 'main',
        prAuthor: 'senior-dev-11',
        prFile: 'src/workers/drainer.ts',
        background: 'Draining an in-memory queue as fast as possible without blocking (or so they thought).',
        prAge: '2 hours ago',
        changes: 'See diff below for the specific lines introduced in this PR.',
        testing: 'No automated tests were added with this change.',
        hints: [
            'When an awaited promise resolves, does it yield to I/O immediately, or does it queue a microtask?',
            'If a function continuously adds microtasks to the microtask queue, when does the event loop process HTTP requests?',
            'Is `async/await` completely non-blocking, or does it have priority queues?'
        ],
        diff: [
            { lineNumL: 10, lineNumR: 10, type: 'normal', text: 'export async function drainQueue() {' },
            { lineNumL: 11, lineNumR: 11, type: 'normal', text: '  const task = memoryQueue.pop();' },
            { lineNumL: null, lineNumR: 12, type: 'addition', text: '  if (!task) return;' },
            { lineNumL: null, lineNumR: 13, type: 'addition', text: '' },
            { lineNumL: null, lineNumR: 14, type: 'addition', text: '  // Process task (fast, synchronous in-memory work)' },
            { lineNumL: null, lineNumR: 15, type: 'addition', text: '  processTask(task);' },
            { lineNumL: null, lineNumR: 16, type: 'addition', text: '' },
            { lineNumL: null, lineNumR: 17, type: 'addition', text: '  // Recursively drain the rest using await to "not block"' },
            { lineNumL: null, lineNumR: 18, type: 'addition', text: '  await Promise.resolve();' },
            { lineNumL: null, lineNumR: 19, type: 'addition', text: '  return drainQueue();' },
            { lineNumL: 13, lineNumR: 20, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'microtask_starvation', label: 'Microtask Starvation', sub: 'Infinite microtasks freeze the event loop' },
            { value: 'stack_overflow', label: 'Stack Overflow', sub: 'Recursion exceeds call stack size' },
            { value: 'memory_leak', label: 'Memory Leak', sub: 'Promises pile up in memory' },
            { value: 'stale_closure', label: 'Stale Closure', sub: 'memoryQueue reference is lost' },
        ],
        correctBugType: 'microtask_starvation',
        successExplanation: "Exactly. This is a deep V8 engine quirk. `Promise.resolve()` queues a microtask. V8 will not proceed to the macrotask queue (I/O, timers, HTTP) until the microtask queue is completely empty. Recursive microtasks essentially freeze the server just like a `while(true)` loop. Use `setImmediate` to yield to the macrotask queue.",
        failExplanation: "The bug is Microtask Queue Starvation. Awaiting a resolved promise simply places the continuation on the microtask queue. Since V8 drains the *entire* microtask queue before handling any new HTTP requests or timers, a recursive loop of resolved promises will completely lock up the Node.js event loop without throwing a stack overflow."
    },
};

export default challenge;