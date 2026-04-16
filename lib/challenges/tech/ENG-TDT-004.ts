import type { Challenge } from '../types';

// ─── ENG-TDT-004 ─────────────────────────────────────────────────────────────────

const challenge: Challenge = {
  id: 'ENG-TDT-004',
  type: 'Tech Debt Tribunal',
  badgeClass: 'badge-error',
  title: 'Monolith to Microservice (Strangler Fig)',
  companies: ['Netflix', 'Atlassian'],
  timeEst: '~60 min',
  level: 'Senior',
  status: 'Not Started',
  desc: 'A 10-year-old Node.js monolith handles Search. On peak traffic it takes down auth and payments too. Extract Search into a microservice with zero downtime using the Strangler Fig pattern.',
  solution: 'Add a gateway router with a SEARCH_TRAFFIC_PERCENT knob. Route that percentage to the new SearchService, the rest to the monolith. Dial from 5% to 100%, then delete the old code.',
  lang: 'TypeScript',
  tribunalData: {
    background: `Search runs inside a 10-year-old monolith. On interview season peaks, it brings down the entire app — auth, payments, everything crashes together.\n\nThe team has a faster standalone SearchService ready to go. The dangerous part: cutting traffic over without downtime.\n\nYour mission: implement the Strangler Fig pattern in ApiGateway.ts. Add a SEARCH_TRAFFIC_PERCENT knob. Route that percentage to the new service, the rest to the monolith fallback. Once you hit 100%, the monolith search code is deleted.`,
    folderPath: 'src/gateway',
    primaryFile: 'ApiGateway.ts',
    files: [
      {
        name: 'ApiGateway.ts',
        lang: 'typescript',
        code: `/**
 * TODO: Implement the Strangler Fig traffic split.
 *
 * 1. Read SEARCH_TRAFFIC_PERCENT from process.env (0-100).
 * 2. For /search requests:
 *    - Roll Math.random() * 100.
 *    - If roll < pct  → forwardToSearchService(req)
 *    - Otherwise      → forwardToMonolith(req)
 * 3. All other routes always go to forwardToMonolith.
 */

function forwardToMonolith(req: { url: string }): object {
  console.log('[Gateway] -> Monolith', req.url);
  return { source: 'monolith', results: [] };
}

function forwardToSearchService(req: { url: string }): object {
  console.log('[Gateway] -> SearchService', req.url);
  return { source: 'search-service', results: [] };
}

export function handleRequest(req: { url: string }): object {
  // TODO: implement traffic split here
  return forwardToMonolith(req);
}`,
      },
      {
        name: 'SearchService.ts',
        lang: 'typescript',
        readOnly: true,
        code: `/**
 * READ-ONLY — the new high-performance service.
 * Already built and deployed. Route traffic to it via the gateway.
 */
export class SearchService {
  search(query: string): { results: string[] } {
    return { results: ['Result for: ' + query] };
  }
}`,
      },
      {
        name: 'MonolithSearch.ts',
        lang: 'typescript',
        readOnly: true,
        code: `/**
 * READ-ONLY — the old monolith search handler.
 * Still handles traffic not yet migrated.
 * Deleted once SEARCH_TRAFFIC_PERCENT hits 100.
 */
export class MonolithSearch {
  search(query: string): { results: string[] } {
    return { results: ['Legacy result for: ' + query] };
  }
}`,
      },
    ],
    objectives: [
      {
        label: 'Read SEARCH_TRAFFIC_PERCENT from process.env in ApiGateway',
        check: { type: 'contains', file: 'ApiGateway.ts', pattern: 'SEARCH_TRAFFIC_PERCENT' },
      },
      {
        label: 'Route matching traffic to forwardToSearchService',
        check: { type: 'contains', file: 'ApiGateway.ts', pattern: 'forwardToSearchService' },
      },
      {
        label: 'Keep monolith as fallback (forwardToMonolith still called)',
        check: { type: 'contains', file: 'ApiGateway.ts', pattern: 'forwardToMonolith' },
      },
    ],
    hints: [
      'Read the env var: `const pct = parseInt(process.env.SEARCH_TRAFFIC_PERCENT ?? "0", 10);`',
      'Generate a random roll: `const roll = Math.floor(Math.random() * 100);`',
      'Apply the split only to search routes: check `req.url.includes("/search")` before rolling, otherwise always call forwardToMonolith.',
    ],
    totalTests: 22,
    testFramework: 'Jest',
    xp: 400,
    successMessage: 'Traffic split is live. Set SEARCH_TRAFFIC_PERCENT=5 in staging, monitor error rates, then promote to 25 -> 50 -> 100. When the dial hits 100, delete MonolithSearch.ts. The Strangler Fig is complete.',
  },
};

export default challenge;
