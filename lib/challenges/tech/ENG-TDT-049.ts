import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-049',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'No Backpressure in Stream Processing',
  companies: ['Confluent', 'Databricks'],
  timeEst: '~40 min',
  level: 'Senior',
  status: 'Not Started',
  desc: 'A Kafka consumer processes messages as fast as possible. The downstream database can only handle 500 writes/second. At 5000 messages/second, the DB crashes. Add backpressure with a concurrency-limited queue.',
  solution: 'Implement a ConcurrentQueue that limits to N parallel DB writes. When at capacity, pause Kafka consumer. Resume when queue drains below a low-water mark. Use p-limit or a manual semaphore.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The Kafka topic spikes to 5,000 messages/second during business hours. The consumer reads them all and fires DB writes immediately. The database, limited to 500 writes/second, starts queuing requests. Connection pool exhausts. DB crashes.\n\nBackpressure is a flow control mechanism: slow producers down when consumers can't keep up. The fix is to limit concurrent DB writes and pause consumption when at capacity.\n\nYour mission: implement a concurrency-limited consumer.`,
    folderPath: 'src/streaming',
    primaryFile: 'consumer.ts',
    files: [
      {
        name: 'consumer.ts',
        lang: 'typescript',
        code: `import { kafka } from './kafka';
import { db } from '../db';

// TODO: Add backpressure — limit concurrent DB writes to MAX_CONCURRENT.
// When at capacity: pause the Kafka consumer.
// When queue drains below LOW_WATER: resume.

const MAX_CONCURRENT = 50;  // max parallel DB writes

export async function startConsumer() {
  const consumer = kafka.consumer({ groupId: 'event-processor' });
  await consumer.connect();
  await consumer.subscribe({ topic: 'user-events' });

  await consumer.run({
    eachMessage: async ({ message }) => {
      // BUG: no backpressure — fires DB write for every message immediately
      const event = JSON.parse(message.value!.toString());
      await db.query('INSERT INTO events(data) VALUES($1)', [JSON.stringify(event)]);
    },
  });
}`,
      },
      {
        name: 'semaphore.ts',
        lang: 'typescript',
        code: `// TODO: Implement a Semaphore for limiting concurrent operations.
// acquire(): waits if at capacity, then takes a slot
// release(): frees a slot and resolves any waiting acquire()

export class Semaphore {
  private count: number;
  private queue: Array<() => void> = [];

  constructor(private readonly max: number) {
    this.count = max;
  }

  async acquire(): Promise<void> {
    // TODO
  }

  release(): void {
    // TODO
  }
}`,
      },
    ],
    objectives: [
      {
        label: 'Implement Semaphore.acquire() that waits when at capacity',
        check: { type: 'contains', file: 'semaphore.ts', pattern: 'Promise' },
      },
      {
        label: 'Implement Semaphore.release() that unblocks waiting acquirers',
        check: { type: 'contains', file: 'semaphore.ts', pattern: 'queue.shift' },
      },
      {
        label: 'Use Semaphore in consumer to limit concurrent DB writes',
        check: { type: 'contains', file: 'consumer.ts', pattern: 'semaphore' },
      },
      {
        label: 'Release the semaphore in a finally block',
        check: { type: 'contains', file: 'consumer.ts', pattern: 'finally' },
      },
    ],
    hints: [
      'acquire: `if (this.count > 0) { this.count--; return; } return new Promise(resolve => this.queue.push(resolve));`',
      'release: `const next = this.queue.shift(); if (next) next(); else this.count++;`',
      'Consumer: `await semaphore.acquire(); try { await db.query(...); } finally { semaphore.release(); }`',
    ],
    totalTests: 18,
    testFramework: 'Jest',
    xp: 440,
    successMessage: `The database is protected. Max 50 concurrent writes cap DB load at ~500 writes/second. During spikes, messages queue in Kafka (it's designed for this) instead of crashing the database. System is now resilient to traffic bursts.`,
  },
};

export default challenge;
