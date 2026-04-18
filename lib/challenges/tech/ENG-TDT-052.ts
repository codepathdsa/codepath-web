import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-052',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Blocking CPU Work on the Event Loop',
  companies: ['Node.js', 'Deno'],
  timeEst: '~30 min',
  level: 'Mid',
  status: 'Not Started',
  desc: 'A report generator performs heavy JSON parsing and computation synchronously on the main thread. During 200ms of CPU work, all HTTP requests queue. Move the work to a Worker Thread.',
  solution: 'Move the heavy computation to a worker_threads Worker. Communicate via postMessage. The main thread dispatches work and receives results asynchronously — never blocking.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The report generator parses large JSON files and performs aggregations — 200ms of synchronous CPU work per report. During that 200ms, Node.js cannot process any other requests: the event loop is blocked.\n\nWith 10 concurrent report requests, the 10th user waits 2 seconds for pure CPU overhead.\n\nWorker threads run in a separate V8 isolate — heavy CPU work doesn't block the main event loop.\n\nYour mission: offload the computation to a worker thread.`,
    folderPath: 'src/reports',
    primaryFile: 'reportWorker.ts',
    files: [
      {
        name: 'reportGenerator.ts',
        lang: 'typescript',
        code: `import { Worker } from 'worker_threads';
import path from 'path';

// TODO: Replace synchronous computation with worker thread dispatch.
// Use runInWorker() to offload heavy computation.

// CURRENT ANTI-PATTERN: blocking the event loop
export function generateReportSync(data: object[]): object {
  // Simulates 200ms CPU work
  const result: Record<string, number> = {};
  for (const item of data) {
    const key = (item as any).category;
    result[key] = (result[key] ?? 0) + (item as any).value;
  }
  return result;
}

// TODO: Implement this non-blocking version using worker_threads
export async function generateReport(data: object[]): Promise<object> {
  // TODO: dispatch to worker thread
  throw new Error('Not implemented');
}`,
      },
      {
        name: 'reportWorker.ts',
        lang: 'typescript',
        code: `import { parentPort, workerData } from 'worker_threads';

// This file runs in the worker thread.
// TODO: Perform the heavy computation and postMessage the result.

const data: object[] = workerData;

// TODO: run the aggregation and post result back
// parentPort!.postMessage(result);`,
      },
    ],
    objectives: [
      {
        label: 'Implement generateReport using Worker thread dispatch',
        check: { type: 'contains', file: 'reportGenerator.ts', pattern: 'new Worker' },
      },
      {
        label: 'Resolve promise on worker message event',
        check: { type: 'contains', file: 'reportGenerator.ts', pattern: "on('message'" },
      },
      {
        label: 'Perform computation in reportWorker.ts',
        check: { type: 'contains', file: 'reportWorker.ts', pattern: 'parentPort' },
      },
    ],
    hints: [
      '`new Worker(path.resolve(__dirname, "reportWorker.js"), { workerData: data })`',
      '`worker.on("message", result => resolve(result)); worker.on("error", reject);`',
      'In the worker: `const result = aggregateData(workerData); parentPort!.postMessage(result);`',
    ],
    totalTests: 14,
    testFramework: 'Jest',
    xp: 320,
    successMessage: `The event loop is free. 200ms CPU work now runs in a separate thread. 10 concurrent report requests execute truly in parallel instead of queuing on the main thread. API latency for other endpoints is unaffected during report generation.`,
  },
};

export default challenge;
