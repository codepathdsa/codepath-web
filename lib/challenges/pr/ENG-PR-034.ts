import { Challenge } from "../types";
// â”€â”€â”€ ENG-PR-034 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const challenge: Challenge = {
    id: 'ENG-PR-034',
    type: 'PR Review',
    badgeClass: 'badge-pr-lead',
    title: 'Floating Point Loss on 64-bit IDs',
    companies: ['Twitter', 'Discord'],
    timeEst: '~10 min',
    level: 'Senior',
    status: 'Not Started',
    desc: 'You recently migrated the primary key of the Users table from an auto-incrementing integer to a 64-bit Twitter Snowflake ID for horizontal scale. The backend works fine, but the React frontend keeps throwing 404s when users try to visit their own profiles.',
    solution: 'JavaScript represents all Numbers as 64-bit floating point, meaning it can only safely represent integers up to `2^53 - 1` (`Number.MAX_SAFE_INTEGER`). A 64-bit Snowflake ID exceeds this limit. When `JSON.parse` encounters the ID, it rounds the last few digits, corrupting the ID. Fix: Cast the Snowflake ID to a string at the API boundary, or use a custom JSON parser with `BigInt`.',
    prReview: {
        prNumber: 388,
        prBranch: 'feat/snowflake-ids',
        prBase: 'main',
        prAuthor: 'senior-dev-11',
        prFile: 'src/api/userController.ts',
        background: 'Returning user data with the new 64-bit Snowflake IDs.',
        prAge: '2 hours ago',
        changes: 'See diff below for the specific lines introduced in this PR.',
        testing: 'No automated tests were added with this change.',
        hints: [
            'What happens if you type `9223372036854775807` into the Chrome JS console?',
            'What is `Number.MAX_SAFE_INTEGER` in JavaScript?',
            'How does standard `res.json()` serialize 64-bit numbers?'
        ],
        diff: [
            { lineNumL: 20, lineNumR: 20, type: 'normal', text: 'export async function getUser(req: Request, res: Response) {' },
            { lineNumL: 21, lineNumR: 21, type: 'normal', text: '  const userId = req.params.id;' },
            { lineNumL: 22, lineNumR: 22, type: 'normal', text: '  ' },
            { lineNumL: null, lineNumR: 23, type: 'addition', text: '  // DB driver returns BigInt for 64-bit integers' },
            { lineNumL: null, lineNumR: 24, type: 'addition', text: '  const user = await db.query("SELECT id, name FROM users WHERE id = $1", [userId]);' },
            { lineNumL: null, lineNumR: 25, type: 'addition', text: '' },
            { lineNumL: null, lineNumR: 26, type: 'addition', text: '  // Convert BigInt to Number for JSON serialization' },
            { lineNumL: null, lineNumR: 27, type: 'addition', text: '  const responseData = {' },
            { lineNumL: null, lineNumR: 28, type: 'addition', text: '    id: Number(user.id),' },
            { lineNumL: null, lineNumR: 29, type: 'addition', text: '    name: user.name' },
            { lineNumL: null, lineNumR: 30, type: 'addition', text: '  };' },
            { lineNumL: 23, lineNumR: 31, type: 'normal', text: '  ' },
            { lineNumL: 24, lineNumR: 32, type: 'normal', text: '  res.json(responseData);' },
            { lineNumL: 25, lineNumR: 33, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'precision_loss', label: 'Precision Loss', sub: 'Numbers > 2^53 lose precision in JS' },
            { value: 'sql_injection', label: 'SQL Injection', sub: 'User ID is not cast properly' },
            { value: 'bigint_error', label: 'TypeError on BigInt', sub: 'BigInt cannot be serialized to JSON' },
            { value: 'type_coercion', label: 'Type Coercion', sub: 'req.params.id is a string, query expects int' },
        ],
        correctBugType: 'precision_loss',
        successExplanation: "Correct. JavaScript Numbers are IEEE 754 floats. They lose integer precision above `9007199254740991`. Snowflake IDs (like Twitter or Discord IDs) are typically around 18-19 digits long. By casting `Number(user.id)`, the last 3-4 digits are silently zeroed/rounded out, completely changing the user's ID. You must serialize 64-bit IDs as Strings: `id: String(user.id)`.",
        failExplanation: "The bug is JS Floating Point Precision Loss. Line 28 casts a 64-bit integer to a JavaScript `Number`. JS max safe integer is 53 bits. The number gets silently rounded, corrupting the ID before it's sent to the client. The fix is to cast the `BigInt` to a `String` before JSON serialization."
    },
};
export default challenge;