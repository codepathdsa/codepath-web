import { Challenge } from "../types";
// ─── ENG-PR-032 ─────────────────────────────────────────────────────────────────

const challenge: Challenge = {
    id: 'ENG-PR-032',
    type: 'PR Review',
    badgeClass: 'badge-pr-lead',
    title: 'Timing Attack on Webhook Signatures',
    companies: ['GitHub', 'Shopify'],
    timeEst: '~10 min',
    level: 'Senior',
    status: 'Not Started',
    desc: 'A custom webhook verification middleware was implemented. A security audit flagged it as vulnerable to a cryptographic timing attack. An attacker can forge a valid signature over the network by measuring the response time of the server.',
    solution: 'Standard string comparison (`===`) in JavaScript exits early the moment it finds a mismatched character. An attacker can brute-force the signature one character at a time, looking for slight increases in response latency (because matching characters take fractions of a millisecond longer to compare). Fix: Use `crypto.timingSafeEqual` which always compares the entire string, taking constant time.',
    prReview: {
        prNumber: 901,
        prBranch: 'sec/webhook-verification',
        prBase: 'main',
        prAuthor: 'senior-dev-11',
        prFile: 'src/middleware/webhooks.ts',
        background: 'Verifying HMAC-SHA256 signatures from incoming third-party webhooks.',
        hints: [
            'How does the `===` operator evaluate strings under the hood?',
            'If string A is "abcdef" and string B is "abczzz", does JS check the "d" or exit immediately at "c"?',
            'How could a hacker use network latency to brute force the signature character by character?'
        ],
        diff: [
            { lineNumL: 8, lineNumR: 8, type: 'normal', text: 'export function verifyWebhook(req: Request, res: Response, next: NextFunction) {' },
            { lineNumL: 9, lineNumR: 9, type: 'normal', text: '  const signature = req.headers["x-signature"];' },
            { lineNumL: 10, lineNumR: 10, type: 'normal', text: '  const payload = JSON.stringify(req.body);' },
            { lineNumL: 11, lineNumR: 11, type: 'normal', text: '' },
            { lineNumL: null, lineNumR: 12, type: 'addition', text: '  const expected = crypto' },
            { lineNumL: null, lineNumR: 13, type: 'addition', text: '    .createHmac("sha256", process.env.WEBHOOK_SECRET)' },
            { lineNumL: null, lineNumR: 14, type: 'addition', text: '    .update(payload)' },
            { lineNumL: null, lineNumR: 15, type: 'addition', text: '    .digest("hex");' },
            { lineNumL: null, lineNumR: 16, type: 'addition', text: '' },
            { lineNumL: null, lineNumR: 17, type: 'addition', text: '  if (signature !== expected) {' },
            { lineNumL: null, lineNumR: 18, type: 'addition', text: '    return res.status(401).send("Invalid signature");' },
            { lineNumL: null, lineNumR: 19, type: 'addition', text: '  }' },
            { lineNumL: 12, lineNumR: 20, type: 'normal', text: '  next();' },
            { lineNumL: 13, lineNumR: 21, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'timing_attack', label: 'Timing Attack', sub: 'String comparison is not constant-time' },
            { value: 'json_stringify', label: 'JSON Stringify Bias', sub: 'Stringify order alters the payload' },
            { value: 'replay_attack', label: 'Replay Attack', sub: 'No timestamp checking included' },
            { value: 'weak_algorithm', label: 'Weak Algorithm', sub: 'SHA256 is deprecated for HMAC' },
        ],
        correctBugType: 'timing_attack',
        successExplanation: "Spot on. `!==` uses an early-exit algorithm. An attacker can repeatedly send payloads, varying the first character of the signature. When the server takes slightly longer to respond, they know they guessed the first character correctly, allowing them to brute-force the HMAC over the network. You must use `crypto.timingSafeEqual` for cryptographic comparisons.",
        failExplanation: "The flaw is a Cryptographic Timing Attack. Line 17 uses `!==`. Standard string equality checks return `false` the instant a character doesn't match. An attacker can measure response times to brute-force the signature character by character. Use `crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))`."
    },
};

export default challenge;