import type { Challenge } from '../types';

// ─── ENG-WAR-011 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-011',
    type: 'War Room',
    badgeClass: 'badge-war',
    title: 'BGP Route Leak Takes Down Global CDN',
    companies: ['Cloudflare', 'Fastly'],
    timeEst: '~20 min',
    level: 'Senior',
    status: 'Not Started',
    realWorldContext: `In April 2021, a misconfigured BGP route leak at a small ISP caused roughly 16,000 Fastly prefixes to be briefly routed through an unintended path, taking a large portion of the internet offline for ~1 hour. Cloudflare has documented similar BGP hijack events. BGP leaks cause routers worldwide to send traffic to the wrong place — and fixing it requires withdrawing the leaked routes and confirming propagation globally.`,
    desc: `Your CDN is reporting packet loss in all regions simultaneously. Monitoring shows traffic is suddenly being routed through an unexpected AS (Autonomous System). Customers cannot reach your edge nodes. The network team suspects a BGP route leak — a peer is advertising your IP prefixes with a shorter AS path than yours.`,
    solution: `Contact the upstream ISP to withdraw the leaked route announcement. Apply a BGP prefix filter (max-prefix limit) on peering sessions to prevent future leaks. Issue a more-specific route announcement from your own AS to reclaim traffic while the leak propagates out.`,
    explanation: `BGP (Border Gateway Protocol) is the routing protocol of the internet. Routers trust announcements from peers — a misconfigured peer can advertise your prefixes with a shorter (more preferred) path, attracting global traffic away from your servers. Fix: (1) identify the leaking AS via BGP monitoring tools like RIPE Stat or BGPmon, (2) contact the upstream to withdraw the announcement, (3) announce a more-specific /24 prefix from your own AS to take priority while the leak clears.`,
    options: [
      { label: 'A', title: 'Flush DNS cache on all edge nodes', sub: 'systemd-resolve --flush-caches on every PoP', isCorrect: false },
      { label: 'B', title: 'Identify the leaking AS, contact upstream, announce more-specific prefix', sub: 'bgp prefix-list LEAK-FILTER + more-specific /24 announcement', isCorrect: true },
      { label: 'C', title: 'Restart the Anycast routing daemon on all PoPs', sub: 'systemctl restart bird on all edge nodes', isCorrect: false },
      { label: 'D', title: 'Failover all traffic to a single origin data center', sub: 'Disable CDN, point DNS A record to origin IP', isCorrect: false },
    ]
  };

export default challenge;
