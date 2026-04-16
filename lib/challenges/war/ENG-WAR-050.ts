import type { Challenge } from '../types';

// ─── ENG-WAR-050 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-050',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Observability Blind Spot: Silent Failure in Async Worker',
            companies: ['Shopify', 'DoorDash'],
              timeEst: '~20 min',
                level: 'Mid',
                  status: 'Not Started',
                    realWorldContext: `DoorDash's engineering team documented an incident where their async order assignment worker had a silent failure — it would dequeue tasks, encounter an error, catch the exception (to prevent crashes), and log a warning. No alert fired. Orders silently stopped being assigned to dashers for 2 hours. The worker appeared healthy (no crashes, low CPU), but thousands of orders were stuck in "processing" limbo.`,
                      desc: `Your order assignment worker processes tasks from SQS. For 2 hours, new orders appeared to be accepted (200 OK from the API) but were never assigned to delivery drivers. The SQS queue showed tasks being consumed (queue depth = 0), but drivers reported no new orders. The worker logs show: WARN: Assignment failed, skipping. Customers are calling. How was this hidden for 2 hours?`,
                        solution: `The worker catches exceptions silently and continues processing (the tasks disappear from the queue but nothing happens). Fix: (1) Never silently swallow errors in async workers — emit a metric (failed_assignments_total counter) and alert when it exceeds 0. (2) Send failed tasks to a Dead Letter Queue instead of discarding them. (3) Add a "heartbeat" metric emitted on every successful assignment — alert if this metric stops for >5 minutes. (4) Track business KPIs, not just system health — "orders assigned per minute" should alert if it drops to 0.`,
                          explanation: `Silent failures in async workers are particularly insidious because: (1) the queue appears healthy (tasks are consumed), (2) the worker appears healthy (no crashes, CPU normal), (3) only a business metric (orders assigned) reveals the problem. Defense layers: (a) Emit explicit success/failure metrics for every significant operation — don't let exceptions be silent. (b) Dead Letter Queue: failed tasks go to DLQ for retry and visibility. (c) Business metric monitoring: if "successful order assignments" drops below X/minute, alert. (d) Queue depth is NOT sufficient — tasks can be consumed and silently discarded.`,
                            options: [
                              { label: 'A', title: 'Add more SQS consumers to process the queue faster', sub: 'Scale worker deployment from 3 to 20 replicas', isCorrect: false },
                              { label: 'B', title: 'Emit failure metrics + send to DLQ + alert on business metric (orders/min)', sub: 'Counter: failed_assignments_total; SQS DLQ; Alert: assignments_per_minute < 10', isCorrect: true },
                              { label: 'C', title: 'Add verbose logging to the worker to capture all assignment events', sub: 'Set LOG_LEVEL=DEBUG on all worker instances', isCorrect: false },
                              { label: 'D', title: 'Restart the worker pods to clear any in-memory state causing failures', sub: 'kubectl rollout restart deployment/order-assignment-worker', isCorrect: false },
                            ]
  };

export default challenge;
