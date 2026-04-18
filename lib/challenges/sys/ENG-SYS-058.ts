import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-058',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Healthcare Appointment System',
  companies: ['Epic', 'Cerner', 'Zocdoc'],
  timeEst: '~40 min',
  level: 'Mid',
  status: 'Not Started',
  desc:
    'Design a healthcare appointment booking system. Patients book appointments with doctors. ' +
    'Each doctor has time slots (e.g., every 15 minutes, 8am-5pm). ' +
    'Prevent double-booking of the same slot. ' +
    'Send automated reminders 24 hours and 1 hour before appointments. ' +
    'Handle last-minute cancellations and slot re-opening for other patients.',
  solution:
    'Model availability as time_slots(doctor_id, slot_start, slot_end, status: AVAILABLE|BOOKED|BLOCKED). ' +
    'Booking: SELECT FOR UPDATE on the slot row, change status to BOOKED, commit. ' +
    'Reminders: a background job queries appointments in the next 24 hours / 1 hour and publishes notification events to Kafka. ' +
    'Cancellation: mark slot as AVAILABLE, notify next patient on waitlist.',

  simulation: {
    constraints: [
      { label: 'Doctors', value: '50,000' },
      { label: 'Slots per doctor per day', value: '~32 (15-min slots, 8h day)' },
      { label: 'Concurrent bookings', value: '10,000/sec peak' },
      { label: 'Reminder window', value: '24 hours and 1 hour before' },
      { label: 'Compliance', value: 'HIPAA (patient data encrypted at rest)' },
    ],
    levels: [
      {
        traffic: 500,
        targetLatency: 300,
        successMsg: 'Appointment slots loading — patients can see doctor availability.',
        failMsg: '[FATAL] Doctor availability not loading. Add time_slots table.',
        failNode: 'api_server',
        failTooltip:
          'Slots table: time_slots(id, doctor_id, slot_start TIMESTAMPTZ, slot_end TIMESTAMPTZ, status). ' +
          'Generate slots in advance (1 month ahead). ' +
          'Query available slots: SELECT * FROM time_slots WHERE doctor_id=? AND status=\'AVAILABLE\' AND slot_start > NOW().',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
        ],
      },
      {
        traffic: 2000,
        targetLatency: 100,
        successMsg: 'Booking with pessimistic lock — slot race condition prevented.',
        failMsg:
          '[DOUBLE BOOKING] Two patients booked the same 2pm slot with Dr. Smith simultaneously.',
        failNode: 'postgres',
        failTooltip:
          'Booking with lock: ' +
          'BEGIN; ' +
          'SELECT id, status FROM time_slots WHERE id=? FOR UPDATE; ' +
          '-- verify status = AVAILABLE ' +
          'UPDATE time_slots SET status=\'BOOKED\', patient_id=? WHERE id=?; ' +
          'INSERT INTO appointments (slot_id, patient_id, doctor_id) VALUES (...); ' +
          'COMMIT;',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
      {
        traffic: 10000,
        targetLatency: 50,
        successMsg: 'SYSTEM STABLE — bookings, reminders, and cancellation waitlist all working.',
        failMsg:
          '[REMINDERS MISSING] 30% of patients missed their reminders — background job not running.',
        failNode: 'worker',
        failTooltip:
          'Reminder worker: runs every 5 minutes. ' +
          'Query: SELECT * FROM appointments WHERE slot_start BETWEEN NOW() AND NOW() + INTERVAL 24 hours AND reminded_24h = FALSE. ' +
          'For each: publish reminder event to Kafka. ' +
          'Kafka consumer sends SMS/email. ' +
          'Update appointments SET reminded_24h = TRUE WHERE id=?. ' +
          'Idempotency: reminded_24h flag prevents duplicate reminders.',
        checks: [
          { type: 'hasEdge', source: 'worker', target: 'kafka' },
          { type: 'hasEdge', source: 'kafka', target: 'api_server' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'A doctor adds a last-minute vacation day. How do you bulk-cancel all appointments for that day?',
      hint: 'Transactional bulk update with patient notifications.',
      answer:
        'BEGIN transaction: ' +
        'UPDATE time_slots SET status=\'BLOCKED\' WHERE doctor_id=? AND DATE(slot_start)=? AND status=\'AVAILABLE\'; ' +
        'UPDATE time_slots SET status=\'CANCELLED\' WHERE doctor_id=? AND DATE(slot_start)=? AND status=\'BOOKED\'; ' +
        'SELECT patient_id FROM appointments WHERE slot_id IN (cancelled_slot_ids); ' +
        'COMMIT. ' +
        'Publish one Kafka event per affected patient: send cancellation notification and offer reschedule. ' +
        'Offer to put patients on waitlist for next available slot with the same doctor.',
    },
    {
      q: 'How would you implement a waitlist for a fully-booked doctor?',
      hint: 'Priority queue ordered by sign-up time.',
      answer:
        'Waitlist table: waitlist(id, doctor_id, patient_id, created_at, notified). ' +
        'Redis sorted set: ZADD waitlist:{doctor_id} {timestamp} {patient_id} — ordered by wait time (FIFO). ' +
        'On cancellation: ZPOPMIN waitlist:{doctor_id} returns the longest-waiting patient. ' +
        'Notify that patient: "A slot opened with Dr. Smith tomorrow at 2pm. Click to confirm within 30 minutes." ' +
        'If no confirmation in 30 minutes: move to next patient on waitlist.',
    },
    {
      q: 'What HIPAA compliance considerations affect the database design?',
      hint: 'Protected Health Information (PHI) storage and access.',
      answer:
        'PHI includes: patient name, date of birth, diagnosis, appointment reason, doctor name. ' +
        'At-rest encryption: database encryption for all PHI columns (AES-256). ' +
        'In-transit: TLS 1.2+ for all connections. ' +
        'Access control: role-based — doctors see only their patients; patients see only their own data. ' +
        'Audit logs: every PHI access is logged (who accessed what and when). ' +
        'Data minimization: don\'t store PHI in logs, analytics pipelines, or caches (Redis should store IDs, not names). ' +
        'Business Associate Agreements (BAA) required for all third-party services handling PHI.',
    },
    {
      q: 'How do you handle time zones for a nationwide telehealth service?',
      hint: 'Store UTC, display local time.',
      answer:
        'Store all timestamps in UTC in the database (TIMESTAMPTZ in Postgres). ' +
        'Doctor sets their availability in their local timezone. ' +
        'API converts to UTC before storage: "Dr. Smith at 2pm EST" = "2026-04-17T18:00:00Z". ' +
        'Patient sees the appointment in their local timezone. ' +
        'Client-side rendering: use the browser\'s timezone for display. ' +
        'Edge case: Daylight Saving Time transitions. ' +
        'A slot at "2am on the day clocks fall back" is ambiguous — must store as UTC to avoid ambiguity.',
    },
  ],
};

export default challenge;
