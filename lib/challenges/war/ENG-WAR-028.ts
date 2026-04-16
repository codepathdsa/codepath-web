import type { Challenge } from '../types';

// ─── ENG-WAR-028 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-028',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'DynamoDB Hot Partition Throttling',
          companies: ['Amazon', 'Lyft'],
            timeEst: '~25 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `Lyft's engineering team documented a DynamoDB incident where ride requests during a surge event all had timestamps as partition keys (e.g., YYYY-MM-DD-HH). Every request in the same minute hit the same partition, causing that single partition to absorb all traffic while others were idle. DynamoDB throttled the hot partition, causing ProvisionedThroughputExceededException for all ride requests during peak surge.`,
                    desc: `Lyft's ride request API is throwing ThrottlingException from DynamoDB during a surge event. CloudWatch shows DynamoDB consumed capacity is evenly distributed ACROSS the table, but one specific partition is consuming 80x more than others. The partition key for ride requests is ride_date (e.g., '2024-01-15') + hour ('14') — meaning all rides in the same hour go to the same partition.`,
                      solution: `The partition key design is the root cause — time-based keys cause all concurrent requests to hit the same partition ("hot partition"). Fix: add a random suffix to partition keys (write sharding): partition_key = ride_date + '#' + random.randint(0, 9). To read, query all 10 shards and merge results. Alternatively, use composite partition keys with high-cardinality attributes (ride_id, user_id) that distribute evenly.`,
                        explanation: `DynamoDB distributes data across partitions by hashing the partition key. When many items share the same key value (all rides in the same hour), they all land on one partition with limited throughput. Write sharding: append a random suffix (0-9) to the partition key to spread writes across 10 partitions. Read sharding: query all N partitions in parallel and merge. For time-series data, this increases read complexity but is essential for throughput. DynamoDB Accelerator (DAX) can also reduce hot reads.`,
                          options: [
                            { label: 'A', title: 'Increase DynamoDB provisioned capacity 10x across all partitions', sub: 'UpdateTable: ProvisionedThroughput: ReadCapacity: 10000, Write: 10000', isCorrect: false },
                            { label: 'B', title: 'Enable DynamoDB Auto Scaling to handle the surge automatically', sub: 'Set target utilization to 70% with min/max capacity', isCorrect: false },
                            { label: 'C', title: 'Redesign partition key with random suffix for write sharding', sub: 'pk = ride_date + "#" + random(0,9); query all 10 shards on read', isCorrect: true },
                            { label: 'D', title: 'Switch DynamoDB table to on-demand capacity mode', sub: 'UpdateTable: BillingMode: PAY_PER_REQUEST', isCorrect: false },
                          ]
};

export default challenge;
