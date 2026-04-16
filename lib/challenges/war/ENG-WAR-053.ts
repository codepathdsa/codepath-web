import type { Challenge } from '../types';

// ─── ENG-WAR-053 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-053',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'ECS Task Scheduling Failure (No Healthy Instances)',
            companies: ['AWS', 'Fargate'],
              timeEst: '~20 min',
                level: 'Mid',
                  status: 'Not Started',
                    realWorldContext: `A common AWS ECS incident: a deployment doubles the number of tasks during the rolling update, temporarily requiring 2x capacity. If the ECS cluster's EC2 instances are running at 90% CPU/memory, there's no room for the new tasks. ECS waits indefinitely for capacity ("AGENT DISCONNECTED: insufficient memory"), while the old tasks are being deregistered. The service ends up with 0 running tasks.`,
                      desc: `You triggered an ECS rolling deployment for your API service. The deployment has been "in progress" for 45 minutes. ECS events show: service api-service was unable to place a task because no container instance met all of its requirements. The old task definition's containers are stopping, but new tasks can't start — no EC2 instances have enough free memory (each task needs 2GB, instances are at 90% utilization). The service currently has 0 running tasks.`,
                        solution: `Immediately: manually register the old task definition revision and force a new deployment with the old version to restore running tasks. Then: configure ECS Capacity Provider with Cluster Auto Scaling so EC2 instances scale out when pending tasks exist. For future deployments: set the deployment minimum healthy percent to 100% (keep old tasks running) and maximum percent to 150% (only add 50% new tasks at a time, requiring available capacity).`,
                          explanation: `ECS rolling deployment drains old tasks and starts new ones. If at 100% capacity, new tasks can't start. Fix: minimum_healthy_percent=100 ensures old tasks stay running, maximum_percent=200 allows adding new ones — but this requires 2x capacity during deployment. Use ECS Capacity Providers with Target Tracking to auto-scale EC2 instances when pending tasks exist (PROVISIONING_NEW_CAPACITY state). Fargate sidesteps this entirely — no EC2 capacity management needed. Monitor: CapacityProviderReservation metric in CloudWatch.`,
                            options: [
                              { label: 'A', title: 'Manually terminate half the running EC2 instances to free memory for new tasks', sub: 'aws ec2 terminate-instances --instance-ids i-xxx i-yyy (to force task redistribution)', isCorrect: false },
                              { label: 'B', title: 'Force-deploy old task definition to restore service; configure Capacity Provider auto-scaling', sub: 'aws ecs update-service --task-definition api:prev-revision; configure ECS Capacity Provider', isCorrect: true },
                              { label: 'C', title: 'Delete the ECS service and recreate it with the new task definition', sub: 'aws ecs delete-service; aws ecs create-service with new task def', isCorrect: false },
                              { label: 'D', title: 'Increase EC2 instance type in the Auto Scaling Group', sub: 'aws autoscaling update-auto-scaling-group --instance-type r6g.2xlarge', isCorrect: false },
                            ]
  };

export default challenge;
