import type { Challenge } from '../types';

// ─── ENG-SYS-007 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-SYS-007',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design a Web Crawler',
    companies: ['Google', 'OpenAI'],
    timeEst: '~60 min',
    level: 'Senior',
    status: 'Not Started',
    desc:
      'Crawl 1 billion web pages a month to train an LLM. ' +
      'Avoid crawling the same page twice, respect robots.txt, ' +
      'and avoid getting blocked by anti-DDoS systems.',
    solution:
      'Seed URLs into a Kafka queue. Worker nodes pull URLs, resolve DNS (with caching), ' +
      'fetch HTML, and extract new links. ' +
      'Use a Bloom Filter to check if a URL has been visited (saves DB lookups at scale). ' +
      'Dedicate one Kafka partition per domain to enforce per-domain rate limiting ' +
      'and avoid triggering DDoS protection.',

    simulation: {
      constraints: [
        { label: 'Pages per month', value: '1 Billion' },
        { label: 'Avg page size', value: '100 KB' },
        { label: 'Total data', value: '~100 TB/month' },
        { label: 'Crawl rate needed', value: '~400 pages/sec' },
        { label: 'Unique URL store', value: '~200 GB (Bloom Filter)' },
      ],

      levels: [
        {
          // Lesson: need a queue to distribute work across many workers
          traffic: 100,
          targetLatency: 500,
          successMsg:
            'URL queue active. 100 workers pulling and fetching URLs.',
          failMsg:
            '[SERIAL CRAWL] Crawling URLs one at a time sequentially. ' +
            'At 400 pages/sec needed, this will take 80 years. ' +
            'Add Kafka as a URL work queue for parallel workers.',
          failNode: 'api_server',
          failTooltip:
            'Add Kafka as the URL frontier queue. ' +
            'Seed it with initial URLs. ' +
            'Hundreds of worker nodes consume from Kafka in parallel, ' +
            'each fetching and parsing a different page simultaneously.',
          checks: [
            { type: 'hasPath', source: 'api_server', target: 'kafka' },
            { type: 'hasPath', source: 'kafka', target: 'worker' },
          ],
        },
        {
          // Lesson: checking visited URLs in Postgres at 400 RPS → too slow
          traffic: 400,
          targetLatency: 2000,
          successMsg:
            'Bloom Filter active. Duplicate URL checks in < 1ms. No DB per-URL lookups.',
          failMsg:
            '[DUPLICATE OVERLOAD] Workers are querying Postgres to check if each URL ' +
            'has been visited before. 400 SQL lookups/sec just for deduplication. ' +
            'Replace with a Bloom Filter — probabilistic, in-memory, zero DB calls.',
          failNode: 'postgres',
          failTooltip:
            'A Bloom Filter can tell you "definitely not seen" or "probably seen" ' +
            'in O(k) hash operations, all in RAM — no network call. ' +
            '200GB Bloom Filter stores 10 billion URLs with 1% false positive rate. ' +
            'Connect Worker → Bloom Filter → Kafka (to decide whether to enqueue new URLs).',
          checks: [
            { type: 'hasPath', source: 'worker', target: 'bloom_filter' },
          ],
        },
        {
          // Lesson: hammering one domain = getting blocked → rate limit per domain
          traffic: 400,
          targetLatency: 100,
          successMsg:
            'SYSTEM STABLE — 400 pages/sec. Per-domain rate limiting. robots.txt respected.',
          failMsg:
            '[BLOCKED] 40 workers all crawling google.com simultaneously. ' +
            'Google\'s DDoS protection returned 429 Too Many Requests. ' +
            'Implement per-domain rate limiting via Kafka partition-per-domain.',
          failNode: 'worker',
          failTooltip:
            'Assign one Kafka partition per domain. ' +
            'A partition has exactly one consumer at a time. ' +
            'This naturally enforces "one worker per domain" — no domain gets hammered. ' +
            'Add a configurable delay (e.g., 1 request/sec per domain) at the consumer level.',
          checks: [
            { type: 'hasNode', source: 'bloom_filter' },
            { type: 'hasPath', source: 'worker', target: 's3' },
          ],
        },
      ],
    },

    questions: [
      {
        q: 'What is a Bloom Filter and why does a web crawler need one?',
        hint: 'Think about what you need to check millions of times per second.',
        answer:
          'A Bloom Filter is a probabilistic data structure that answers "have I seen this before?" ' +
          'in O(k) time using only in-memory bit operations. ' +
          'It has no false negatives (if it says "not seen", it definitely hasn\'t been) ' +
          'and a configurable false positive rate (say 1% — occasionally re-crawls a page). ' +
          'At 1 billion URLs, a Bloom Filter takes ~200GB of RAM. ' +
          'Checking Postgres for the same 1 billion URLs would require 1 billion index lookups — ' +
          'orders of magnitude slower and much more expensive.',
      },
      {
        q: 'How do you handle robots.txt?',
        hint: 'You need to check robots.txt before crawling any page on a domain.',
        answer:
          'Fetch and cache robots.txt for each domain at the start of crawling that domain. ' +
          'Store the parsed rules (Disallow: /admin) in Redis with a 24-hour TTL. ' +
          'Before fetching any URL, check the domain\'s cached robots.txt rules. ' +
          'If the path is disallowed, drop the URL and do not enqueue it. ' +
          'Respect Crawl-delay directives in robots.txt for rate limiting per domain.',
      },
      {
        q: 'How do you detect and handle duplicate content? Two different URLs with the same page.',
        hint: 'Hash the content, not the URL.',
        answer:
          'After fetching a page, compute a SHA-256 hash of the page content (not the URL). ' +
          'Store the hash in Postgres. Before saving a page, check if that hash already exists. ' +
          'If yes: the page is a duplicate (canonical vs non-canonical URL). ' +
          'Don\'t re-process it. Optionally, record the canonical URL mapping for SEO analysis. ' +
          'Bloom Filter stores URL-level deduplication; Postgres stores content-level deduplication.',
      },
      {
        q: 'How do you prioritize which URLs to crawl first?',
        hint: 'Not all pages are equally valuable.',
        answer:
          'Use multiple Kafka topics with different priority levels: ' +
          'PRIORITY_HIGH (news sites, known quality domains), PRIORITY_NORMAL, PRIORITY_LOW. ' +
          'Workers poll high-priority topics first (weighted round-robin). ' +
          'Compute priority based on: PageRank of the referring page, ' +
          'domain authority, recency of last modification (from sitemap.xml or HTTP Last-Modified header), ' +
          'and user-defined seed lists.',
      },
      {
        q: 'How do you store 100TB of crawled HTML per month cost-effectively?',
        hint: 'Block storage is expensive. Think object storage.',
        answer:
          'Write raw HTML to S3 (or GCS). Object storage costs ~$23/TB/month vs ~$100/TB for SSD. ' +
          'Store only the parsed/cleaned text in your training corpus. ' +
          'Keep a Postgres index of: URL, crawl timestamp, S3 path, content hash. ' +
          'Apply compression (gzip) before writing to S3 — HTML compresses ~10:1, ' +
          'reducing storage to ~10TB/month. Use S3 Intelligent-Tiering to auto-move ' +
          'old crawl data to Glacier for even cheaper long-term storage.',
      },
    ],
  };

export default challenge;
