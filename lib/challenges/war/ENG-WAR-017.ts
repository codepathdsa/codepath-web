import type { Challenge } from '../types';

// ─── ENG-WAR-017 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-017',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Nginx Config Reload Drops Active WebSocket Connections',
          companies: ['Slack', 'Discord'],
            timeEst: '~20 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `Discord's real-time messaging relies on millions of persistent WebSocket connections. Nginx config reloads (nginx -s reload) send SIGQUIT to workers, which wait for active connections to close gracefully — but without proper timeout configuration, this can force-close tens of thousands of WebSocket connections, causing all connected clients to immediately reconnect in a thundering herd.`,
                    desc: `Your ops team pushed an Nginx config update (a new rate limiting rule) and did a reload. Within seconds, 40,000 WebSocket users were disconnected. The reconnect storm is now flooding your backend servers. CPU is peaking, and new connections are timing out because the backend cannot handle the burst. Users are seeing the "reconnecting..." spinner.`,
                      solution: `The Nginx reload caused active workers to wait for connections to drain with no timeout, but some connection handling was not graceful. Fix: configure worker_shutdown_timeout in nginx.conf so workers close connections within a bounded time. For the current incident: the reconnect storm is the immediate problem — implement exponential backoff + jitter on client reconnects to spread the load over 30-60 seconds instead of all at once.`,
                        explanation: `Nginx reload sends SIGQUIT to old workers, which gracefully wait for active connections to finish. Without worker_shutdown_timeout, this can take minutes. Meanwhile, WebSockets sitting on old workers will eventually be forcefully closed as old workers kill idle connections. The thundering herd fix is exponential backoff + jitter on the client: instead of all 40k clients reconnecting at T+0, they reconnect at T + random(0, 30) seconds, spreading the load.`,
                          options: [
                            { label: 'A', title: 'Immediately roll back the nginx config and restart nginx completely', sub: 'git checkout nginx.conf && systemctl restart nginx', isCorrect: false },
                            { label: 'B', title: 'Add worker_shutdown_timeout; implement client reconnect exponential backoff + jitter', sub: 'worker_shutdown_timeout 10s; client: retry after Math.random()*30s', isCorrect: true },
                            { label: 'C', title: 'Scale backend servers to 10x to absorb reconnect storm', sub: 'kubectl scale deployment backend --replicas=300', isCorrect: false },
                            { label: 'D', title: 'Block all WebSocket reconnects for 60 seconds at the load balancer', sub: 'iptables -A INPUT -p tcp --dport 443 --tcp-flags SYN SYN -j DROP', isCorrect: false },
                          ]
};

export default challenge;
