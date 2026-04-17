// ─── ENG-PR-041 ─────────────────────────────────────────────────────────────────
import type { Challenge } from '../types';
const challenge: Challenge = {
    id: 'ENG-PR-041',
    type: 'PR Review',
    badgeClass: 'badge-pr-lead',
    title: 'Webhook Replay Attack',
    companies: ['Stripe', 'Coinbase'],
    timeEst: '~12 min',
    level: 'Senior',
    status: 'Not Started',
    desc: 'A payment gateway integration verifies the cryptographic signature perfectly. However, a malicious proxy intercepts the webhook and resends the exact same HTTP request 30 days later. The system happily grants the user their credits again.',
    solution: 'Cryptographic signatures verify *authenticity*, but they do not protect against Replay Attacks if the exact payload and signature are captured and resent. Fix: Webhooks must include a timestamp in the signed payload (e.g., `t=16123456`). The server must check that `Math.abs(Date.now() - timestamp) < 5_MINUTES` to reject old payloads.',
    prReview: {
        prNumber: 110,
        prBranch: 'sec/verify-payment',
        prBase: 'main',
        prAuthor: 'senior-dev-11',
        prFile: 'src/api/webhooks.ts',
        background: 'Receiving signed webhooks confirming successful crypto deposits.',
        hints: [
            'If I copy the HTTP request headers and body verbatim and run it in Postman tomorrow, will the signature match?',
            'Does verifying the signature prove *when* the request was originally sent?',
            'What piece of data is missing from the validation check to prevent old requests?'
        ],
        diff: [
            { lineNumL: 10, lineNumR: 10, type: 'normal', text: 'export async function handleDeposit(req: Request, res: Response) {' },
            { lineNumL: 11, lineNumR: 11, type: 'normal', text: '  const signature = req.headers["x-signature"];' },
            { lineNumL: 12, lineNumR: 12, type: 'normal', text: '  const payload = req.rawBody;' },
            { lineNumL: 13, lineNumR: 13, type: 'normal', text: '' },
            { lineNumL: null, lineNumR: 14, type: 'addition', text: '  const expected = crypto.createHmac("sha256", SECRET)' },
            { lineNumL: null, lineNumR: 15, type: 'addition', text: '                         .update(payload).digest("hex");' },
            { lineNumL: null, lineNumR: 16, type: 'addition', text: '' },
            { lineNumL: null, lineNumR: 17, type: 'addition', text: '  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {' },
            { lineNumL: null, lineNumR: 18, type: 'addition', text: '    return res.status(401).send("Invalid signature");' },
            { lineNumL: null, lineNumR: 19, type: 'addition', text: '  }' },
            { lineNumL: null, lineNumR: 20, type: 'addition', text: '' },
            { lineNumL: null, lineNumR: 21, type: 'addition', text: '  await db.users.addBalance(req.body.userId, req.body.amount);' },
            { lineNumL: 14, lineNumR: 22, type: 'normal', text: '  res.sendStatus(200);' },
            { lineNumL: 15, lineNumR: 23, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'replay_attack', label: 'Replay Attack', sub: 'Missing timestamp verification window' },
            { value: 'timing_attack', label: 'Timing Attack', sub: 'Signature comparison leaks length' },
            { value: 'type_coercion', label: 'Type Coercion', sub: 'Buffer.from allows unverified inputs' },
            { value: 'idempotency_fail', label: 'Missing Idempotency', sub: 'DB update is not atomic' },
        ],
        correctBugType: 'replay_attack',
        successExplanation: "Exactly. The signature is perfectly valid, but it's permanently valid. An attacker who intercepts the network traffic can simply replay the HTTP request forever. To prevent this, the payload/headers must include a timestamp that is factored into the signature, and the server must reject requests older than 5 minutes.",
        failExplanation: "The vulnerability is a Replay Attack. The cryptographic check proves Stripe/Coinbase generated the payload, but it doesn't prove *when*. If an attacker copies the raw request and replays it a week later, the signature still matches perfectly. You must parse a timestamp from the headers/payload and enforce a strict 5-minute expiration window."
    },
};

export default challenge;
