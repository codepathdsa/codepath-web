import type { Challenge } from '../types';

// ─── ENG-WAR-060 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-060',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Clock Skew Breaks Distributed Consensus (Raft / etcd)',
            companies: ['CockroachDB', 'TiKV'],
              timeEst: '~30 min',
                level: 'Senior',
                  status: 'Not Started',
                    realWorldContext: `CockroachDB uses hybrid logical clocks (HLC) to handle clock skew between nodes. When NTP synchronization fails and one node's clock drifts more than 500ms from others, CockroachDB rejects writes from that node to prevent causality violations. In a 3-node cluster, one node with a clock drift of 600ms effectively becomes unavailable — and if this node holds the Raft leader lease, the entire cluster stops accepting writes.`,
                      desc: `Your CockroachDB cluster (3 nodes) suddenly stops accepting write queries. Error logs show: ERROR: node 2: clock skew of 623ms exceeds maximum tolerated skew of 500ms. NTP was recently reconfigured on node 2 and its clock jumped forward by 623ms. Because of the clock skew safety check, node 2 is rejecting its own writes. The Raft leader happens to be on node 2. All other nodes are healthy with <5ms skew.`,
                        solution: `Fix NTP on node 2 immediately: sync the clock using ntpdate or chronyc. Do NOT force-adjust the clock backward by more than a few milliseconds at a time — a sudden large backward jump can violate causality (timestamps going backward). Use chrony's slew mode to gradually correct the clock. After clock is within acceptable skew: node 2 will automatically rejoin the cluster and Raft leader election will stabilize.`,
                          explanation: `Distributed databases rely on time for: (1) Raft leader leases (node with expired lease can't commit writes), (2) MVCC timestamp ordering (ensuring reads see causally consistent snapshots), (3) distributed transaction timestamps. Clock skew causes: (1) A node ahead of time can't commit (other nodes will see it as from the future). (2) A node behind time might overwrite newer data. Prevention: use PTP (Precision Time Protocol) instead of NTP for microsecond accuracy; use TrueTime (Google's GPS+atomic clock based time) if available; set chrony max_slew_rate to avoid sudden jumps.`,
                            options: [
                              { label: 'A', title: 'Force a manual clock adjustment on node 2 to immediately fix the drift', sub: 'timedatectl set-time "2024-01-15 14:30:00" (hard set clock)', isCorrect: false },
                              { label: 'B', title: 'Fix NTP on node 2 using chrony slew mode; allow automatic Raft recovery', sub: 'chronyc makestep; verify skew < 500ms; monitor Raft leader election', isCorrect: true },
                              { label: 'C', title: 'Remove node 2 from the cluster and add a fresh replacement node', sub: 'cockroach node decommission 2; add new node with correct time', isCorrect: false },
                              { label: 'D', title: 'Increase the max tolerated clock skew to 2000ms to accommodate drift', sub: '--max-offset=2000ms on all cockroachdb nodes', isCorrect: false },
                            ]
  };

export default challenge;
