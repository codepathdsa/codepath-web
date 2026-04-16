import type { Challenge } from '../types';

// ─── ENG-WAR-034 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-034',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Health Check Returns 200 but Service is Broken',
          companies: ['Kubernetes', 'AWS ECS'],
            timeEst: '~20 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `A common Kubernetes production incident: the liveness probe checks GET /health which returns HTTP 200. But /health only checks "is the HTTP server running?" — not "can the server handle real requests?" The database connection pool is exhausted, the cache is unreachable, and every real API request fails. But because /health returns 200, Kubernetes never restarts the pod.`,
                    desc: `Your users report 100% API error rate. All pods show "Running" and "Ready" in kubectl. The load balancer health checks are passing. But every real API request returns 500. Pod logs show "DB connection pool exhausted" and "Redis connection refused". The /health endpoint returns 200 because it only checks if the HTTP server is alive, not if its dependencies are healthy.`,
                      solution: `Fix the health check to perform deep health validation: check database connectivity (SELECT 1), check Redis connectivity (PING), check other critical dependencies. A deep health check returns 503 when any critical dependency is unhealthy, causing Kubernetes readiness probes to remove the pod from the load balancer and liveness probes to restart it. Separate liveness (is the process alive?) from readiness (is it ready to serve traffic?).`,
                        explanation: `Kubernetes probe types: Liveness: "should we restart this pod?" — check for deadlocks, infinite loops. Should be lightweight. Readiness: "should we send traffic to this pod?" — check database, cache, external dependencies. A failed readiness probe removes the pod from Service endpoints (no traffic) without restarting it. Deep health check: GET /health/ready returns {"db": "ok", "redis": "ok"} or 503 with details. /health/live (liveness) can be simpler — just check the process is responsive.`,
                          options: [
                            { label: 'A', title: 'Restart all pods manually to reset the connection state', sub: 'kubectl rollout restart deployment/api-service', isCorrect: false },
                            { label: 'B', title: 'Implement deep health checks that verify DB, Redis, and critical dependencies', sub: '/health/ready: SELECT 1 + PING + dep checks → 503 on failure', isCorrect: true },
                            { label: 'C', title: 'Set Kubernetes liveness probe failure threshold to 1 for faster restarts', sub: 'livenessProbe: failureThreshold: 1 periodSeconds: 5', isCorrect: false },
                            { label: 'D', title: 'Remove health checks entirely and rely on external monitoring', sub: 'Delete livenessProbe and readinessProbe from all deployment specs', isCorrect: false },
                          ]
};

export default challenge;
