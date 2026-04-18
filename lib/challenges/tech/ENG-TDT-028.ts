import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-TDT-028',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Missing Circuit Breaker on Downstream Service',
  companies: ['Netflix', 'Amazon'],
  timeEst: '~35 min',
  level: 'Senior',
  status: 'Not Started',
  desc: 'A checkout service calls a loyalty points API synchronously. When the loyalty service degrades, checkout failure rates hit 80%. Add a circuit breaker with half-open state to fail fast and recover gracefully.',
  solution: 'Implement a CircuitBreaker class with CLOSED/OPEN/HALF_OPEN states. Track failure count and last failure time. In OPEN state, throw immediately without calling the downstream. After a cooldown, transition to HALF_OPEN and allow one probe request.',
  lang: 'TypeScript',
  tribunalData: {
    background: `The loyalty service SLA is 99.9% — but when it degrades to 95%, cascade failure takes checkout down to 80% success rate. Each checkout attempt waits 10s for loyalty to timeout before failing.\n\nA circuit breaker is a state machine: CLOSED (normal), OPEN (fail fast, no calls), HALF_OPEN (single probe). When failure threshold is exceeded, trip to OPEN. After cooldown, probe. If probe succeeds, close again.\n\nYour mission: implement a production-grade circuit breaker.`,
    folderPath: 'src/reliability',
    primaryFile: 'CircuitBreaker.ts',
    files: [
      {
        name: 'CircuitBreaker.ts',
        lang: 'typescript',
        code: `// TODO: Implement a circuit breaker with three states.
// States: CLOSED | OPEN | HALF_OPEN
// Config: failureThreshold (default 5), cooldownMs (default 30000)
//
// Behaviour:
//  - CLOSED: calls go through. On failure, increment counter. When counter >= threshold, trip to OPEN.
//  - OPEN: throw CircuitOpenError immediately. After cooldownMs, transition to HALF_OPEN.
//  - HALF_OPEN: allow ONE call. If success -> CLOSED, reset counter. If failure -> OPEN again.

export class CircuitOpenError extends Error {
  constructor() { super('Circuit is open — downstream unavailable'); this.name = 'CircuitOpenError'; }
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  cooldownMs: number;
}

export class CircuitBreaker {
  // TODO: implement
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    throw new Error('Not implemented');
  }
}`,
      },
      {
        name: 'checkoutService.ts',
        lang: 'typescript',
        code: `import { CircuitBreaker, CircuitOpenError } from './CircuitBreaker';
import { loyaltyClient } from '../loyalty/client';

// TODO: Wrap loyaltyClient.getPoints() with the circuit breaker.
// When circuit is OPEN, return 0 points and proceed with checkout.
const loyaltyBreaker = new CircuitBreaker({ failureThreshold: 5, cooldownMs: 30_000 });

export async function checkout(userId: string, cartTotal: number) {
  // TODO: Use loyaltyBreaker.execute() to call loyaltyClient.getPoints()
  const loyaltyPoints = await loyaltyClient.getPoints(userId);
  const discount = loyaltyPoints * 0.01;
  return { total: cartTotal - discount, pointsUsed: loyaltyPoints };
}`,
      },
    ],
    objectives: [
      {
        label: 'Implement CircuitBreaker with CLOSED/OPEN/HALF_OPEN states',
        check: { type: 'contains', file: 'CircuitBreaker.ts', pattern: 'HALF_OPEN' },
      },
      {
        label: 'Throw CircuitOpenError when circuit is OPEN',
        check: { type: 'contains', file: 'CircuitBreaker.ts', pattern: 'CircuitOpenError' },
      },
      {
        label: 'Implement cooldown and HALF_OPEN probe logic',
        check: { type: 'contains', file: 'CircuitBreaker.ts', pattern: 'cooldownMs' },
      },
      {
        label: 'Use circuit breaker in checkoutService.ts with graceful fallback',
        check: { type: 'contains', file: 'checkoutService.ts', pattern: 'loyaltyBreaker.execute' },
      },
    ],
    hints: [
      'Track `failureCount`, `state: "CLOSED"|"OPEN"|"HALF_OPEN"`, and `lastFailureTime: number`.',
      'In OPEN state: `if (Date.now() - lastFailureTime > cooldownMs) setState("HALF_OPEN"); else throw new CircuitOpenError()`',
      'In checkoutService: catch CircuitOpenError and return 0 loyalty points — checkout still works, just without discount.',
    ],
    totalTests: 24,
    testFramework: 'Jest',
    xp: 400,
    successMessage: `Checkout now degrades gracefully under loyalty service failures. When the circuit trips, customers still complete purchases (0 points). When loyalty recovers, the circuit closes and rewards resume automatically.`,
  },
};

export default challenge;
