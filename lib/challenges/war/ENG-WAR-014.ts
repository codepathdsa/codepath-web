import type { Challenge } from '../types';

// ─── ENG-WAR-014 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-014',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'AWS S3 Runaway rm Command (Region-Wide Outage)',
          companies: ['AWS', 'Airbnb'],
            timeEst: '~20 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `The real AWS S3 US-East-1 outage in February 2017 was caused by an engineer running a debugging script to remove a small number of billing servers. A typo in the parameter caused significantly more servers to be removed than intended, taking S3 offline for 4 hours and knocking out nearly every major website. AWS's own status page was down because it ran on S3.`,
                    desc: `A junior engineer ran a maintenance script with a typo in the bucket name parameter. Instead of deleting temporary files in 'app-logs-temp', the script targeted 'app-logs' — your primary application asset bucket containing 500GB of user-uploaded files and static assets. The delete operation ran for 3 minutes before the engineer noticed and killed it. An unknown number of objects have been permanently deleted. The CDN is now returning 403s for missing assets.`,
                      solution: `Check if S3 versioning was enabled on the bucket — if yes, use S3 Batch Operations to restore all deleted objects by deleting the deletion markers. If versioning was not enabled, restore from the most recent backup (S3 Cross-Region Replication or an AWS Backup vault). Immediately enable S3 Object Lock on the restored bucket to prevent future accidental deletes.`,
                        explanation: `S3 versioning is the safety net for accidental deletes. When versioning is on, deleting an object creates a "delete marker" — the original version is still there. You can recover by removing the delete markers. If versioning was off, you need a backup. Prevention: (1) always enable versioning on critical buckets, (2) use IAM bucket policies that deny DeleteObject to application roles, (3) use MFA-protected bucket policies for human deletion.`,
                          options: [
                            { label: 'A', title: 'Immediately recreate the bucket with the same name and re-upload assets', sub: 'aws s3 mb s3://app-logs && re-run asset pipeline', isCorrect: false },
                            { label: 'B', title: 'Check S3 versioning — restore via delete-marker removal or backup restore', sub: 'aws s3api list-object-versions + S3 Batch Operations to remove delete markers', isCorrect: true },
                            { label: 'C', title: 'Open an AWS support ticket and wait for them to restore the data', sub: 'AWS support case: S3 accidental delete recovery', isCorrect: false },
                            { label: 'D', title: 'Restore assets from engineer\'s local laptop cache', sub: 'Copy browser cached files back to S3', isCorrect: false },
                          ]
};

export default challenge;
