import type { Challenge } from '../types';

// ─── ENG-SYS-008 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-SYS-008',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design a Proximity Service (Yelp)',
    companies: ['Yelp', 'Tinder'],
    timeEst: '~45 min',
    level: 'Mid',
    status: 'Not Started',
    desc:
      'Users open the app and need to see the 10 closest restaurants within a 5-mile radius. ' +
      'There are 50 million restaurants in the database.',
    solution:
      'Standard SQL WHERE lat > X AND lon > Y is too slow — it\'s a 2D range scan on two columns. ' +
      'Use Geohashing to encode 2D coordinates into a 1D string. ' +
      'Store geohashes in Redis (or Postgres with a B-Tree index) for fast prefix matching. ' +
      'To find restaurants within 5 miles, query the user\'s geohash cell and its 8 neighbors.',

    simulation: {
      constraints: [
        { label: 'Total restaurants', value: '50 Million' },
        { label: 'Search radius', value: '5 miles' },
        { label: 'Results to return', value: 'Top 10 by distance' },
        { label: 'Target latency', value: '< 100ms' },
        { label: 'Location update rate', value: '< 1/sec per user' },
      ],

      levels: [
        {
          // Lesson: naive SQL 2D query is too slow
          traffic: 1000,
          targetLatency: 2000,
          successMsg:
            'Geohash service active. Proximity queries returning in < 20ms.',
          failMsg:
            '[SLOW QUERY] Running WHERE lat BETWEEN X AND lat+5mi AND lon BETWEEN Y AND lon+5mi. ' +
            'Full table scan on 50M rows. Query taking 4 seconds. ' +
            'Add a Geohash Service to convert coordinates to 1D prefix keys.',
          failNode: 'postgres',
          failTooltip:
            'A 2D range query on lat/lon requires scanning millions of rows. ' +
            'Geohashing converts a 2D point to a 1D string (e.g., "9q8yy"). ' +
            'All points within a radius share the same prefix. ' +
            'This turns a 2D range query into a fast B-Tree prefix lookup. ' +
            'Add: API Server → Geohash Service → Postgres/Redis.',
          checks: [
            { type: 'hasPath', source: 'api_server', target: 'geohash_service' },
          ],
        },
        {
          // Lesson: geohash results in Postgres need indexing
          traffic: 5000,
          targetLatency: 500,
          successMsg:
            'Redis geospatial index active. 50M restaurants indexed. Lookups < 5ms.',
          failMsg:
            '[INDEX MISSING] Geohash prefix queries against Postgres are still slow. ' +
            '50M rows with no B-Tree index on the geohash column = full scan. ' +
            'Add Redis GEOADD/GEORADIUS or a Postgres index on the geohash column.',
          failNode: 'geohash_service',
          failTooltip:
            'Redis has native geospatial commands: GEOADD stores lat/lon, ' +
            'GEORADIUS returns all keys within a radius in O(N+log(M)) time. ' +
            'Pre-load all 50M restaurant coordinates into Redis. ' +
            'A GEORADIUS query returns the 10 nearest in ~10ms regardless of total count.',
          checks: [
            { type: 'hasEdge', source: 'geohash_service', target: 'redis' },
          ],
        },
        {
          // Lesson: CDN + caching for popular areas
          traffic: 50000,
          targetLatency: 80,
          successMsg:
            'SYSTEM STABLE — 50k RPS. Popular area results cached at CDN edge.',
          failMsg:
            '[CACHE MISS] Every user in downtown San Francisco is querying the same ' +
            '5-mile radius. 10,000 identical Redis GEORADIUS queries per second for the same result. ' +
            'Cache popular geohash results at the CDN layer.',
          failNode: 'redis',
          failTooltip:
            'Cache the result of a GEORADIUS query keyed by geohash prefix + radius. ' +
            'Restaurants don\'t move often — a 30-second CDN cache dramatically reduces Redis load. ' +
            'Restaurants that update their location invalidate the cache for their geohash cell only.',
          checks: [
            { type: 'hasPath', source: 'client', target: 'cdn' },
            { type: 'hasPath', source: 'cdn', target: 'redis' },
          ],
        },
      ],
    },

    questions: [
      {
        q: 'What is geohashing and how does it make proximity queries fast?',
        hint: 'Think about turning a 2D problem into a 1D problem.',
        answer:
          'Geohashing divides the world into a grid of rectangular cells, ' +
          'each encoded as a base32 string. Nearby locations share a common prefix. ' +
          '"9q8yy" and "9q8yz" are adjacent cells in San Francisco. ' +
          'A range query becomes a prefix lookup: "give me all restaurants where geohash LIKE \'9q8y%\'". ' +
          'A B-Tree index on the geohash string makes this O(log n) instead of O(n).',
      },
      {
        q: 'What is the edge case with geohashing near cell boundaries?',
        hint: 'Two points can be 10 meters apart but in different geohash cells.',
        answer:
          'A user standing on the border of geohash cell "9q8yy" is equidistant from ' +
          'restaurants in cells "9q8yy" and "9q8yz". ' +
          'If you only query one cell, you miss nearby restaurants in adjacent cells. ' +
          'Solution: always query the user\'s geohash cell PLUS its 8 neighboring cells (a 3x3 grid). ' +
          'Then filter the results by actual Euclidean distance and return the top 10.',
      },
      {
        q: 'Tinder shows people within a radius. How does the design change for moving users?',
        hint: 'Restaurants don\'t move. Users do.',
        answer:
          'For moving users (Tinder, Uber), you cannot cache geohash results. ' +
          'Users send location updates every 5 seconds via the mobile app. ' +
          'Write each update to Redis GEOADD, overwriting the previous position. ' +
          'For user privacy, round coordinates to the nearest 100m. ' +
          'To avoid showing stale locations, only include users whose last update was < 10 minutes ago. ' +
          'Store last_seen timestamp alongside coordinates.',
      },
      {
        q: 'How do you rank the 10 results? Nearest? Highest rated?',
        hint: 'Pure distance ranking is rarely what users want.',
        answer:
          'The database returns all restaurants within the radius (say 50 candidates). ' +
          'Rank by a weighted score: ' +
          '(0.4 × rating_score) + (0.3 × proximity_score) + (0.2 × review_count_score) + (0.1 × recency_score). ' +
          'proximity_score = 1 - (distance / max_radius). ' +
          'Return the top 10 by this score. ' +
          'Allow users to switch to "Sort by: Distance / Rating / Open Now" in the UI, ' +
          'which re-ranks client-side since the candidate set is already fetched.',
      },
      {
        q: 'How would you handle 50 million restaurant writes during an initial data import?',
        hint: 'Inserting 50M rows one at a time would take days.',
        answer:
          'Use Redis GEOADD with bulk pipeline: batch 10,000 restaurants per command, ' +
          'pipelined without waiting for acknowledgment between batches. ' +
          'A 50M import at 10k/batch = 5,000 pipeline batches. ' +
          'At ~50ms per batch, total import time = ~4 minutes. ' +
          'For Postgres, use COPY FROM (PostgreSQL\'s bulk loader) instead of INSERT — ' +
          '10–100× faster for large datasets.',
      },
    ],
  };

export default challenge;
