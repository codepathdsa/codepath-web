import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-045',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Code Deployment System (CI/CD)',
  companies: ['GitHub', 'Vercel', 'Heroku'],
  timeEst: '~50 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design a CI/CD system that automatically builds, tests, and deploys code on every git push. ' +
    'Support 10,000 repositories pushing code simultaneously, ' +
    'build isolation (each build in its own container), ' +
    'and zero-downtime deployments with instant rollback.',
  solution:
    'A webhook from the git provider triggers a pipeline. ' +
    'A build job queue (Kafka) distributes work to a pool of ephemeral build workers (Docker containers on Kubernetes). ' +
    'Build artifacts are stored in S3. ' +
    'Deployment uses rolling updates + health checks. ' +
    'Feature flags and canary deployments provide progressive rollout. ' +
    'Rollback = redeploying the previous artifact from S3.',

  simulation: {
    constraints: [
      { label: 'Concurrent builds', value: '10,000' },
      { label: 'Avg build time', value: '3 minutes' },
      { label: 'Build isolation', value: 'One Docker container per build' },
      { label: 'Rollback time', value: '< 60 seconds' },
      { label: 'Deployment strategy', value: 'Blue-green or rolling update' },
    ],
    levels: [
      {
        traffic: 1000,
        targetLatency: 180000,
        successMsg: 'Build pipeline running — code pushed, tests executed, artifact stored.',
        failMsg: '[FATAL] Builds not triggering. Configure git webhook → build queue → workers.',
        failNode: 'api_server',
        failTooltip:
          'Git push → webhook to CI server → create build job in Kafka. ' +
          'Worker: pull code from git, run tests in Docker container, push artifact to S3.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
          { type: 'hasEdge', source: 'kafka', target: 'worker' },
        ],
      },
      {
        traffic: 5000,
        targetLatency: 60000,
        successMsg: 'Blue-green deployments active — zero-downtime deploys with instant rollback.',
        failMsg:
          '[DOWNTIME] Deployment taking the service offline for 2 minutes. ' +
          'Implement blue-green deployment to switch traffic with zero downtime.',
        failNode: 'worker',
        failTooltip:
          'Blue-green: maintain two identical environments (blue = current, green = new). ' +
          'Deploy to green while blue serves traffic. ' +
          'Health check green. Switch load balancer from blue to green. ' +
          'Green is now live. Blue becomes standby (instant rollback: switch back).',
        checks: [
          { type: 'hasEdge', source: 'worker', target: 's3' },
          { type: 'hasEdge', source: 'api_server', target: 'load_balancer' },
        ],
      },
      {
        traffic: 10000,
        targetLatency: 30000,
        successMsg: 'SYSTEM STABLE — 10k concurrent builds, canary deployments, rollback in < 30 sec.',
        failMsg:
          '[NO CANARY] A bad deploy went to 100% of users immediately. ' +
          'Add canary deployments to gradually roll out changes.',
        failNode: 'load_balancer',
        failTooltip:
          'Canary deployment: send 5% of traffic to the new version. ' +
          'Monitor error rate and latency for 10 minutes. ' +
          'If metrics are healthy, gradually increase to 10% → 50% → 100%. ' +
          'Automated rollback: if error rate exceeds threshold, revert to previous version.',
        checks: [
          { type: 'hasEdge', source: 'load_balancer', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How do you ensure build isolation — a build in one repo can\'t affect builds in another repo?',
      hint: 'Container isolation and resource limits.',
      answer:
        'Each build runs in a fresh Docker container. ' +
        'The container is ephemeral: created at build start, destroyed at build end. ' +
        'Container resource limits: CPU, memory, network bandwidth per build. ' +
        'Network isolation: builds can\'t reach each other\'s containers. ' +
        'Secrets injection: environment variables passed at runtime (not baked into the image). ' +
        'Build artifacts are uploaded to S3 — no shared local filesystem.',
    },
    {
      q: 'A build takes 30 minutes. How do you cache dependencies to speed it up?',
      hint: 'Layer caching in Docker and dependency caching.',
      answer:
        'Docker layer caching: if the Dockerfile hasn\'t changed, the base image layers are reused. ' +
        'Dependency caching: cache node_modules / .pip cache / Maven local repo between builds. ' +
        'The cache key is a hash of the dependency manifest (package.json, requirements.txt). ' +
        'Store caches in S3. Pull cache at build start, push updated cache at build end. ' +
        'GitHub Actions cache action does exactly this. Typical speedup: 30 min → 3 min.',
    },
    {
      q: 'How do you handle a flaky test that randomly fails 5% of the time, causing false failures?',
      hint: 'Test retry, quarantine, and tracking.',
      answer:
        'Automatic retry: if a test fails, retry it up to 3 times. ' +
        'If it passes on retry, mark as flaky (not blocking). ' +
        'Flaky test quarantine: tests that fail more than 10% of the time are moved to a "flaky" bucket — ' +
        'they run but don\'t fail the build. ' +
        'Track flaky tests in a DB (test name, pass rate, last failure). ' +
        'Alert the team when flaky tests are introduced — they should be fixed, not quarantined forever.',
    },
    {
      q: 'How do you roll back a deployment that broke the database schema?',
      hint: 'Schema migrations and backward compatibility.',
      answer:
        'This is the hardest rollback scenario. ' +
        'If a migration drops a column, the previous code (which uses that column) will fail. ' +
        'Prevention: expand-contract pattern. ' +
        '(1) Expand: add the new column (backward compatible — old code ignores it). ' +
        '(2) Migrate data. ' +
        '(3) Deploy new code that uses the new column. ' +
        '(4) Contract: drop the old column after verifying new code works. ' +
        'Never drop or rename columns in the same release that uses them.',
    },
  ],
};

export default challenge;
