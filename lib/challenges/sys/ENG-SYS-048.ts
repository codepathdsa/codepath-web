import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-048',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Load Balancer',
  companies: ['AWS', 'Nginx', 'Cloudflare'],
  timeEst: '~45 min',
  level: 'Mid',
  status: 'Not Started',
  desc:
    'Design an L7 (application layer) load balancer that distributes HTTP requests across ' +
    'a fleet of backend servers. Handle 1M RPS, support sticky sessions (user always routes to same server), ' +
    'health checks (remove unhealthy servers), SSL termination, and horizontal scaling of the LB itself.',
  solution:
    'The load balancer is a reverse proxy: receives client requests, forwards to a backend, returns the response. ' +
    'Algorithm choices: round-robin (simple), least connections (intelligent), consistent hash (sticky). ' +
    'Health checks: every 5 seconds, send a GET /health to each backend — ' +
    'remove it from the pool after 3 consecutive failures. ' +
    'SSL termination: decrypt HTTPS at the LB, forward HTTP to backends (simpler backend setup). ' +
    'Multiple LB instances behind DNS with anycast for the LB itself.',

  simulation: {
    constraints: [
      { label: 'Backend servers', value: '100' },
      { label: 'Target RPS', value: '1,000,000' },
      { label: 'LB overhead target', value: '< 1ms added latency' },
      { label: 'Health check cadence', value: 'Every 5 sec per backend' },
      { label: 'Sticky session mechanism', value: 'Consistent hash on user_id cookie' },
    ],
    levels: [
      {
        traffic: 10000,
        targetLatency: 5,
        successMsg: 'Load balancer routing traffic — round-robin distribution across backends.',
        failMsg: '[FATAL] All traffic hitting one backend server. LB not configured.',
        failNode: 'load_balancer',
        failTooltip:
          'A load balancer receives requests on a VIP (Virtual IP) and forwards to backends. ' +
          'Round-robin: requests go to backends in sequence (1, 2, 3, 1, 2, 3...). ' +
          'Simple but ignores backend load.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'load_balancer' },
          { type: 'hasEdge', source: 'load_balancer', target: 'api_server' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 3,
        successMsg: 'Health checks active — unhealthy backends removed from pool within 15 sec.',
        failMsg:
          '[ERRORS] 20% of requests failing because one backend is down. ' +
          'Add health checks to detect and remove unhealthy backends.',
        failNode: 'api_server',
        failTooltip:
          'Health check: GET /health → expect 200 OK within 2 seconds. ' +
          'After 3 consecutive failures: mark backend as unhealthy, stop routing to it. ' +
          'After 2 consecutive successes: mark healthy again and re-add to rotation.',
        checks: [
          { type: 'hasEdge', source: 'load_balancer', target: 'api_server' },
          { type: 'hasEdge', source: 'load_balancer', target: 'redis' },
        ],
      },
      {
        traffic: 1000000,
        targetLatency: 1,
        successMsg: 'SYSTEM STABLE — 1M RPS, sticky sessions, SSL terminated, LB horizontally scaled.',
        failMsg:
          '[BOTTLENECK] Single load balancer saturated at 500k RPS. ' +
          'Scale the load balancer horizontally using DNS round-robin.',
        failNode: 'load_balancer',
        failTooltip:
          'The LB itself can be a bottleneck. Scale horizontally: multiple LB instances behind DNS. ' +
          'DNS returns multiple IPs; clients round-robin across LB instances. ' +
          'For the LBs to share state (session affinity), use a shared Redis cluster.',
        checks: [
          { type: 'hasEdge', source: 'client', target: 'load_balancer' },
          { type: 'hasEdge', source: 'load_balancer', target: 'api_server' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'What is the difference between L4 and L7 load balancing?',
      hint: 'Which layer of the OSI model do they operate at?',
      answer:
        'L4 (transport layer): routes based on IP address and TCP/UDP port. ' +
        'Fast (no need to inspect the HTTP request), but can\'t do content-based routing. ' +
        'L7 (application layer): inspects HTTP headers, URL path, cookies. ' +
        'Can route /api to backend A and /static to backend B. ' +
        'Can implement sticky sessions (inspect session cookie). ' +
        'Slower (must parse the full HTTP request), but much more flexible. ' +
        'AWS ALB = L7. AWS NLB = L4.',
    },
    {
      q: 'How does "least connections" load balancing differ from round-robin?',
      hint: 'Backend servers may have different processing times.',
      answer:
        'Round-robin sends the same number of requests to each backend, regardless of how long they take. ' +
        'If backend A handles fast requests (50ms) and backend B handles slow requests (500ms), ' +
        'backend B builds up a larger backlog. ' +
        'Least connections: route the next request to the backend with the fewest active connections. ' +
        'Backend A processes requests faster, so it gets more new connections — natural load balancing. ' +
        'Best when backend processing times vary significantly.',
    },
    {
      q: 'How do you implement session stickiness (user always routes to the same backend)?',
      hint: 'Cookie-based sticky sessions.',
      answer:
        'The LB inserts a Set-Cookie: LB_SESSION=backend_id on the first response. ' +
        'Subsequent requests from the same browser include the cookie. ' +
        'The LB reads the cookie and routes to the specified backend. ' +
        'With consistent hashing: hash(user_id) → backend index. ' +
        'No cookie needed — deterministic routing. ' +
        'Problem: if the target backend is down, the request must be re-routed (session lost).',
    },
    {
      q: 'How does SSL termination at the load balancer affect security compared to end-to-end TLS?',
      hint: 'Where is data decrypted?',
      answer:
        'SSL termination at LB: client ↔ LB is HTTPS (encrypted). LB ↔ backend is HTTP (unencrypted). ' +
        'The internal network must be trusted. ' +
        'Advantage: backends don\'t need TLS certificates, simpler certificate management at one place. ' +
        'End-to-end TLS: LB passes encrypted traffic to the backend, which terminates TLS. ' +
        'Advantage: backend is encrypted even on the internal network. ' +
        'Required for compliance (PCI-DSS, HIPAA) where internal network encryption is mandated.',
    },
  ],
};

export default challenge;
