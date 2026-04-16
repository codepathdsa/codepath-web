import type { Challenge } from '../types';

// ─── ENG-WAR-012 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-012',
    type: 'War Room',
    badgeClass: 'badge-war',
    title: 'Kubernetes etcd Split-Brain After Node Replacement',
    companies: ['Google Cloud', 'OpenAI'],
    timeEst: '~35 min',
    level: 'Senior',
    status: 'Not Started',
    realWorldContext: `OpenAI's December 2024 outage was caused by a misconfigured telemetry service overwhelming Kubernetes API servers, which then broke DNS-based service discovery. Reddit's Pi-Day 2023 outage (314 minutes!) was caused by a Kubernetes cluster upgrade where node metadata changed between versions, breaking workload networking. Both incidents share a root cause: the Kubernetes control plane becoming unhealthy cascades to the data plane.`,
    desc: `After a routine Kubernetes control-plane node replacement in your production cluster, the new node failed to join the etcd quorum. The etcd cluster now has only 1 of 3 members healthy, losing quorum. The API server is read-only — \`kubectl apply\` hangs. Running pods continue to serve traffic but no new deployments, scaling events, or config changes are possible. Your team has 2 hours before a scheduled release.`,
    solution: `First, DO NOT delete the unhealthy etcd member — losing quorum further would permanently corrupt the cluster. Restore the failed etcd member from a recent snapshot, or forcefully add the replacement node using etcdctl member add with the correct peer URL. Verify quorum with etcdctl endpoint health. Never restore from a snapshot unless quorum is permanently unrecoverable.`,
    explanation: `etcd uses the Raft consensus protocol requiring N/2+1 healthy members for writes. With 3 nodes and 1 healthy, you have no quorum. The correct fix: (1) verify the failed member's state via etcdctl member list, (2) if the node is reachable but misconfigured, fix its peer URL with etcdctl member update, (3) if truly dead, use etcdctl member remove then etcdctl member add on a fresh node. Never guess — a bad restore wipes all cluster state.`,
    options: [
      { label: 'A', title: 'Restore etcd from yesterday\'s snapshot immediately', sub: 'etcdctl snapshot restore snapshot.db --data-dir=/var/lib/etcd', isCorrect: false },
      { label: 'B', title: 'Restart all three API server pods to force leader re-election', sub: 'kubectl delete pod -n kube-system kube-apiserver-*', isCorrect: false },
      { label: 'C', title: 'Fix or re-add the failed etcd member with correct peer URL, restore quorum', sub: 'etcdctl member update <id> --peer-urls=https://new-node:2380', isCorrect: true },
      { label: 'D', title: 'Immediately create a brand new cluster and migrate all workloads', sub: 'eksctl create cluster + kubectl apply all manifests', isCorrect: false },
    ]
  };

export default challenge;
