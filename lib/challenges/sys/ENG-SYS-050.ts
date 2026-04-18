import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-050',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Ride-Hailing Surge Pricing Engine',
  companies: ['Uber', 'Lyft', 'Grab'],
  timeEst: '~50 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design the surge pricing engine for a ride-hailing platform. ' +
    'During high demand, prices automatically increase to incentivize more drivers to come online. ' +
    'Compute real-time supply/demand ratios per geographic zone, ' +
    'update surge multipliers every 30 seconds, and serve pricing in < 10ms.',
  solution:
    'A Flink streaming job consumes Kafka events: ride requests (demand) and driver locations (supply). ' +
    'Groups events into 30-second windows per H3 geo cell. ' +
    'Computes supply/demand ratio → applies pricing function → writes surge map to Redis. ' +
    'API servers serve prices from Redis on every estimate request. ' +
    'A smoothing function prevents abrupt price changes (surge rises slowly, falls slowly).',

  simulation: {
    constraints: [
      { label: 'Driver location updates/sec', value: '250,000' },
      { label: 'Ride requests/sec', value: '5,000' },
      { label: 'Geo cells (H3 hexagons)', value: '10,000 per city' },
      { label: 'Surge update cadence', value: 'Every 30 sec' },
      { label: 'Price read latency', value: '< 10ms' },
    ],
    levels: [
      {
        traffic: 5000,
        targetLatency: 100,
        successMsg: 'Ride requests and driver locations flowing into Kafka pipeline.',
        failMsg: '[FATAL] No supply/demand data flowing. Connect events → Kafka → Surge processor.',
        failNode: 'api_server',
        failTooltip:
          'Two Kafka topics: driver_locations (geohash + driver_id) and ride_requests (geohash + request_id). ' +
          'The surge processor consumes both to compute supply/demand per geo cell.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
        ],
      },
      {
        traffic: 50000,
        targetLatency: 500,
        successMsg: 'Surge multipliers computing — H3 hexagon grid updated every 30 sec.',
        failMsg:
          '[STALE SURGE] Surge multiplier showing 1.0x during a concert egress with 10x demand. ' +
          'Flink streaming job not computing supply/demand ratios.',
        failNode: 'kafka',
        failTooltip:
          'Flink tumbling 30-second window per H3 cell: ' +
          'demand = COUNT(ride_requests IN cell IN window). ' +
          'supply = COUNT(available_drivers IN cell). ' +
          'ratio = demand / max(supply, 1). ' +
          'surge = pricing_function(ratio).',
        checks: [
          { type: 'hasEdge', source: 'kafka', target: 'worker' },
          { type: 'hasEdge', source: 'worker', target: 'redis' },
        ],
      },
      {
        traffic: 250000,
        targetLatency: 10,
        successMsg: 'SYSTEM STABLE — surge updated every 30 sec, prices serving in < 5ms.',
        failMsg:
          '[ABRUPT CHANGE] Surge went from 1.0x to 5.0x in one update, confusing users. ' +
          'Add a price smoothing function to limit surge change per update.',
        failNode: 'redis',
        failTooltip:
          'Price smoothing: new_surge = old_surge + min(target_surge - old_surge, max_delta_per_step). ' +
          'Max delta: 0.5x per 30-second step. ' +
          'Surge rises in steps: 1.0 → 1.5 → 2.0 → ... ' +
          'Falls faster when demand drops: allows 1.0x reduction per step.',
        checks: [
          { type: 'hasEdge', source: 'worker', target: 'redis' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How do you define geographic zones for surge pricing? What are the trade-offs of different zone sizes?',
      hint: 'Large zones vs small zones.',
      answer:
        'Uber uses H3 hexagonal grids (open-sourced). ' +
        'Large zones (1 km radius): surge averages over a wide area — less precise but stable. ' +
        'Micro-zones (100m radius): very precise but volatile — a single car movement changes the ratio. ' +
        'Uber uses a dynamic zone size: during normal demand, larger zones. ' +
        'During events, smaller zones for precision. ' +
        'Zone sizes must be large enough to have at least 5-10 drivers for statistical significance.',
    },
    {
      q: 'How do you prevent surge pricing from disproportionately affecting users in low-income areas?',
      hint: 'Geographically-aware pricing caps.',
      answer:
        'Regulatory and ethical consideration: ' +
        '(1) Price caps: some cities regulate max surge (e.g., 2x during normal times, 3x during declared emergencies). ' +
        '(2) Income-aware pricing: this is controversial — most platforms avoid explicit income targeting. ' +
        '(3) Flat-rate options: UberPool/shared rides don\'t surge as much. ' +
        '(4) Transparency: show users exactly why the price is high and estimated time until surge drops.',
    },
    {
      q: 'A user gets a price estimate, then the surge increases before they confirm the ride. Do they pay the old or new price?',
      hint: 'Price lock window.',
      answer:
        'Price guarantee window: the estimated price is valid for 2 minutes from when it was shown. ' +
        'If the user confirms within 2 minutes, they pay the estimated price even if surge increased. ' +
        'If they confirm after 2 minutes, the current surge price applies. ' +
        'A price lock token is stored in Redis (locked_price:{estimate_id}: TTL 120 seconds). ' +
        'On booking: check if the token is still valid → charge locked price.',
    },
    {
      q: 'How do you ensure drivers aren\'t gaming the surge by going offline to create artificial demand?',
      hint: 'Historical behavior analysis.',
      answer:
        'Monitor driver patterns: if a driver repeatedly goes offline when surge is about to start ' +
        'and comes back when surge is active, flag as suspicious gaming behavior. ' +
        'ML model: features = (offline timing patterns, correlation with surge zones, frequency). ' +
        'Consequence: remove surge bonus for flagged drivers. ' +
        'Uber has dealt with this extensively — it\'s a real coordination behavior among drivers.',
    },
  ],
};

export default challenge;
