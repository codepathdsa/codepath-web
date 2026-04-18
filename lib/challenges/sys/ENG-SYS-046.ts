import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-046',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design an IoT Sensor Data Pipeline',
  companies: ['AWS', 'Tesla', 'Nest'],
  timeEst: '~50 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design a data pipeline for 10M IoT devices (sensors, smart meters, vehicles) that each ' +
    'emit a reading every 30 seconds. Process 333k events/sec, detect anomalies in real-time ' +
    '(e.g., temperature > 100°C), store readings for 5 years, and expose a dashboard API.',
  solution:
    'MQTT broker (Mosquitto/AWS IoT Core) for device communication — lightweight, pub/sub, connection-oriented. ' +
    'Events bridge to Kafka for scalable stream processing. ' +
    'Flink processes streams: anomaly detection (stateful per-device), aggregation (1-min averages). ' +
    'Time-series DB (InfluxDB/Cassandra) for raw + aggregated readings. ' +
    'Long-term cold storage in S3 with Athena for historical analysis.',

  simulation: {
    constraints: [
      { label: 'Devices', value: '10M' },
      { label: 'Events/sec', value: '333,000' },
      { label: 'Avg payload size', value: '200 bytes' },
      { label: 'Ingest bandwidth', value: '~66 MB/sec' },
      { label: 'Anomaly detection latency', value: '< 5 sec' },
    ],
    levels: [
      {
        traffic: 10000,
        targetLatency: 1000,
        successMsg: 'MQTT broker accepting device connections — sensor data flowing in.',
        failMsg: '[FATAL] Devices cannot connect. Deploy MQTT broker to handle device connections.',
        failNode: 'api_server',
        failTooltip:
          'MQTT is designed for IoT: binary protocol, small packet overhead (2 byte header), ' +
          'QoS levels (fire-and-forget or guaranteed delivery), ' +
          'persistent sessions (devices can reconnect and receive missed messages). ' +
          'HTTP REST API is too heavyweight for millions of battery-powered sensors.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 500,
        successMsg: 'Stream processing active — 1-min aggregates computed, anomalies detected in < 3 sec.',
        failMsg:
          '[BLIND SPOT] Temperature spike to 150C not detected for 5 minutes. ' +
          'Add Flink streaming job for real-time anomaly detection.',
        failNode: 'kafka',
        failTooltip:
          'Flink stateful processing: per-device state tracks last N readings. ' +
          'Anomaly: if current reading deviates from device\'s own baseline by > 3 std deviations. ' +
          'Per-device state (not global) prevents high-temp climate zones from false-triggering.',
        checks: [
          { type: 'hasEdge', source: 'kafka', target: 'worker' },
          { type: 'hasEdge', source: 'worker', target: 'cassandra' },
        ],
      },
      {
        traffic: 333000,
        targetLatency: 200,
        successMsg: 'SYSTEM STABLE — 333k events/sec, 5-year retention, < 2 sec anomaly alerts.',
        failMsg:
          '[STORAGE COST] Storing raw 200-byte readings for 5 years = 105 TB. ' +
          'Downsample old data: keep 1-min aggregates after 30 days, daily averages after 1 year.',
        failNode: 'cassandra',
        failTooltip:
          'Tiered retention: ' +
          'Hot (0-30 days): raw readings in Cassandra. ' +
          'Warm (30-365 days): 1-minute averages in Cassandra. ' +
          'Cold (1-5 years): daily averages in S3. ' +
          'Compaction job runs nightly to aggregate and archive old data.',
        checks: [
          { type: 'hasEdge', source: 'worker', target: 's3' },
          { type: 'hasEdge', source: 'api_server', target: 'cassandra' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'Why is MQTT better than HTTP REST for IoT devices?',
      hint: 'Battery life, packet overhead, connectivity.',
      answer:
        'MQTT advantages for IoT: ' +
        '(1) Tiny packet overhead: 2-byte fixed header vs ~500 bytes for HTTP headers. ' +
        'For battery-powered sensors, this matters. ' +
        '(2) Persistent connections: TCP connection stays open. No TLS handshake overhead per message. ' +
        '(3) QoS levels: QoS 0 (fire-and-forget), QoS 1 (at-least-once), QoS 2 (exactly-once). ' +
        '(4) Last Will message: broker notifies subscribers if a device disconnects unexpectedly. ' +
        '(5) Works over unreliable networks (cellular IoT, low-power WAN).',
    },
    {
      q: 'A sensor is in a tunnel with no connectivity for 30 minutes. How do you handle the data gap?',
      hint: 'Device-side buffering and MQTT persistent sessions.',
      answer:
        'Device-side buffering: store readings in local flash memory when offline. ' +
        'On reconnect: MQTT QoS 1 with persistent session ensures the broker knows the device\'s subscription state. ' +
        'The device publishes all buffered readings in a batch. ' +
        'Timestamps are device-side: each reading includes the actual measurement time. ' +
        'The pipeline accepts out-of-order events (Flink watermarks handle late data). ' +
        'The 30-minute gap appears in dashboards, then backfills when the device reconnects.',
    },
    {
      q: 'How do you authenticate 10M devices? You can\'t give each device a username/password.',
      hint: 'TLS client certificates and device provisioning.',
      answer:
        'Each device has a unique TLS client certificate burned in at manufacturing time. ' +
        'The MQTT broker validates the certificate against the device CA (Certificate Authority). ' +
        'Certificate rotation: over-the-air (OTA) firmware updates can renew certificates. ' +
        'Device provisioning service (AWS IoT): ' +
        'device sends its serial number + hardware attestation → receives its unique certificate. ' +
        'Never hardcode a shared API key — compromise of one device would expose all devices.',
    },
    {
      q: 'How do you detect a malfunctioning sensor that\'s reporting the same value for 24 hours (stuck sensor)?',
      hint: 'Stateful anomaly detection.',
      answer:
        'Flink stateful job tracks per-device reading variance over a 1-hour window. ' +
        'If variance is 0 (all readings identical) for > 1 hour, flag as "stuck sensor". ' +
        'Also flag: readings exactly = 0 (sensor offline), readings = max sensor value (overflow), ' +
        'and readings outside physical bounds (temperature = -999C). ' +
        'Stuck sensor alert routes to the device management system for a diagnostic check.',
    },
  ],
};

export default challenge;
