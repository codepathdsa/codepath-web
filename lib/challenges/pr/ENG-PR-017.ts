import type { Challenge } from '../types';
// â”€â”€â”€ ENG-PR-017 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const challenge: Challenge = {
    id: 'ENG-PR-017',
    type: 'PR Review',
    badgeClass: 'badge-pr-pro',
    title: 'Optimistic Locking Failure',
    companies: ['Amazon', 'eBay'],
    timeEst: '~15 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'In a high-traffic "Edit Product" screen, users are complaining that their changes are "vanishing." If two admins edit the same product at once, the one who clicks save last wins, completely overwriting the first adminâ€™s work without warning.',
    solution: 'The code lacks concurrency control. It uses a blind UPDATE. Fix: Implement Optimistic Locking. Add a `version` or `updated_at` column to the WHERE clause. If the version in the DB has changed since the user loaded the page, the update will affect 0 rows, allowing us to throw a "Conflict" error.',
    prReview: {
        prNumber: 420,
        prBranch: 'fix/product-overwrites',
        prBase: 'main',
        prAuthor: 'mid-dev-44',
        prFile: 'src/db/product.repo.ts',
        background: 'Updating product details like price and stock.',
        prAge: '2 hours ago',
        changes: 'See diff below for the specific lines introduced in this PR.',
        testing: 'No automated tests were added with this change.',
        hints: [
            'What happens if User A and User B both load the same record, but User A saves first?',
            'How does the current SQL query know if the data has changed since it was last read?',
            'How can we use the `version` column to ensure we only update if the data is exactly as we saw it?'
        ],
        diff: [
            { lineNumL: 10, lineNumR: 10, type: 'normal', text: 'async function updateProduct(id: string, data: ProductUpdate) {' },
            { lineNumL: 11, lineNumR: 11, type: 'normal', text: '  const { name, price, version } = data;' },
            { lineNumL: 12, lineNumR: 12, type: 'normal', text: '  await db.query(' },
            { lineNumL: 13, lineNumR: null, type: 'deletion', text: '    "UPDATE products SET name = $1, price = $2 WHERE id = $3",' },
            { lineNumL: 14, lineNumR: null, type: 'deletion', text: '    [name, price, id]' },
            { lineNumL: null, lineNumR: 13, type: 'addition', text: '    "UPDATE products SET name = $1, price = $2, version = version + 1 ' },
            { lineNumL: null, lineNumR: 14, type: 'addition', text: '     WHERE id = $3 AND version = $4",' },
            { lineNumL: null, lineNumR: 15, type: 'addition', text: '    [name, price, id, version]' },
            { lineNumL: 15, lineNumR: 16, type: 'normal', text: '  );' },
            { lineNumL: null, lineNumR: 17, type: 'addition', text: '  // BUG: What if the update failed because the version was wrong?' },
            { lineNumL: 16, lineNumR: 18, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'race_condition', label: 'Lost Update', sub: 'Concurrent writes overwrite each other' },
            { value: 'deadlock', label: 'Database Deadlock', sub: 'Two transactions locking each other' },
            { value: 'integrity_error', label: 'Integrity Violation', sub: 'Constraint failed on version column' },
        ],
        correctBugType: 'race_condition',
        successExplanation: "Perfect. This is the 'Lost Update' problem. By adding `AND version = $4` to the WHERE clause, the query becomes conditional. If `affectedRows` is 0, it means someone else updated the product while the current user was editing. You must check the result of the query and return a 409 Conflict to the user.",
        failExplanation: "This is a Lost Update race condition. Even though the dev added a version check, the function still doesn't *check* if the update actually happened. If the versions don't match, the DB does nothing, and the code continues as if it succeeded. You need to verify that `result.rowCount === 1`."
    },
};

export default challenge;