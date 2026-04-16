import type { Challenge } from '../types';

// ─── ENG-WAR-056 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-056',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Dual-Write Inconsistency During Database Migration',
            companies: ['Facebook', 'Airbnb'],
              timeEst: '~35 min',
                level: 'Senior',
                  status: 'Not Started',
                    realWorldContext: `Facebook's engineering team documented the complexity of migrating from one data store to another while maintaining consistency. During a "dual-write" migration phase, writes go to both old and new databases simultaneously. A partial failure (write succeeds to old DB, fails to new DB) leaves the two systems inconsistent — data that exists in the old store doesn't exist in the new one. This is one of the hardest problems in distributed systems.`,
                      desc: `You're migrating from MySQL to Cassandra. During the dual-write phase, writes are sent to both MySQL and Cassandra. A Cassandra network partition caused 2 hours of write failures — all writes during this period went only to MySQL. The migration team didn't detect this. Now, Cassandra is missing 2 hours of data. If you cut over to Cassandra, users will see missing records. You cannot afford extended downtime for a full re-sync.`,
                        solution: `Implement a reconciliation process: (1) Query MySQL for all records written during the failure window (WHERE created_at BETWEEN T1 AND T2). (2) For each record, attempt an upsert into Cassandra. (3) Use a CDC (Change Data Capture) tool like Debezium to tail MySQL binlog and replay missed events into Cassandra. Do not cut over until reconciliation is complete and a consistency check (random sample comparison) passes.`,
                          explanation: `Dual-write failure patterns: (1) Partial success: write to system A succeeds, write to B fails → inconsistency. (2) Detection: compare record counts and checksums between systems periodically. (3) Recovery: binlog-based replay (Debezium reads MySQL binlog and replays to Cassandra), or a full re-sync from a MySQL snapshot. Prevention: write to a message queue (Kafka) first (system of record), then consume from Kafka to write to both MySQL and Cassandra — Kafka provides replay capability on failure. This is the "event sourcing" migration pattern.`,
                            options: [
                              { label: 'A', title: 'Proceed with cutover to Cassandra and let users re-create missing data', sub: 'Accept data loss; communicate to users; proceed with migration', isCorrect: false },
                              { label: 'B', title: 'Reconcile via MySQL binlog replay (Debezium CDC) for the failure window; consistency check before cutover', sub: 'Debezium: replay MySQL binlog T1→T2 into Cassandra; run consistency check', isCorrect: true },
                              { label: 'C', title: 'Roll back entirely to MySQL and abandon the Cassandra migration', sub: 'Revert dual-write; cancel migration; stay on MySQL indefinitely', isCorrect: false },
                              { label: 'D', title: 'Do a full Cassandra TRUNCATE and re-sync all data from MySQL from scratch', sub: '4-hour downtime: dump MySQL → import to Cassandra', isCorrect: false },
                            ]
  };

export default challenge;
