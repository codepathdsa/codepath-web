import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-017',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design Pastebin',
  companies: ['Pastebin', 'GitHub', 'Hastebin'],
  timeEst: '~30 min',
  level: 'Junior',
  status: 'Not Started',
  desc:
    'Design a service where users can paste text (up to 10MB) and share it via a short URL. ' +
    'Support 1M pastes/day written and 10M reads/day. Pastes may be public or private, ' +
    'and can have an optional expiry time.',
  solution:
    'Generate a random 8-character base62 short key for each paste. ' +
    'Store paste content in S3 (cheap, scalable for large text blobs). ' +
    'Store metadata (key, user_id, created_at, expires_at, visibility) in Postgres. ' +
    'Cache hot pastes in Redis with a TTL. A background job deletes expired pastes.',

  simulation: {
    constraints: [
      { label: 'Writes/day', value: '1M' },
      { label: 'Reads/day', value: '10M (~115 reads/sec)' },
      { label: 'Read:Write ratio', value: '10:1' },
      { label: 'Max paste size', value: '10 MB' },
      { label: 'Unique keys needed', value: 'base62^8 = 218 trillion' },
    ],
    levels: [
      {
        traffic: 1000,
        targetLatency: 100,
        successMsg: 'Create and fetch pastes working — content stored in S3, metadata in Postgres.',
        failMsg: '[FATAL] Paste creation failing. Connect API → Postgres + S3.',
        failNode: 'api_server',
        failTooltip:
          'Split storage: metadata (key, owner, expiry) → Postgres, content (text blob) → S3. ' +
          'Never store large blobs in Postgres — it bloats the DB and kills query performance.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
          { type: 'hasEdge', source: 'api_server', target: 's3' },
        ],
      },
      {
        traffic: 10000,
        targetLatency: 50,
        successMsg: 'Cache layer active — popular pastes served from Redis, S3 load reduced 80%.',
        failMsg:
          '[OVERLOAD] Every read is hitting S3. Read-through cache is missing. ' +
          'Add Redis as a cache layer between API and S3.',
        failNode: 's3',
        failTooltip:
          'Cache key: paste:{shortKey}. TTL: 1 hour for public pastes. ' +
          'Read-through: check Redis first, fallback to S3 on miss, populate cache. ' +
          'S3 reads cost money and add latency — cache the top 10% of pastes that get 90% of reads.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'api_server', target: 's3' },
        ],
      },
      {
        traffic: 115,
        targetLatency: 200,
        successMsg: 'SYSTEM STABLE — short URLs resolving in < 50ms, CDN serving raw paste content globally.',
        failMsg:
          '[LATENCY] International users experiencing 800ms latency fetching paste content from S3. ' +
          'Add a CDN to serve paste content from edge nodes.',
        failNode: 's3',
        failTooltip:
          'Public pastes are immutable once created — perfect CDN candidates. ' +
          'Set Cache-Control: public, max-age=86400. S3 as origin, CDN edge nodes serve globally. ' +
          'Private pastes must NOT be CDN-cached (signed URLs only).',
        checks: [
          { type: 'hasEdge', source: 'cdn', target: 's3' },
          { type: 'hasEdge', source: 'client', target: 'cdn' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How do you generate a unique short key (e.g., "aB3xQ7kL") without collisions?',
      hint: 'Random vs sequential, and how to handle collision.',
      answer:
        'Option 1: Generate a random 8-char base62 string (a-z, A-Z, 0-9). Collision probability at 1M keys: ' +
        '1M / 218T = 0.0000046%. On INSERT, if unique constraint fails, regenerate. ' +
        'Option 2: Pre-generate keys in a batch (key service), pop one on each request. ' +
        'Option 3: Use a counter + base62 encode (sequential, no collision). ' +
        'Avoid MD5/SHA hashing the content — two identical pastes would share a URL.',
    },
    {
      q: 'How do you implement paste expiry? A paste should auto-delete after 24 hours.',
      hint: 'Active vs passive expiry.',
      answer:
        'Two approaches: ' +
        '(1) Lazy expiry: on each read, check if expires_at < NOW(). If expired, return 404 and schedule deletion. ' +
        '(2) Active expiry: a cron job queries Postgres for expired pastes (WHERE expires_at < NOW()), ' +
        'deletes from Postgres, then deletes from S3. ' +
        'Also set Redis TTL to match the paste expiry — cache entry auto-purges. ' +
        'S3 Lifecycle Policies can auto-delete objects after N days for further automation.',
    },
    {
      q: 'How do you handle a paste with a syntax-highlighted view? The user can select a language (Python, JavaScript).',
      hint: 'Server-side vs client-side rendering.',
      answer:
        'Store the language as metadata in Postgres alongside the paste. ' +
        'For the raw paste URL, return plain text with Content-Type: text/plain. ' +
        'For the HTML view, the frontend fetches the raw content from S3/CDN and applies ' +
        'a syntax highlighting library (e.g., Prism.js) entirely client-side. ' +
        'No need for server-side rendering of highlighting — keep the backend simple.',
    },
    {
      q: 'What security concerns exist for a public paste service?',
      hint: 'Think about private pastes, malware, and resource abuse.',
      answer:
        '(1) Private paste enumeration: use random keys, not sequential IDs. ' +
        'An attacker shouldn\'t be able to guess a private paste key by incrementing. ' +
        '(2) Malware uploads: scan paste content for malicious code/URLs (VirusTotal API). ' +
        '(3) Spam/abuse: rate-limit by IP (10 pastes/hour for anonymous users). ' +
        '(4) SSRF risk: never render paste content inside an iframe without sandboxing.',
    },
  ],
};

export default challenge;
