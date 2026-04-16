import type { Challenge } from '../types';

// ─── ENG-WAR-043 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-043',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'DDoS Amplification Attack Exhausting Bandwidth',
          companies: ['Cloudflare', 'AWS Shield'],
            timeEst: '~20 min',
              level: 'Senior',
                status: 'Not Started',
                  realWorldContext: `A memcached DDoS amplification attack in 2018 set a record at 1.7 Tbps, targeting GitHub. The attack exploited misconfigured public-facing memcached servers — a single UDP packet could be amplified 51,000x. GitHub survived because they had Akamai Prolexic DDoS scrubbing in place. AWS Shield Advanced protects against similar volumetric attacks.`,
                    desc: `Your platform is under a DDoS attack. Incoming traffic is 800 Gbps — your upstream bandwidth is 10 Gbps. The attack is volumetric (UDP flood) and is completely saturating your network uplink before traffic even reaches your servers. Your own firewall can't block it — by the time packets reach your firewall, the pipe is already full. Internal services are unreachable. Customer-facing APIs are completely down.`,
                      solution: `A volumetric DDoS at 800 Gbps cannot be mitigated by your own infrastructure — it must be absorbed upstream. Immediately contact your DDoS scrubbing provider (Cloudflare Magic Transit, AWS Shield Advanced, Akamai Prolexic) to activate DDoS scrubbing. This routes your traffic through their scrubbing centers (with 100+ Tbps capacity) which filter attack traffic before forwarding clean traffic to your servers.`,
                        explanation: `Volumetric DDoS exceeds your bandwidth before packets reach your servers. You cannot block what you cannot receive. Solutions: (1) DDoS scrubbing services (Cloudflare Magic Transit, AWS Shield Advanced) absorb attacks at their massive global network. (2) Anycast routing: distribute your IP space across many PoPs so the attack is diluted globally. (3) BGP blackhole: as a last resort, your upstream ISP can null-route your IP (you go dark but the attack traffic is dropped). Prevention: never expose memcached/DNS/NTP services to the public internet (common amplification vectors).`,
                          options: [
                            { label: 'A', title: 'Add iptables rules on all servers to block the attacking IP addresses', sub: 'iptables -A INPUT -s <attack_src_ip> -j DROP', isCorrect: false },
                            { label: 'B', title: 'Activate DDoS scrubbing service (Cloudflare Magic Transit / AWS Shield Advanced)', sub: 'Contact Cloudflare/Akamai/AWS: activate BGP-based scrubbing for your IP prefixes', isCorrect: true },
                            { label: 'C', title: 'Increase server count from 50 to 500 to absorb the extra traffic', sub: 'Auto-scale: aws autoscaling set-desired-capacity --desired-capacity 500', isCorrect: false },
                            { label: 'D', title: 'Change all DNS records to new IP addresses to escape the attack', sub: 'aws route53 change-resource-record-sets to new IP range', isCorrect: false },
                          ]
};

export default challenge;
