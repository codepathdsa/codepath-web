import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-029',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Distributed Transaction Without Saga Pattern',
  companies: ['Stripe', 'Adyen'],
  timeEst: '~45 min',
  level: 'Senior',
  status: 'Not Started',
  desc: 'An order service calls inventory, payment, and shipping APIs in sequence with no compensation. If shipping fails after payment succeeds, the customer is charged but never ships. Implement a choreography-based saga with compensating transactions.',
  solution: 'Model each step as an event. For each step, define a compensating action. If any step fails, publish compensation events in reverse order: reverse-ship → refund-payment → restore-inventory.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The order flow: reserve inventory → charge payment → create shipment. The problem: if createShipment fails after chargePayment succeeds, the customer is charged and the inventory is reserved — but no shipment exists.\n\nThis is the distributed transaction problem. You can't use a 2PC across microservices. The solution is the Saga pattern: each step has a compensating transaction.\n\nYour mission: implement the saga orchestrator with rollback logic.`,
    folderPath: 'src/order',
    primaryFile: 'orderSaga.ts',
    files: [
      {
        name: 'orderSaga.ts',
        lang: 'typescript',
        code: `import { inventoryService } from '../inventory';
import { paymentService } from '../payment';
import { shippingService } from '../shipping';

// TODO: Implement a saga with compensating transactions.
// Steps:
//   1. inventory.reserve(orderId, items) — compensate: inventory.release(orderId)
//   2. payment.charge(orderId, amount) — compensate: payment.refund(orderId)
//   3. shipping.create(orderId, address) — no compensation needed (last step)
//
// If step N fails, run compensating transactions for steps N-1..1 in reverse order.

export async function processOrder(order: Order): Promise<{ success: boolean; error?: string }> {
  // TODO: implement the saga
  await inventoryService.reserve(order.id, order.items);
  await paymentService.charge(order.id, order.total);
  await shippingService.create(order.id, order.address);
  return { success: true };
}

interface Order {
  id: string;
  items: Array<{ sku: string; qty: number }>;
  total: number;
  address: string;
}`,
      },
      {
        name: 'services.ts',
        lang: 'typescript',
        readOnly: true,
        code: `export const inventoryService = {
  reserve: (orderId: string, items: object[]) => Promise.resolve(),
  release: (orderId: string) => Promise.resolve(),
};

export const paymentService = {
  charge: (orderId: string, amount: number) => Promise.resolve(),
  refund: (orderId: string) => Promise.resolve(),
};

export const shippingService = {
  create: (orderId: string, address: string) => Promise.resolve(),
};`,
      },
    ],
    objectives: [
      {
        label: 'Wrap the saga steps in try/catch with compensation on failure',
        check: { type: 'contains', file: 'orderSaga.ts', pattern: 'try {' },
      },
      {
        label: 'Call inventory.release() as compensation when payment or shipping fails',
        check: { type: 'contains', file: 'orderSaga.ts', pattern: 'release' },
      },
      {
        label: 'Call payment.refund() as compensation when shipping fails',
        check: { type: 'contains', file: 'orderSaga.ts', pattern: 'refund' },
      },
    ],
    hints: [
      'Track completed steps in an array. On catch, iterate in reverse and call each compensation function.',
      'For step 1 failure: no compensation needed. For step 2 failure: release inventory. For step 3 failure: refund payment + release inventory.',
      'Compensating transactions can also fail — log errors but continue unwinding. Don\'t let a compensation failure prevent the others.',
    ],
    totalTests: 18,
    testFramework: 'Jest',
    xp: 450,
    successMessage: `The saga is resilient. A shipping failure now triggers automatic payment refund and inventory release. Customers are never charged without receiving their order. The system self-heals without manual intervention.`,
  },
};

export default challenge;
