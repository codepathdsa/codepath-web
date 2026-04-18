import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-043',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Banking Ledger (Double-Entry)',
  companies: ['Stripe', 'Plaid', 'JPMorgan'],
  timeEst: '~55 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design an immutable double-entry accounting ledger for a fintech platform. ' +
    'Every financial transaction (transfer, fee, refund) must be recorded with full auditability. ' +
    'Account balances must be always accurate. ' +
    'Handle 100k transactions/sec and support queries: account balance, transaction history, reconciliation.',
  solution:
    'Double-entry bookkeeping: every transaction creates TWO ledger entries ' +
    '(debit from one account, credit to another). The sum of all entries always equals zero. ' +
    'Ledger entries are immutable (append-only). ' +
    'Account balance = SUM of all credits - debits for that account. ' +
    'A materialized balance cache in Redis is updated atomically with each transaction.',

  simulation: {
    constraints: [
      { label: 'Transactions/sec', value: '100,000' },
      { label: 'Ledger entries/sec', value: '200,000 (2 per transaction)' },
      { label: 'Accounts', value: '500M' },
      { label: 'Immutability', value: 'No UPDATE/DELETE ever' },
      { label: 'Balance accuracy', value: 'Exact — no approximations' },
    ],
    levels: [
      {
        traffic: 1000,
        targetLatency: 100,
        successMsg: 'Double-entry ledger working — each transaction creates debit + credit entries.',
        failMsg: '[FATAL] Single-entry accounting not reliable. Implement double-entry bookkeeping.',
        failNode: 'api_server',
        failTooltip:
          'Double-entry: transaction_id, account_id, amount, direction (DEBIT/CREDIT), timestamp. ' +
          'Transfer $100 from A to B: ' +
          'INSERT (txn_id, account_A, -100, DEBIT); INSERT (txn_id, account_B, +100, CREDIT). ' +
          'Both rows in the same DB transaction — atomically.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
        ],
      },
      {
        traffic: 10000,
        targetLatency: 50,
        successMsg: 'Balance cache active — account balance queries returning in < 5ms.',
        failMsg:
          '[SLOW BALANCE] Balance query computing SUM of all ledger entries for each request.',
        failNode: 'postgres',
        failTooltip:
          'A user with 10 years of transactions: SUM over 100k rows on every balance check. ' +
          'Maintain a materialized balance in Redis. ' +
          'Update atomically with Lua script: HINCRBYFLOAT balances {accountId} {amount}. ' +
          'Recompute from ledger on discrepancy (audit process).',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 20,
        successMsg: 'SYSTEM STABLE — 100k txns/sec, immutable audit trail, reconciliation automated.',
        failMsg:
          '[FRAUD] Balance in Redis is $500 but ledger sum is $200. ' +
          'Add hourly reconciliation to detect and alert on balance discrepancies.',
        failNode: 'redis',
        failTooltip:
          'Reconciliation job: for N% of accounts per hour, ' +
          'compare Redis balance to SUM of ledger entries. ' +
          'If they differ: log discrepancy, alert fraud team, freeze account for investigation. ' +
          'This catches bugs, data corruption, and fraud.',
        checks: [
          { type: 'hasEdge', source: 'worker', target: 'postgres' },
          { type: 'hasEdge', source: 'worker', target: 'redis' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'Why is double-entry bookkeeping more reliable than single-entry accounting?',
      hint: 'Self-balancing property.',
      answer:
        'In double-entry, every transaction has equal and opposite entries. ' +
        'The invariant: SUM(all debit entries) = SUM(all credit entries). ' +
        'If a bug creates a credit without a corresponding debit, the sum won\'t balance — ' +
        'the invariant is violated and detectable. ' +
        'Single-entry: no such invariant. A bug can silently create or destroy money. ' +
        'This is why every accounting system, from QuickBooks to Stripe, uses double-entry.',
    },
    {
      q: 'How do you handle a bank transfer that involves two accounts in different database shards?',
      hint: 'Cross-shard transactions.',
      answer:
        'Option 1: Saga pattern. ' +
        'Debit account A (shard 1) → if success, credit account B (shard 2). ' +
        'If credit fails, compensate: reverse the debit. ' +
        'The system may briefly show account A debited but account B not yet credited. ' +
        'Option 2: Use a single database for all financial transactions (no sharding). ' +
        'Many fintechs (Stripe) use a single Postgres instance with read replicas for the ledger, ' +
        'trading horizontal scale for simplicity and ACID guarantees.',
    },
    {
      q: 'A user claims they transferred $100 but their balance didn\'t decrease. How do you investigate?',
      hint: 'The ledger is your audit trail.',
      answer:
        'Query the ledger: SELECT * FROM ledger_entries WHERE account_id = X ORDER BY timestamp DESC LIMIT 100. ' +
        'Look for the transaction ID associated with the transfer. ' +
        'Check both sides: did the debit entry and the credit entry both get created? ' +
        'If debit exists but credit doesn\'t: the transfer is in a partial state (bug/crash mid-transaction). ' +
        'The compensating transaction (reverse the debit) must be applied. ' +
        'An immutable ledger makes this investigation straightforward.',
    },
    {
      q: 'How do you prevent overdrafts — a user spending more than their balance?',
      hint: 'Atomic check-and-debit.',
      answer:
        'In the same DB transaction: ' +
        'SELECT balance FROM accounts WHERE id = X FOR UPDATE; ' +
        'If balance < debitAmount: ROLLBACK, return "Insufficient funds"; ' +
        'ELSE: INSERT debit entry, UPDATE balance; COMMIT. ' +
        'The FOR UPDATE lock prevents another transaction from reading the same balance concurrently. ' +
        'In Redis: use a Lua script to check balance ≥ amount before DECR — atomic.',
    },
  ],
};

export default challenge;
