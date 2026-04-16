import type { Challenge } from '../types';

// ─── ENG-WAR-022 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-022',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Redis Pub/Sub CPU Saturation (Figma-style)',
          companies: ['Figma', 'Miro'],
            timeEst: '~25 min',
              level: 'Senior',
                status: 'Not Started',
                  realWorldContext: `Figma's June 2022 outage was caused by a rare Redis bug triggered when Pub/Sub operations ran on a Cluster-Mode Enabled (CME) ElastiCache instance. CPU on one node hit 100%, causing cascading failures. Migrating the Pub/Sub load back to a Cluster-Mode Disabled instance resolved the issue. The tricky part: adding more Redis nodes with CME actually made things worse, not better.`,
                    desc: `Your collaborative editing platform uses Redis Pub/Sub for real-time cursor and change propagation. After migrating from a Redis Cluster-Mode Disabled (CMD) instance to a Cluster-Mode Enabled (CME) instance for "better scalability", one node's Engine CPU hit 100%. The node is processing Pub/Sub commands but is non-responsive. Vertical scaling (larger instance type) seems to temporarily fix the issue but it returns within hours.`,
                      solution: `This is a Redis CME + Pub/Sub incompatibility issue. In cluster mode, Pub/Sub channel subscriptions are broadcast to ALL nodes, causing multiplicative CPU load. The fix: migrate Pub/Sub operations back to a dedicated Redis instance running in Cluster-Mode Disabled (CMD) mode, or use a separate Redis instance specifically for Pub/Sub. Keep the CME instance for regular key-value operations.`,
                        explanation: `Redis Cluster Mode and Pub/Sub have a fundamental mismatch: in cluster mode, SUBSCRIBE and PUBLISH must be broadcast to all nodes since the subscribing client could be connected to any node. This N×N fan-out is CPU-intensive. The Figma postmortem revealed this is a known Redis behavior that only manifests under sufficient Pub/Sub load. Solution: run Pub/Sub on a separate non-clustered Redis instance. Monitoring: watch Redis PUBLISH and SUBSCRIBE command rates separately from GET/SET rates.`,
                          options: [
                            { label: 'A', title: 'Upgrade to a larger ElastiCache instance (r6g.4xlarge)', sub: 'Vertical scale: AWS Console → Modify → Node type r6g.4xlarge', isCorrect: false },
                            { label: 'B', title: 'Add more shards to the CME cluster to distribute the Pub/Sub load', sub: 'Increase CME cluster from 3 shards to 9 shards', isCorrect: false },
                            { label: 'C', title: 'Migrate Pub/Sub to a dedicated CMD (non-cluster) Redis instance', sub: 'Provision separate ElastiCache CMD instance; route SUBSCRIBE/PUBLISH there', isCorrect: true },
                            { label: 'D', title: 'Switch from Redis Pub/Sub to Kafka for real-time collaboration events', sub: 'Migrate to kafka topics with consumer groups per editor session', isCorrect: false },
                          ]
};

export default challenge;
