import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-057',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Hotel Booking Inventory System',
  companies: ['Booking.com', 'Expedia', 'Marriott'],
  timeEst: '~40 min',
  level: 'Mid',
  status: 'Not Started',
  desc:
    'Design the inventory and booking system for a hotel chain with 100,000 properties worldwide. ' +
    'Guests search for available rooms by location + date range. ' +
    'The system must prevent double-booking (two guests booking the same room for the same night), ' +
    'handle cancellations, and manage overbooking allowances for no-shows.',
  solution:
    'Model inventory as room_inventory(hotel_id, room_type, date, available_count). ' +
    'On booking: use SELECT FOR UPDATE to lock the row, check available_count > 0, decrement, commit. ' +
    'Search: query via Elasticsearch for location/date filtering; ' +
    'confirm real-time availability via the DB before checkout. ' +
    'Overbooking: allow available_count to go slightly below 0 (configurable per property, e.g., 2% overbook).',

  simulation: {
    constraints: [
      { label: 'Properties', value: '100,000 hotels' },
      { label: 'Rooms per hotel', value: '~200 avg' },
      { label: 'Booking rate', value: '10,000 bookings/sec (peak)' },
      { label: 'Search rate', value: '500,000 searches/sec' },
      { label: 'Availability window', value: 'Up to 1 year in advance' },
    ],
    levels: [
      {
        traffic: 1000,
        targetLatency: 200,
        successMsg: 'Availability search working — guests finding rooms by location and date.',
        failMsg: '[FATAL] Availability search not working. Add inventory table with date granularity.',
        failNode: 'api_server',
        failTooltip:
          'Inventory model: room_inventory(hotel_id, room_type, date, available_count, total_count). ' +
          'One row per hotel per room type per date. ' +
          'Search: SELECT * FROM room_inventory WHERE hotel_id IN (...) AND date BETWEEN check_in AND check_out.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
        ],
      },
      {
        traffic: 5000,
        targetLatency: 100,
        successMsg: 'Booking with lock working — no double bookings under concurrent load.',
        failMsg:
          '[DOUBLE BOOKING] Two guests booked the same last room simultaneously. ' +
          'Add pessimistic locking with SELECT FOR UPDATE.',
        failNode: 'postgres',
        failTooltip:
          'Booking transaction: ' +
          'BEGIN; ' +
          'SELECT available_count FROM room_inventory WHERE hotel_id=? AND date=? FOR UPDATE; ' +
          '-- check available_count > 0 ' +
          'UPDATE room_inventory SET available_count = available_count - 1 WHERE ...; ' +
          'INSERT INTO bookings (...); ' +
          'COMMIT;' +
          'FOR UPDATE locks the row — no other transaction can modify it until this one commits.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
      {
        traffic: 10000,
        targetLatency: 50,
        successMsg: 'SYSTEM STABLE — Elasticsearch search + DB booking with full consistency.',
        failMsg:
          '[SEARCH SLOW] Full-text location search on 100k hotels causing Postgres table scans. ' +
          'Add Elasticsearch for geo/text search, Postgres only for booking transactions.',
        failNode: 'api_server',
        failTooltip:
          'CQRS pattern: separate reads (Elasticsearch) from writes (Postgres). ' +
          'Elasticsearch: geo_point for hotel coordinates, text fields for name/amenities. ' +
          'Search query: geo_distance filter + date availability from Redis cache. ' +
          'Postgres: only handles booking transactions (strong consistency required). ' +
          'Inventory cache: Redis stores available_count per hotel/date — cache is approximate, DB is authoritative.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How do you model room availability for a 7-night stay (check-in Monday, check-out Sunday)?',
      hint: 'One row per date or one row per booking?',
      answer:
        'Row-per-date model: hotel has 7 rows in room_inventory (one per night). ' +
        'Booking a 7-night stay: decrement available_count in all 7 rows atomically in one transaction. ' +
        'Why not a single row with date_range? Range queries are harder to update atomically; ' +
        'checking availability for arbitrary date ranges is complex. ' +
        'Row-per-date is simple: SELECT COUNT(*) WHERE available_count > 0 AND date BETWEEN ? AND ? = 7 nights available.',
    },
    {
      q: 'How do you handle a hotel that wants to close rooms for renovation on certain dates?',
      hint: 'Blocking inventory.',
      answer:
        'Blocked inventory: hotel staff can create a "block" record that reduces available_count. ' +
        'Implementation: same mechanism as a booking, but with a special block type. ' +
        'Alternatively: a separate blocked_dates table that the availability query checks. ' +
        'Blocking is recorded as a booking with type=MAINTENANCE, guest_id=NULL. ' +
        'The available_count decrements — guests can\'t book those rooms for those dates.',
    },
    {
      q: 'What is an overbooking strategy and why do hotels do it?',
      hint: 'No-show rates and revenue optimization.',
      answer:
        'Hotels allow 5-10% overbooking because ~5% of guests no-show. ' +
        'If a 100-room hotel books 105 rooms, and 5 guests don\'t show, revenue is maximized. ' +
        'Implementation: available_count can go below 0 (allow_overbook_count = 5). ' +
        'Check: available_count > -allow_overbook_count (rather than > 0). ' +
        'When all overbooked guests arrive: "walk" one guest to a nearby hotel (hotel pays). ' +
        'Risk management: machine learning models predict no-show probability per booking.',
    },
    {
      q: 'How do you handle a booking cancellation with a partial refund policy?',
      hint: 'Cancellation windows and inventory release.',
      answer:
        'Cancellation creates a CANCELLED record in bookings table. ' +
        'Inventory release: UPDATE room_inventory SET available_count = available_count + 1 WHERE ... (for each date). ' +
        'Refund calculation: ' +
        '- Cancel 7+ days before check-in: 100% refund. ' +
        '- Cancel 1-6 days before: 50% refund. ' +
        '- Cancel < 24 hours: no refund. ' +
        'Refund is processed via payment service asynchronously (Kafka event). ' +
        'Edge case: cancellation and a new booking for the same room can race — handled by the same locking mechanism.',
    },
  ],
};

export default challenge;
