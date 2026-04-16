import type { Challenge } from '../types';

// ─── ENG-WAR-048 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-048',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Distributed Tracing Shows Dark Latency (Missing Spans)',
            companies: ['Datadog', 'Jaeger'],
              timeEst: '~20 min',
                level: 'Mid',
                  status: 'Not Started',
                    realWorldContext: `A common distributed tracing puzzle: the trace shows Service A calls Service B, and the end-to-end latency is 800ms. But Service A's span shows 50ms execution and Service B's span shows 50ms execution. Where did the other 700ms go? This "dark latency" can indicate: network latency, connection pool waiting, DNS resolution time, or time between spans that isn't being instrumented.`,
                      desc: `Users report API latency of 800ms on the /checkout endpoint. Your distributed trace (Datadog APM) shows: Service A (30ms) → Service B (50ms) → Database query (10ms). Total instrumented spans: 90ms. Total actual latency: 800ms. 710ms is unaccounted for between spans. Network latency between services is typically 1-2ms. Where is the time going?`,
                        solution: `The "dark latency" is likely time spent waiting for a connection from the connection pool (not instrumented as a span). Add instrumentation to measure: (1) connection pool wait time (acquire_connection span), (2) HTTP client connection establishment time (including DNS + TCP + TLS), (3) serialization/deserialization time. Common culprits: connection pool contention, TLS handshake on every request (missing keep-alive), DNS resolution on each call.`,
                          explanation: `Distributed tracing gaps: spans only measure what's explicitly instrumented. Time spent waiting for a connection from a pool, TLS handshakes, and framework overhead are often not included in spans. Debugging: (1) Add connection pool instrumentation (most APM agents have this as an option). (2) Check if HTTP connections use keep-alive (Connection: keep-alive header). (3) Measure DNS TTL — per-request DNS lookups can add 200ms. (4) Check for synchronous blocking I/O that isn't traced. Tools: Datadog APM's "span gaps" view, Jaeger's critical path analysis.`,
                            options: [
                              { label: 'A', title: 'The database query is lying — add more detailed DB query traces', sub: 'Enable full query tracing: log all statements + explain plans', isCorrect: false },
                              { label: 'B', title: 'Add connection pool, TLS, and DNS instrumentation to find dark latency', sub: 'Add spans: pool_acquire, tls_handshake, dns_resolve; check keep-alive headers', isCorrect: true },
                              { label: 'C', title: 'The latency is normal — 800ms is acceptable for checkout', sub: 'Close the investigation; update SLO to 1000ms threshold', isCorrect: false },
                              { label: 'D', title: 'Add more Datadog agents to get more detailed traces', sub: 'Increase trace sampling rate from 10% to 100%', isCorrect: false },
                            ]
  };

export default challenge;
