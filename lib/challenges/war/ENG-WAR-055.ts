import type { Challenge } from '../types';

// ─── ENG-WAR-055 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-055',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Auto-Scaling Race Condition (Scale-Down Kills Active Requests)',
            companies: ['AWS', 'GCP'],
              timeEst: '~20 min',
                level: 'Mid',
                  status: 'Not Started',
                    realWorldContext: `AWS Auto Scaling terminates instances without waiting for in-flight requests to complete. If an API request takes 30 seconds (e.g., a report generation job) and auto-scaling terminates the instance at second 15, the request fails. This causes elevated error rates during scale-down events. AWS supports lifecycle hooks to delay termination, and Kubernetes supports terminationGracePeriodSeconds for the same purpose.`,
                      desc: `During a traffic decrease after peak hours, your EC2 Auto Scaling Group starts scaling down. Users are reporting 5% of API requests are failing with connection reset errors. Analysis shows the failures occur when an EC2 instance is terminated mid-request. Your application handles requests up to 45 seconds long. The ASG terminates instances without waiting for requests to complete.`,
                        solution: `Implement connection draining (ALB connection draining / deregistration delay) before instance termination. In Auto Scaling: use Lifecycle Hooks (TerminatingWait state) to delay termination and allow the instance to: (1) signal the load balancer to stop routing new requests, (2) wait for existing requests to complete (up to 45 seconds), then (3) terminate. Set ALB deregistration_delay to 60 seconds to ensure the LB stops routing before the instance receives SIGTERM.`,
                          explanation: `Graceful shutdown sequence: (1) Auto Scaling marks instance for termination. (2) Lifecycle hook triggers (TerminatingWait). (3) Instance signals load balancer to deregister (stops receiving new traffic). (4) Load balancer connection drain period (60s): existing connections complete, new requests go elsewhere. (5) Instance sends SIGTERM to application process. (6) Application finishes in-flight requests (up to 45s). (7) SIGTERM → application graceful shutdown. (8) Auto Scaling continues termination. K8s equivalent: terminationGracePeriodSeconds + preStop hook.`,
                            options: [
                              { label: 'A', title: 'Disable auto-scaling and manually manage instance counts', sub: 'aws autoscaling suspend-processes --auto-scaling-group-name prod-asg', isCorrect: false },
                              { label: 'B', title: 'Add Lifecycle Hook (TerminatingWait) + ALB deregistration delay for graceful drain', sub: 'lifecycle hook: TerminatingWait 120s; ALB: deregistration_delay=60s; app: SIGTERM handler', isCorrect: true },
                              { label: 'C', title: 'Increase minimum instance count so scale-down never occurs during business hours', sub: 'ASG min_size: 20 (never scale below business-hour baseline)', isCorrect: false },
                              { label: 'D', title: 'Reduce maximum request timeout to 5 seconds to minimize impact of termination', sub: 'nginx: proxy_read_timeout 5s; app: request_timeout: 5000ms', isCorrect: false },
                            ]
  };

export default challenge;
