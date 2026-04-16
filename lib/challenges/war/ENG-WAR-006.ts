import type { Challenge } from '../types';

// ─── ENG-WAR-006 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-006',
    type: 'War Room',
    badgeClass: 'badge-war',
    title: 'Cascading Failure via Synchronous Calls',
    companies: ['Amazon', 'Netflix'],
    timeEst: '~30 min',
    level: 'Senior',
    status: 'Not Started',
    desc: 'The non-critical "Recommendations" service slowed down. Suddenly, the critical "Checkout" service crashed. Why did a minor service take down the core business?',
    solution: 'Checkout makes synchronous REST calls to Recommendations. Because it slowed down, Checkout threads blocked waiting for replies, exhausting thread pools. Implement the Circuit Breaker pattern.',
    options: [
      { label: 'A', title: 'Scale up the Recommendations service', sub: 'kubectl scale deployment recommendations --replicas=30', isCorrect: false },
      { label: 'B', title: 'Restart the Checkout service pods', sub: 'kubectl rollout restart deployment checkout', isCorrect: false },
      { label: 'C', title: 'Add a timeout + Circuit Breaker on Checkout → Recommendations calls', sub: 'Implement Resilience4j/Hystrix circuit breaker with 500ms timeout', isCorrect: true },
      { label: 'D', title: 'Move both services into a single monolith', sub: 'Consolidate to reduce network hops', isCorrect: false },
    ]
  };

export default challenge;
