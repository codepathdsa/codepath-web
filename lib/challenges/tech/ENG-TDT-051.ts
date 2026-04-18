import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-051',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Global Variables in Node.js Module',
  companies: ['Vercel', 'Railway'],
  timeEst: '~20 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'A request counter and session store are stored as module-level globals. In a multi-instance deployment, counters are inconsistent. In tests, global state bleeds between test cases. Refactor to factory functions.',
  solution: 'Replace global variables with a factory function that returns a fresh instance. For shared state (request counters), accept a storage adapter (Redis/Memory) as a dependency.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The request metrics module has \`let requestCount = 0\` at the top of the file. In production with 4 Node.js processes, each has its own counter — the dashboard shows fractional request counts. In tests, \`requestCount\` persists between test cases causing ordering-dependent failures.\n\nThe fix: factory functions that create fresh instances, and injected storage for anything that needs to be shared across processes.\n\nYour mission: refactor metrics.ts to eliminate global state.`,
    folderPath: 'src/metrics',
    primaryFile: 'metrics.ts',
    files: [
      {
        name: 'metrics.ts',
        lang: 'typescript',
        code: `// TODO: Replace global variables with factory function.
// createMetricsCollector() should return a fresh instance.
// Accept a StorageAdapter for counters that need cross-process visibility.

// BUG: Module-level globals
let requestCount = 0;
let errorCount = 0;
const responseTimes: number[] = [];

export function recordRequest(durationMs: number) {
  requestCount++;
  responseTimes.push(durationMs);
}

export function recordError() {
  errorCount++;
}

export function getStats() {
  const avg = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;
  return { requestCount, errorCount, avgResponseTime: avg };
}

// BUG: No way to reset between tests without importing and mutating the module
export function reset() {
  requestCount = 0;
  errorCount = 0;
  responseTimes.length = 0;
}`,
      },
    ],
    objectives: [
      {
        label: 'Remove module-level global variables',
        check: { type: 'not_contains', file: 'metrics.ts', pattern: 'let requestCount = 0' },
      },
      {
        label: 'Export a createMetricsCollector factory function',
        check: { type: 'contains', file: 'metrics.ts', pattern: 'createMetricsCollector' },
      },
      {
        label: 'Factory function returns an object with recordRequest, recordError, getStats',
        check: { type: 'contains', file: 'metrics.ts', pattern: 'recordRequest' },
      },
    ],
    hints: [
      'Factory: `export function createMetricsCollector() { let requestCount = 0; ... return { recordRequest, recordError, getStats }; }`',
      'In tests: `const collector = createMetricsCollector()` — fresh state per test, no reset() needed.',
      'For cross-process metrics, accept a `storage: { increment(key: string): Promise<void> }` parameter.',
    ],
    totalTests: 12,
    testFramework: 'Jest',
    xp: 190,
    successMessage: `Global state eliminated. Each consumer gets its own fresh instance. Tests are fully isolated — no state bleeds between cases. For production, a Redis-backed adapter provides consistent cross-process metrics.`,
  },
};

export default challenge;
