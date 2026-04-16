import type { Challenge } from '../types';

// ─── ENG-WAR-004 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-004',
    type: 'War Room',
    badgeClass: 'badge-war',
    title: 'Kafka Poison Pill (Dead Letter Queue)',
    companies: ['Uber', 'DoorDash'],
    timeEst: '~30 min',
    level: 'Mid',
    status: 'Not Started',
    desc: 'The order-fulfillment microservice stopped processing new orders 2 hours ago. CPU is low. The consumer group lag is in the millions. A single malformed JSON message is at the head of the partition.',
    solution: 'The consumer crashes parsing the bad message, restarts, and pulls the exact same message again in an infinite loop. Manually advance the Kafka offset or implement a Dead Letter Queue (DLQ) for failed messages.',
    options: [
      { label: 'A', title: 'Restart the consumer service pods', sub: 'kubectl rollout restart deployment order-consumer', isCorrect: false },
      { label: 'B', title: 'Delete and recreate the Kafka topic', sub: 'kafka-topics.sh --delete --topic orders', isCorrect: false },
      { label: 'C', title: 'Increase consumer group instances to process lag faster', sub: 'kubectl scale deployment order-consumer --replicas=20', isCorrect: false },
      { label: 'D', title: 'Skip the bad message by advancing the offset, implement DLQ', sub: 'kafka-consumer-groups.sh --reset-offsets --to-offset +1', isCorrect: true },
    ]
  };

export default challenge;
