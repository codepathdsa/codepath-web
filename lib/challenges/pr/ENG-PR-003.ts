import type { Challenge } from '../types';
// â”€â”€â”€ ENG-PR-003 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const challenge: Challenge = {
  id: 'ENG-PR-003',
  type: 'PR Review',
  badgeClass: 'badge-pr',
  title: 'await Inside forEach â€” Silent Async Failure',
  companies: ['Stripe', 'Linear'],
  timeEst: '~10 min',
  level: 'Junior',
  status: 'Not Started',
  desc: 'A junior dev refactored the order-fulfilment service to send confirmation emails after each order is marked shipped. QA reports emails are never sent, yet CI is green and no errors appear in logs.',
  solution: 'forEach ignores the return value of its callback â€” it does not await the async functions passed to it. The loop fires all the async calls and immediately moves on, so the emails are never awaited. Fix: replace forEach with for...of and await inside it, or use Promise.all(orders.map(sendEmail)).',
  prReview: {
    prNumber: 204,
    prBranch: 'feature/order-email-confirmation',
    prBase: 'main',
    prAuthor: 'junior-dev-99',
    prFile: 'src/services/fulfilment.ts',
    prAge: '2 hours ago',
    background: 'Post-ship emails were previously sent from a cron job. This PR moves the logic inline so emails fire immediately after the DB update, reducing the delay customers see.',
    changes: 'Used forEach to iterate orders and call sendConfirmationEmail for each one. Wrapped the call in async/await so it looks clean.',
    testing: 'CI passed. Checked the DB â€” orders are marked shipped correctly.',
    hints: [
      'What does Array.prototype.forEach do with the return value of its callback?',
      'If the callback is async, does forEach wait for the returned Promise to settle before the next iteration?',
      'How would you rewrite this so each sendConfirmationEmail call is actually awaited?',
    ],
    diff: [
      { lineNumL: 12, lineNumR: 12, type: 'normal', text: 'async function fulfilOrders(orders: Order[]) {' },
      { lineNumL: 13, lineNumR: 13, type: 'normal', text: '  await db.markShipped(orders.map(o => o.id));' },
      { lineNumL: 14, lineNumR: null, type: 'deletion', text: '  for (const order of orders) {' },
      { lineNumL: 15, lineNumR: null, type: 'deletion', text: '    await sendConfirmationEmail(order);' },
      { lineNumL: 16, lineNumR: null, type: 'deletion', text: '  }' },
      { lineNumL: null, lineNumR: 14, type: 'addition', text: '  orders.forEach(async (order) => {' },
      { lineNumL: null, lineNumR: 15, type: 'addition', text: '    await sendConfirmationEmail(order);' },
      { lineNumL: null, lineNumR: 16, type: 'addition', text: '  });' },
      { lineNumL: 17, lineNumR: 17, type: 'normal', text: '}' },
    ],
    bugOptions: [
      { value: 'foreach_async', label: 'forEach ignores Promises', sub: 'async callbacks not awaited' },
      { value: 'missing_try', label: 'No error handling', sub: 'try/catch missing' },
      { value: 'wrong_order', label: 'Wrong operation order', sub: 'email fires before DB update' },
      { value: 'memory_leak', label: 'Memory leak', sub: 'Promises accumulate unresolved' },
      { value: 'race_condition', label: 'Race condition', sub: 'Concurrent writes clash' },
      { value: 'missing_await', label: 'Missing top-level await', sub: 'fulfilOrders not awaited by caller' },
    ],
    correctBugType: 'foreach_async',
    successExplanation: "Spot on. forEach is not promise-aware â€” it calls the callback, ignores the returned Promise, and moves to the next item immediately. The emails are 'fired' but never awaited, so the fulfilOrders function resolves before any of them complete. Because nothing catches the floating Promises, failures disappear silently. Fix: use for...of with await, or Promise.all(orders.map(sendConfirmationEmail)).",
    failExplanation: "The bug is on line 14: forEach does not await async callbacks. It calls sendConfirmationEmail for each order, receives a Promise, and immediately discards it. Execution continues without waiting, so emails either never send or fail silently. Swap forEach for for...of and await inside it, or use await Promise.all(orders.map(sendConfirmationEmail)) to run them concurrently.",
  },
};
export default challenge;