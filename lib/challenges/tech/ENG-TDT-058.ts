import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-058',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Console.log Left in Production Build',
  companies: ['Facebook', 'Google'],
  timeEst: '~15 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'The production bundle contains 47 console.log calls including raw user data, JWT payloads, and API responses. PII leaks into browser DevTools. Add an ESLint rule and a build-time strip.',
  solution: 'Add "no-console" ESLint rule. Configure a babel plugin or Webpack/Terser to strip console calls in production. Create a logger utility that no-ops in production.',
  lang: 'TypeScript',
  tribunalData: {
    background: `A security audit found console.log(userData) including email addresses and partial payment tokens visible in browser DevTools — in production. Any user who opens DevTools sees the next user's data from shared browser sessions in a call centre.\n\nThe rule is simple: no console.log in production code. Ever.\n\nYour mission: create a logger utility, add the ESLint rule, and strip console calls at build time.`,
    folderPath: 'src/utils',
    primaryFile: 'logger.ts',
    files: [
      {
        name: 'logger.ts',
        lang: 'typescript',
        code: `// TODO: Create a logger that:
// - In development: prints to console with level prefix
// - In production: no-ops (never calls console)
// - Supports levels: debug, info, warn, error
// - error() always logs (even in production) but never includes PII objects

const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  debug: (...args: unknown[]) => {
    // TODO: only log in dev
  },
  info: (...args: unknown[]) => {
    // TODO: only log in dev
  },
  warn: (...args: unknown[]) => {
    // TODO: log in dev; in prod log to error reporting service (not console)
  },
  error: (message: string, context?: { code?: string; requestId?: string }) => {
    // TODO: always log, but only accept safe non-PII fields
    // NEVER accept a raw user object
  },
};`,
      },
      {
        name: '.eslintrc.json',
        lang: 'json',
        code: `{
  "rules": {
    // TODO: Add the no-console ESLint rule that errors on console.log/debug/info/warn
    // but allows console.error for legitimate error reporting
  }
}`,
      },
    ],
    objectives: [
      {
        label: 'Make debug/info/warn no-ops in production',
        check: { type: 'contains', file: 'logger.ts', pattern: 'isDev' },
      },
      {
        label: 'error() method accepts only safe non-PII fields',
        check: { type: 'contains', file: 'logger.ts', pattern: 'message: string' },
      },
      {
        label: 'Add no-console ESLint rule to .eslintrc.json',
        check: { type: 'contains', file: '.eslintrc.json', pattern: 'no-console' },
      },
    ],
    hints: [
      '`debug: (...args) => { if (isDev) console.debug("[DEBUG]", ...args); }` — empty function in production.',
      'error() signature: `(message: string, context?: { code?: string; requestId?: string })` — no `user` object allowed.',
      'ESLint: `"no-console": ["error", { "allow": ["error"] }]` — blocks log/warn/debug, allows error.',
    ],
    totalTests: 10,
    testFramework: 'Jest',
    xp: 180,
    successMessage: `Production logs contain zero PII. Console calls are stripped at build time. The ESLint rule prevents new violations from being committed. The logger's typed error() signature structurally prevents passing raw user objects.`,
  },
};

export default challenge;
