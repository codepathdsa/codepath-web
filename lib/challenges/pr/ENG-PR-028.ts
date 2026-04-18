
// â”€â”€â”€ ENG-PR-028 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

import { Challenge } from "../types";

const challenge: Challenge = {
    id: 'ENG-PR-028',
    type: 'PR Review',
    badgeClass: 'badge-pr-pro',
    title: 'The Hidden O(N) Pagination Death',
    companies: ['Twitter', 'Discord'],
    timeEst: '~12 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'A classic "Page 1 of X" pagination works perfectly for most users. However, when power users try to load Page 5,000 of their audit logs, the database CPU spikes and the request times out.',
    solution: 'Using large `OFFSET` values in SQL is secretly an O(N) operation. To satisfy `OFFSET 100000 LIMIT 50`, the database must fetch, sort, and discard 100,000 rows before returning the final 50. Fix: Use "Cursor-based" pagination (e.g., `WHERE id < ? LIMIT 50`) which can instantly jump to the correct row using indexes.',
    prReview: {
        prNumber: 520,
        prBranch: 'feat/audit-log-pagination',
        prBase: 'main',
        prAuthor: 'mid-dev-44',
        prFile: 'src/repositories/auditLog.ts',
        background: 'Paginating millions of audit logs to display in an admin data grid.',
        prAge: '2 hours ago',
        changes: 'See diff below for the specific lines introduced in this PR.',
        testing: 'No automated tests were added with this change.',
        hints: [
            'How does PostgreSQL execute an `OFFSET` command?',
            'If the user requests page 10,000, how many rows does the database process to return the 50 results?',
            'How could we use the `id` or `created_at` column to jump directly to the correct page?'
        ],
        diff: [
            { lineNumL: 5, lineNumR: 5, type: 'normal', text: 'export async function getAuditLogs(page: number = 1) {' },
            { lineNumL: 6, lineNumR: 6, type: 'normal', text: '  const limit = 50;' },
            { lineNumL: null, lineNumR: 7, type: 'addition', text: '  const offset = (page - 1) * limit;' },
            { lineNumL: 7, lineNumR: 8, type: 'normal', text: '' },
            { lineNumL: 8, lineNumR: 9, type: 'normal', text: '  const result = await db.query(' },
            { lineNumL: null, lineNumR: 10, type: 'addition', text: '    `SELECT * FROM audit_logs ' },
            { lineNumL: null, lineNumR: 11, type: 'addition', text: '     ORDER BY created_at DESC ' },
            { lineNumL: null, lineNumR: 12, type: 'addition', text: '     LIMIT $1 OFFSET $2`,' },
            { lineNumL: null, lineNumR: 13, type: 'addition', text: '    [limit, offset]' },
            { lineNumL: 12, lineNumR: 14, type: 'normal', text: '  );' },
            { lineNumL: 13, lineNumR: 15, type: 'normal', text: '  return result.rows;' },
            { lineNumL: 14, lineNumR: 16, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'offset_performance', label: 'OFFSET Performance', sub: 'Large offsets degrade to O(N) scan' },
            { value: 'sql_injection', label: 'SQL Injection', sub: 'Page number not sanitized' },
            { value: 'missing_index', label: 'Missing Index', sub: 'created_at cannot be sorted quickly' },
            { value: 'floating_point', label: 'Float Precision', sub: 'Math creates floating offsets' },
        ],
        correctBugType: 'offset_performance',
        successExplanation: "Spot on. `OFFSET` forces the DB to read and discard every row up to the offset amount. For `OFFSET 500000`, the DB processes 500,000 rows just to give you 50. For deep pagination on large tables, you must move to cursor-based pagination (Seek Method) relying on an indexed column: `WHERE created_at < cursor LIMIT 50`.",
        failExplanation: "The bug is the architectural choice of using `OFFSET`. SQL databases evaluate `OFFSET` by scanning through all preceding rows. As `page` grows, performance decreases linearly (O(N)). The query will eventually time out on large tables. You should flag this and recommend cursor-based pagination."
    },
};

export default challenge;