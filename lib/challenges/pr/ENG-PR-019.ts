import type { Challenge } from '../types';
// ─── ENG-PR-019 ─────────────────────────────────────────────────────────────────

const challenge: Challenge = {
    id: 'ENG-PR-019',
    type: 'PR Review',
    badgeClass: 'badge-pr-pro',
    title: 'The Floating Promise Crash',
    companies: ['Netflix', 'Cloudflare'],
    timeEst: '~10 min',
    level: 'Mid-Level',
    status: 'Not Started',
    desc: 'A dev added a telemetry logger to an Express route. Occasionally, the entire Node.js process crashes with `UnhandledPromiseRejection`. The crash only happens when the external logging service is down.',
    solution: 'The developer is calling an async function (`logger.track`) but not awaiting it or adding a `.catch()`. If that promise rejects (e.g., the logging service is down), it becomes a "floating promise" with no rejection handler. In modern Node.js, an unhandled rejection terminates the process. Fix: either await the call or add a `.catch(err => ...)` to handle logging failures gracefully.',
    prReview: {
        prNumber: 301,
        prAuthor: 'mid-dev-44',
        prFile: 'src/routes/user.ts',
        background: 'Adding analytics to track user login frequency.',
        hints: [
            'What happens if `logger.trackLogin` fails?',
            'Is there any code waiting for the result of line 12?',
            'Does Express catch errors from promises that aren\'t returned or awaited?'
        ],
        diff: [
            { lineNumL: 10, lineNumR: 10, type: 'normal', text: 'router.post("/login", async (req, res) => {' },
            { lineNumL: 11, lineNumR: 11, type: 'normal', text: '  const user = await AuthService.login(req.body);' },
            { lineNumL: null, lineNumR: 12, type: 'addition', text: '  // Fire and forget telemetry' },
            { lineNumL: null, lineNumR: 13, type: 'addition', text: '  logger.trackLogin(user.id);' },
            { lineNumL: 12, lineNumR: 14, type: 'normal', text: '  res.json(user);' },
            { lineNumL: 13, lineNumR: 15, type: 'normal', text: '});' },
        ],
        bugOptions: [
            { value: 'floating_promise', label: 'Floating Promise', sub: 'Async call has no error handler' },
            { value: 'blocking_io', label: 'Blocking Event Loop', sub: 'Logger blocks the response' },
            { value: 'memory_leak', label: 'Memory Leak', sub: 'Promises piling up in queue' },
        ],
        correctBugType: 'floating_promise',
        successExplanation: "Spot on. Even if you don't want to wait for the logger to finish before responding to the user, you *must* handle potential errors. An unhandled rejection in a floating promise will crash the entire Node.js process. Fix: `logger.trackLogin(user.id).catch(err => console.error(err))`.",
        failExplanation: "The bug is on line 13. By calling an async function without `await` or a `.catch()`, you've created a floating promise. If the logger fails, there's nothing to catch the error, leading to an `UnhandledPromiseRejection` which kills the server."
    },
};

export default challenge;