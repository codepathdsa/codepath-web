import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-034',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design Airbnb (Hotel Booking)',
  companies: ['Airbnb', 'Booking.com', 'Vrbo'],
  timeEst: '~50 min',
  level: 'Mid',
  status: 'Not Started',
  desc:
    'Design the core booking flow for a vacation rental platform. ' +
    'Users search available listings by location and dates, view listings, and complete a booking. ' +
    'Prevent double-booking (two guests booking the same listing for overlapping dates). ' +
    'Handle 10M searches/day, 1M bookings/day, and 6M active listings.',
  solution:
    'Availability calendar per listing stored in Postgres (listing_id, date, status: available/booked). ' +
    'On booking: begin a transaction, lock the availability rows for the date range, ' +
    'verify all dates are still available, insert the booking, mark dates as booked, commit. ' +
    'Search indexes listing availability in Elasticsearch for geo + date-range queries.',

  simulation: {
    constraints: [
      { label: 'Active listings', value: '6M' },
      { label: 'Searches/day', value: '10M' },
      { label: 'Bookings/day', value: '1M' },
      { label: 'Avg stay duration', value: '4 nights' },
      { label: 'Double-booking tolerance', value: 'Zero' },
    ],
    levels: [
      {
        traffic: 10000,
        targetLatency: 300,
        successMsg: 'Listing search and availability loading correctly.',
        failMsg: '[FATAL] Search not returning results. Connect API → Elasticsearch + Postgres.',
        failNode: 'api_server',
        failTooltip:
          'Search: Elasticsearch for geo-filter + free-text search. ' +
          'Availability: Postgres for exact date-range availability check. ' +
          'Two separate concerns — don\'t put availability in Elasticsearch.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 200,
        successMsg: 'Booking flow working — availability locked atomically during checkout.',
        failMsg:
          '[DOUBLE BOOKING] Two guests booked the same listing for overlapping dates. ' +
          'Fix with SELECT FOR UPDATE on availability rows during booking transaction.',
        failNode: 'postgres',
        failTooltip:
          'BEGIN TRANSACTION; ' +
          'SELECT * FROM availability WHERE listing_id = X AND date BETWEEN A AND B FOR UPDATE; ' +
          'Check all rows are \'available\'; ' +
          'INSERT booking; UPDATE availability SET status = \'booked\'; ' +
          'COMMIT;' +
          'FOR UPDATE prevents concurrent transactions from modifying the same rows.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
      {
        traffic: 1000000,
        targetLatency: 100,
        successMsg: 'SYSTEM STABLE — 1M bookings/day, searches returning in < 50ms.',
        failMsg:
          '[SLOW SEARCH] Location-based search taking 3 seconds. ' +
          'Add geo-spatial index and cache popular search results.',
        failNode: 'api_server',
        failTooltip:
          'Cache popular searches (San Francisco, 2 nights, next weekend) in Redis. ' +
          'TTL: 5 minutes. Elasticsearch geo query: 50km radius from user location. ' +
          'Pre-warm cache for top 100 destinations every hour.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How do you represent and query a listing\'s availability calendar efficiently?',
      hint: 'Sparse vs dense representation.',
      answer:
        'Option 1 (dense): one row per listing per date — listing_availability(listing_id, date, status). ' +
        '6M listings × 365 days = 2.2B rows. Query: WHERE listing_id = X AND date IN (range) AND status = \'available\'. ' +
        'Option 2 (sparse): only store blocked dates — listing_blocked(listing_id, start_date, end_date). ' +
        'A listing is available if no blocked range overlaps the requested dates. ' +
        'Overlap query: NOT EXISTS (SELECT 1 WHERE listing_id = X AND start_date < endDate AND end_date > startDate). ' +
        'Airbnb uses a dense calendar for simplicity.',
    },
    {
      q: 'A host changes their listing\'s price after a guest books. Does the guest pay the old or new price?',
      hint: 'Snapshot pricing at booking time.',
      answer:
        'Snapshot the price at booking time. Store the agreed price in the booking record, not a foreign key to the current price. ' +
        'bookings(id, listing_id, guest_id, checkin_date, checkout_date, total_price_cents, status). ' +
        'total_price_cents is immutable after booking confirmation. ' +
        'The host can change their price for future bookings without affecting existing ones. ' +
        'This is a fundamental immutability principle for financial records.',
    },
    {
      q: 'How does Airbnb\'s search handle "available near San Francisco for the weekend of June 14-16"?',
      hint: 'Geo filter + date range filter — how do you efficiently combine both?',
      answer:
        'Two-phase filtering: ' +
        '(1) Geo filter in Elasticsearch: listings within 50km of San Francisco. ' +
        'Returns ~50,000 listing IDs. ' +
        '(2) Availability filter in Postgres: ' +
        'SELECT listing_id FROM availability WHERE listing_id IN (...50k IDs...) AND date IN (June 14, 15, 16) AND status = \'available\' GROUP BY listing_id HAVING COUNT(*) = 3. ' +
        'Post-process to show only listings with all 3 dates available.',
    },
    {
      q: 'How do you handle the instant book vs request-to-book models differently in the system?',
      hint: 'Two different state machines.',
      answer:
        'Instant book: booking is confirmed immediately. ' +
        'Flow: guest books → availability locked → payment captured → booking CONFIRMED. ' +
        'Request to book: host has 24 hours to accept/decline. ' +
        'Flow: guest requests → availability tentatively held (status: PENDING, TTL: 24h) → ' +
        'host accepts → payment captured → booking CONFIRMED. ' +
        'If host declines or 24h passes, release the hold (status back to AVAILABLE). ' +
        'Different state machine, same underlying availability table.',
    },
  ],
};

export default challenge;
