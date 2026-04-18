import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-031',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'No Input Validation on Form Submission',
  companies: ['Stripe', 'Square'],
  timeEst: '~20 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'A payment form accepts any string as card number, expiry, and amount. Empty strings and negative amounts reach the payment processor, causing 400 errors logged as P0 incidents. Add Zod validation.',
  solution: 'Define a PaymentSchema with zod. Validate req.body with schema.safeParse(). Return 400 with structured field errors on failure. Never pass unvalidated data to the payment client.',
  lang: 'TypeScript',
  tribunalData: {
    background: `On-call was paged at 3am because the payment processor returned 400 errors in bulk. The root cause: a cron job was submitting forms with empty card numbers — nobody validated on the server side.\n\nClient-side validation had been stripped during a React Native migration. The server assumed the client was honest. It wasn't.\n\nYour mission: add server-side validation with Zod and return clear field-level errors.`,
    folderPath: 'src/api/payments',
    primaryFile: 'paymentRoute.ts',
    files: [
      {
        name: 'paymentRoute.ts',
        lang: 'typescript',
        code: `import { Router } from 'express';
import { z } from 'zod';
import { processPayment } from './processor';

const router = Router();

// TODO: Add Zod validation before calling processPayment.
// Required fields: cardNumber (16 digits), expiry (MM/YY), cvv (3-4 digits), amount (positive number)
// Return 400 with { errors: [{field, message}] } on validation failure.
router.post('/pay', async (req, res) => {
  const { cardNumber, expiry, cvv, amount } = req.body;
  // BUG: No validation — empty/invalid data reaches the payment processor
  try {
    const result = await processPayment({ cardNumber, expiry, cvv, amount });
    res.json({ success: true, transactionId: result.id });
  } catch (err) {
    res.status(500).json({ error: 'Payment failed' });
  }
});

export default router;`,
      },
      {
        name: 'schemas.ts',
        lang: 'typescript',
        code: `import { z } from 'zod';

// TODO: Define the PaymentSchema using Zod.
// cardNumber: exactly 16 digits (string, no spaces)
// expiry: MM/YY format
// cvv: 3-4 digits
// amount: positive number, max 2 decimal places

export const PaymentSchema = z.object({
  // TODO
});

export type PaymentInput = z.infer<typeof PaymentSchema>;`,
      },
    ],
    objectives: [
      {
        label: 'Define PaymentSchema with all four fields in schemas.ts',
        check: { type: 'contains', file: 'schemas.ts', pattern: 'cardNumber' },
      },
      {
        label: 'Use safeParse in the route and return 400 on failure',
        check: { type: 'contains', file: 'paymentRoute.ts', pattern: 'safeParse' },
      },
      {
        label: 'Return structured field errors (not just a string)',
        check: { type: 'contains', file: 'paymentRoute.ts', pattern: 'errors' },
      },
      {
        label: 'Pass only validated data to processPayment',
        check: { type: 'contains', file: 'paymentRoute.ts', pattern: 'data.cardNumber' },
      },
    ],
    hints: [
      'Card number regex: `z.string().regex(/^\\d{16}$/, "Must be 16 digits")`',
      'Expiry regex: `z.string().regex(/^(0[1-9]|1[0-2])\\/\\d{2}$/, "Must be MM/YY")`',
      'After `safeParse`, if `!result.success`, return `res.status(400).json({ errors: result.error.errors })`',
    ],
    totalTests: 18,
    testFramework: 'Jest + Supertest',
    xp: 210,
    successMessage: `Invalid data is rejected at the boundary with clear field-level error messages. The payment processor never sees garbage input. 3am pages from validation errors are over.`,
  },
};

export default challenge;
