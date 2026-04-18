import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-019',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'No Retry Logic on Flaky External API',
  companies: ['Brex', 'Ramp'],
  timeEst: '~25 min',
  level: 'Mid',
  status: 'Not Started',
  desc: 'An expense categorization service calls a third-party ML API that returns 503 ~5% of the time. Without retries, 5% of expenses fail permanently. Implement exponential backoff with jitter.',
  solution: 'Wrap the HTTP call in a retry loop with up to 3 attempts, exponential backoff (1s, 2s, 4s base), and ±30% random jitter. Only retry on 5xx or network errors — never on 4xx.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The ML categorization API for expenses fails with 503 about 5% of the time under load. With 20,000 expenses/day, that's 1,000 permanent failures — requiring manual review by the finance team.\n\nThe fix is not to blindly retry forever. You need exponential backoff to avoid hammering the upstream, plus jitter to spread retry storms across clients.\n\nYour mission: implement a retryWithBackoff wrapper and apply it to the categorize call.`,
    folderPath: 'src/expenses',
    primaryFile: 'categorizer.ts',
    files: [
      {
        name: 'categorizer.ts',
        lang: 'typescript',
        code: `import { httpClient } from '../http';

// TODO: Wrap callCategorizationAPI with retry logic.
// Requirements:
//   - Max 3 attempts
//   - Exponential backoff: 1000ms, 2000ms, 4000ms
//   - ±30% random jitter on each delay
//   - Only retry on HTTP 5xx or network errors (never on 4xx)

export async function categorizeExpense(description: string): Promise<string> {
  const response = await httpClient.post('https://ml.api.internal/categorize', { description });
  return response.data.category;
}`,
      },
      {
        name: 'retry.ts',
        lang: 'typescript',
        code: `// TODO: Implement a generic retry wrapper with exponential backoff + jitter.

export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  shouldRetry: (error: unknown) => boolean;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  // TODO
  throw new Error('Not implemented');
}`,
      },
      {
        name: 'http.ts',
        lang: 'typescript',
        readOnly: true,
        code: `// Stub HTTP client for testing
export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export const httpClient = {
  post: async (url: string, body: object) => {
    // Simulates real HTTP — throws HttpError on 4xx/5xx
    return { data: { category: 'travel' } };
  }
};`,
      },
    ],
    objectives: [
      {
        label: 'Implement retryWithBackoff in retry.ts',
        check: { type: 'contains', file: 'retry.ts', pattern: 'baseDelayMs' },
      },
      {
        label: 'Apply exponential backoff (2^attempt * baseDelay)',
        check: { type: 'contains', file: 'retry.ts', pattern: 'Math.pow' },
      },
      {
        label: 'Add random jitter to the delay',
        check: { type: 'contains', file: 'retry.ts', pattern: 'Math.random' },
      },
      {
        label: 'Use retryWithBackoff in categorizer.ts',
        check: { type: 'contains', file: 'categorizer.ts', pattern: 'retryWithBackoff' },
      },
    ],
    hints: [
      'Delay formula: `Math.pow(2, attempt) * baseDelayMs * (0.7 + Math.random() * 0.6)` gives ±30% jitter.',
      'Check `shouldRetry` before each retry — if it returns false, rethrow immediately.',
      'Use `await new Promise(resolve => setTimeout(resolve, delay))` to sleep between attempts.',
    ],
    totalTests: 20,
    testFramework: 'Jest',
    xp: 280,
    successMessage: `Retry success rate increased from 95% to 99.8%. Exponential backoff with jitter prevents clients from thundering-herding the upstream service. 1,000 daily failures → ~40.`,
  },
};

export default challenge;
