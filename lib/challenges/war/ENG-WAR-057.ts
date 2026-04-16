import type { Challenge } from '../types';

// ─── ENG-WAR-057 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-057',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Kafka Consumer Lag After Rebalance Storm',
            companies: ['LinkedIn', 'Confluent'],
              timeEst: '~30 min',
                level: 'Senior',
                  status: 'Not Started',
                    realWorldContext: `LinkedIn (creators of Kafka) documented "rebalance storms" — when a consumer group rebalances too frequently, no consumer makes progress. Each rebalance requires all consumers to stop processing, renegotiate partition ownership, and start processing from their last committed offset. If rebalances take 30 seconds each and trigger every 45 seconds (due to a slow consumer causing heartbeat timeouts), consumers spend more time rebalancing than consuming.`,
                      desc: `Your Kafka consumer group has a lag of 5 million messages and is growing, not shrinking. Consumer metrics show group is in continuous rebalancing state — every 30-60 seconds a rebalance triggers. A slow consumer (one pod with high CPU spike from an expensive message) occasionally exceeds the max.poll.interval.ms timeout, causing Kafka to think it's dead and trigger a rebalance, which drags all other healthy consumers into the renegotiation.`,
                        solution: `Fix the slow consumer: (1) Increase max.poll.interval.ms to give slow processing more time. (2) Reduce max.poll.records to consume fewer messages per poll interval (smaller batches). (3) Move heavy processing to an async thread pool so poll() returns before the timeout. Long term: use Static Group Membership (group.instance.id) — each consumer gets a sticky partition assignment that survives short disconnections without triggering a full rebalance.`,
                          explanation: `Kafka rebalance triggers: (1) consumer joins/leaves, (2) heartbeat timeout (session.timeout.ms), (3) max.poll.interval.ms exceeded (consumer polled but didn't call poll() again within the interval — means processing took too long). Fix: reduce work per poll batch (max.poll.records=50 instead of default 500), or move processing async so poll() is called on schedule. Static membership (group.instance.id): consumers get deterministic IDs and keep their partition assignments across pod restarts for up to group.instance.id timeout — dramatically reduces rebalances during rolling deployments.`,
                            options: [
                              { label: 'A', title: 'Scale the consumer group to 100 consumers to clear the backlog faster', sub: 'kubectl scale deployment kafka-consumer --replicas=100', isCorrect: false },
                              { label: 'B', title: 'Increase max.poll.interval.ms + reduce max.poll.records + enable static group membership', sub: 'max.poll.interval.ms=600000; max.poll.records=50; group.instance.id=pod-name', isCorrect: true },
                              { label: 'C', title: 'Delete and recreate the consumer group with a fresh offset', sub: 'kafka-consumer-groups.sh --delete --group my-group; recreate from latest', isCorrect: false },
                              { label: 'D', title: 'Increase Kafka partition count to distribute load more evenly', sub: 'kafka-topics.sh --alter --topic orders --partitions 100', isCorrect: false },
                            ]
  };

export default challenge;
