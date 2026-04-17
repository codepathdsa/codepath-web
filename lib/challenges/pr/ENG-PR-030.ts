import { Challenge } from "../types";

// ─── ENG-PR-030 ─────────────────────────────────────────────────────────────────

const challenge: Challenge = {
    id: 'ENG-PR-030',
    type: 'PR Review',
    badgeClass: 'badge-pr-lead',
    title: 'Connection Pool Exhaustion',
    companies: ['Stripe', 'Twilio'],
    timeEst: '~15 min',
    level: 'Senior',
    status: 'Not Started',
    desc: 'A feature processes user refunds. It opens a database transaction, calls a 3rd-party banking API, and commits. When the 3rd-party API has latency spikes (takes 10s instead of 100ms), the entire application crashes because no other service can talk to the database.',
    solution: 'The transaction holds an active connection from the database pool while waiting for a slow external network request. If 50 requests are waiting on the slow API, your 50-connection DB pool is completely exhausted. Fix: Never make slow external network calls inside a database transaction. Do the API call first, verify it, and *then* open the short-lived DB transaction.',
    prReview: {
        prNumber: 442,
        prBranch: 'feat/refund-processing',
        prBase: 'main',
        prAuthor: 'senior-dev-11',
        prFile: 'src/services/billing.ts',
        background: 'Processing a refund and updating the ledger atomically.',
        hints: [
            'While `await stripe.refunds.create(...)` is running, what is happening to the DB connection `client`?',
            'If the Postgres connection pool has a max size of 20, and 20 refunds take 5 seconds each, can the rest of the app query the database?',
            'Should external I/O be inside a database transaction?'
        ],
        diff: [
            { lineNumL: 12, lineNumR: 12, type: 'normal', text: 'export async function processRefund(paymentId: string) {' },
            { lineNumL: 13, lineNumR: 13, type: 'normal', text: '  const client = await pool.connect();' },
            { lineNumL: 14, lineNumR: 14, type: 'normal', text: '  try {' },
            { lineNumL: 15, lineNumR: 15, type: 'normal', text: '    await client.query("BEGIN");' },
            { lineNumL: null, lineNumR: 16, type: 'addition', text: '    const payment = await getPayment(client, paymentId);' },
            { lineNumL: null, lineNumR: 17, type: 'addition', text: '    // Call third-party banking API' },
            { lineNumL: null, lineNumR: 18, type: 'addition', text: '    const refund = await stripe.refunds.create({ charge: payment.stripeId });' },
            { lineNumL: null, lineNumR: 19, type: 'addition', text: '    ' },
            { lineNumL: null, lineNumR: 20, type: 'addition', text: '    await client.query("UPDATE payments SET status = \'refunded\' WHERE id = $1", [paymentId]);' },
            { lineNumL: 16, lineNumR: 21, type: 'normal', text: '    await client.query("COMMIT");' },
            { lineNumL: 17, lineNumR: 22, type: 'normal', text: '    return refund;' },
            { lineNumL: 18, lineNumR: 23, type: 'normal', text: '  } catch (e) {' },
            { lineNumL: 19, lineNumR: 24, type: 'normal', text: '    await client.query("ROLLBACK");' },
            { lineNumL: 20, lineNumR: 25, type: 'normal', text: '  } finally {' },
            { lineNumL: 21, lineNumR: 26, type: 'normal', text: '    client.release();' },
            { lineNumL: 22, lineNumR: 27, type: 'normal', text: '  }' },
            { lineNumL: 23, lineNumR: 28, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'pool_exhaustion', label: 'Pool Exhaustion', sub: 'Holding DB connection during slow I/O' },
            { value: 'missing_idempotency', label: 'Missing Idempotency', sub: 'Refund can be processed twice' },
            { value: 'unhandled_rejection', label: 'Unhandled Rejection', sub: 'Stripe API throws uncatchable error' },
            { value: 'deadlock', label: 'Database Deadlock', sub: 'Transaction ordering mismatch' },
        ],
        correctBugType: 'pool_exhaustion',
        successExplanation: "Perfect. This is a classic distributed systems anti-pattern. Database transactions must be as fast and localized as possible. Awaiting a 3rd-party HTTP call inside a transaction holds a connection pool slot hostage. If the API degrades, your entire app’s database pool drops to zero available connections, causing a total system outage. Perform the API call outside the transaction.",
        failExplanation: "The bug is connection pool exhaustion. Line 18 awaits an external network call while holding an open database transaction (and thus, a connection from the pool). A small spike in Stripe latency will quickly tie up all available DB connections, bringing down the entire application."
    },
};

export default challenge;