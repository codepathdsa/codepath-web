import type { Challenge } from '../types';

// ─── ENG-WAR-036 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-036',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'GraphQL N+1 Behind a Public API',
          companies: ['GitHub', 'Shopify'],
            timeEst: '~25 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `GitHub's GraphQL API v4 launched with DataLoader to solve N+1 queries. Without DataLoader, a GraphQL query like {repositories {pullRequests {author {name}}}} would execute 1 query per PR to fetch author data. With 1000 PRs that's 1001 database queries for one API request. GitHub's adoption of DataLoader batched these into 3 queries total.`,
                    desc: `Your GraphQL API is publicly available. A power user sends a query: { users { posts { comments { author { name } } } } }. This innocent-looking query generates 10,000+ database queries per request. Your database CPU hits 100% for every such request. The query is technically valid per your schema. Other users' requests start timing out.`,
                      solution: `Implement DataLoader for all relationship fields to batch and cache database lookups within a single request. Add Query Depth Limiting (max 5 levels deep), Query Complexity Scoring (cost per field), and Rate Limiting per API key. Consider Persisted Queries (only allow pre-approved query shapes) for public APIs. Field-level authorization should also reject overly broad queries.`,
                        explanation: `DataLoader (Facebook's open-source library) solves GraphQL N+1: it collects all "author" lookups needed during a request execution, then fires a single batched query (SELECT * FROM users WHERE id IN (1,2,3,...)) instead of one per comment. Defense in depth for public GraphQL APIs: (1) DataLoader for batching, (2) max query depth limit, (3) query complexity analysis (each field has a cost; reject expensive queries), (4) rate limiting, (5) query timeout.`,
                          options: [
                            { label: 'A', title: 'Add a 10 queries/minute rate limit per API key', sub: 'graphql-rate-limit middleware: max 10 requests/minute', isCorrect: false },
                            { label: 'B', title: 'Implement DataLoader + query depth/complexity limits + rate limiting', sub: 'DataLoader batch + maxDepth:5 + complexity scoring + per-key rate limit', isCorrect: true },
                            { label: 'C', title: 'Disable nested queries in the schema entirely', sub: 'Remove all relationship fields from public GraphQL schema', isCorrect: false },
                            { label: 'D', title: 'Add a Redis cache for all GraphQL query results', sub: 'Cache full query result by SHA256(query+variables) for 60s', isCorrect: false },
                          ]
};

export default challenge;
