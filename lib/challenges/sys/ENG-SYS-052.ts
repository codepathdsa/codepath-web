import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-052',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a DNS System',
  companies: ['Cloudflare', 'AWS Route 53', 'Google'],
  timeEst: '~50 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design the Domain Name System — the internet\'s distributed directory that translates domain names ' +
    'to IP addresses. Handle 1 trillion DNS queries/day globally (11.5M queries/sec), ' +
    'resolve queries in < 10ms for cached entries, ' +
    'and support record types: A, AAAA, CNAME, MX, TXT.',
  solution:
    'DNS is a hierarchical, distributed, heavily cached system. ' +
    'Root nameservers → TLD nameservers (.com) → Authoritative nameservers (example.com). ' +
    'Each level caches responses for TTL seconds. ' +
    'Resolvers (ISP DNS, 8.8.8.8) do the recursive lookups and cache results. ' +
    'A public recursive resolver (Cloudflare 1.1.1.1) needs globally distributed anycast servers ' +
    'with a tiered cache: in-process memory → Redis → authoritative query.',

  simulation: {
    constraints: [
      { label: 'Queries/sec globally', value: '11.5M' },
      { label: 'Cached resolution latency', value: '< 1ms' },
      { label: 'Uncached (recursive) latency', value: '< 100ms' },
      { label: 'Record TTL range', value: '60 sec – 86400 sec' },
      { label: 'Cache hit rate', value: '~99% (most queries are for popular domains)' },
    ],
    levels: [
      {
        traffic: 10000,
        targetLatency: 1,
        successMsg: 'DNS resolver answering queries — cached responses serving in < 1ms.',
        failMsg: '[FATAL] DNS queries not resolving. Configure resolver with in-memory cache.',
        failNode: 'api_server',
        failTooltip:
          'In-process cache: a hash map of {domain → IP, TTL_expiry}. ' +
          'On query: if cache hit and TTL not expired, return immediately. ' +
          'Cache hit rate is ~99% for popular domains (google.com, facebook.com cached everywhere).',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
      {
        traffic: 1000000,
        targetLatency: 5,
        successMsg: 'Recursive resolution working — uncached queries resolved via root → TLD → auth chain.',
        failMsg:
          '[CACHE MISS] 100% of queries going to authoritative servers. Tiered cache not working.',
        failNode: 'redis',
        failTooltip:
          'Tiered cache: L1 = in-process (~1M entries, 5ms TTL), L2 = Redis (~100M entries, full TTL). ' +
          'L1 hit: < 0.1ms. L2 hit: < 2ms. L3 miss (recursive): 50-100ms. ' +
          '99% hit rate in L1 means only 1% ever reaches Redis.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'redis', target: 'cassandra' },
        ],
      },
      {
        traffic: 11500000,
        targetLatency: 1,
        successMsg: 'SYSTEM STABLE — 11.5M queries/sec, anycast routing to nearest resolver.',
        failMsg:
          '[LATENCY] Users in Asia querying resolver in US — 200ms RTT. ' +
          'Deploy anycast resolver nodes globally.',
        failNode: 'api_server',
        failTooltip:
          'Anycast: the same IP (e.g., 1.1.1.1) is announced from 250+ PoPs globally. ' +
          'BGP routing sends each query to the nearest PoP. ' +
          'A user in Tokyo queries a Tokyo resolver — < 5ms RTT instead of 200ms to the US.',
        checks: [
          { type: 'hasEdge', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'Walk through the full DNS resolution for "www.example.com" from a cold cache.',
      hint: 'Root → TLD → Authoritative → Response.',
      answer:
        'Step 1: Client queries the local resolver (8.8.8.8). ' +
        'Step 2: Resolver asks a root nameserver: "who handles .com?" → ".com TLD server IPs". ' +
        'Step 3: Resolver asks the .com TLD server: "who handles example.com?" → "example.com nameservers". ' +
        'Step 4: Resolver asks example.com\'s authoritative nameserver: "what is www.example.com?" → "93.184.216.34". ' +
        'Step 5: Resolver caches the response (TTL: 300 seconds). Returns IP to client. ' +
        'Total time: 3 round trips × ~20ms = ~60ms for a cold resolution.',
    },
    {
      q: 'What is DNSSEC and why is it needed?',
      hint: 'DNS cache poisoning attack.',
      answer:
        'DNS cache poisoning: an attacker sends a forged DNS response that poisons the resolver\'s cache. ' +
        'Subsequent users get the fake IP (pointing to an attacker\'s server). ' +
        'DNSSEC: each DNS zone signs its records with a private key. ' +
        'Resolvers verify signatures using the zone\'s public key (stored in the parent zone as a DS record). ' +
        'Chain of trust: root zone signs TLD zone keys, TLD signs domain zone keys. ' +
        'If the signature doesn\'t verify, the resolver rejects the response.',
    },
    {
      q: 'How does DNS-based load balancing work? How does it differ from an L7 load balancer?',
      hint: 'DNS returns multiple A records.',
      answer:
        'DNS load balancing: an A record has multiple IP addresses. ' +
        'The resolver returns them in round-robin or based on geo-routing. ' +
        'Pros: no single point of failure (no LB), global routing (geo-aware). ' +
        'Cons: DNS TTL means failover is slow (TTL must expire before clients update). ' +
        'A low TTL (30 sec) allows faster failover but increases DNS query volume. ' +
        'L7 LB: faster failover (health check every 5 sec), but adds a network hop.',
    },
    {
      q: 'Why does a low DNS TTL (e.g., 30 seconds) hurt performance, even though it enables faster failover?',
      hint: 'Cache misses increase recursive query frequency.',
      answer:
        'With TTL=30, the resolver must re-query the authoritative server every 30 seconds per domain. ' +
        'For a website with 1M visitors/hour: 1M × 2 lookups (A + AAAA) / 30 seconds = 66k queries/sec to your auth server. ' +
        'With TTL=3600 (1 hour): 1M / 3600 = 278 queries/sec — 240x less load. ' +
        'The trade-off: higher TTL = slower failover if a server goes down. ' +
        'Best practice: normal TTL = 3600 sec. Before planned maintenance, lower to 60 sec.',
    },
  ],
};

export default challenge;
