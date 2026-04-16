import type { Challenge } from '../types';

// ─── ENG-WAR-013 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-013',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'CoreDNS ndots:5 Causing Latency Spike',
          companies: ['Cloudflare', 'Preply'],
            timeEst: '~25 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `Preply's 2020 Kubernetes postmortem revealed that the default Kubernetes DNS configuration (ndots:5) was causing every DNS query to attempt 5 absolute lookups before resolving correctly. A service calling "redis" internally would try redis.namespace.svc.cluster.local, redis.svc.cluster.local, redis.cluster.local, redis.company.com, redis — in that order — before succeeding. Under load, this flooded CoreDNS and caused conntrack table exhaustion.`,
                    desc: `After scaling your Kubernetes cluster from 20 to 100 nodes, internal service-to-service calls are intermittently failing with 5-second timeouts. External API calls from pods are also slow. CPU on CoreDNS pods is at 100%. The application logs show DNS resolution timeouts. Node conntrack tables are filling up.`,
                      solution: `The Kubernetes default resolv.conf sets ndots:5, causing every hostname to attempt multiple FQDN lookups before finding the correct answer. Fix: (1) Set ndots:1 or ndots:2 in your pod spec's dnsConfig, (2) use fully-qualified domain names (FQDNs) ending with a dot for external calls, (3) add more CoreDNS replicas and set NodeLocal DNSCache to reduce conntrack pressure.`,
                        explanation: `ndots:5 means any hostname with fewer than 5 dots gets expanded with search domain suffixes first. A call to 'api.stripe.com' becomes 5 failed lookups before the correct external resolution. At scale, this means every pod multiplies DNS traffic by 5x. NodeLocal DNSCache (running a DNS cache on each node) eliminates the conntrack table pressure entirely since the daemonset runs in hostNetwork mode.`,
                          options: [
                            { label: 'A', title: 'Increase CoreDNS pod memory limits to 2GB', sub: 'kubectl patch deploy coredns -n kube-system --patch resources', isCorrect: false },
                            { label: 'B', title: 'Set ndots:1 in pod dnsConfig + enable NodeLocal DNSCache DaemonSet', sub: 'dnsConfig: options: [{name: ndots, value: "1"}]', isCorrect: true },
                            { label: 'C', title: 'Switch from CoreDNS to kube-dns', sub: 'Reinstall cluster with kube-dns instead of CoreDNS', isCorrect: false },
                            { label: 'D', title: 'Increase conntrack table size on all nodes', sub: 'sysctl -w net.netfilter.nf_conntrack_max=1000000', isCorrect: false },
                          ]
};

export default challenge;
