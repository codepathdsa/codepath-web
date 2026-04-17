// ─── ENG-PR-042 ─────────────────────────────────────────────────────────────────
import type { Challenge } from '../types';
const challenge: Challenge = {
    id: 'ENG-PR-042',
    type: 'PR Review',
    badgeClass: 'badge-pr-lead',
    title: 'DynamoDB Eventual Consistency Trap',
    companies: ['Amazon', 'Netflix'],
    timeEst: '~12 min',
    level: 'Senior',
    status: 'Not Started',
    desc: 'A user updates their profile picture. The app redirects them to their profile page, but the old picture is still showing. A refresh fixes it. This happens 10% of the time. The database uses DynamoDB with a Global Secondary Index (GSI).',
    solution: 'Global Secondary Indexes in DynamoDB (and many NoSQL databases) are strictly Eventually Consistent. The code writes to the main table, then immediately redirects the user to a page that queries the GSI. The replication to the GSI takes 10-100ms, meaning a fast read will return stale data. Fix: Query the main table using strongly consistent reads, or have the client handle the optimistic UI update.',
    prReview: {
        prNumber: 88,
        prBranch: 'feat/update-profile-pic',
        prBase: 'main',
        prAuthor: 'senior-dev-11',
        prFile: 'src/services/user.ts',
        background: 'Updating a profile and immediately fetching the updated user via their username (GSI).',
        hints: [
            'If you write to a DynamoDB Main Table, is the GSI updated synchronously or asynchronously?',
            'What happens if the `getUserByUsername` query hits the GSI 10 milliseconds after the `update` completes?',
            'Can you request a Strongly Consistent read from a DynamoDB Global Secondary Index?'
        ],
        diff: [
            { lineNumL: 10, lineNumR: 10, type: 'normal', text: 'export async function updateProfile(userId: string, picUrl: string) {' },
            { lineNumL: 11, lineNumR: 11, type: 'normal', text: '  // Write to Main Table (Partition Key: userId)' },
            { lineNumL: null, lineNumR: 12, type: 'addition', text: '  await dynamo.update({' },
            { lineNumL: null, lineNumR: 13, type: 'addition', text: '    TableName: "Users",' },
            { lineNumL: null, lineNumR: 14, type: 'addition', text: '    Key: { userId },' },
            { lineNumL: null, lineNumR: 15, type: 'addition', text: '    UpdateExpression: "SET picUrl = :p",' },
            { lineNumL: null, lineNumR: 16, type: 'addition', text: '    ExpressionAttributeValues: { ":p": picUrl }' },
            { lineNumL: null, lineNumR: 17, type: 'addition', text: '  }).promise();' },
            { lineNumL: 12, lineNumR: 18, type: 'normal', text: '' },
            { lineNumL: null, lineNumR: 19, type: 'addition', text: '  // Fetch updated user to return to frontend' },
            { lineNumL: null, lineNumR: 20, type: 'addition', text: '  // Queries the GSI (Partition Key: username)' },
            { lineNumL: null, lineNumR: 21, type: 'addition', text: '  const updatedUser = await getUserByUsername(username);' },
            { lineNumL: 13, lineNumR: 22, type: 'normal', text: '  return updatedUser;' },
            { lineNumL: 14, lineNumR: 23, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'eventual_consistency', label: 'Eventual Consistency', sub: 'GSI replication is asynchronous' },
            { value: 'missing_await', label: 'Missing Await', sub: '.promise() resolves without waiting' },
            { value: 'stale_closure', label: 'Stale Variable', sub: 'username is not updated locally' },
            { value: 'transaction_fail', label: 'Missing Transaction', sub: 'Dynamo updates are not atomic' },
        ],
        correctBugType: 'eventual_consistency',
        successExplanation: "Spot on. DynamoDB Global Secondary Indexes (GSIs) are purely eventually consistent. You cannot force a strongly consistent read on a GSI. If you write to the main table and immediately query the GSI, there's a race condition. The correct pattern is to return the updated attributes directly from the `update` call using `ReturnValues: 'ALL_NEW'`, avoiding the second read entirely.",
        failExplanation: "The flaw is an Eventual Consistency trap. In DynamoDB, Global Secondary Indexes replicate asynchronously. The write to the main table finishes, but the `getUserByUsername` query hits the GSI before the new data arrives. You should use `ReturnValues: 'ALL_NEW'` on the update request to get the new data instantly."
    },
};

export default challenge;