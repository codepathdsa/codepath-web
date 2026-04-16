import type { Challenge } from '../types';

// ─── ENG-WAR-054 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-WAR-054',
      type: 'War Room',
        badgeClass: 'badge-war',
          title: 'Kubernetes PodDisruptionBudget Blocks Node Drain',
            companies: ['Kubernetes', 'GKE'],
              timeEst: '~20 min',
                level: 'Mid',
                  status: 'Not Started',
                    realWorldContext: `A GKE maintenance window requires draining nodes for upgrade. The node drain hangs indefinitely because a PodDisruptionBudget (PDB) requires "at least 3 replicas always running", but the deployment only has 3 replicas — draining any node would violate the PDB. The node drain command waits forever for the PDB to be satisfied. The cluster upgrade is blocked and maintenance windows close.`,
                      desc: `You're running kubectl drain node-1 to prepare for a GKE upgrade. The drain has been running for 20 minutes and is stuck: Cannot evict pod as it would violate the pod's disruption budget. The affected deployment has 3 replicas spread across 3 nodes, and a PodDisruptionBudget requiring minAvailable: 3. Draining any single node evicts 1 pod, leaving only 2 — violating the PDB.`,
                        solution: `Two options: (1) Temporarily scale up the deployment to 4 replicas before draining — this allows 1 pod to be evicted while still meeting minAvailable: 3. (2) Temporarily patch the PDB to minAvailable: 2 during the maintenance window. Restore after drain completes. Long-term: ensure your PDB settings are achievable given your cluster topology — if minAvailable == replica count, no node can ever be drained.`,
                          explanation: `PodDisruptionBudget (PDB) protects service availability during voluntary disruptions (drains, upgrades). But if minAvailable equals the number of replicas, the PDB makes node draining impossible. Golden rule: minAvailable should always be < desired replica count. Example: 3 replicas → maxUnavailable: 1 (or minAvailable: 2) — allows 1 pod down at a time. For a drain to succeed: at least 1 pod must be evictable. Configure PDB based on your actual redundancy requirements, not "always all replicas."`,
                            options: [
                              { label: 'A', title: 'Use --force flag to override the PDB and force-drain the node', sub: 'kubectl drain node-1 --force --ignore-daemonsets', isCorrect: false },
                              { label: 'B', title: 'Scale deployment to 4 replicas before draining; restore PDB after upgrade', sub: 'kubectl scale deploy api --replicas=4; drain; scale back; fix PDB', isCorrect: true },
                              { label: 'C', title: 'Delete the PodDisruptionBudget permanently', sub: 'kubectl delete pdb api-pdb', isCorrect: false },
                              { label: 'D', title: 'Cancel the cluster upgrade and schedule it for a lower-traffic period', sub: 'Abort GKE upgrade; reschedule for weekend maintenance', isCorrect: false },
                            ]
  };

export default challenge;
