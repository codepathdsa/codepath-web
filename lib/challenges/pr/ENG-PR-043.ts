// ─── ENG-PR-043 ─────────────────────────────────────────────────────────────────
import type { Challenge } from '../types';
const challenge: Challenge = {
    id: 'ENG-PR-043',
    type: 'PR Review',
    badgeClass: 'badge-pr-lead',
    title: 'Write Skew (Isolation Level Failure)',
    companies: ['Palantir', 'Stripe'],
    timeEst: '~15 min',
    level: 'Senior',
    status: 'Not Started',
    desc: 'An on-call scheduling app enforces a business rule: "There must always be at least 1 doctor on call." During a shift change, Doctor A and Doctor B both try to drop their shifts simultaneously. Due to a race condition, both requests succeed, leaving 0 doctors on call.',
    solution: 'This is the "Write Skew" anomaly. Under PostgreSQL\'s default `READ COMMITTED` or even `REPEATABLE READ` isolation levels, two concurrent transactions both run `SELECT count(*)`. Both see 2 doctors. Both evaluate `2 - 1 >= 1` as true, and both DELETE their rows. Fix: Use `SERIALIZABLE` isolation level, or use explicit row-level locking (`SELECT ... FOR UPDATE`), or write the constraint directly into the schema.',
    prReview: {
        prNumber: 15,
        prBranch: 'feat/shift-drop',
        prBase: 'main',
        prAuthor: 'senior-dev-11',
        prFile: 'src/services/schedule.ts',
        background: 'A transaction dropping a shift while ensuring coverage limits.',
        hints: [
            'If Tx 1 and Tx 2 run `SELECT count(*)` at the exact same time, what do they both see?',
            'Does standard `BEGIN` block other transactions from reading the table?',
            'How does standard Postgres handle two transactions making decisions based on data that hasn\'t been modified yet?'
        ],
        diff: [
            { lineNumL: 10, lineNumR: 10, type: 'normal', text: 'export async function dropShift(doctorId: string, date: string) {' },
            { lineNumL: 11, lineNumR: 11, type: 'normal', text: '  const client = await pool.connect();' },
            { lineNumL: 12, lineNumR: 12, type: 'normal', text: '  try {' },
            { lineNumL: null, lineNumR: 13, type: 'addition', text: '    await client.query("BEGIN"); // Uses default READ COMMITTED' },
            { lineNumL: null, lineNumR: 14, type: 'addition', text: '    ' },
            { lineNumL: null, lineNumR: 15, type: 'addition', text: '    const result = await client.query(' },
            { lineNumL: null, lineNumR: 16, type: 'addition', text: '      "SELECT count(*) as total FROM shifts WHERE date = $1", [date]' },
            { lineNumL: null, lineNumR: 17, type: 'addition', text: '    );' },
            { lineNumL: null, lineNumR: 18, type: 'addition', text: '    if (result.rows[0].total <= 1) throw new Error("Need 1 doctor");' },
            { lineNumL: null, lineNumR: 19, type: 'addition', text: '    ' },
            { lineNumL: null, lineNumR: 20, type: 'addition', text: '    await client.query("DELETE FROM shifts WHERE doctor_id = $1", [doctorId]);' },
            { lineNumL: 13, lineNumR: 21, type: 'normal', text: '    await client.query("COMMIT");' },
            { lineNumL: 14, lineNumR: 22, type: 'normal', text: '  } finally {' },
            { lineNumL: 15, lineNumR: 23, type: 'normal', text: '    client.release();' },
            { lineNumL: 16, lineNumR: 24, type: 'normal', text: '  }' },
            { lineNumL: 17, lineNumR: 25, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'write_skew', label: 'Write Skew', sub: 'Isolation level allows concurrent condition bypass' },
            { value: 'phantom_read', label: 'Phantom Read', sub: 'Concurrent inserts alter the row count' },
            { value: 'deadlock', label: 'Deadlock', sub: 'Two deletes lock the entire table' },
            { value: 'dirty_read', label: 'Dirty Read', sub: 'Reads uncommitted data from other Tx' },
        ],
        correctBugType: 'write_skew',
        successExplanation: "Excellent. This is 'Write Skew'. A standard transaction (`READ COMMITTED` or `REPEATABLE READ`) does not lock rows on a simple `SELECT`. Both doctors see 2 total shifts, and both proceed to delete their own rows, resulting in 0 coverage. You must either use `SERIALIZABLE` isolation, or lock the specific day's schedule using a row-level lock (like `SELECT * FROM schedule_days WHERE date = $1 FOR UPDATE`).",
        failExplanation: "The flaw is the 'Write Skew' transaction anomaly. Because `BEGIN` defaults to `READ COMMITTED`, concurrent transactions are allowed to read the same `count(*)`. Both read '2', and both delete a row, dropping the count to 0. You need `SERIALIZABLE` isolation or explicit pessimistic locking (`FOR UPDATE`) to prevent this."
    },
};
export default challenge;