import type { Challenge } from '../types';

// ─── ENG-WAR-038 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-038',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Memory Leak in Long-Running Go Service',
          companies: ['Uber', 'Datadog'],
            timeEst: '~25 min',
              level: 'Senior',
                status: 'Not Started',
                  realWorldContext: `Datadog's agent is written in Go and runs on millions of hosts. A subtle memory leak — goroutines not being properly cleaned up when connections closed — caused memory usage to grow by ~10MB per hour. Over a week, the agent would OOM. The fix required analyzing goroutine stack dumps (SIGQUIT) and pprof heap profiles to identify the leaking goroutines.`,
                    desc: `Your Go microservice processes real-time events and has been running for 5 days. Memory usage has grown from 200MB to 4GB (a perfect linear increase). The K8s pod will OOM-kill in approximately 6 hours. CPU is normal. There are no obvious errors in logs. The service handles 10,000 concurrent WebSocket connections.`,
                      solution: `Capture a pprof heap profile and goroutine profile while memory is high: curl localhost:6060/debug/pprof/heap > heap.prof and curl localhost:6060/debug/pprof/goroutine > goroutine.prof. Analyze with go tool pprof. Look for goroutines blocked on channels with no corresponding reader — these are typical leaks in WebSocket/event-handling code. Common cause: spawning a goroutine to handle a connection but not cleaning it up when the connection closes.`,
                        explanation: `Go goroutine/memory leak patterns: (1) Goroutine leak: a goroutine blocked on a channel read/write with no corresponding operation on the other side — it lives forever. Each goroutine uses ~8KB stack (grows on demand). (2) Map not cleaned: accumulating entries in a global map without eviction. Diagnostic: enable pprof in your service (import _ "net/http/pprof"), check /debug/pprof/goroutine for goroutine counts, /debug/pprof/heap for memory. WebSocket: always defer conn.Close() and cancel context on disconnect.`,
                          options: [
                            { label: 'A', title: 'Increase pod memory limits to 16GB to buy more time', sub: 'resources: limits: memory: 16Gi', isCorrect: false },
                            { label: 'B', title: 'Add a cron job to restart the service every 24 hours', sub: 'K8s CronJob: kubectl rollout restart every night at 2am', isCorrect: false },
                            { label: 'C', title: 'Capture pprof heap+goroutine profiles; identify and fix the goroutine leak', sub: 'curl /debug/pprof/goroutine; go tool pprof; fix defer conn.Close() + ctx cleanup', isCorrect: true },
                            { label: 'D', title: 'Rewrite the service in Rust to avoid garbage collection issues', sub: 'Port Go service to Rust for zero-GC memory management', isCorrect: false },
                          ]
};

export default challenge;
