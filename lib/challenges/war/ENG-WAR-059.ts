import type { Challenge } from '../types';

// ─── ENG-WAR-059 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-059',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'GitHub Actions Self-Hosted Runner Exhaustion',
            companies: ['GitHub', 'GitLab'],
              timeEst: '~20 min',
                level: 'Mid',
                  status: 'Not Started',
                    realWorldContext: `An engineering team's CI/CD pipeline stopped deploying for 3 hours. Investigation revealed all 10 self-hosted GitHub Actions runners were occupied running a runaway test suite — a flaky test with no timeout was running for 4 hours per job. All 10 runners were occupied by stuck jobs. New deployment PRs queued but couldn't start. The fix: add job-level timeouts and runner autoscaling.`,
                      desc: `Your GitHub Actions self-hosted runner pool (10 runners) is fully occupied. No new CI/CD jobs can start. Looking at the active jobs: 8 of 10 runners are running an integration test workflow that has been running for 4 hours (normally takes 15 minutes). The integration tests have no timeout configured. A flaky external API dependency is hanging, and the tests are waiting indefinitely. Critical deployment PRs are queued but unexecuted.`,
                        solution: `Immediately cancel the stuck workflow runs via the GitHub API or UI. Add a job-level timeout to all workflow files: timeout-minutes: 30. Also add step-level timeouts for individual test steps. Long-term: implement runner autoscaling (actions-runner-controller for Kubernetes) so the runner pool scales out during queue buildup. Add a monitoring alert when runner queue depth exceeds 5 jobs for > 5 minutes.`,
                          explanation: `GitHub Actions timeout configuration: jobs.job_id.timeout-minutes: 30 — cancels the job if it runs longer than 30 minutes. steps.timeout-minutes: 10 for individual steps. Without this, a job waits indefinitely for a hung network call. Runner autoscaling: actions-runner-controller (ARC) watches the Actions API for queued jobs and spins up Kubernetes pods as runners. When queue is empty, it scales to zero. This prevents runner starvation from a single runaway test suite.`,
                            options: [
                              { label: 'A', title: 'Add 10 more permanent self-hosted runners to the pool', sub: 'Provision 10 more EC2 instances as GitHub Actions runners', isCorrect: false },
                              { label: 'B', title: 'Cancel stuck jobs, add job timeout-minutes, implement runner autoscaling', sub: 'Cancel jobs → add timeout-minutes: 30 → deploy actions-runner-controller', isCorrect: true },
                              { label: 'C', title: 'Migrate from self-hosted runners to GitHub-hosted runners', sub: 'Change runs-on: self-hosted to runs-on: ubuntu-latest', isCorrect: false },
                              { label: 'D', title: 'Disable the integration test workflow until the flaky dependency is fixed', sub: 'Comment out the integration test job from workflow YAML', isCorrect: false },
                            ]
  };

export default challenge;
