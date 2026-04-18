import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-042',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Missing Dead Letter Queue for Failed Job Processing',
  companies: ['Shopify', 'Twilio'],
  timeEst: '~35 min',
  level: 'Senior',
  status: 'Not Started',
  desc: 'A background job processor silently drops failed jobs after 3 retries. 2% of notification jobs fail permanently — no trace of what failed. Add a Dead Letter Queue (DLQ) to capture unprocessable messages.',
  solution: 'After max retries, instead of dropping the job, publish it to a dead-letter queue with error metadata (reason, timestamp, attempts). Add a /dlq/retry endpoint and monitoring alert when DLQ grows.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The notification job processor retries 3 times then silently discards failures. Every month, ~5,000 notifications are dropped — no error, no trace. Users never receive their refund notifications.\n\nA Dead Letter Queue captures jobs that cannot be processed. Engineers can inspect why they failed, fix the bug, and requeue them.\n\nYour mission: add DLQ support to the job processor.`,
    folderPath: 'src/jobs',
    primaryFile: 'jobProcessor.ts',
    files: [
      {
        name: 'jobProcessor.ts',
        lang: 'typescript',
        code: `import { queue } from './queue';
import { dlq } from './dlq';

interface Job {
  id: string;
  type: string;
  payload: object;
  attempts: number;
}

const MAX_RETRIES = 3;

// TODO: After MAX_RETRIES, send to DLQ instead of silently dropping.
export async function processJob(job: Job): Promise<void> {
  try {
    await handleJob(job);
  } catch (err) {
    job.attempts++;
    if (job.attempts < MAX_RETRIES) {
      await queue.requeue(job);
    } else {
      // BUG: Job silently dropped!
      console.error(\`Job \${job.id} failed after \${MAX_RETRIES} attempts\`);
    }
  }
}

async function handleJob(job: Job) {
  // ... job-specific logic
}`,
      },
      {
        name: 'dlq.ts',
        lang: 'typescript',
        code: `// TODO: Implement Dead Letter Queue storage.
// Store failed jobs with: job data, error reason, timestamp, attempt count.
// Provide: push(job, error) and getAll() and remove(jobId)

interface DLQEntry {
  job: object;
  error: string;
  failedAt: string;
  attempts: number;
}

export const dlq = {
  async push(job: object, error: Error): Promise<void> {
    // TODO: persist to DB or Redis
    throw new Error('Not implemented');
  },
  async getAll(): Promise<DLQEntry[]> {
    throw new Error('Not implemented');
  },
  async remove(jobId: string): Promise<void> {
    throw new Error('Not implemented');
  },
};`,
      },
    ],
    objectives: [
      {
        label: 'Call dlq.push() instead of silently dropping failed jobs',
        check: { type: 'contains', file: 'jobProcessor.ts', pattern: 'dlq.push' },
      },
      {
        label: 'Implement dlq.push with job data, error reason, and timestamp',
        check: { type: 'contains', file: 'dlq.ts', pattern: 'failedAt' },
      },
      {
        label: 'Include the original error message in the DLQ entry',
        check: { type: 'contains', file: 'dlq.ts', pattern: 'error.message' },
      },
    ],
    hints: [
      'DLQ push: `await db.query("INSERT INTO dead_letter_queue(job_id, job_data, error, failed_at, attempts) VALUES(...)", [...])`',
      'Include `error.stack` in the DLQ entry for debugging. `error.message` alone isn\'t always enough.',
      'Add a monitoring alert: if `COUNT(*) FROM dead_letter_queue > 100`, page on-call.',
    ],
    totalTests: 16,
    testFramework: 'Jest',
    xp: 380,
    successMessage: `No job is silently lost. Every failed notification lands in the DLQ with a full error trace. Engineers can inspect, fix the root cause, and requeue. 5,000 monthly dropped notifications → 0.`,
  },
};

export default challenge;
