import type { Challenge } from '../types';

// ─── ENG-WAR-031 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-031',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'gRPC Deadline Propagation Causing Cascading Timeout',
          companies: ['Google', 'Stripe'],
            timeEst: '~25 min',
              level: 'Senior',
                status: 'Not Started',
                  realWorldContext: `Google's SRE book dedicates significant coverage to "deadline propagation" — the practice of passing the original request's remaining time budget through to all downstream calls. Stripe's microservices architecture requires each service to honor the upstream deadline and cancel its downstream calls when the budget expires. Without deadline propagation, a slow dependency can keep consuming resources long after the user has received a timeout.`,
                    desc: `Service A calls Service B (gRPC, 500ms deadline). Service B calls Service C (no deadline set — default is infinite). Service A times out after 500ms and returns an error to the user. But Service B is still waiting for Service C, which is slow (takes 45 seconds). Service B's connection pool fills up with these zombie goroutines waiting for Service C. After 10 minutes, Service B is completely unresponsive due to goroutine/thread exhaustion.`,
                      solution: `Always propagate the parent request's context (with its deadline) to ALL downstream calls. In gRPC: pass the original ctx to outbound calls instead of context.Background(). In HTTP: use ctx.WithTimeout() derived from the parent context. Add an explicit upper-bound deadline on each inter-service call even when propagating context (belt-and-suspenders). Implement context cancellation in Service C to abort work when the context is cancelled.`,
                        explanation: `gRPC deadline propagation pattern: when Service B receives a request with ctx (which has 500ms remaining), it should pass ctx to its call to Service C. When Service A's deadline expires and it cancels ctx, that cancellation propagates to Service C — which should detect context.Done() and abort. Without this, Service C runs to completion (45s), holding Service B's thread/goroutine the entire time. Fix: ctx propagation + check context.Err() in all blocking calls.`,
                          options: [
                            { label: 'A', title: 'Add a 60-second timeout on all calls from Service B to Service C', sub: 'ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)', isCorrect: false },
                            { label: 'B', title: 'Increase Service B\'s goroutine pool size to handle more concurrent requests', sub: 'Set GOMAXPROCS=64 and increase worker pool size', isCorrect: false },
                            { label: 'C', title: 'Propagate parent request context to all downstream gRPC calls', sub: 'Pass original ctx (not context.Background()) to all downstream calls', isCorrect: true },
                            { label: 'D', title: 'Add a bulkhead to Service B with a separate thread pool for Service C calls', sub: 'Isolate Service C calls in a bounded goroutine pool with circuit breaker', isCorrect: false },
                          ]
};

export default challenge;
