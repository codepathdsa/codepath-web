import type { Challenge } from '../types';

// ─── ENG-SYS-009 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
    id: 'ENG-SYS-009',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design a Notification System',
    companies: ['Apple', 'Netflix'],
    timeEst: '~45 min',
    level: 'Mid',
    status: 'Not Started',
    desc:
      'Send out 10 million push notifications for a breaking news event within 1 minute. ' +
      'Handle user opt-outs and failed deliveries.',
    solution:
      'The API drops a "send" event into RabbitMQ/Kafka. ' +
      'Hundreds of worker nodes consume the queue in parallel, ' +
      'check user preferences in Redis (opt-out status), ' +
      'format the payload, and send asynchronously to APNS (Apple) or FCM (Google). ' +
      'Failed deliveries are retried with exponential backoff via a dead-letter queue.',

    simulation: {
      constraints: [
        { label: 'Target recipients', value: '10,000,000' },
        { label: 'Time budget', value: '60 seconds' },
        { label: 'Required throughput', value: '166,667 sends/sec' },
        { label: 'APNS max batch size', value: '5,000 per connection' },
        { label: 'Opt-out check', value: 'Per user, before every send' },
      ],

      levels: [
        {
          // Lesson: synchronous serial send is too slow
          traffic: 1000,
          targetLatency: 200,
          successMsg:
            'Kafka queue active. Workers consuming and dispatching notifications in parallel.',
          failMsg:
            '[TOO SLOW] Sending notifications synchronously, one at a time. ' +
            'At 1ms per send, 10M notifications = 2.7 hours. ' +
            'You have 60 seconds. Publish to Kafka, fan out to 200 parallel workers.',
          failNode: 'api_server',
          failTooltip:
            'The API should immediately publish a "send_campaign" event to Kafka and return 202. ' +
            'Worker nodes subscribe to Kafka, each handling a shard of the recipient list in parallel. ' +
            '200 workers × 833 sends/sec each = 166k sends/sec total.',
          checks: [
            { type: 'hasPath', source: 'api_server', target: 'kafka' },
            { type: 'hasPath', source: 'kafka', target: 'worker' },
          ],
        },
        {
          // Lesson: must check preferences before sending — opt-outs
          traffic: 50000,
          targetLatency: 300,
          successMsg:
            'Preference checks passing. Opted-out users skipped. Compliance maintained.',
          failMsg:
            '[COMPLIANCE FAILURE] Sending notifications to users who opted out. ' +
            'GDPR violation. Workers must check user notification preferences before each send.',
          failNode: 'worker',
          failTooltip:
            'Before calling APNS/FCM, each worker must check Redis for the user\'s ' +
            'notification preferences (opt-in status, quiet hours, device token validity). ' +
            'Cache preferences in Redis with a 5-minute TTL. ' +
            'Connect Worker → Redis → APNS/FCM.',
          checks: [
            { type: 'hasEdge', source: 'worker', target: 'redis' },
            { type: 'hasPath', source: 'worker', target: 'apns_fcm' },
          ],
        },
        {
          // Lesson: failed deliveries need retries via dead-letter queue
          traffic: 166000,
          targetLatency: 60,
          successMsg:
            'SYSTEM STABLE — 10M notifications sent in 58 seconds. Failed retried via DLQ.',
          failMsg:
            '[SILENT FAILURE] 300,000 notifications failed silently. ' +
            'APNS returned error but workers dropped the failure. ' +
            'Add a Dead-Letter Queue in Kafka for failed messages.',
          failNode: 'apns_fcm',
          failTooltip:
            'When APNS/FCM returns an error (expired device token, rate limit), ' +
            'publish the failed message to a Kafka DLQ topic. ' +
            'A separate retry consumer processes DLQ messages with exponential backoff. ' +
            'After 3 retries, mark the notification as permanently failed in Postgres and alert.',
          checks: [
            { type: 'hasPath', source: 'apns_fcm', target: 'kafka' },
            { type: 'hasPath', source: 'kafka', target: 'postgres' },
          ],
        },
      ],
    },

    questions: [
      {
        q: 'APNS and FCM have rate limits. How do you avoid hitting them?',
        hint: 'Each APNS connection has a max throughput. More connections = more throughput.',
        answer:
          'APNS supports up to 500 concurrent connections per certificate, each handling ~1,000 msgs/sec. ' +
          'To hit 100k sends/sec: maintain a connection pool of 100 APNS connections. ' +
          'Shard the recipient list by user_id % num_workers so each worker owns ' +
          'a non-overlapping slice of the recipient list. ' +
          'Use the HTTP/2 protocol to APNS — it multiplexes requests over a single connection.',
      },
      {
        q: 'How do you handle a user who has both an iOS and Android device?',
        hint: 'One user can have multiple device tokens.',
        answer:
          'Store device tokens in a Postgres table: ' +
          'user_id (FK), device_token (unique), platform (ios/android), last_active. ' +
          'One user can have N device tokens. ' +
          'When sending, fetch all active tokens for the user and send to all of them. ' +
          'On APNS error 410 (token expired), delete that token from Postgres. ' +
          'Clients register new tokens on app launch, so stale tokens self-resolve.',
      },
      {
        q: 'How do you implement "quiet hours" — don\'t send between 10pm and 8am in the user\'s timezone?',
        hint: 'You need to know the user\'s timezone and current local time.',
        answer:
          'Store the user\'s timezone in the user table (set during signup or inferred from IP). ' +
          'In Redis, cache a "suppressed_until" timestamp per user. ' +
          'Before sending, convert current UTC to user\'s local time. ' +
          'If within quiet hours, publish to a "scheduled" Kafka topic with a delay timestamp. ' +
          'A scheduler consumer re-enqueues the message at 8am local time. ' +
          'This requires a priority queue or time-sorted queue.',
      },
      {
        q: 'Netflix sends personalized notifications ("Season 3 of your show just dropped"). How do you personalize at 10M scale?',
        hint: 'Personalization data must be pre-computed, not generated at send time.',
        answer:
          'Personalization at send time (querying each user\'s watch history) is too slow. ' +
          'Run a nightly Spark batch job that pre-computes each user\'s top recommended shows. ' +
          'Store results in Redis: user_id → [show_1, show_2, ...]. ' +
          'At send time, the worker fetches the precomputed recommendation from Redis in ~1ms ' +
          'and injects it into the notification template. ' +
          'Total overhead: 1ms per notification, negligible.',
      },
      {
        q: 'How do you measure the success of a notification campaign?',
        hint: 'You need open rates, delivery rates, and opt-out rates.',
        answer:
          'Emit events at each stage to Kafka: ' +
          'notification_sent, notification_delivered (APNS confirmation), ' +
          'notification_opened (deep link click tracked in app), notification_dismissed. ' +
          'A Flink/Spark consumer aggregates these events into Postgres by campaign_id. ' +
          'Dashboard shows: delivery rate (sent vs confirmed), open rate (opened / delivered), ' +
          'opt-out rate (opt-outs triggered by this campaign). ' +
          'Store events in S3 for long-term analytics in Redshift.',
      },
    ],
  };

export default challenge;
