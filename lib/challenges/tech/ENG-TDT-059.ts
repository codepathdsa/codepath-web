import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-059',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Config in Code — 12-Factor App Violation',
  companies: ['Heroku', 'AWS'],
  timeEst: '~25 min',
  level: 'Senior',
  status: 'Not Started',
  desc: 'Database URLs, third-party API keys, service endpoints, and feature flags are all hardcoded in config files committed to git. Deploying to staging requires editing source code. Implement 12-Factor App config externalisation.',
  solution: 'Create a validated config module that reads exclusively from process.env. Support multiple environments via .env files (never committed). Add start-up validation that fails fast on missing required config.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The 12-Factor App methodology (factor III) states: "store config in the environment." The codebase violates this completely — there are separate config files for staging and production committed to git.\n\nLast week, a staging Stripe key was accidentally deployed to production. Real customers were charged to a test account.\n\nYour mission: implement proper environment-based configuration with validation.`,
    folderPath: 'src/config',
    primaryFile: 'config.ts',
    files: [
      {
        name: 'config.ts',
        lang: 'typescript',
        code: `// TODO: Implement a validated config module.
// All values come from process.env ONLY.
// Fail fast at startup if required vars are missing.
// Group config by domain (database, stripe, redis, app).

// CURRENT VIOLATION: env-specific configs committed to git
// import config from './config.staging.json';  // WRONG!
// import config from './config.production.json';  // WRONG!

// Required vars (startup fails if missing):
// DATABASE_URL, STRIPE_SECRET_KEY, REDIS_URL, JWT_SECRET, APP_URL
// Optional with defaults:
// PORT (default 3000), LOG_LEVEL (default 'info'), MAX_CONNECTIONS (default 20)

interface AppConfig {
  database: {
    url: string;
    maxConnections: number;
  };
  stripe: {
    secretKey: string;
  };
  redis: {
    url: string;
  };
  auth: {
    jwtSecret: string;
  };
  app: {
    url: string;
    port: number;
    logLevel: string;
  };
}

// TODO: implement and export
export function loadConfig(): AppConfig {
  throw new Error('Not implemented');
}

export const config = loadConfig();`,
      },
    ],
    objectives: [
      {
        label: 'Read DATABASE_URL from process.env in config.ts',
        check: { type: 'contains', file: 'config.ts', pattern: 'DATABASE_URL' },
      },
      {
        label: 'Validate required vars and throw on missing at startup',
        check: { type: 'contains', file: 'config.ts', pattern: 'throw' },
      },
      {
        label: 'Return grouped AppConfig object',
        check: { type: 'contains', file: 'config.ts', pattern: 'database:' },
      },
      {
        label: 'Provide defaults for optional vars',
        check: { type: 'contains', file: 'config.ts', pattern: "?? '3000'" },
      },
    ],
    hints: [
      'Validation helper: `function require(key: string): string { const v = process.env[key]; if (!v) throw new Error(\`Missing required env var: \${key}\`); return v; }`',
      'Optional with default: `port: parseInt(process.env.PORT ?? "3000", 10)`',
      'Export the result of `loadConfig()` as a singleton so validation runs once at module import time.',
    ],
    totalTests: 14,
    testFramework: 'Jest',
    xp: 380,
    successMessage: `No more environment-specific files in git. Deploying to staging vs production is purely a matter of environment variables. Missing config causes an immediate startup error with a clear message — never a mysterious runtime failure.`,
  },
};

export default challenge;
