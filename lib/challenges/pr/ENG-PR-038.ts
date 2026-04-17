// ─── ENG-PR-038 ─────────────────────────────────────────────────────────────────
import type { Challenge } from '../types';
const challenge: Challenge = {
    id: 'ENG-PR-038',
    type: 'PR Review',
    badgeClass: 'badge-pr-lead',
    title: 'DB Index Prefixing Failure',
    companies: ['Datadog', 'GitLab'],
    timeEst: '~12 min',
    level: 'Senior',
    status: 'Not Started',
    desc: 'A query to fetch a user\'s unread notifications `WHERE user_id = $1 AND is_read = false` is taking 5 seconds. The developer added a composite index on `(is_read, user_id)` to fix it, but EXPLAIN ANALYZE shows a full table scan is still occurring.',
    solution: 'The order of columns in a composite index matters immensely. An index on `(is_read, user_id)` groups by boolean first. Because `is_read` has incredibly low cardinality (only true/false), the database query planner determines that using the index is just as slow as scanning the whole table. Fix: Order composite indexes by highest cardinality first: `(user_id, is_read)`.',
    prReview: {
        prNumber: 211,
        prBranch: 'perf/notification-index',
        prBase: 'main',
        prAuthor: 'senior-dev-11',
        prFile: 'migrations/20260417_add_index.sql',
        background: 'Optimizing a slow query: SELECT * FROM notifications WHERE user_id = X AND is_read = false.',
        hints: [
            'What is the cardinality (number of unique values) of `is_read` vs `user_id`?',
            'If you sort a phonebook by "Has Glasses (Yes/No)" and then "Last Name", how useful is the index to find "Smith"?',
            'How does the PostgreSQL query planner decide whether to use an index?'
        ],
        diff: [
            { lineNumL: 1, lineNumR: 1, type: 'normal', text: '-- Up Migration' },
            { lineNumL: 2, lineNumR: null, type: 'deletion', text: '-- No index existed previously' },
            { lineNumL: null, lineNumR: 2, type: 'addition', text: 'CREATE INDEX idx_notifications_unread' },
            { lineNumL: null, lineNumR: 3, type: 'addition', text: '  ON notifications (is_read, user_id);' },
            { lineNumL: 3, lineNumR: 4, type: 'normal', text: '' },
            { lineNumL: 4, lineNumR: 5, type: 'normal', text: '-- Down Migration' },
            { lineNumL: null, lineNumR: 6, type: 'addition', text: 'DROP INDEX idx_notifications_unread;' },
        ],
        bugOptions: [
            { value: 'cardinality_order', label: 'Index Cardinality', sub: 'Low cardinality column placed first' },
            { value: 'missing_include', label: 'Missing INCLUDE', sub: 'Needs covering index for SELECT *' },
            { value: 'btree_limit', label: 'B-Tree Limitation', sub: 'Booleans cannot be indexed in Postgres' },
            { value: 'left_prefix', label: 'Left Prefix Violation', sub: 'Query omitting the first index column' },
        ],
        correctBugType: 'cardinality_order',
        successExplanation: "Spot on. The index structure is basically a tree. By putting `is_read` (a boolean) first, the tree splits into two massive branches. Since half the table might be `is_read = false`, the Postgres Query Planner calculates that reading the index + looking up the heap is actually *slower* than a sequential table scan. Always put high-cardinality columns (like `user_id`) first in a composite index.",
        failExplanation: "The bug is incorrect index column ordering. Composite indexes should place the column with the highest cardinality (most unique values) first. `user_id` is highly unique, `is_read` only has 2 values. Because `is_read` is first, the index is practically useless to the DB query planner. Switch it to `(user_id, is_read)`."
    },
};

export default challenge;