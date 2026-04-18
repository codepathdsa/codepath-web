import type { Challenge } from '../types';
// â”€â”€â”€ ENG-PR-022 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const challenge: Challenge = {
    id: 'ENG-PR-022',
    type: 'PR Review',
    badgeClass: 'badge-pr-pro',
    title: 'JWT "None" Algorithm Attack',
    companies: ['Auth0', 'Okta'],
    timeEst: '~10 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'A backend refactor centralized the JWT validation logic. During a pen-test, an attacker bypassed authentication by altering their token\'s header to `{"alg": "none"}` and stripping the signature.',
    solution: 'Many popular JWT libraries (like `jsonwebtoken` in older defaults) support the "none" algorithm. If the token specifies `none`, the library skips signature verification entirely, treating any manipulated payload as valid. Fix: Always pass an explicit array of allowed algorithms (e.g., `algorithms: ["RS256"]`) to the verify options.',
    prReview: {
        prNumber: 215,
        prBranch: 'refactor/auth-middleware',
        prBase: 'main',
        prAuthor: 'mid-dev-44',
        prFile: 'src/middleware/auth.ts',
        background: 'Validating incoming JWTs for protected API routes using a public key.',
        prAge: '2 hours ago',
        changes: 'See diff below for the specific lines introduced in this PR.',
        testing: 'No automated tests were added with this change.',
        hints: [
            'Who decides what algorithm is used to verify the token: the server, or the token itself?',
            'What happens if an attacker crafts a token with `alg: "none"`?',
            'How do we force the library to only accept `RS256`?'
        ],
        diff: [
            { lineNumL: 5, lineNumR: 5, type: 'normal', text: 'export function authenticateToken(req, res, next) {' },
            { lineNumL: 6, lineNumR: 6, type: 'normal', text: '  const token = req.headers["authorization"]?.split(" ")[1];' },
            { lineNumL: 7, lineNumR: 7, type: 'normal', text: '  if (!token) return res.sendStatus(401);' },
            { lineNumL: 8, lineNumR: 8, type: 'normal', text: '' },
            { lineNumL: 9, lineNumR: null, type: 'deletion', text: '  jwt.verify(token, PUBLIC_KEY, { algorithms: ["RS256"] }, (err, user) => {' },
            { lineNumL: null, lineNumR: 9, type: 'addition', text: '  // Simplified verification for flexibility' },
            { lineNumL: null, lineNumR: 10, type: 'addition', text: '  jwt.verify(token, PUBLIC_KEY, (err, user) => {' },
            { lineNumL: 11, lineNumR: 11, type: 'normal', text: '    if (err) return res.sendStatus(403);' },
            { lineNumL: 12, lineNumR: 12, type: 'normal', text: '    req.user = user;' },
            { lineNumL: 13, lineNumR: 13, type: 'normal', text: '    next();' },
            { lineNumL: 14, lineNumR: 14, type: 'normal', text: '  });' },
            { lineNumL: 15, lineNumR: 15, type: 'normal', text: '}' },
        ],
        bugOptions: [
            { value: 'jwt_none', label: 'JWT None Attack', sub: 'Accepts tokens without signatures' },
            { value: 'missing_expiry', label: 'Missing Expiry', sub: 'Token expiration not checked' },
            { value: 'symmetric_key', label: 'Symmetric Confusion', sub: 'Public key used as HMAC secret' },
            { value: 'timing_attack', label: 'Timing Attack', sub: 'Signature comparison leaks length' },
        ],
        correctBugType: 'jwt_none',
        successExplanation: "Spot on. Removing the `algorithms` array leaves the library vulnerable to trusting whatever algorithm the token's header specifies. An attacker can set `alg: none`, remove the signature, and change their `userId` to an admin's ID. The server must enforce `algorithms: ['RS256']`.",
        failExplanation: "The bug is the removal of the `algorithms: ['RS256']` option. By default, some JWT implementations read the token header to determine how to verify it. If an attacker passes a token with `alg: none` and no signature, `jwt.verify` assumes it's valid. You must explicitly restrict the algorithms."
    },
};

export default challenge;
