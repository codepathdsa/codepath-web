import type { Challenge } from '../types';

// ─── ENG-TDT-009 ─────────────────────────────────────────────────────────────────

const challenge: Challenge = {
  id: 'ENG-TDT-009',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Fix Mutable Shared State',
  companies: ['Google', 'Notion'],
  timeEst: '~25 min',
  level: 'Mid',
  status: 'Not Started',
  desc: 'HttpClient mutates the global config timeout to 50ms. AnalyticsClient reads the same object and starts dropping its 200ms tracking calls. A ghost bug with no stack trace.',
  solution: 'Freeze the base config with Object.freeze(). Add a createConfig() factory so each module gets its own isolated copy with its own overrides.',
  lang: 'TypeScript',
  tribunalData: {
    background: `Analytics data disappeared for 4 hours. Root cause: HttpClient was tuning its timeout on the shared global config object — and AnalyticsClient was reading that same mutated value.\n\nShared mutable state produces ghost bugs: failures with no stack trace that only appear under certain module initialization orders.\n\nYour mission: freeze the base config, and create a createConfig() factory so each module gets its own isolated configuration copy.`,
    folderPath: 'src/config',
    primaryFile: 'config.ts',
    files: [
      {
        name: 'config.ts',
        lang: 'typescript',
        code: `/**
 * TODO: Two changes required:
 * 1. Wrap the exported config in Object.freeze() so direct mutation throws.
 * 2. Add a createConfig() factory that returns a new copy with optional overrides.
 *
 * Modules should use: const cfg = createConfig({ timeout: 50 });
 */
export const config = {
  timeout: 100,
  retries: 3,
  baseUrl: 'https://api.engprep.io',
  logLevel: 'info',
};

// TODO: export function createConfig(overrides?: Partial<typeof config>) { ... }`,
      },
      {
        name: 'HttpClient.ts',
        lang: 'typescript',
        code: `import { config } from './config';

/**
 * TODO: Replace the direct mutation with createConfig({ timeout: 50 }).
 * HttpClient needs 50ms for health-check pings but must NOT
 * alter the shared global config.
 */
export class HttpClient {
  private cfg = config;

  constructor() {
    this.cfg.timeout = 50; // BUG: mutates shared global!
  }

  ping(url: string): void {
    console.log('[HttpClient] GET ' + url + ' (timeout: ' + this.cfg.timeout + 'ms)');
  }
}`,
      },
      {
        name: 'AnalyticsClient.ts',
        lang: 'typescript',
        code: `import { config } from './config';

/**
 * TODO: Replace with createConfig() so this module
 * always gets the default 100ms regardless of HttpClient.
 */
export class AnalyticsClient {
  private cfg = config; // BUG: reads the mutated shared object

  track(event: string): void {
    console.log('[Analytics] ' + event + ' (timeout: ' + this.cfg.timeout + 'ms)');
    if (this.cfg.timeout < 100) {
      console.warn('[Analytics] Timeout too low — event may be dropped!');
    }
  }
}`,
      },
    ],
    objectives: [
      {
        label: 'Freeze the base config with Object.freeze() in config.ts',
        check: { type: 'contains', file: 'config.ts', pattern: 'Object.freeze' },
      },
      {
        label: 'HttpClient stops direct mutation (remove cfg.timeout = 50)',
        check: { type: 'not_contains', file: 'HttpClient.ts', pattern: 'cfg.timeout = 50' },
      },
      {
        label: 'HttpClient uses createConfig() for its isolated settings',
        check: { type: 'contains', file: 'HttpClient.ts', pattern: 'createConfig(' },
      },
    ],
    hints: [
      'In config.ts: `export const config = Object.freeze({ timeout: 100, retries: 3, ... });`',
      'Add: `export function createConfig(overrides: Partial<typeof config> = {}) { return { ...config, ...overrides }; }`',
      'In HttpClient.ts: `import { createConfig } from "./config"; private cfg = createConfig({ timeout: 50 });` — then delete the mutation line in the constructor.',
    ],
    totalTests: 16,
    testFramework: 'Jest',
    xp: 200,
    successMessage: 'Base config is now immutable. Each module owns its own isolated copy. HttpClient can set timeout: 50 without affecting AnalyticsClient. Ghost bug permanently eliminated.',
  },
};

export default challenge;
