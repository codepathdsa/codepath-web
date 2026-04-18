import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-020',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Overly Broad try/catch Swallowing Errors',
  companies: ['Databricks', 'Snowflake'],
  timeEst: '~20 min',
  level: 'Mid',
  status: 'Not Started',
  desc: 'A data pipeline wraps everything in a single try/catch that logs "unknown error" and continues. Real errors (schema mismatches, OOM) are silently swallowed. Fix it with typed error handling.',
  solution: 'Replace the catch-all with specific error type checks. Re-throw unexpected errors. Treat RecoverableError and FatalError differently. Add structured logging with error context.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The ETL pipeline catch block has been "catch(e) { logger.warn('error', e); continue; }" for 3 years. Engineers joke that it's the "Error Hotel — errors check in, but they never check out."\n\nReal schema mismatches, out-of-memory conditions, and auth errors all look identical in Datadog. On-call spends 45 minutes per incident just identifying the error type.\n\nYour mission: replace the catch-all with typed, structured error handling.`,
    folderPath: 'src/pipeline',
    primaryFile: 'etlProcessor.ts',
    files: [
      {
        name: 'etlProcessor.ts',
        lang: 'typescript',
        code: `import { logger } from '../logging';
import { processRow } from './transform';
import { SchemaError, NetworkError, AuthError } from './errors';

// TODO: Replace the catch-all with typed error handling.
// - SchemaError: log as warning, skip the row, continue
// - NetworkError: log as error, retry once, then skip
// - AuthError: log as FATAL, stop the entire pipeline
// - Unknown errors: log as error, re-throw (don't swallow!)

export async function processRows(rows: object[]): Promise<void> {
  for (const row of rows) {
    try {
      await processRow(row);
    } catch (e) {
      logger.warn('Row processing error', { error: e });
      // Silently continue — this is the bug
    }
  }
}`,
      },
      {
        name: 'errors.ts',
        lang: 'typescript',
        readOnly: true,
        code: `export class SchemaError extends Error {
  constructor(public field: string, message: string) { super(message); this.name = 'SchemaError'; }
}

export class NetworkError extends Error {
  constructor(public statusCode: number, message: string) { super(message); this.name = 'NetworkError'; }
}

export class AuthError extends Error {
  constructor(message: string) { super(message); this.name = 'AuthError'; }
}`,
      },
    ],
    objectives: [
      {
        label: 'Handle SchemaError specifically (log + skip row)',
        check: { type: 'contains', file: 'etlProcessor.ts', pattern: 'SchemaError' },
      },
      {
        label: 'Handle AuthError specifically (stop pipeline)',
        check: { type: 'contains', file: 'etlProcessor.ts', pattern: 'AuthError' },
      },
      {
        label: 'Re-throw unknown errors instead of swallowing them',
        check: { type: 'contains', file: 'etlProcessor.ts', pattern: 'throw' },
      },
      {
        label: 'Remove the original catch-all continue',
        check: { type: 'not_contains', file: 'etlProcessor.ts', pattern: "logger.warn('Row processing error'" },
      },
    ],
    hints: [
      'Use `if (e instanceof SchemaError)` for typed checks.',
      'For AuthError, throw after logging to halt the entire pipeline.',
      'Add an `else { throw e; }` at the end of your catch block for unrecognised error types.',
    ],
    totalTests: 18,
    testFramework: 'Jest',
    xp: 250,
    successMessage: `Errors are now surfaced, not buried. Schema errors skip rows cleanly. Auth errors halt the pipeline immediately. Unknown errors propagate to PagerDuty instead of disappearing forever.`,
  },
};

export default challenge;
