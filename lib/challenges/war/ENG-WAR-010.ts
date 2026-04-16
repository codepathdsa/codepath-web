import type { Challenge } from '../types';

// ─── ENG-WAR-010 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-010',
    type: 'War Room',
    badgeClass: 'badge-war',
    title: 'DNS Propagation Outage',
    companies: ['Shopify', 'Squarespace'],
    timeEst: '~20 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'We migrated our domain to a new AWS load balancer. 50% of global users can access the site, but the other 50% are hitting the old decommissioned IP address and timing out.',
    solution: 'The TTL (Time To Live) on the old DNS A-record was set to 48 hours instead of 5 minutes before the migration. You must temporarily turn the old server back on and proxy traffic to the new one while DNS propagates globally.',
    options: [
      { label: 'A', title: 'Flush DNS on all global Cloudflare edge nodes', sub: 'cf dns purge --all', isCorrect: false },
      { label: 'B', title: 'Force all users to refresh their browser cache', sub: 'Send a push notification to clear browser cache', isCorrect: false },
      { label: 'C', title: 'Bring old server back up and proxy it to new LB while DNS propagates', sub: 'Restart old EC2, configure nginx proxy_pass to new LB IP', isCorrect: true },
      { label: 'D', title: 'Roll back the DNS change entirely and stay on old server', sub: 'aws route53 change-resource-record-sets (revert)', isCorrect: false },
    ]
  };

export default challenge;
