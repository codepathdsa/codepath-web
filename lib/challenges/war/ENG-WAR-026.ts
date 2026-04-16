import type { Challenge } from '../types';

// ─── ENG-WAR-026 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-026',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'MongoDB Atlas Auto-Index Build Causing OOM',
          companies: ['MongoDB', 'Typeform'],
            timeEst: '~20 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `MongoDB index builds require significant memory when running on large collections. A customer triggered an index build on a 100M-document collection during peak traffic. The index build consumed available memory, causing the primary to OOM-kill and trigger a failover. The secondary then became primary and immediately started the same index build, repeating the failure cycle.`,
                    desc: `An engineer created a new index on a 100-million document MongoDB collection during business hours. Atlas started the index build. Within 10 minutes, the primary OOM-killed. The replica set elected a new primary, which immediately started the same index build, OOM-killed, failed over again. The cluster is now in a failover loop. Application is throwing MongoNetworkError on every request.`,
                      solution: `Stop the index build immediately via db.collection.dropIndex() or db.adminCommand({abortIndexBuild: ...}) if supported by your Atlas version. Then schedule the index build during a low-traffic window, and pre-split the build using rolling index builds — build on one secondary at a time, then step down the primary and build on the old primary last. Atlas has a "Hidden" index feature to test index performance before making it live.`,
                        explanation: `Rolling index build (MongoDB manual) procedure: (1) Build index on each secondary one at a time (use the secondary directly or let Atlas do it). (2) Step down the primary (rs.stepDown()). (3) Build index on the old primary (now a secondary). (4) Step up a new primary. This ensures only one node builds the index at a time, never causing cluster-wide OOM. For Atlas: use the Index Advisor and schedule index builds during off-peak hours.`,
                          options: [
                            { label: 'A', title: 'Increase Atlas cluster tier to M80 (more memory) immediately', sub: 'Atlas: Cluster → Modify → Tier: M80 ($1,700/mo)', isCorrect: false },
                            { label: 'B', title: 'Abort the index build; reschedule with rolling index build during off-peak', sub: 'db.adminCommand({abortIndexBuild: "idx_name"}); rolling build on secondaries first', isCorrect: true },
                            { label: 'C', title: 'Pause all Atlas backups to free memory for the index build', sub: 'Atlas: Backup → Disable continuous backup', isCorrect: false },
                            { label: 'D', title: 'Restore the cluster from the last Atlas snapshot', sub: 'Atlas: Backup → Restore to Point in Time', isCorrect: false },
                          ]
};

export default challenge;
