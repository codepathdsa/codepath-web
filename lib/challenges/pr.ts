import { Challenge } from './types';

export const prChallenges: Challenge[] = [
  {
    id: 'ENG-PR-001',
    type: 'PR Review',
    badgeClass: 'badge-pr',
    title: 'React `useEffect` Infinite Loop',
    companies: ['Figma', 'Vercel'],
    timeEst: '~10 min',
    level: 'SDE I',
    status: 'Not Started',
    desc: 'A junior dev added a data fetch inside a React component. QA reports the browser tab completely freezes when loading the profile page. Spot the bug in the PR diff.',
    solution: 'The `useEffect` dependency array is missing, or an object/array is defined inside the render loop and passed to the dependency array, causing a new reference on every render, triggering an infinite fetch loop.'
  },
  {
    id: 'ENG-PR-002',
    type: 'PR Review',
    badgeClass: 'badge-pr',
    title: 'SQL Injection via Template Literals',
    companies: ['Airbnb', 'Shopify'],
    timeEst: '~10 min',
    level: 'SDE I',
    status: 'Not Started',
    desc: 'Security scan flagged this PR. The developer used Node.js string interpolation (`SELECT * FROM users WHERE email = ${req.body.email}`) instead of parameterized queries.',
    solution: 'Flag the string interpolation. An attacker can pass `"admin@sys.com" OR 1=1; DROP TABLE users;` to execute malicious SQL. Require parameterized queries (e.g., `WHERE email = $1`).'
  },
  {
    id: 'ENG-PR-003',
    type: 'PR Review',
    badgeClass: 'badge-pr',
    title: 'The ORM N+1 Query Problem',
    companies: ['Instagram', 'Gusto'],
    timeEst: '~15 min',
    level: 'SDE II',
    status: 'Not Started',
    desc: 'A PR added authors to the Blog Feed endpoint. It passed unit tests. But in production with 1,000 posts, it will make 1,001 database calls. Find the N+1 bug.',
    solution: 'The code iterates over `posts` and calls `post.getAuthor()` inside the loop. Flag it and suggest using `.select_related()` (Django) or `.includes()` (Rails/Prisma) to perform a SQL JOIN instead.'
  },
  {
    id: 'ENG-PR-004',
    type: 'PR Review',
    badgeClass: 'badge-pr',
    title: 'Goroutine Race Condition',
    companies: ['Uber', 'Twitch'],
    timeEst: '~20 min',
    level: 'SDE II',
    status: 'Not Started',
    desc: 'This Go PR processes payments concurrently using goroutines. However, the total order value sometimes computes incorrectly under load. Spot the concurrency bug.',
    solution: 'Multiple goroutines are incrementing a shared `total_sales` integer without a Mutex lock or atomic operation. Flag the race condition and suggest `sync.Mutex` or `atomic.AddInt64`.'
  },
  {
    id: 'ENG-PR-005',
    type: 'PR Review',
    badgeClass: 'badge-pr',
    title: 'Missing Database Transaction',
    companies: ['Square', 'Stripe'],
    timeEst: '~15 min',
    level: 'SDE II',
    status: 'Not Started',
    desc: 'A money transfer feature subtracts from Account A and adds to Account B. What happens if the server crashes exactly between those two lines of code?',
    solution: 'The two SQL updates are not wrapped in a `BEGIN TRANSACTION` and `COMMIT` block. If step 2 fails, money is permanently lost. Flag for missing ACID compliance.'
  },
  {
    id: 'ENG-PR-006',
    type: 'PR Review',
    badgeClass: 'badge-pr',
    title: 'Memory Leak in Node.js Event Listeners',
    companies: ['Discord', 'Netflix'],
    timeEst: '~25 min',
    level: 'SDE III',
    status: 'Not Started',
    desc: 'A Senior Engineer optimized WebSocket connections. But load testing shows RAM usage climbing steadily until the container OOM crashes. Find the leak.',
    solution: 'Inside the connection handler, `emitter.on("data", callback)` is called, but `emitter.off()` is never called when the socket closes. The listeners accumulate infinitely in memory.'
  },
  {
    id: 'ENG-PR-007',
    type: 'PR Review',
    badgeClass: 'badge-pr',
    title: 'Phantom Reads (Isolation Levels)',
    companies: ['Plaid', 'Coinbase'],
    timeEst: '~30 min',
    level: 'SDE III',
    status: 'Not Started',
    desc: 'A monthly audit script calculates user balances. Despite using DB transactions, the math sometimes includes transactions that were rolled back by other concurrent processes.',
    solution: 'The database transaction isolation level is left at default (Read Committed). For financial audits requiring range locks, it must be elevated to `REPEATABLE READ` or `SERIALIZABLE`.'
  },
  {
    id: 'ENG-PR-008',
    type: 'PR Review',
    badgeClass: 'badge-pr',
    title: 'Cache Stampede (Thundering Herd)',
    companies: ['Twitter', 'Reddit'],
    timeEst: '~20 min',
    level: 'SDE III',
    status: 'Not Started',
    desc: 'This PR caches the "Viral Tweets Feed" for 60 seconds. What happens at second 61 when the cache expires and 50,000 requests hit the server simultaneously?',
    solution: 'When the key expires, all 50k requests bypass the cache and hit the database at once, causing a crash. Suggest implementing a lock/mutex so only one thread recomputes the cache while others wait.'
  },
  {
    id: 'ENG-PR-009',
    type: 'PR Review',
    badgeClass: 'badge-pr',
    title: 'Floating Point Math for Currency',
    companies: ['Robinhood', 'Adyen'],
    timeEst: '~10 min',
    level: 'SDE I',
    status: 'Not Started',
    desc: 'A frontend PR calculates a 15% discount on a shopping cart using standard Javascript numbers (`price * 0.85`). Why will this upset accounting?',
    solution: 'Floating point arithmetic is imprecise (e.g., 0.1 + 0.2 = 0.30000000000000004). Flag it and require using integers (cents) or a specialized Decimal library for financial math.'
  },
  {
    id: 'ENG-PR-010',
    type: 'PR Review',
    badgeClass: 'badge-pr',
    title: 'Unpaginated API Response',
    companies: ['GitHub', 'Atlassian'],
    timeEst: '~10 min',
    level: 'SDE I',
    status: 'Not Started',
    desc: 'A new internal API returns `User.objects.all()`. It works perfectly in staging with 50 test users. Why will this take down production?',
    solution: 'Fetching millions of rows into memory will immediately crash the server. Require pagination (Limit/Offset or Cursor-based) before merging.'
  },

];
