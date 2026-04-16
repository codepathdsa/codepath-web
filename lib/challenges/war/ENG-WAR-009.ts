import type { Challenge } from '../types';

// ─── ENG-WAR-009 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-009',
    type: 'War Room',
    badgeClass: 'badge-war',
    title: 'OOM Killed (Memory Leak over time)',
    companies: ['Docker', 'Kubernetes'],
    timeEst: '~25 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'Every 24 hours, K8s kills the reporting pod with exit code 137. The memory graphs show a slow, perfect diagonal line climbing upward until death.',
    solution: 'Exit code 137 means Out Of Memory (OOMKilled). Use a heap snapshot profiler to find the array or global object that is growing indefinitely without being garbage collected.',
    options: [
      { label: 'A', title: 'Raise the pod memory limit to 16GB', sub: 'resources: limits: memory: 16Gi', isCorrect: false },
      { label: 'B', title: 'Add a daily cron job to restart the pod', sub: 'kubectl delete pod reporting-xxx (via CronJob)', isCorrect: false },
      { label: 'C', title: 'Use a heap profiler to find and fix the memory leak', sub: 'node --inspect app.js, capture heap snapshots over time', isCorrect: true },
      { label: 'D', title: 'Migrate the service to a serverless Lambda function', sub: 'serverless deploy --function reporting', isCorrect: false },
    ]
  };

export default challenge;
