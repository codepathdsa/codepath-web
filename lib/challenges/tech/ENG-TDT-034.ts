import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-034',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'No Idempotency Keys on Payment API',
  companies: ['Stripe', 'PayPal'],
  timeEst: '~30 min',
  level: 'Senior',
  status: 'Not Started',
  desc: 'A payment retry mechanism sends the same charge request without idempotency keys. Network hiccups cause duplicate charges — 340 customers double-charged last month. Implement idempotency using a UUID stored in the DB before the request.',
  solution: 'Generate a stable idempotency key from (userId + orderId + amount). Store it in the DB before the payment API call. If the key already exists, return the stored result without re-charging. Pass the key in the Stripe-Idempotency-Key header.',
  lang: 'TypeScript',
  tribunalData: {
    background: `When the payment request times out, the retry logic sends an identical request — but doesn't know if the first one succeeded. Stripe charges the card again.\n\nThe fix is idempotency: generate a deterministic key from the request parameters, store it before the call, and check it on retry. If the key exists, return the cached result.\n\nYour mission: implement idempotency key storage and header forwarding.`,
    folderPath: 'src/payments',
    primaryFile: 'idempotentPayment.ts',
    files: [
      {
        name: 'idempotentPayment.ts',
        lang: 'typescript',
        code: `import Stripe from 'stripe';
import { db } from '../db';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// TODO: Implement idempotent payment with:
//   1. Generate idempotency key from stable inputs (userId + orderId + amount)
//   2. Check DB for existing result — if found, return it (don't re-charge)
//   3. Call Stripe with the idempotency key in request options
//   4. Store the result in DB before returning

export async function chargePayment(
  userId: string,
  orderId: string,
  amount: number,
  paymentMethodId: string
): Promise<{ chargeId: string; status: string }> {
  // TODO: implement
  const charge = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    payment_method: paymentMethodId,
    confirm: true,
  });

  return { chargeId: charge.id, status: charge.status };
}`,
      },
      {
        name: 'schema.sql',
        lang: 'sql',
        readOnly: true,
        code: `CREATE TABLE payment_idempotency (
  idempotency_key TEXT PRIMARY KEY,
  charge_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);`,
      },
    ],
    objectives: [
      {
        label: 'Generate a deterministic idempotency key from userId+orderId+amount',
        check: { type: 'contains', file: 'idempotentPayment.ts', pattern: 'crypto' },
      },
      {
        label: 'Check DB for existing idempotency key before charging',
        check: { type: 'contains', file: 'idempotentPayment.ts', pattern: 'payment_idempotency' },
      },
      {
        label: 'Pass idempotency key to Stripe in request options',
        check: { type: 'contains', file: 'idempotentPayment.ts', pattern: 'idempotencyKey' },
      },
      {
        label: 'Store result in DB after successful charge',
        check: { type: 'contains', file: 'idempotentPayment.ts', pattern: 'INSERT INTO payment_idempotency' },
      },
    ],
    hints: [
      'Key: `crypto.createHash("sha256").update(\`\${userId}:\${orderId}:\${amount}\`).digest("hex")`',
      'Check first: `SELECT charge_id, status FROM payment_idempotency WHERE idempotency_key=$1`',
      'Stripe accepts idempotency: `stripe.paymentIntents.create({...}, { idempotencyKey: key })`',
    ],
    totalTests: 16,
    testFramework: 'Jest',
    xp: 400,
    successMessage: `Double charges are impossible. Every retry looks up the idempotency key first — if the original charge succeeded, the cached result is returned immediately. 340 monthly double-charges → 0.`,
  },
};

export default challenge;
