import type { Challenge } from '../types';

// ─── ENG-WAR-003 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-003',
    type: 'War Room',
    badgeClass: 'badge-war',
    title: 'Postgres Max Connections Exhausted',
    companies: ['Supabase', 'Heroku'],
    timeEst: '~25 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'Traffic spiked 3x. The API servers auto-scaled from 5 pods to 50 pods. Immediately after scaling, the entire platform went offline with "FATAL: sorry, too many clients already".',
    solution: 'Each new API pod opened its own pool of DB connections, exceeding Postgres\'s `max_connections` limit. Deploy a connection pooler like PgBouncer to multiplex connections.',
    options: [
      { label: 'A', title: 'Scale the API pods back down to 5', sub: 'kubectl scale deployment api --replicas=5', isCorrect: false },
      { label: 'B', title: 'Increase max_connections in postgresql.conf to 10,000', sub: 'ALTER SYSTEM SET max_connections = 10000;', isCorrect: false },
      { label: 'C', title: 'Deploy PgBouncer to multiplex all pod connections', sub: 'helm install pgbouncer bitnami/pgbouncer', isCorrect: true },
      { label: 'D', title: 'Restart the primary database', sub: 'sudo systemctl restart postgresql', isCorrect: false },
    ]
  };

export default challenge;
