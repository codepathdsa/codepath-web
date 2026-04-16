import type { Challenge } from '../types';

// ─── ENG-TDT-003 ─────────────────────────────────────────────────────────────────

const challenge: Challenge = {
  id: 'ENG-TDT-003',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Break the Circular Dependency',
  companies: ['Uber', 'Doordash'],
  timeEst: '~45 min',
  level: 'Senior',
  status: 'Not Started',
  desc: 'OrderService imports BillingEngine to charge the card. BillingEngine imports OrderService to mark it PAID. TypeScript crashes with a circular dependency error at runtime.',
  solution: 'Introduce an EventBus. BillingEngine emits payment.succeeded. OrderService listens for it. Neither module imports the other.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The checkout flow broke in production at 2 AM. Root cause: a circular import between OrderService and BillingEngine that the bundler silently resolved to undefined at runtime.\n\nOrderService needs BillingEngine to charge the card. BillingEngine needs OrderService to flip the order status to PAID. Classic chicken-and-egg.\n\nYour mission: introduce an EventBus so BillingEngine emits a "payment.succeeded" event and OrderService reacts to it. Neither module should import the other directly.`,
    folderPath: 'src/services',
    primaryFile: 'OrderService.ts',
    files: [
      {
        name: 'OrderService.ts',
        lang: 'typescript',
        code: `import { BillingEngine } from './BillingEngine'; // circular!

/**
 * TODO: Remove the BillingEngine import.
 * Listen for 'payment.succeeded' on the EventBus
 * and call markPaid() there instead.
 */
export class OrderService {
  async placeOrder(orderId: string, amount: number): Promise<void> {
    console.log('[Order] Creating order ' + orderId);
    const billing = new BillingEngine();
    await billing.charge(orderId, amount);
  }

  markPaid(orderId: string): void {
    console.log('[Order] Order ' + orderId + ' marked PAID');
  }
}`,
      },
      {
        name: 'BillingEngine.ts',
        lang: 'typescript',
        code: `import { OrderService } from './OrderService'; // circular!

/**
 * TODO: Remove the OrderService import.
 * After charging, emit 'payment.succeeded' on EventBus
 * instead of calling OrderService.markPaid() directly.
 */
export class BillingEngine {
  async charge(orderId: string, amount: number): Promise<void> {
    console.log('[Billing] Charging $' + amount + ' for order ' + orderId);
    const order = new OrderService();
    order.markPaid(orderId);
  }
}`,
      },
      {
        name: 'EventBus.ts',
        lang: 'typescript',
        code: `/**
 * HINT: A minimal Pub/Sub EventBus.
 * EventBus.on('payment.succeeded', handler) — subscribe
 * EventBus.emit('payment.succeeded', { orderId }) — publish
 */
type Handler = (payload: Record<string, unknown>) => void;

class EventBusClass {
  private listeners: Record<string, Handler[]> = {};

  on(event: string, handler: Handler): void {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(handler);
  }

  emit(event: string, payload: Record<string, unknown>): void {
    (this.listeners[event] ?? []).forEach(h => h(payload));
  }
}

export const EventBus = new EventBusClass();`,
      },
      {
        name: 'index.ts',
        lang: 'typescript',
        readOnly: true,
        code: `/**
 * READ-ONLY — bootstrap file.
 * This can import both services because it sits above
 * the dependency graph. When this runs without error, you're done.
 */
import { OrderService } from './OrderService';
import { BillingEngine } from './BillingEngine';

const orders = new OrderService();
const billing = new BillingEngine();
console.log('Services started:', orders, billing);`,
      },
    ],
    objectives: [
      {
        label: 'Remove BillingEngine import from OrderService',
        check: { type: 'not_contains', file: 'OrderService.ts', pattern: 'BillingEngine' },
      },
      {
        label: 'OrderService subscribes to EventBus',
        check: { type: 'contains', file: 'OrderService.ts', pattern: 'EventBus' },
      },
      {
        label: 'BillingEngine emits event instead of calling OrderService',
        check: { type: 'contains', file: 'BillingEngine.ts', pattern: 'EventBus.emit' },
      },
    ],
    hints: [
      'In BillingEngine.ts: replace `new OrderService().markPaid(orderId)` with `EventBus.emit("payment.succeeded", { orderId })`.',
      'In OrderService.ts: remove the BillingEngine import. In a constructor, add `EventBus.on("payment.succeeded", ({ orderId }) => this.markPaid(orderId as string))`.',
      'Both files should import EventBus — that is the only shared dependency allowed.',
    ],
    totalTests: 18,
    testFramework: 'Jest',
    xp: 350,
    successMessage: 'Circular dependency eliminated. OrderService and BillingEngine communicate through events — neither knows the other exists. Adding a receipt email is now one EventBus.on() call.',
  },
};

export default challenge;
