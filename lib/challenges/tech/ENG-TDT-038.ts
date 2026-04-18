import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-038',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'No Structured Logging — Unqueryable Log Strings',
  companies: ['Datadog', 'Splunk'],
  timeEst: '~20 min',
  level: 'Mid',
  status: 'Not Started',
  desc: 'All logs are free-form console.log strings: "User 123 placed order for $45.00". These are unqueryable in Datadog. Replace with JSON structured logs using a proper logger (Pino).',
  solution: 'Install and configure pino. Replace all console.log/error calls with logger.info/error. Use structured fields: { userId, orderId, amount } — not string interpolation.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The on-call engineer got paged at 2am for elevated error rates. They opened Datadog and found thousands of lines like "Failed to process order for user 5892 - amount: 129.99". You can't query by userId in Datadog without regex.\n\nStructured logs are JSON objects. Every field is queryable: filter by userId=5892, sum amount grouped by error type, alert when errorCount > 100.\n\nYour mission: replace all string logs with Pino structured logging.`,
    folderPath: 'src/orders',
    primaryFile: 'orderProcessor.ts',
    files: [
      {
        name: 'orderProcessor.ts',
        lang: 'typescript',
        code: `// TODO: Replace all console.log/error with pino structured logging.
// Use structured fields — not string interpolation.
// Example: logger.info({ userId, orderId, amount }, 'Order placed')

export async function processOrder(userId: string, orderId: string, amount: number) {
  console.log(\`Processing order \${orderId} for user \${userId} - amount: \${amount}\`);

  try {
    await chargePayment(userId, amount);
    console.log(\`Payment successful for order \${orderId}\`);

    await updateInventory(orderId);
    console.log(\`Inventory updated for order \${orderId}\`);

    console.log(\`Order \${orderId} completed for user \${userId} - total: \${amount}\`);
  } catch (err) {
    console.error(\`Failed to process order \${orderId} for user \${userId} - \${err}\`);
    throw err;
  }
}

async function chargePayment(userId: string, amount: number) { /* stub */ }
async function updateInventory(orderId: string) { /* stub */ }`,
      },
      {
        name: 'logger.ts',
        lang: 'typescript',
        code: `import pino from 'pino';

// TODO: Create and export a configured Pino logger instance.
// In production: JSON output
// In development: pretty-printed (pino-pretty)

export const logger = pino({
  // TODO: configure
});`,
      },
    ],
    objectives: [
      {
        label: 'Create and export a Pino logger in logger.ts',
        check: { type: 'contains', file: 'logger.ts', pattern: 'pino(' },
      },
      {
        label: 'Remove all console.log calls from orderProcessor.ts',
        check: { type: 'not_contains', file: 'orderProcessor.ts', pattern: 'console.log' },
      },
      {
        label: 'Remove all console.error calls from orderProcessor.ts',
        check: { type: 'not_contains', file: 'orderProcessor.ts', pattern: 'console.error' },
      },
      {
        label: 'Use structured fields (object as first arg) in logger calls',
        check: { type: 'contains', file: 'orderProcessor.ts', pattern: 'userId' },
      },
    ],
    hints: [
      'Pino structured logging: `logger.info({ userId, orderId, amount }, "Order placed")` — NOT `logger.info(\`...\${userId}...\`)`.',
      'For errors: `logger.error({ userId, orderId, err }, "Failed to process order")` — Pino serialises the error object automatically.',
      'Set `level: process.env.LOG_LEVEL || "info"` in the Pino config.',
    ],
    totalTests: 12,
    testFramework: 'Jest',
    xp: 240,
    successMessage: `Logs are now structured JSON. Datadog can filter by userId, sum amount by error type, and trigger alerts on specific error codes — all in seconds. 2am debugging sessions now take 2 minutes.`,
  },
};

export default challenge;
