import type { Challenge } from '../types';

// ─── ENG-WAR-001 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-001',
    type: 'War Room',
    badgeClass: 'badge-war',
    title: '502 Bad Gateway Loop',
    companies: ['Cloudflare', 'Vercel'],
    timeEst: '~15 min',
    level: 'Junior',
    status: 'Not Started',
    desc: 'Nginx is throwing 502 Bad Gateway errors. You check the Node.js application server, and it is running. But logs show the Node process restarting every 5 seconds.',
    solution: 'The application is encountering a fatal uncaught exception during boot (e.g., failed DB connection string) and PM2/Docker is constantly restarting it. Fix the environment variable.',
    options: [
      { label: 'A', title: 'Restart the Nginx proxy', sub: 'sudo systemctl restart nginx', isCorrect: false },
      { label: 'B', title: 'Fix the bad environment variable causing boot crash', sub: 'Check .env, fix DB_URL, then pm2 restart app', isCorrect: true },
      { label: 'C', title: 'Scale out to 3 more pods', sub: 'kubectl scale deployment app --replicas=6', isCorrect: false },
      { label: 'D', title: 'Reboot the entire host machine', sub: 'sudo reboot', isCorrect: false },
    ]
  };

export default challenge;
