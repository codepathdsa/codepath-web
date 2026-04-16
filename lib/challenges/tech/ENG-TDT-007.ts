import type { Challenge } from '../types';

// ─── ENG-TDT-007 ─────────────────────────────────────────────────────────────────

const challenge: Challenge = {
  id: 'ENG-TDT-007',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Unify Scattered Magic Strings',
  companies: ['Apple', 'Microsoft'],
  timeEst: '~15 min',
  level: 'Junior',
  status: 'Not Started',
  desc: '"PAYMENT_PENDING" is hardcoded in 42 files. A typo last week — "PAYMNT_PENDING" — crashed checkout for 3 hours with no compile-time warning. Centralise all status strings into a TypeScript enum.',
  solution: 'Create an OrderStatus enum. Replace every "PAYMENT_PENDING" / "PAID" / "CANCELLED" literal with OrderStatus.PENDING / PAID / CANCELLED. TypeScript catches typos at build time.',
  lang: 'TypeScript',
  tribunalData: {
    background: `A junior engineer fixed a bug at 11 PM by hardcoding "PAYMNT_PENDING" — a typo that matched none of the status checks downstream. Orders silently stalled for 3 hours.\n\nMagic strings are testing debt disguised as convenience. No compile-time safety, no autocomplete, no single source of truth.\n\nYour mission: create an OrderStatus enum and migrate checkout.ts to use it. TypeScript will then catch any typo at build time.`,
    folderPath: 'src/orders',
    primaryFile: 'checkout.ts',
    files: [
      {
        name: 'checkout.ts',
        lang: 'typescript',
        code: `/**
 * TODO: Replace all magic string literals with OrderStatus enum values.
 * "PAYMENT_PENDING" → OrderStatus.PENDING
 * "PAID"            → OrderStatus.PAID
 * "CANCELLED"       → OrderStatus.CANCELLED
 */
export function processCheckout(orderId: string, paymentOk: boolean): string {
  let status = "PAYMENT_PENDING";

  if (paymentOk) {
    status = "PAID";
  } else {
    status = "CANCELLED";
  }

  console.log('Order ' + orderId + ' status: ' + status);
  return status;
}

export function isOrderPaid(status: string): boolean {
  return status === "PAID";
}`,
      },
      {
        name: 'OrderStatus.ts',
        lang: 'typescript',
        code: `/**
 * TODO: Define the OrderStatus enum here.
 * All string literals across the codebase should
 * become members of this enum.
 *
 * Example:
 *   export enum OrderStatus {
 *     PENDING   = 'PAYMENT_PENDING',
 *     PAID      = 'PAID',
 *     CANCELLED = 'CANCELLED',
 *   }
 */

// TODO: export enum OrderStatus { ... }`,
      },
      {
        name: 'notifications.ts',
        lang: 'typescript',
        readOnly: true,
        code: `import { OrderStatus } from './OrderStatus';

/**
 * READ-ONLY — already uses OrderStatus correctly.
 * Shows the pattern your checkout.ts should follow.
 */
export function sendNotification(status: OrderStatus): void {
  if (status === OrderStatus.PAID) {
    console.log('Sending receipt email...');
  } else if (status === OrderStatus.PENDING) {
    console.log('Sending payment processing SMS...');
  } else if (status === OrderStatus.CANCELLED) {
    console.log('Sending cancellation email...');
  }
}`,
      },
    ],
    objectives: [
      {
        label: 'Define PENDING in the OrderStatus enum in OrderStatus.ts',
        check: { type: 'contains', file: 'OrderStatus.ts', pattern: 'PENDING' },
      },
      {
        label: 'Remove the "PAYMENT_PENDING" string literal from checkout.ts',
        check: { type: 'not_contains', file: 'checkout.ts', pattern: '"PAYMENT_PENDING"' },
      },
      {
        label: 'checkout.ts imports and uses the OrderStatus enum',
        check: { type: 'contains', file: 'checkout.ts', pattern: 'OrderStatus' },
      },
    ],
    hints: [
      'In OrderStatus.ts: `export enum OrderStatus { PENDING = "PAYMENT_PENDING", PAID = "PAID", CANCELLED = "CANCELLED" }`',
      'In checkout.ts: add `import { OrderStatus } from "./OrderStatus";` at the top.',
      'Replace `"PAYMENT_PENDING"` with `OrderStatus.PENDING`, `"PAID"` with `OrderStatus.PAID`, and `"CANCELLED"` with `OrderStatus.CANCELLED`.',
    ],
    totalTests: 12,
    testFramework: 'Jest',
    xp: 150,
    successMessage: 'Magic strings eliminated. TypeScript enforces every status value at compile time. The next developer who types "PAYMNT_PENDING" sees a red squiggle before the code even runs.',
  },
};

export default challenge;
