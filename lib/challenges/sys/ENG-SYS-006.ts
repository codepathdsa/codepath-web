import type { Challenge } from '../types';

// ─── ENG-SYS-006 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-SYS-006',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design a Payment Gateway (Stripe)',
    companies: ['Stripe', 'Square'],
    timeEst: '~60 min',
    level: 'Senior',
    status: 'Not Started',
    desc:
      'Architect a B2B payment API. It must strictly guarantee 100% data consistency, ' +
      'no dropped payments, and absolute protection against double-charging ' +
      'due to network retries.',
    solution:
      'Use PostgreSQL with ACID transactions for all payment state. ' +
      'Enforce Idempotency Keys on every API endpoint — the key is stored in Postgres ' +
      'alongside the result, so retries return the cached response rather than re-executing. ' +
      'Implement a Saga pattern (or 2-Phase Commit) for cross-service distributed transactions ' +
      'to ensure bank and internal state stay synchronized.',

    simulation: {
      constraints: [
        { label: 'Consistency model', value: 'Strong (ACID required)' },
        { label: 'Double-charge rate', value: 'Must be 0%' },
        { label: 'Retry safety', value: 'All endpoints idempotent' },
        { label: 'Availability target', value: '99.999% (5.26 min/yr downtime)' },
        { label: 'Audit requirement', value: 'Every state change logged' },
      ],

      levels: [
        {
          // Lesson: payment APIs must be idempotent — retries can't double-charge
          traffic: 1000,
          targetLatency: 200,
          successMsg:
            'Idempotency layer active. Retry requests return cached result.',
          failMsg:
            '[DOUBLE CHARGE] A client retried a failed request. ' +
            'Two payment rows were created for the same transaction. ' +
            'You must enforce Idempotency Keys on the API endpoint.',
          failNode: 'api_server',
          failTooltip:
            'Every POST /charge request must include an idempotency_key in the header. ' +
            'Before processing, check if this key exists in Postgres. ' +
            'If yes, return the stored result — do NOT re-execute the charge. ' +
            'If no, execute and store the result atomically.',
          checks: [
            { type: 'hasPath', source: 'client', target: 'api_server' },
            { type: 'hasPath', source: 'api_server', target: 'postgres' },
          ],
        },
        {
          // Lesson: payment state must be in ACID-compliant DB, not eventually consistent
          traffic: 5000,
          targetLatency: 150,
          successMsg:
            'ACID transactions confirmed. Payment state consistent across all reads.',
          failMsg:
            '[DATA INCONSISTENCY] Cassandra\'s eventual consistency caused a payment to ' +
            'appear as "pending" to the merchant dashboard but "completed" in the ledger. ' +
            'Use PostgreSQL — payments require strong consistency, not eventual.',
          failNode: 'cassandra',
          failTooltip:
            'Cassandra is eventually consistent by default. For payments, ' +
            '"eventually" is not good enough — a charge must be atomically committed or rolled back. ' +
            'Replace Cassandra with PostgreSQL. Use SERIALIZABLE isolation for balance checks.',
          checks: [
            { type: 'hasEdge', source: 'api_server', target: 'postgres' },
          ],
        },
        {
          // Lesson: external bank API calls need async handling + Kafka for reliability
          traffic: 5000,
          targetLatency: 100,
          successMsg:
            'SYSTEM STABLE — Payments processed reliably. Saga pattern preventing partial failures.',
          failMsg:
            '[PARTIAL FAILURE] Internal DB was charged but the bank API call timed out. ' +
            'Your DB says the user paid; the bank says they didn\'t. ' +
            'Add Kafka + a Saga coordinator to manage distributed transaction state.',
          failNode: 'api_server',
          failTooltip:
            'Use the Saga pattern: split the transaction into steps ' +
            '(reserve funds → call bank API → confirm reservation). ' +
            'If the bank API fails, publish a compensating event to Kafka ' +
            'that reverses the DB reservation. This prevents the split-brain state.',
          checks: [
            { type: 'hasPath', source: 'api_server', target: 'kafka' },
            { type: 'hasPath', source: 'kafka', target: 'postgres' },
          ],
        },
      ],
    },

    questions: [
      {
        q: 'A client sends a charge request. Your server processes it but crashes before responding. The client retries. What happens?',
        hint: 'This is exactly what idempotency keys solve.',
        answer:
          'Without idempotency keys: the retry creates a second charge — the customer is double-billed. ' +
          'With idempotency keys: the client sends the same idempotency_key on retry. ' +
          'Your server checks the key in Postgres before executing. ' +
          'Finds the first charge result (committed before the crash). ' +
          'Returns that result without re-executing the charge. Customer billed exactly once.',
      },
      {
        q: 'Why is Postgres the right choice here when Cassandra handles higher throughput?',
        hint: 'CAP theorem: what do you sacrifice with eventual consistency in payments?',
        answer:
          'Cassandra sacrifices consistency for availability and partition tolerance. ' +
          'In a payment system, an inconsistent read could show a user has $500 when they have $0, ' +
          'allowing a fraudulent charge. ' +
          'Postgres provides SERIALIZABLE isolation: balance check and deduction happen atomically. ' +
          'No other transaction can read the intermediate state. ' +
          'For payment volumes (typically < 10k TPS), Postgres with connection pooling (PgBouncer) is sufficient.',
      },
      {
        q: 'What is the Saga pattern and how does it handle a bank API failure mid-transaction?',
        hint: 'Think of a Saga as a distributed transaction with compensating steps.',
        answer:
          'A Saga is a sequence of local transactions, each publishing an event on completion. ' +
          'Step 1: Reserve $100 from user balance (local Postgres write). ' +
          'Step 2: Call bank API to process payment (external). ' +
          'Step 3: Confirm reservation and mark payment complete. ' +
          'If Step 2 fails: publish a "payment_failed" event to Kafka. ' +
          'A compensating transaction runs Step 1 in reverse: release the $100 reservation. ' +
          'No money leaves the user\'s account. No orphaned state.',
      },
      {
        q: 'How do you prevent a race condition where two requests check a user\'s balance simultaneously and both see sufficient funds?',
        hint: 'Optimistic vs pessimistic locking in Postgres.',
        answer:
          'Use SELECT ... FOR UPDATE in Postgres to acquire a row-level lock on the user\'s balance row. ' +
          'The first transaction locks the row, checks the balance, deducts, and commits. ' +
          'The second transaction is blocked until the first commits. ' +
          'It then reads the updated balance and either proceeds or fails with "Insufficient funds". ' +
          'No two transactions can simultaneously see the same "available" balance.',
      },
      {
        q: 'Stripe achieves 99.999% uptime. How do you design for that level of availability?',
        hint: 'What are all the single points of failure in your design?',
        answer:
          '99.999% = 5.26 minutes downtime per year. Required: ' +
          '(1) Multi-AZ Postgres with synchronous replication — failover < 30 seconds. ' +
          '(2) Kafka with replication factor 3 — tolerates 2 broker failures. ' +
          '(3) Stateless API servers behind a load balancer — restart in seconds. ' +
          '(4) Circuit breakers on all external bank API calls — fail fast, queue for retry. ' +
          '(5) Regular chaos engineering (kill random nodes in staging). ' +
          'The biggest risk: the Postgres primary failing. Synchronous replication to a standby is mandatory.',
      },
    ],
  };

export default challenge;
