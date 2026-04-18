import type { Challenge } from '../types';

const challenge: Challenge = {
    id: 'ENG-PR-015',
    type: 'PR Review',
    badgeClass: 'badge-pr-pro',
    title: 'Missing Idempotency in Payment Webhooks',
    companies: ['Stripe', 'Airbnb'],
    timeEst: '~15 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'The customer support team is flooded with tickets. Users are complaining they are being double-charged for "Pro" credits. The junior says "I checked the code, we only call the increment function once per request!"',
    solution: 'Distributed systems are unreliable. Stripe (and most providers) guarantee "at least once" delivery, not "exactly once." If Stripe doesn\'t get a 200 OK fast enough, they retry. Fix: Create an `processed_events` table. Wrap the logic in a DB transaction: 1. Check if event_id exists. 2. If no, insert event_id and increment credits. 3. Commit.',
    prReview: {
        prNumber: 1042,
        prBranch: 'feat/webhook-handler',
        prBase: 'main',
        prAuthor: 'mid-dev-44',
        prFile: 'src/api/webhooks/stripe.ts',
        background: 'Handling Stripe "charge.succeeded" events to grant users virtual currency.',
        prAge: '2 hours ago',
        changes: 'See diff below for the specific lines introduced in this PR.',
        testing: 'No automated tests were added with this change.',
        hints: [
            'What happens if this function is called twice with the same payload?',
            'Is there a unique identifier in the Stripe payload we can use to track "seen" requests?',
            'How do we ensure that checking for the ID and updating the balance happens atomically?'
        ],
        diff: [
            { lineNumL: 10, lineNumR: 10, type: 'normal', text: 'export async function handleStripeWebhook(req: Request, res: Response) {' },
            { lineNumL: 11, lineNumR: 11, type: 'normal', text: '  const event = req.body;' },
            { lineNumL: 12, lineNumR: 12, type: 'normal', text: '  if (event.type === "charge.succeeded") {' },
            { lineNumL: 13, lineNumR: 13, type: 'normal', text: '    const { userId, amount } = event.data.object.metadata;' },
            { lineNumL: null, lineNumR: 14, type: 'addition', text: '    // Grant credits to user' },
            { lineNumL: null, lineNumR: 15, type: 'addition', text: '    await db.user.incrementBalance(userId, amount);' },
            { lineNumL: 16, lineNumR: 16, type: 'normal', text: '  }' },
            { lineNumL: 17, lineNumR: 17, type: 'normal', text: '  return res.sendStatus(200);' },
            { lineNumL: 18, lineNumR: 18, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'idempotency', label: 'Missing Idempotency', sub: 'Retried webhooks cause duplicate side-effects' },
            { value: 'race_condition', label: 'Race Condition', sub: 'Concurrent updates clash' },
            { value: 'no_transaction', label: 'Missing Transaction', sub: 'Partial failures leave DB inconsistent' },
        ],
        correctBugType: 'idempotency',
        successExplanation: "Spot on. In distributed systems, you must assume every action will be retried. Without an idempotency key (the Stripe Event ID), the system has no way of knowing it already processed this specific payment.",
        failExplanation: "The logic is too optimistic. If the `incrementBalance` call takes 4 seconds and Stripe's timeout is 3 seconds, Stripe will retry the request. You'll end up running the increment twice. You must store and check for the `event.id`."
    }
};

export default challenge;