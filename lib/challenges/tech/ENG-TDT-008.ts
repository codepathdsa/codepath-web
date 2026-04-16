import type { Challenge } from '../types';

// ─── ENG-TDT-008 ─────────────────────────────────────────────────────────────────

const challenge: Challenge = {
  id: 'ENG-TDT-008',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Migrate off Deprecated Library',
  companies: ['Expedia', 'Booking'],
  timeEst: '~30 min',
  level: 'Mid',
  status: 'Not Started',
  desc: 'The app ships 67 KB of deprecated moment.js on every page load. Lighthouse flags it every sprint. Wrap it in a DateAdapter so you can swap to native Date without touching 40 call sites.',
  solution: 'Adapter Pattern: build DateAdapter.ts backed by native Intl. Migrate ReportGenerator off moment. Other files follow one by one once the adapter is proven.',
  lang: 'TypeScript',
  tribunalData: {
    background: `moment.js was added in 2017 and nobody dared remove it. It is now deprecated, unmaintained, and adds 67 KB to the bundle — the top item in every Lighthouse report.\n\nThe problem: it is called directly in 40+ source files. Replacing it everywhere at once is too risky for a single PR.\n\nYour mission: apply the Adapter Pattern. Build DateAdapter.ts with the same format() API but powered by native JavaScript. Migrate ReportGenerator to use it. Once the adapter is proven stable, other files migrate one at a time.`,
    folderPath: 'src/utils',
    primaryFile: 'DateAdapter.ts',
    files: [
      {
        name: 'DateAdapter.ts',
        lang: 'typescript',
        code: `/**
 * TODO: Implement a date adapter using native JavaScript.
 * Match the moment.js API that the rest of the codebase calls:
 *
 *   moment(date).format('YYYY-MM-DD')  ->  DateAdapter.format(date, 'YYYY-MM-DD')
 *   moment(date).fromNow()             ->  DateAdapter.fromNow(date)
 *
 * Supported format tokens:
 *   YYYY -> full 4-digit year
 *   MM   -> 2-digit month (01-12)
 *   DD   -> 2-digit day   (01-31)
 */
export const DateAdapter = {
  // TODO: format(date: Date, pattern: string): string
  // TODO: fromNow(date: Date): string
};`,
      },
      {
        name: 'ReportGenerator.ts',
        lang: 'typescript',
        code: `import moment from 'moment';

/**
 * TODO: Remove the moment import.
 * Replace moment(date).format(...) with DateAdapter.format(date, ...).
 * Replace moment(date).fromNow() with DateAdapter.fromNow(date).
 */
export class ReportGenerator {
  generateTitle(date: Date): string {
    return 'Report for ' + moment(date).format('YYYY-MM-DD');
  }

  generateSummary(startDate: Date, endDate: Date): string {
    const start = moment(startDate).format('MM/DD/YYYY');
    const end   = moment(endDate).format('MM/DD/YYYY');
    return 'Period: ' + start + ' to ' + end;
  }

  getAgeLabel(date: Date): string {
    return 'Created ' + moment(date).fromNow();
  }
}`,
      },
      {
        name: 'LegacyInvoiceFormatter.ts',
        lang: 'typescript',
        readOnly: true,
        code: `import moment from 'moment';

/**
 * READ-ONLY — still on moment.js.
 * Will be migrated in a future sprint once DateAdapter
 * is proven stable in ReportGenerator.
 */
export function formatInvoiceDate(date: Date): string {
  return moment(date).format('DD MMM YYYY');
}`,
      },
    ],
    objectives: [
      {
        label: 'DateAdapter implements a format() method',
        check: { type: 'contains', file: 'DateAdapter.ts', pattern: 'format(' },
      },
      {
        label: 'ReportGenerator no longer imports moment',
        check: { type: 'not_contains', file: 'ReportGenerator.ts', pattern: "from 'moment'" },
      },
      {
        label: 'ReportGenerator uses DateAdapter for date formatting',
        check: { type: 'contains', file: 'ReportGenerator.ts', pattern: 'DateAdapter' },
      },
    ],
    hints: [
      'Implement format() with template substitution: replace YYYY with `date.getFullYear()`, MM with `String(date.getMonth()+1).padStart(2,"0")`, DD with `String(date.getDate()).padStart(2,"0")`.',
      'For fromNow(): `const days = Math.floor((Date.now() - date.getTime()) / 86400000); return days === 0 ? "today" : days + " days ago";`',
      'In ReportGenerator.ts: `import { DateAdapter } from "./DateAdapter";` then replace every `moment(date).format(...)` with `DateAdapter.format(date, ...)`.',
    ],
    totalTests: 20,
    testFramework: 'Jest',
    xp: 250,
    successMessage: 'moment.js removed from ReportGenerator. Bundle reduced by 67 KB for this entry point. The Adapter pattern means every remaining call site can now migrate independently, one file per PR.',
  },
};

export default challenge;
