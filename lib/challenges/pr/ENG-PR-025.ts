
// ─── ENG-PR-025 ─────────────────────────────────────────────────────────────────

import { Challenge } from "../types";

const challenge: Challenge = {
    id: 'ENG-PR-025',
    type: 'PR Review',
    badgeClass: 'badge-pr-pro',
    title: 'Heavy Computation Blocking the Event Loop',
    companies: ['Shopify', 'Vercel'],
    timeEst: '~12 min',
    level: 'Mid-Level',
    status: 'Not Started',
    desc: 'A new feature allows admins to download an audit log of 100,000+ records. The file generates successfully, but while it is downloading, the entire Node.js server becomes completely unresponsive to all other users for 3–5 seconds.',
    solution: 'Node.js is single-threaded. Running a heavy synchronous loop (`.map` and `.join` on an array of 100,000 large objects) hogs the CPU and prevents the event loop from processing incoming HTTP requests. Fix: Use `stream.Transform` to process the data in small chunks, or offload heavy data processing to a Worker Thread.',
    prReview: {
        prNumber: 112,
        prBranch: 'feat/admin-csv-export',
        prBase: 'main',
        prAuthor: 'mid-dev-44',
        prFile: 'src/routes/admin.ts',
        background: 'Generating a massive CSV export dynamically from the database.',
        hints: [
            'What happens to other HTTP requests while `logs.map(...)` is running on a massive array?',
            'Does Node.js run JavaScript code in multiple threads or a single thread?',
            'How can we send data to the user without loading and processing all 100,000 rows into memory at once?'
        ],
        diff: [
            { lineNumL: 10, lineNumR: 10, type: 'normal', text: 'router.get("/export/logs", requireAdmin, async (req, res) => {' },
            { lineNumL: 11, lineNumR: 11, type: 'normal', text: '  // Fetch 100,000+ logs' },
            { lineNumL: 12, lineNumR: 12, type: 'normal', text: '  const logs = await db.query("SELECT * FROM audit_logs");' },
            { lineNumL: 13, lineNumR: 13, type: 'normal', text: '' },
            { lineNumL: null, lineNumR: 14, type: 'addition', text: '  // Format as CSV' },
            { lineNumL: null, lineNumR: 15, type: 'addition', text: '  const csvHeader = "id,action,user_id,created_at\\n";' },
            { lineNumL: null, lineNumR: 16, type: 'addition', text: '  const csvRows = logs.rows.map(log => ' },
            { lineNumL: null, lineNumR: 17, type: 'addition', text: '    `${log.id},${log.action},${log.user_id},${log.created_at}`' },
            { lineNumL: null, lineNumR: 18, type: 'addition', text: '  ).join("\\n");' },
            { lineNumL: null, lineNumR: 19, type: 'addition', text: '' },
            { lineNumL: null, lineNumR: 20, type: 'addition', text: '  res.header("Content-Type", "text/csv");' },
            { lineNumL: null, lineNumR: 21, type: 'addition', text: '  res.send(csvHeader + csvRows);' },
            { lineNumL: 14, lineNumR: 22, type: 'normal', text: '});' },
        ],
        bugOptions: [
            { value: 'event_loop_block', label: 'Event Loop Blocked', sub: 'Synchronous array processing halts server' },
            { value: 'memory_leak', label: 'Memory Leak', sub: 'CSV string not garbage collected' },
            { value: 'missing_await', label: 'Missing Await', sub: 'DB query is not awaited properly' },
            { value: 'sql_injection', label: 'SQL Injection', sub: 'Query missing pagination' },
        ],
        correctBugType: 'event_loop_block',
        successExplanation: "Spot on. Loading 100k rows into memory and doing a synchronous `.map().join()` on them will consume the main thread's CPU for several seconds. During this time, Node.js cannot process *any* other requests. The correct architecture is to use Node.js Streams (e.g., streaming rows from DB directly to the HTTP response).",
        failExplanation: "The main issue is blocking the Node.js event loop. The `.map()` and `.join()` operations are fully synchronous CPU work. If there are 100,000 rows, this computation will freeze the single-threaded Node process, causing all other users' requests to hang until it finishes. You must use Streams."
    },
};

export default challenge;
