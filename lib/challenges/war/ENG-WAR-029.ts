import type { Challenge } from '../types';

// ─── ENG-WAR-029 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-029',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Backup Restore Failure Discovered During Real Disaster',
          companies: ['GitLab', 'Tarsnap'],
            timeEst: '~35 min',
              level: 'Senior',
                status: 'Not Started',
                  realWorldContext: `GitLab's 2017 postmortem revealed that 5 of their 6 backup methods were silently failing — backups were being created but never tested for restorability. Tarsnap's 2023 outage postmortem by Colin Percival revealed that his recovery scripts had never been tested and contained multiple bugs that significantly delayed recovery. "Untested backups are not backups" is a hard-learned lesson.`,
                    desc: `A production database failure requires a restore from backup. Your team goes to restore from the nightly backup — and discovers the restore fails with: 'pg_restore: error: could not read from input file: end of file'. The backup file exists in S3 (8GB), but appears corrupted. The secondary backup (a read replica) had replication lag of 3 hours and was also taken offline during the failure. You have 8 hours before data loss becomes permanent.`,
                      solution: `Check the S3 backup file integrity first (aws s3api head-object to verify ETag/checksum). Try an older backup from 2 days ago — it may be uncorrupted. If all backups are corrupted, restore from the replica's last known good state (3h lag) and accept 3h of data loss. Post-incident: implement backup verification — after every backup, automatically restore it to a test instance and run a row count / checksum validation.`,
                        explanation: `The key lesson: backup verification is not optional. A backup that has never been restored is not a backup. Best practices: (1) automate restore tests on every backup — spin up a test instance, restore, run SELECT COUNT(*) and schema checks, then delete. (2) use checksums/hashes on backup files stored in S3. (3) test the FULL recovery playbook quarterly (game days). (4) use streaming WAL archiving (continuous) rather than nightly snapshots to minimize recovery point objective (RPO).`,
                          options: [
                            { label: 'A', title: 'Contact AWS Support to recover the corrupted S3 file', sub: 'AWS Support case: S3 file corruption, request block-level recovery', isCorrect: false },
                            { label: 'B', title: 'Check backup integrity, try older backup; restore replica; fix backup verification', sub: 'aws s3api head-object --checksum; try T-2d backup; pg_ctl promote replica; add backup restore tests', isCorrect: true },
                            { label: 'C', title: 'Ask engineers to reconstruct data from application logs and API request history', sub: 'Replay API request logs to rebuild database state', isCorrect: false },
                            { label: 'D', title: 'Deploy the application without a database and disable data-dependent features', sub: 'Feature flag all DB-dependent endpoints; serve from cache only', isCorrect: false },
                          ]
};

export default challenge;
