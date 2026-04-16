import type { Challenge } from '../types';

// ─── ENG-WAR-021 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-021',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'GitLab-style Database Deletion (Human Error Cascade)',
          companies: ['GitLab', 'PlanetScale'],
            timeEst: '~30 min',
              level: 'Senior',
                status: 'Not Started',
                  realWorldContext: `GitLab's January 2017 18-hour outage began with a database admin running db1 when they intended db2 — accidentally running pg_basebackup on the wrong server which wiped the replication directory. They discovered that 5 of their 6 backup methods had silently failed. Only 6 hours of data was lost because a Postgres WAL archive happened to work. GitLab famously did their recovery live-streamed to 5,000 viewers.`,
                    desc: `A database admin was cleaning up replication configuration on your secondary Postgres replica (db-replica-1). They accidentally ran the cleanup command on the primary database (db-primary-1) instead. The primary's data directory was partially overwritten by the replica sync process. Postgres on the primary is refusing to start. You have: (1) a 2-day-old base backup in S3, (2) WAL (Write-Ahead Log) archives continuously shipped to S3 every 5 minutes, (3) read replicas that were replicating up to T-30min.`,
                      solution: `The WAL archives are the most valuable asset — they can replay all transactions up to the last successfully archived WAL segment. Restore the base backup to a new server, then replay WAL archives using recovery.conf (Postgres 12+: recovery.conf becomes recovery.signal). This is Point-In-Time Recovery (PITR). You can recover to within 5 minutes of the incident.`,
                        explanation: `Postgres PITR workflow: (1) Start with the base backup (aws s3 cp s3://backups/base.tar.gz), (2) Restore to /var/lib/postgresql/data, (3) Create recovery.signal file (Postgres 12+), (4) In postgresql.conf: set restore_command to copy WAL files from S3, set recovery_target_time to 5 minutes before the incident. (5) Start Postgres — it replays WAL up to the target time. The replicas at T-30min can also be promoted as a faster but lossy alternative.`,
                          options: [
                            { label: 'A', title: 'Promote the read replica (T-30min) to primary immediately', sub: 'pg_ctl promote -D /var/lib/postgresql/data', isCorrect: false },
                            { label: 'B', title: 'Perform Postgres PITR using base backup + WAL archives to recover to within 5min of incident', sub: 'Restore base backup + recovery.conf: restore_command + recovery_target_time', isCorrect: true },
                            { label: 'C', title: 'Restore the 2-day-old base backup directly to production', sub: 'aws s3 cp s3://backups/base.tar.gz + extract to /var/lib/postgresql', isCorrect: false },
                            { label: 'D', title: 'Ask each application team to replay their recent API requests against a fresh DB', sub: 'Re-execute all HTTP requests from application logs', isCorrect: false },
                          ]
};

export default challenge;
