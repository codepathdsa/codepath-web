import type { Challenge } from '../types';
// ─── ENG-PR-024 ─────────────────────────────────────────────────────────────────

const challenge: Challenge = {
    id: 'ENG-PR-024',
    type: 'PR Review',
    badgeClass: 'badge-pr-pro',
    title: 'Deadlock in Multi-Table Updates',
    companies: ['Uber', 'Datadog'],
    timeEst: '~15 min',
    level: 'Mid-Level',
    status: 'Not Started',
    desc: 'During flash sales, the database logs throw `Deadlock found when trying to get lock; try restarting transaction`. The `cancelOrder` service and the `fulfillOrder` service are crashing each other.',
    solution: 'The two services are taking out row locks in opposing orders. `fulfillOrder` updates `Orders` then `Inventory`. `cancelOrder` updates `Inventory` then `Orders`. If both run simultaneously, Service A locks Orders and waits for Inventory, while Service B locks Inventory and waits for Orders. Fix: Always lock tables in the exact same alphabetical or hierarchical order across the entire application.',
    prReview: {
        prNumber: 802,
        prBranch: 'feat/order-cancellation',
        prBase: 'main',
        prAuthor: 'mid-dev-44',
        prFile: 'src/services/cancellation.ts',
        background: 'Restoring inventory when a user cancels an unfulfilled order.',
        hints: [
            'The fulfillment service updates the `Orders` table FIRST, then `Inventory`.',
            'What happens if Transaction A locks `Orders` and Transaction B locks `Inventory` at the exact same millisecond?',
            'How does the order of SQL statements affect database row-level locking?'
        ],
        diff: [
            { lineNumL: 10, lineNumR: 10, type: 'normal', text: 'export async function cancelOrder(orderId: string, itemId: string) {' },
            { lineNumL: 11, lineNumR: 11, type: 'normal', text: '  const client = await db.getClient();' },
            { lineNumL: 12, lineNumR: 12, type: 'normal', text: '  try {' },
            { lineNumL: 13, lineNumR: 13, type: 'normal', text: '    await client.query("BEGIN");' },
            { lineNumL: null, lineNumR: 14, type: 'addition', text: '    // Restore inventory first' },
            { lineNumL: null, lineNumR: 15, type: 'addition', text: '    await client.query(' },
            { lineNumL: null, lineNumR: 16, type: 'addition', text: '      "UPDATE inventory SET stock = stock + 1 WHERE item_id = $1", [itemId]' },
            { lineNumL: null, lineNumR: 17, type: 'addition', text: '    );' },
            { lineNumL: null, lineNumR: 18, type: 'addition', text: '    // Mark order as cancelled' },
            { lineNumL: null, lineNumR: 19, type: 'addition', text: '    await client.query(' },
            { lineNumL: null, lineNumR: 20, type: 'addition', text: '      "UPDATE orders SET status = \'cancelled\' WHERE id = $1", [orderId]' },
            { lineNumL: null, lineNumR: 21, type: 'addition', text: '    );' },
            { lineNumL: 14, lineNumR: 22, type: 'normal', text: '    await client.query("COMMIT");' },
            { lineNumL: 15, lineNumR: 23, type: 'normal', text: '  } catch (e) {' },
            { lineNumL: 16, lineNumR: 24, type: 'normal', text: '    await client.query("ROLLBACK");' },
            { lineNumL: 17, lineNumR: 25, type: 'normal', text: '    throw e;' },
            { lineNumL: 18, lineNumR: 26, type: 'normal', text: '  } finally {' },
            { lineNumL: 19, lineNumR: 27, type: 'normal', text: '    client.release();' },
            { lineNumL: 20, lineNumR: 28, type: 'normal', text: '  }' },
            { lineNumL: 21, lineNumR: 29, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'deadlock', label: 'Locking Deadlock', sub: 'Inconsistent lock ordering across services' },
            { value: 'sql_injection', label: 'SQL Injection', sub: 'Inputs not sanitized properly' },
            { value: 'connection_leak', label: 'Connection Leak', sub: 'Client not released on error' },
            { value: 'dirty_read', label: 'Dirty Read', sub: 'Missing isolation level' },
        ],
        correctBugType: 'deadlock',
        successExplanation: "Correct. Database deadlocks almost always happen because of inconsistent lock ordering. If one service updates Orders -> Inventory, and this service updates Inventory -> Orders, concurrent requests will cross-lock each other resulting in a DB-level crash. Always update resources in a globally agreed-upon order.",
        failExplanation: "The bug is a database deadlock caused by lock ordering. By updating Inventory *then* Orders, this transaction locks in the reverse order of the fulfillment service (which updates Orders *then* Inventory). If both run simultaneously, neither can proceed, and the database kills one of the transactions."
    },
};

export default challenge;