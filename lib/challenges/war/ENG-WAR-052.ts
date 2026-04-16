import type { Challenge } from '../types';

// ─── ENG-WAR-052 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-052',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Canary Deployment Rolled Out to 100% By Mistake',
            companies: ['Netflix', 'Flagger'],
              timeEst: '~15 min',
                level: 'Junior',
                  status: 'Not Started',
                    realWorldContext: `Netflix's canary analysis system (Kayenta) is designed to automatically gate rollouts based on metrics comparison. A misconfigured Kayenta rule marked a canary with a 40% error rate as "passing" due to a threshold typo (40 instead of 4). The canary was auto-promoted to 100% production. Netflix's defense: they have layered checks including manual approval for changes to error rate thresholds.`,
                      desc: `Your CI/CD pipeline uses Flagger for automated canary analysis. A new version was deployed as a canary at 10% traffic. The canary analysis had a typo in the error threshold (40% instead of 4%). Flagger saw the canary's 30% error rate as within the 40% threshold and automatically promoted it to 100% of traffic. All production traffic is now on the broken version. Error rate is 30%.`,
                        solution: `Immediately trigger a rollback via Flagger: kubectl annotate canary <name> flagger.app/rollback-revision="true" or manually set the Deployment image back to the previous version. Then: fix the error threshold typo, add a validation step that requires human approval before promotion beyond 20%, and add schema validation to Flagger configuration files.`,
                          explanation: `Canary rollback in Flagger: either via annotation (kubectl annotate canary api flagger.app/rollback=true) or by manually patching the deployment to the previous image. Prevention: (1) Configuration validation: schema check Flagger CRDs with unit tests — assert errorRateThreshold < 10. (2) Progressive gates: 10% (automated) → 30% (manual approval) → 100% (manual approval). (3) Multiple metrics: don't rely solely on error rate; also gate on p99 latency and business KPIs. (4) Dry-run canary analysis in staging with synthetic traffic before production.`,
                            options: [
                              { label: 'A', title: 'Immediately deploy a hotfix to the new version to reduce its error rate', sub: 'Ship fix for the 30% error rate directly on top of the broken canary', isCorrect: false },
                              { label: 'B', title: 'Rollback via Flagger annotation; fix typo; add manual approval gate and config validation', sub: 'kubectl annotate canary api flagger.app/rollback=true; fix threshold; add gate', isCorrect: true },
                              { label: 'C', title: 'Delete the Flagger canary object to stop automated promotions', sub: 'kubectl delete canary api -n production', isCorrect: false },
                              { label: 'D', title: 'Wait for users to report errors, then decide if rollback is needed', sub: 'Monitor user feedback before taking action', isCorrect: false },
                            ]
  };

export default challenge;
