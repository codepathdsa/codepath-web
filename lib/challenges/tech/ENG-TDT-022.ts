import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-022',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Hardcoded API URLs & Credentials in Source Code',
  companies: ['HashiCorp', 'Okta'],
  timeEst: '~20 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'API base URLs, secret keys, and environment-specific config are hardcoded across 4 files. The staging URL is now live in production. Extract everything to environment variables.',
  solution: 'Create a config.ts that reads all values from process.env with validation. Export typed config constants. Replace all hardcoded strings. Add a .env.example file.',
  lang: 'TypeScript',
  tribunalData: {
    background: `A security audit found the staging payment gateway URL hardcoded in the production bundle — meaning all production payments were being processed through the test gateway for two weeks.\n\nAdditionally, the Stripe secret key was committed to git history in auth.ts. The key has been rotated, but the practice hasn't changed.\n\nYour mission: centralise all config in environment variables and add startup validation.`,
    folderPath: 'src/config',
    primaryFile: 'config.ts',
    files: [
      {
        name: 'config.ts',
        lang: 'typescript',
        code: `// TODO: Read all values from process.env. 
// Add validation: throw if required vars are missing at startup.

export const config = {
  // TODO: read from process.env.STRIPE_SECRET_KEY
  stripeSecretKey: 'sk_test_HARDCODED_KEY_DO_NOT_COMMIT',

  // TODO: read from process.env.PAYMENT_API_URL
  paymentApiUrl: 'https://staging.payments.internal/v1',

  // TODO: read from process.env.DATABASE_URL
  databaseUrl: 'postgres://admin:password123@staging-db:5432/app',

  // TODO: read from process.env.JWT_SECRET
  jwtSecret: 'super_secret_jwt_key_2021',
};`,
      },
      {
        name: '.env.example',
        lang: 'bash',
        code: `# TODO: Add all required environment variable names (without values).
# Commit this file. Never commit .env or .env.local.
`,
      },
    ],
    objectives: [
      {
        label: 'Remove all hardcoded secret values from config.ts',
        check: { type: 'not_contains', file: 'config.ts', pattern: 'sk_test_' },
      },
      {
        label: 'Read values from process.env in config.ts',
        check: { type: 'contains', file: 'config.ts', pattern: 'process.env' },
      },
      {
        label: 'Add validation that throws if required vars are missing',
        check: { type: 'contains', file: 'config.ts', pattern: 'throw' },
      },
      {
        label: 'Document all required vars in .env.example',
        check: { type: 'contains', file: '.env.example', pattern: 'STRIPE_SECRET_KEY' },
      },
    ],
    hints: [
      'Helper: `function requireEnv(key: string): string { const v = process.env[key]; if (!v) throw new Error(\`Missing: \${key}\`); return v; }`',
      'Call this at module load time so the server crashes fast if config is missing — better than crashing at runtime mid-request.',
      'Add STRIPE_SECRET_KEY, PAYMENT_API_URL, DATABASE_URL, JWT_SECRET to .env.example (keys only, no values).',
    ],
    totalTests: 10,
    testFramework: 'Jest',
    xp: 200,
    successMessage: `No secrets in source code. The server validates all required config at startup and fails fast with a clear error message if anything is missing. .env.example documents the contract for future developers.`,
  },
};

export default challenge;
