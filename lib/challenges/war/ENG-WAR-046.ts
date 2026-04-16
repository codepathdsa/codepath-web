import type { Challenge } from '../types';

// ─── ENG-WAR-046 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-046',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Alert Fatigue Masks a Real Outage',
            companies: ['PagerDuty', 'Datadog'],
              timeEst: '~15 min',
                level: 'Mid',
                  status: 'Not Started',
                    realWorldContext: `A documented incident pattern at multiple FAANG companies: the on-call engineer receives 500+ alerts during a deployment (normal, expected noise from rolling restarts). Mixed within those 500 alerts is the critical alert: "database connection pool exhausted." The engineer, fatigued by the noise, acknowledges all alerts without reading them. The real issue goes undetected for 45 minutes until users start calling.`,
                      desc: `Your on-call engineer received 500 PagerDuty alerts during a deployment at 2am. They acknowledged them in bulk ("these are just deployment noise"). Hidden in those 500 alerts was: "Payment Service: Database connection pool exhausted (severity: critical)". Payments have been failing for 45 minutes. The engineer assumed all alerts were deployment-related. How do you prevent this from happening again?`,
                        solution: `Implement alert severity tiering and smart grouping: (1) P0/P1 critical alerts (payments, auth, data loss) should page via a separate channel with a distinctive ring (different sound, auto-calls). (2) Deployment-phase alerts should be automatically suppressed or grouped into a single "deployment noise" bundle. (3) Require specific acknowledgment (not bulk) for P0 alerts. (4) Implement alert correlation — if 10 alerts fire during a deployment window, group them; but always surface P0s separately.`,
                          explanation: `Alert fatigue is one of the most dangerous SRE problems. Solutions: (1) Alert tiers: P0 (customer-facing, data loss) → page with phone call. P1 (degraded service) → paging. P2 (warning) → Slack/email. P3 (info) → dashboards only. (2) Deployment suppression windows: maintenance windows automatically suppress P2/P3 alerts. (3) Alert grouping: correlated alerts from the same deployment grouped into one incident, except P0s which always surface. (4) Alert quality reviews: track alert-to-action ratio. If more than 50% of alerts are acknowledged without action, the alert is wrong.`,
                            options: [
                              { label: 'A', title: 'Reduce the total number of alerts to below 50 by removing non-critical ones', sub: 'Delete all alerts with < 100% customer impact', isCorrect: false },
                              { label: 'B', title: 'Implement severity tiering, deployment suppression windows, and mandatory P0 acknowledgment', sub: 'P0 alerts: phone call + mandatory individual ACK; suppress P2/P3 during deploy', isCorrect: true },
                              { label: 'C', title: 'Assign a second on-call engineer to review all alerts during deployments', sub: 'Require 2 on-call engineers for all production deployments', isCorrect: false },
                              { label: 'D', title: 'Migrate from PagerDuty to a different alerting system', sub: 'Evaluate OpsGenie, VictorOps as PagerDuty replacements', isCorrect: false },
                            ]
  };

export default challenge;
