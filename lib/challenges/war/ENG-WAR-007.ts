import type { Challenge } from '../types';

// ─── ENG-WAR-007 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-007',
    type: 'War Room',
    badgeClass: 'badge-war',
    title: 'Expired SSL Certificate',
    companies: ['Twilio', 'Okta'],
    timeEst: '~10 min',
    level: 'Junior',
    status: 'Not Started',
    desc: 'At exactly 00:00 UTC, all iOS mobile apps failed to connect to the API with vague network errors. Web users see a red padlock.',
    solution: 'The wildcard SSL/TLS certificate expired. Jump into the load balancer/Certbot, renew the certificate, and restart the proxy layer.',
    options: [
      { label: 'A', title: 'Restart all API server pods', sub: 'kubectl rollout restart deployment api', isCorrect: false },
      { label: 'B', title: 'Roll back the last deployment', sub: 'kubectl rollout undo deployment api', isCorrect: false },
      { label: 'C', title: 'Renew the TLS certificate and reload the proxy', sub: 'certbot renew && sudo nginx -s reload', isCorrect: true },
      { label: 'D', title: 'Flush Cloudflare CDN cache globally', sub: 'cf purge --all-zones', isCorrect: false },
    ]
  };

export default challenge;
