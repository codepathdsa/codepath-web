import type { Challenge } from '../types';

// ─── ENG-WAR-039 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-039',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Feature Flag Rollout Breaks Dark Launch A/B Test',
          companies: ['LaunchDarkly', 'Facebook'],
            timeEst: '~15 min',
              level: 'Junior',
                status: 'Not Started',
                  realWorldContext: `Facebook ships new features via "dark launches" — the feature is live in code but invisible to users, with metrics collected before a public launch. A common incident: a feature flag meant to show a new checkout UI to 10% of users was accidentally set to 100%. The new (untested-at-scale) checkout UI was shown to all users, causing a 30% conversion drop before the team noticed and rolled back.`,
                    desc: `An engineer pushed a feature flag configuration change intended to roll out a new checkout UI to 10% of users for an A/B test. Due to a YAML misconfiguration, the flag was deployed with rollout_percentage: 100 instead of 10. All users are now seeing the new UI. Conversion rate has dropped 28% in the last 20 minutes. The flag change was pushed 25 minutes ago.`,
                      solution: `Immediately revert the feature flag rollout to 0% (kill switch — show no users the new UI) using the feature flag management dashboard. Do not revert to 10% yet — verify the old UI restores conversion rates first. Then: (1) add a test that validates flag values are in expected ranges before deployment, (2) require 2-person review for any production flag change above 20% rollout.`,
                        explanation: `Feature flag incident response: (1) Kill switch: set rollout to 0% immediately — this is faster than deploying a fix. (2) Verify metrics recover. (3) Investigate root cause. (4) Add guards: schema validation on flag configuration files (if percentage > 50, require approval). Feature flag best practices: (a) phased rollout: 1% → 5% → 20% → 50% → 100% with metric validation at each step. (b) Kill switches for every significant feature. (c) Alerting: if conversion drops > 10% within 10 minutes of a flag change, auto-alert the team.`,
                          options: [
                            { label: 'A', title: 'Roll back the entire application deployment immediately', sub: 'kubectl rollout undo deployment/checkout-service', isCorrect: false },
                            { label: 'B', title: 'Set rollout to 50% as a compromise while investigating', sub: 'LaunchDarkly: Edit flag → rollout_percentage: 50', isCorrect: false },
                            { label: 'C', title: 'Set rollout to 0% (kill switch) immediately; verify recovery; then fix validation', sub: 'Flag: rollout_percentage: 0; add YAML schema validation + approval gates', isCorrect: true },
                            { label: 'D', title: 'Wait 30 more minutes to collect more A/B test data before deciding', sub: 'Continue monitoring; need more statistical significance', isCorrect: false },
                          ]
};

export default challenge;
