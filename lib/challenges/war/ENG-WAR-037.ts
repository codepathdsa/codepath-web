import type { Challenge } from '../types';

// ─── ENG-WAR-037 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-037',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Celery Task Queue Backlog (Worker Starvation)',
          companies: ['Dropbox', 'Instacart'],
            timeEst: '~20 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `Dropbox's file sync pipeline uses a task queue system similar to Celery. A high-volume but non-urgent task type ("thumbnail generation") was placed in the same queue as urgent tasks ("send password reset email"). The thumbnail backlog grew to 500k tasks, starving the email tasks which waited hours in queue behind them. Users never received their password reset emails.`,
                    desc: `Your Celery task queue has 500,000 queued tasks. Users are reporting they never received their password reset emails (sent via a Celery task). Celery workers are running but consuming thumbnail generation tasks (each takes 2-5 seconds). Password reset email tasks are buried at position 498,000 in the queue. Time-sensitive tasks are taking hours to be processed.`,
                      solution: `Implement queue prioritization: create separate queues for different task priorities (e.g., 'critical', 'high', 'default', 'low'). Route password reset emails to the 'critical' queue. Route thumbnail generation to the 'low' queue. Start dedicated workers that only consume the 'critical' queue. In Celery: use task_routes to assign tasks to queues and start workers with -Q critical,high flags.`,
                        explanation: `Celery queue design principles: never mix time-sensitive tasks with bulk tasks. Create at least 3 priority queues: critical (auth emails, payment confirmations — dedicated workers, always first), high (notifications, API calls), low (thumbnails, reports, batch jobs). Worker assignment: critical queue: 5 workers dedicated, never process other queues. Low queue: workers can be reduced during resource constraints. Celery: celery worker -Q critical,high --concurrency=10. The "critical" queue workers should never be starved by other queues.`,
                          options: [
                            { label: 'A', title: 'Scale Celery workers to 100 instances to clear the backlog faster', sub: 'kubectl scale deployment celery-worker --replicas=100', isCorrect: false },
                            { label: 'B', title: 'Flush the entire task queue and re-enqueue only password reset tasks', sub: 'celery purge; re-queue critical tasks only', isCorrect: false },
                            { label: 'C', title: 'Implement separate priority queues; dedicate workers to critical queue', sub: 'task_routes: email → critical, thumbnail → low; workers: -Q critical', isCorrect: true },
                            { label: 'D', title: 'Increase Celery task visibility timeout to deprioritize old tasks', sub: 'CELERY_VISIBILITY_TIMEOUT = 3600', isCorrect: false },
                          ]
};

export default challenge;
