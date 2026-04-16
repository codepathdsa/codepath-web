import type { Challenge } from '../types';

// ─── ENG-TDT-006 ─────────────────────────────────────────────────────────────────

const challenge: Challenge = {
  id: 'ENG-TDT-006',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Standardize the Logging Facade',
  companies: ['Datadog', 'Splunk'],
  timeEst: '~20 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'PaymentService uses console.log. UserService imports winston directly. The team just mandated Datadog — and now 500 files need updating. Introduce a single AppLogger facade to fix this permanently.',
  solution: 'Facade Pattern: create AppLogger.ts with info/warn/error. All modules import AppLogger. Internals can be swapped to Datadog in one place.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The on-call engineer could not find the payment failure logs during last night's incident. Half the logs were in Datadog, half in the terminal, some swallowed entirely.\n\nEvery developer picked their own logging tool. PaymentService uses console.log. UserService imports winston. Infrastructure just mandated Datadog across the board.\n\nYour mission: build AppLogger.ts with info(), warn(), and error() methods. Migrate PaymentService and UserService to use it. Future provider swaps become a one-file change.`,
    folderPath: 'src/services',
    primaryFile: 'AppLogger.ts',
    files: [
      {
        name: 'AppLogger.ts',
        lang: 'typescript',
        code: `/**
 * TODO: Implement the logging Facade.
 *
 * Expose info(), warn(), and error() methods.
 * Use console internally for now — the architecture
 * ensures that swapping to Datadog later is a one-file change.
 */
export const AppLogger = {
  // TODO: info(message: string, meta?: object): void
  // TODO: warn(message: string, meta?: object): void
  // TODO: error(message: string, meta?: object): void
};`,
      },
      {
        name: 'PaymentService.ts',
        lang: 'typescript',
        code: `/**
 * TODO: Replace all console.log / console.error calls
 * with AppLogger.info() / AppLogger.error().
 */
export class PaymentService {
  async charge(userId: string, amount: number): Promise<void> {
    console.log('[Payment] Charging user ' + userId + ' $' + amount);
    try {
      if (amount <= 0) throw new Error('Invalid amount');
      console.log('[Payment] Success for user ' + userId);
    } catch (err) {
      console.error('[Payment] Failed for user ' + userId, err);
      throw err;
    }
  }
}`,
      },
      {
        name: 'UserService.ts',
        lang: 'typescript',
        code: `import winston from 'winston';

/**
 * TODO: Remove the direct winston import.
 * Replace winston.info() / winston.error() with AppLogger.
 */
export class UserService {
  createUser(email: string): void {
    winston.info('Creating user: ' + email);
    if (!email.includes('@')) {
      winston.error('Invalid email: ' + email);
      throw new Error('Invalid email');
    }
    winston.info('User created: ' + email);
  }
}`,
      },
    ],
    objectives: [
      {
        label: 'AppLogger exposes an info() method',
        check: { type: 'contains', file: 'AppLogger.ts', pattern: 'info(' },
      },
      {
        label: 'PaymentService no longer uses console.log',
        check: { type: 'not_contains', file: 'PaymentService.ts', pattern: 'console.log' },
      },
      {
        label: 'UserService no longer imports winston directly',
        check: { type: 'not_contains', file: 'UserService.ts', pattern: 'winston' },
      },
    ],
    hints: [
      'Build AppLogger: `info(msg: string, meta?: object) { console.log(msg, meta); }` — keep it simple for now.',
      'In PaymentService.ts: `import { AppLogger } from "./AppLogger";` then replace every console.log with AppLogger.info() and console.error with AppLogger.error().',
      'In UserService.ts: remove the winston import, import AppLogger, and replace winston.info/error with AppLogger.info/error.',
    ],
    totalTests: 14,
    testFramework: 'Jest',
    xp: 150,
    successMessage: 'All logs now flow through AppLogger. Switching to Datadog is a 3-line change in one file. The Facade Pattern has decoupled the entire codebase from its logging infrastructure.',
  },
};

export default challenge;
