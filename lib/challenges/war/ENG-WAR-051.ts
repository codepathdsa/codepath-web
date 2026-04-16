import type { Challenge } from '../types';

// ─── ENG-WAR-051 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-051',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Blue-Green Deployment: Database Migration Incompatibility',
            companies: ['Heroku', 'Render'],
              timeEst: '~30 min',
                level: 'Senior',
                  status: 'Not Started',
                    realWorldContext: `A classic zero-downtime deployment failure: blue-green deployment requires both versions (old and new) to run simultaneously during the switchover. If the new version runs a database migration that adds a NOT NULL column without a default, the old version (blue) immediately starts throwing errors because it can't INSERT rows without the new column. The deployment window becomes an outage.`,
                      desc: `Your blue-green deployment is running. Blue (old) and Green (new) are both live. The migration added a NOT NULL column "shipping_address" to the orders table with no default value. As soon as the migration ran, Blue started throwing: ERROR: null value in column "shipping_address" violates not-null constraint. 50% of traffic (still on Blue) is failing. Rolling back the migration while Green is live would break Green.`,
                        solution: `Backward-incompatible migrations break blue-green deployments. The fix requires a 3-step migration pattern: (1) Add column as nullable (no default, no constraint): ALTER TABLE orders ADD COLUMN shipping_address VARCHAR(500). (2) Deploy new code that writes to the column. (3) After old code is fully retired: ALTER TABLE orders ALTER COLUMN shipping_address SET NOT NULL. This way, both old (which doesn't write the column) and new (which does) can run simultaneously.`,
                          explanation: `Blue-green safe migration pattern (expand-contract): Phase 1 (Expand): Add column as nullable. Deploy new code. Both old and new code can write to the table — old ignores the column, new populates it. Phase 2 (Verify): Confirm all rows have the new column populated. Phase 3 (Contract): Apply NOT NULL constraint (only after old code is fully decommissioned). For removes: Phase 1 (stop writing to column), Phase 2 (remove column from reads), Phase 3 (drop column). This is the Stripe, GitHub, and Shopify approach to zero-downtime schema changes.`,
                            options: [
                              { label: 'A', title: 'Immediately roll back to the Blue deployment to stop errors', sub: 'Switch load balancer to 100% Blue; rollback migration', isCorrect: false },
                              { label: 'B', title: 'Add a default value to the NOT NULL column as an emergency patch', sub: 'ALTER TABLE orders ALTER COLUMN shipping_address SET DEFAULT \'\'', isCorrect: false },
                              { label: 'C', title: 'Switch 100% traffic to Green immediately to eliminate Blue errors', sub: 'Load balancer: Green 100%, Blue 0% immediately', isCorrect: false },
                              { label: 'D', title: 'In future: use 3-phase expand-contract migration; add nullable column first', sub: 'Phase 1: ADD COLUMN nullable → deploy → Phase 3: SET NOT NULL after cutover', isCorrect: true },
                            ]
  };

export default challenge;
