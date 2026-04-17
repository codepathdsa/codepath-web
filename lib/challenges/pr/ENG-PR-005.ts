import type { Challenge } from '../types';

// ─── ENG-PR-005 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

// ─── ENG-PR-005 ─────────────────────────────────────────────────────────────────

const challenge: Challenge = {
  id: 'ENG-PR-005',
  type: 'PR Review',
  badgeClass: 'badge-pr',
  title: 'Exposed .env Credentials Committed to Git',
  companies: ['GitLab', 'Supabase'],
  timeEst: '~8 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'A security bot flagged this PR within minutes of it being opened. A junior dev added third-party payment integration — but something in the diff should never have been committed. Find it fast.',
  solution: 'The .env file containing STRIPE_DUMMY_KEY and DATABASE_URL was committed directly to the repository. Secret keys should never enter version control. Fix: add .env to .gitignore, rotate the exposed keys immediately, and use environment variable injection via CI/CD or a secrets manager (e.g., AWS Secrets Manager, Doppler). Provide a .env.example with placeholder values instead.',
  prReview: {
    prNumber: 88,
    prBranch: 'feature/stripe-payment-integration',
    prBase: 'main',
    prAuthor: 'junior-dev-99',
    prFile: '.env',
    prAge: '20 minutes ago',
    background: 'The team is integrating Stripe for subscription billing. The junior dev was testing locally and needed to share their working config with the team for review.',
    changes: 'Added Stripe secret key and the DB connection string so the reviewer can run the integration locally without setup friction.',
    testing: 'Payments work end-to-end in local dev. Stripe test mode confirmed.',
    hints: [
      'Which file in a Node.js project should list .env to prevent it from being tracked by Git?',
      'What should you do immediately if a secret key has been pushed to a remote repository — even for one minute?',
      'What file can you commit as a safe alternative so teammates know which env vars are required?',
    ],
    diff: [
      { lineNumL: null, lineNumR: 1, type: 'addition', text: 'NODE_ENV=development' },
      { lineNumL: null, lineNumR: 2, type: 'addition', text: 'PORT=3000' },
      { lineNumL: null, lineNumR: 3, type: 'addition', text: 'STRIPE_DUMMY_KEY= i_am_awesome_developer' },
      { lineNumL: null, lineNumR: 4, type: 'addition', text: 'DATABASE_URL_DUMMY=postgres://admin:S3cr3tP@ss@prod-db.internal:5432/payments' },
      { lineNumL: null, lineNumR: 5, type: 'addition', text: 'JWT_SECRET_DUMMY=mySuperSecretJWTKey2024!' },
    ],
    bugOptions: [
      { value: 'secret_committed', label: 'Secret in version control', sub: 'Credentials committed to Git' },
      { value: 'wrong_env', label: 'Wrong environment', sub: 'Prod keys used in dev config' },
      { value: 'weak_secret', label: 'Weak JWT secret', sub: 'JWT secret is guessable' },
      { value: 'hardcoded_port', label: 'Hardcoded port', sub: 'PORT should be dynamic' },
      { value: 'no_validation', label: 'No env validation', sub: 'Missing startup env checks' },
      { value: 'plain_text_pw', label: 'Plaintext password in URL', sub: 'DB password visible in URL' },
    ],
    correctBugType: 'secret_committed',
    successExplanation: "Correct — and this needs to be escalated immediately, not just in a review comment. The .env file is committed to the repo containing a live Stripe secret key, production database credentials, and a JWT signing secret. Even if the PR is closed without merging, the secret is in Git history. Rotate all three keys right now, add .env to .gitignore, and push a .env.example with placeholder values. Consider using GitHub's secret scanning alert which likely already fired.",
    failExplanation: "The critical issue is that .env itself was committed. It contains sk_live_... (a live Stripe secret key), the production DATABASE_URL with a plaintext password, and the JWT_SECRET. These are now in Git history permanently. Steps: (1) Rotate all exposed credentials immediately. (2) Add .env to .gitignore. (3) Commit .env.example with placeholder values instead. Git history rewrites (git filter-branch / BFG) can help but rotating keys is non-negotiable.",
  },
};