import type { Challenge } from '../types';

// ─── ENG-WAR-008 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-008',
    type: 'War Room',
    badgeClass: 'badge-war',
    title: 'Replication Lag causing Stale Reads',
    companies: ['Meta', 'Instagram'],
    timeEst: '~20 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'Users are complaining that when they update their profile picture, it still shows the old picture on their feed immediately after saving.',
    solution: 'Writes go to the Primary DB, but Reads come from the Replica. Due to high load, replication lag is 2 seconds. Force reads to the Primary DB for the current user for 5 seconds after a write (Read-Your-Writes consistency).',
    options: [
      { label: 'A', title: 'Invalidate the CDN cache on every profile update', sub: 'cf purge --tag=profile-images', isCorrect: false },
      { label: 'B', title: 'Disable read replicas entirely and read from primary always', sub: 'DB_READ_HOST=$DB_PRIMARY_HOST', isCorrect: false },
      { label: 'C', title: 'After a write, force reads to the Primary for 5 seconds', sub: 'Set session flag: read_from_primary=true for 5s TTL', isCorrect: true },
      { label: 'D', title: 'Add more read replicas to reduce per-replica lag', sub: 'terraform apply -var replica_count=5', isCorrect: false },
    ]
  };

export default challenge;
