import { Challenge } from './types';

export const sysChallenges: Challenge[] = [
  {
    id: 'ENG-SYS-001',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design a URL Shortener (Bitly)',
    companies: ['Bitly', 'Google'],
    timeEst: '~45 min',
    level: 'SDE II',
    status: 'Not Started',
    desc: 'Design a system that takes long URLs and generates 7-character short links. It must handle 10,000 Read RPS and 100 Write RPS, and survive datacenter failures.',
    solution: 'Use a base62 encoder on an auto-incrementing ID. Store data in a NoSQL DB (DynamoDB/Cassandra) for easy scaling. Add a Redis cache layer in front of the DB to handle the heavy read-heavy 10k RPS load.'
  },
  {
    id: 'ENG-SYS-002',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design a Ticketmaster Waiting Room',
    companies: ['Ticketmaster', 'LiveNation'],
    timeEst: '~60 min',
    level: 'SDE III',
    status: 'Not Started',
    desc: 'Taylor Swift tickets drop at noon. 5 million users will hit the buy button at the exact same second for 50,000 tickets. If you write directly to the DB, it will melt.',
    solution: 'Implement an asynchronous Queue-based architecture (Kafka/SQS). Users hit an API gateway that drops a token into SQS and returns a "Waiting" UI. A group of worker nodes consumes the queue at a rate the DB can handle.'
  },
  {
    id: 'ENG-SYS-003',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design an Autocomplete Typeahead',
    companies: ['Google', 'Amazon'],
    timeEst: '~45 min',
    level: 'SDE II',
    status: 'Not Started',
    desc: 'As a user types "S-A-M", suggest the top 5 most popular search terms. Must return results in < 50ms.',
    solution: 'Store the dictionary in a Trie data structure. Cache the Trie in RAM on multiple distributed edge servers. Aggregate historical search frequency via Hadoop/Spark offline, and update the Trie node weights daily.'
  },
  {
    id: 'ENG-SYS-004',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design a Live Viewership Counter',
    companies: ['Twitch', 'YouTube'],
    timeEst: '~45 min',
    level: 'SDE III',
    status: 'Not Started',
    desc: 'A livestream has 2 million concurrent viewers. Users join and leave constantly. Show an accurate viewer count on the screen updating every 2 seconds.',
    solution: 'Do not update a database on every join/leave. Have clients send heartbeat pings every 5 seconds to distributed aggregation servers. These servers batch the counts in memory and send a single aggregate integer to Redis every second.'
  },
  {
    id: 'ENG-SYS-005',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design a Global Chat App (WhatsApp)',
    companies: ['Meta', 'Discord'],
    timeEst: '~60 min',
    level: 'SDE III',
    status: 'Not Started',
    desc: 'Design 1-on-1 messaging for 1 Billion users. Messages must be delivered in real-time, and read receipts must be supported.',
    solution: 'Clients maintain persistent WebSockets to a Gateway cluster. The Gateway maps UserID -> ServerID in Redis. When User A messages User B, the backend looks up B\'s active server in Redis and pushes the message over B\'s open socket.'
  },
  {
    id: 'ENG-SYS-006',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design a Payment Gateway (Stripe)',
    companies: ['Stripe', 'Square'],
    timeEst: '~60 min',
    level: 'Staff',
    status: 'Not Started',
    desc: 'Architect a B2B payment API. It must strictly guarantee 100% data consistency, no dropped payments, and absolute protection against double-charging due to network retries.',
    solution: 'Use a relational database (PostgreSQL) for ACID compliance. Enforce Idempotency Keys on all API endpoints so if a client retries a timeout, the DB rejects the duplicate. Implement a 2-Phase Commit or Saga pattern for distributed transactions.'
  },
  {
    id: 'ENG-SYS-007',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design a Web Crawler',
    companies: ['Google', 'OpenAI'],
    timeEst: '~60 min',
    level: 'SDE III',
    status: 'Not Started',
    desc: 'Crawl 1 billion web pages a month to train an LLM. Avoid crawling the same page twice, respect robots.txt, and avoid getting blocked by DDoS protection.',
    solution: 'Seed URLs into a Kafka queue. Worker nodes pull URLs, resolve DNS (cached), fetch HTML, and extract links. Use a Bloom Filter to quickly check if a URL has already been visited (saves DB lookups). Hash the domain to ensure rate-limiting per domain.'
  },
  {
    id: 'ENG-SYS-008',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design a Proximity Service (Yelp)',
    companies: ['Yelp', 'Tinder'],
    timeEst: '~45 min',
    level: 'SDE II',
    status: 'Not Started',
    desc: 'Users open the app and need to see the 10 closest restaurants within a 5-mile radius. There are 50 million restaurants in the database.',
    solution: 'Standard SQL `WHERE lat > X and lon > Y` is too slow. Use Geohashing or S2 Geometry to convert 2D coordinates into a 1D string. Store the strings in Redis or Postgres with a B-Tree index for ultra-fast prefix matching.'
  },
  {
    id: 'ENG-SYS-009',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Design a Notification System',
    companies: ['Apple', 'Netflix'],
    timeEst: '~45 min',
    level: 'SDE II',
    status: 'Not Started',
    desc: 'Send out 10 million Push Notifications for a breaking news event within 1 minute. Handle user opt-outs and failed deliveries.',
    solution: 'API drops the "Send" event into a message broker (RabbitMQ). Hundreds of worker nodes consume the queue in parallel, check the DB for user preferences, format the payload, and interface asynchronously with APNS (Apple) and FCM (Google).'
  },
  {
    id: 'ENG-SYS-010',
    type: 'System Design',
    badgeClass: 'badge-design',
    title: 'Multi-Region Active-Active DB Replication',
    companies: ['Netflix', 'Uber'],
    timeEst: '~60 min',
    level: 'Staff',
    status: 'Not Started',
    desc: 'A streaming service needs users in New York and Tokyo to both have <50ms read/write latency. If the Tokyo datacenter burns down, New York must take over with zero data loss.',
    solution: 'Implement an Active-Active globally distributed database (like Spanner, CockroachDB, or Cassandra). Use Quorum consensus (e.g., Paxos/Raft) for writes. Handle conflict resolution using Vector Clocks or Last-Write-Wins (LWW) timestamps.'
  },

];
