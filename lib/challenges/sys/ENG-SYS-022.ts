import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-022',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design Google Maps (Routing)',
  companies: ['Google', 'Apple', 'HERE'],
  timeEst: '~60 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design the routing backend for a maps application. Given an origin and destination, ' +
    'compute the fastest route considering real-time traffic. ' +
    'Handle 100M route requests/day, map data updates every 5 minutes, ' +
    'and navigation sessions with turn-by-turn updates.',
  solution:
    'The road network is a weighted directed graph (nodes=intersections, edges=road segments with travel time). ' +
    'Dijkstra\'s shortest path works but is too slow for continent-scale graphs. ' +
    'Use Contraction Hierarchies (pre-process the graph, adding shortcut edges) ' +
    'for 1000x speedup. Real-time traffic updates recalibrate edge weights via a Kafka stream. ' +
    'Map tiles are stored in S3 and served via CDN.',

  simulation: {
    constraints: [
      { label: 'Route requests/day', value: '100M' },
      { label: 'Map nodes (US)', value: '100M intersections' },
      { label: 'Map edges', value: '200M road segments' },
      { label: 'Traffic update cadence', value: 'Every 5 min' },
      { label: 'Navigation sessions', value: '10M concurrent' },
    ],
    levels: [
      {
        traffic: 10000,
        targetLatency: 500,
        successMsg: 'Route computed — Dijkstra working for city-scale routing.',
        failMsg: '[FATAL] No routing engine configured. Connect API → Graph DB → Routing Service.',
        failNode: 'api_server',
        failTooltip:
          'Road network stored as a weighted directed graph. ' +
          'Dijkstra\'s algorithm finds shortest path. For a city (10k nodes), this is fast. ' +
          'For continent-scale (100M nodes), you need pre-processing optimizations.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 200,
        successMsg: 'Contraction Hierarchies pre-computed — continent-scale routes in < 50ms.',
        failMsg:
          '[TIMEOUT] Route from NYC to LA timing out. Dijkstra on 100M nodes takes 10+ seconds.',
        failNode: 'postgres',
        failTooltip:
          'Contraction Hierarchies: offline pre-processing removes low-importance nodes and adds shortcut edges. ' +
          'At query time, only search "important" nodes first, then fill in details. ' +
          '1000x speedup vs plain Dijkstra. Google Maps uses this family of algorithms.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'api_server', target: 'worker' },
        ],
      },
      {
        traffic: 1000000,
        targetLatency: 100,
        successMsg: 'SYSTEM STABLE — 100M routes/day, real-time traffic adjusting routes within 30 sec.',
        failMsg:
          '[STALE] Traffic incident 10 minutes ago not reflected in routes. ' +
          'Add a Kafka stream to update edge weights in real-time.',
        failNode: 'api_server',
        failTooltip:
          'Traffic sensors, probe vehicles (Waze/Google Maps users), and incident reports feed Kafka. ' +
          'A streaming job recalculates travel time for affected edges every 5 minutes. ' +
          'Active navigation sessions poll for route updates every 30 seconds.',
        checks: [
          { type: 'hasEdge', source: 'kafka', target: 'worker' },
          { type: 'hasEdge', source: 'worker', target: 'redis' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How does Google Maps estimate ETA with traffic? What data goes into the travel time for each road segment?',
      hint: 'Probe vehicle data, historical patterns, incident reports.',
      answer:
        'Each edge (road segment) has a dynamically updated travel time: ' +
        '(1) Probe vehicles: anonymized GPS from Maps app users (speed on each segment, averaged). ' +
        '(2) Historical patterns: "Tuesday 5pm on I-95 is always slow" — ML model predicts from history. ' +
        '(3) Incident reports: accidents, road closures from Google\'s incident database. ' +
        'The ETA model combines all three. Google has 1B+ GPS data points from users daily.',
    },
    {
      q: 'How do you efficiently store and serve map tiles (the visual map) globally?',
      hint: 'Tiles are pre-generated images at each zoom level.',
      answer:
        'The map is divided into tiles (256x256 pixel images) at each zoom level (0-20). ' +
        'Zoom 0 = 1 tile (whole world). Zoom 20 = 1 trillion tiles (building-level). ' +
        'Tiles are pre-generated from raw geographic data and stored in S3 with the naming ' +
        'convention /tiles/{zoom}/{x}/{y}.png. ' +
        'Served via CDN — tiles rarely change, so cache-hit ratio is > 99%. ' +
        'A tile server regenerates specific tiles when map data changes.',
    },
    {
      q: 'How do you handle route recalculation during navigation when the user misses a turn?',
      hint: 'The client detects deviation; the server needs to compute a new route quickly.',
      answer:
        'The mobile client detects that the user is off the planned route (GPS position deviates > 50m). ' +
        'It sends a re-route request from the current GPS position. ' +
        'The server computes a new shortest path. ' +
        'With Contraction Hierarchies, this takes < 100ms even for continent-scale. ' +
        'The new route is streamed to the client and overlaid on the map.',
    },
    {
      q: 'How would you design the schema for storing the road network graph efficiently?',
      hint: 'Adjacency list vs compressed sparse row.',
      answer:
        'Adjacency list in Postgres: ' +
        'nodes(id, lat, lng, type) — 100M rows. ' +
        'edges(id, from_node, to_node, length_m, speed_limit, travel_time_sec) — 200M rows. ' +
        'But for algorithmic queries, Postgres is too slow. ' +
        'Load the graph into memory on the routing service (RAM: ~8 bytes × 300M entries = ~2.4 GB). ' +
        'Compressed Sparse Row (CSR) format: the fastest in-memory graph representation for Dijkstra.',
    },
    {
      q: 'How would you handle multimodal routing (driving + subway + walking)?',
      hint: 'Multiple graph layers with transfer edges.',
      answer:
        'Model each transport mode as a separate graph layer. ' +
        'Add "transfer edges" between layers: e.g., a node at a subway station has an edge from ' +
        'the road network (walking to the station) to the subway network (boarding). ' +
        'The unified graph allows algorithms to find routes that mix modes. ' +
        'Time-dependent edges: subway departs at specific times — ' +
        'edge weight = wait time + travel time. This becomes a time-dependent shortest path problem.',
    },
  ],
};

export default challenge;
