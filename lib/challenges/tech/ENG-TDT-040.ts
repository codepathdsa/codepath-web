import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-040',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Copy-Paste Code → Shared Utility',
  companies: ['Airbnb', 'Booking.com'],
  timeEst: '~20 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'The same price formatting function (currency symbol, decimal places, locale) is copy-pasted in 8 files with slight variations. When the locale requirement changed, 6 of 8 copies were updated — 2 were missed. Extract it.',
  solution: 'Create a formatCurrency(amount, currency, locale) utility function in lib/formatters.ts. Replace all 8 copies with an import. Delete the duplicates.',
  lang: 'TypeScript',
  tribunalData: {
    background: `After a product requirement changed ("show EUR prices to European users"), an engineer searched for "toFixed(2)" and found 8 copies of the formatter. They updated 6. Two weeks later, on-call was paged because Portuguese users were still seeing "$" instead of "€".\n\nThe root cause: DRY (Don't Repeat Yourself) was violated. Copy-pasted code creates hidden dependency: every copy must be updated independently.\n\nYour mission: create a single formatCurrency utility and replace all copies.`,
    folderPath: 'src/lib',
    primaryFile: 'formatters.ts',
    files: [
      {
        name: 'formatters.ts',
        lang: 'typescript',
        code: `// TODO: Implement a single, correct formatCurrency utility.
// Requirements:
//   - Uses Intl.NumberFormat for locale-aware formatting
//   - Accepts: amount (number), currency (string, e.g. 'USD'), locale (string, e.g. 'en-US')
//   - Returns formatted string: "$12.50", "€12,50" (depending on locale)
//   - Default locale: 'en-US', default currency: 'USD'

export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  // TODO: use Intl.NumberFormat
  return '';
}`,
      },
      {
        name: 'checkout.ts',
        lang: 'typescript',
        code: `// TODO: Replace the inline formatter with the shared utility.
// import { formatCurrency } from '../lib/formatters';

export function getCheckoutSummary(subtotal: number, tax: number) {
  // DUPLICATE: inline formatter (copy 1 of 8)
  const format = (n: number) => '\$' + n.toFixed(2);
  return {
    subtotal: format(subtotal),
    tax: format(tax),
    total: format(subtotal + tax),
  };
}`,
      },
      {
        name: 'invoice.ts',
        lang: 'typescript',
        code: `// TODO: Replace the inline formatter with the shared utility.

export function formatInvoiceLine(amount: number, currency: string) {
  // DUPLICATE: inline formatter (copy 2 of 8)
  const symbol = currency === 'EUR' ? '€' : '\$';
  return symbol + amount.toFixed(2);  // BUG: doesn't use locale-aware formatting
}`,
      },
    ],
    objectives: [
      {
        label: 'Implement formatCurrency using Intl.NumberFormat in formatters.ts',
        check: { type: 'contains', file: 'formatters.ts', pattern: 'Intl.NumberFormat' },
      },
      {
        label: 'Replace inline formatter in checkout.ts with import',
        check: { type: 'contains', file: 'checkout.ts', pattern: 'formatCurrency' },
      },
      {
        label: 'Remove the inline format function from checkout.ts',
        check: { type: 'not_contains', file: 'checkout.ts', pattern: "const format = " },
      },
      {
        label: 'Replace inline formatter in invoice.ts with import',
        check: { type: 'contains', file: 'invoice.ts', pattern: 'formatCurrency' },
      },
    ],
    hints: [
      '`new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount)` handles all locale/currency combinations correctly.',
      'Import: `import { formatCurrency } from "../lib/formatters";`',
      'Locale-aware: "en-US" formats as "$12.50", "de-DE" formats as "12,50 €".',
    ],
    totalTests: 16,
    testFramework: 'Jest',
    xp: 180,
    successMessage: `One formatter to rule them all. Future locale changes require editing one function. The "missed copy" bug is structurally impossible when there's only one copy.`,
  },
};

export default challenge;
