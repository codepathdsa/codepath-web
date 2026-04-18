import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-020',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a CDN',
  companies: ['Cloudflare', 'Akamai', 'AWS CloudFront'],
  timeEst: '~55 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design a Content Delivery Network that serves static assets (images, JS, CSS, video) from 200 ' +
    'edge locations globally. Target: serve 10 trillion requests/year, ' +
    'cache-hit ratio > 90%, and reduce origin server load by 95%.',
  solution:
    'A CDN works via anycast routing: the user\'s DNS request resolves to the nearest edge server by BGP. ' +
    'Edge servers check their local cache; on a miss, they pull from the origin and cache. ' +
    'The cache key is typically the URL + Vary headers. ' +
    'HTTP cache-control headers (max-age, s-maxage, stale-while-revalidate) control TTL. ' +
    'Purge propagation: invalidate a URL across all 200 edge nodes within 5 seconds.',

  simulation: {
    constraints: [
      { label: 'Edge locations', value: '200' },
      { label: 'Requests/year', value: '10 trillion' },
      { label: 'Cache-hit target', value: '> 90%' },
      { label: 'Origin offload target', value: '95%' },
      { label: 'Purge propagation', value: '< 5 sec' },
    ],
    levels: [
      {
        traffic: 10000,
        targetLatency: 50,
        successMsg: 'Edge caching active — assets served from regional edge nodes.',
        failMsg: '[LATENCY] All requests going directly to origin. No CDN routing configured.',
        failNode: 's3',
        failTooltip:
          'Route: Client → CDN Edge → S3 Origin (on cache miss). ' +
          'The CDN edge is physically closer to the user, reducing latency from 200ms (cross-continent) to 20ms (nearby PoP).',
        checks: [
          { type: 'hasPath', source: 'client', target: 'cdn' },
          { type: 'hasEdge', source: 'cdn', target: 's3' },
        ],
      },
      {
        traffic: 1000000,
        targetLatency: 20,
        successMsg: '90% cache hit ratio achieved — origin receiving only 10% of total traffic.',
        failMsg:
          '[CACHE MISS STORM] Cache hit ratio at 40%. A deploy just busted all caches simultaneously. ' +
          'Implement staggered TTLs and stale-while-revalidate.',
        failNode: 'cdn',
        failTooltip:
          'After a deploy, all edge caches miss simultaneously (cache stampede). ' +
          'Stale-while-revalidate: serve stale content while refreshing in background. ' +
          'Staggered TTL: add random jitter to TTL so edges don\'t all expire at the same time.',
        checks: [
          { type: 'hasEdge', source: 'client', target: 'cdn' },
          { type: 'hasEdge', source: 'cdn', target: 's3' },
          { type: 'hasEdge', source: 'cdn', target: 'api_server' },
        ],
      },
      {
        traffic: 10000000,
        targetLatency: 10,
        successMsg: 'SYSTEM STABLE — 10M RPS, 95% origin offload, purge propagates in < 2 sec.',
        failMsg:
          '[SLOW PURGE] Cache purge after a content update taking 5 minutes to propagate. ' +
          'Add a real-time purge API that broadcasts invalidations to all edge nodes.',
        failNode: 'cdn',
        failTooltip:
          'A centralized purge controller receives invalidation requests and ' +
          'broadcasts to all 200 edge nodes via a control plane channel (not the data plane). ' +
          'Each edge node marks the URL as stale immediately. Next request triggers a background refresh.',
        checks: [
          { type: 'hasEdge', source: 'client', target: 'cdn' },
          { type: 'hasEdge', source: 'cdn', target: 's3' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How does anycast routing direct users to the nearest edge node?',
      hint: 'BGP and same IP address on multiple servers.',
      answer:
        'Anycast: the same IP address is announced from 200 BGP locations. ' +
        'The internet\'s routing protocol (BGP) sends each user\'s packets to the "nearest" ' +
        'announce (measured in BGP hops/AS path length). ' +
        'The user\'s DNS query resolves to the CDN\'s anycast IP. ' +
        'Their ISP\'s routers automatically send them to the nearest edge PoP. ' +
        'No application logic needed — it\'s handled by the internet routing layer.',
    },
    {
      q: 'A user uploads a new profile photo. The old photo is still being served from CDN edge nodes. How do you invalidate it?',
      hint: 'URL-based invalidation vs versioned URLs.',
      answer:
        'Two strategies: ' +
        '(1) Purge API: call CDN API to invalidate the specific URL. Takes 1-5 seconds to propagate. ' +
        'Costly if doing many purges (Cloudflare charges per purge). ' +
        '(2) Cache busting (preferred): append a version to the URL: /avatar/user123?v=2. ' +
        'Old URL expires naturally. New URL is a fresh cache entry. ' +
        'This is why JS bundles have filenames like main.a3b4c5d6.js — hash-based versioning.',
    },
    {
      q: 'How would you handle a Vary: Accept-Language header — where the same URL returns different content per language?',
      hint: 'The CDN needs to cache multiple variants per URL.',
      answer:
        'The cache key includes the Vary header value. ' +
        'URL /home + Accept-Language: en-US → cache key "/home:en-US". ' +
        'URL /home + Accept-Language: fr-FR → cache key "/home:fr-FR". ' +
        'This multiplies cache entries. For i18n, a better approach: ' +
        'use separate URLs (/en/home vs /fr/home) to avoid complex cache key logic ' +
        'and improve cache hit ratios.',
    },
    {
      q: 'How do you handle dynamic, personalized content (e.g., "Welcome, Alice!" header) on a CDN?',
      hint: 'CDN caching breaks for personalized content.',
      answer:
        'Never cache personalized content at the CDN layer. Two approaches: ' +
        '(1) ESI (Edge Side Includes): cache the page skeleton at CDN, ' +
        'fetch personalized fragments from origin. ' +
        '(2) Split the page: cache static parts (header, footer) as separate fragments. ' +
        'The personalized greeting is loaded client-side via an authenticated API call after page load. ' +
        'Cloudflare Workers can run JavaScript at the edge to inject personalized content dynamically.',
    },
    {
      q: 'A new video goes viral — 10M users simultaneously request it for the first time. How does the CDN avoid overwhelming the origin?',
      hint: 'The "thundering herd" problem at CDN scale.',
      answer:
        'Request coalescing: when 1000 users simultaneously request a cold URL, ' +
        'the edge node makes ONE request to the origin and holds the others pending. ' +
        'When the origin responds, all 1000 requests are served from the single response. ' +
        'This is also called "request collapsing" or "thundering herd protection". ' +
        'Without it, 10M users could send 10M cache-miss requests to the origin simultaneously.',
    },
  ],
};

export default challenge;
