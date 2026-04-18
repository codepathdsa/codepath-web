import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-060',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design an Online Auction System',
  companies: ['eBay', 'Christie\'s', 'Sotheby\'s'],
  timeEst: '~50 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design an online auction platform like eBay. ' +
    'Auctions have a fixed end time. Users place bids; the highest bid wins when time expires. ' +
    'Support proxy bidding (autobid up to a max), ' +
    'sniper protection (auction extends 5 min if bid in final 5 min), ' +
    'and 10,000 concurrent auctions each with up to 1,000 active bidders.',
  solution:
    'Each auction stores: current_price, minimum_increment, end_time, highest_bidder_id. ' +
    'Bid: validate bid > current_price + increment; use optimistic locking (version field) to prevent race conditions. ' +
    'Proxy bidding: store the user\'s max_bid privately; autobid server outbids competitors up to max. ' +
    'Sniper protection: if bid received with < 5 min remaining, extend end_time by 5 min. ' +
    'Auction expiry: a scheduler checks for auctions past end_time and triggers settlement.',

  simulation: {
    constraints: [
      { label: 'Concurrent auctions', value: '10,000' },
      { label: 'Bidders per auction', value: 'Up to 1,000' },
      { label: 'Bid rate', value: '50,000 bids/sec total' },
      { label: 'Bid latency target', value: '< 200ms (confirm/reject)' },
      { label: 'Auction end accuracy', value: '< 1 sec precision' },
    ],
    levels: [
      {
        traffic: 1000,
        targetLatency: 200,
        successMsg: 'Bid placement working — bids being accepted and current price updating.',
        failMsg: '[FATAL] Bid placement not working. Add auction state and bid validation.',
        failNode: 'api_server',
        failTooltip:
          'Bid table: bids(id, auction_id, user_id, amount, created_at). ' +
          'Auction table: auctions(id, current_price, highest_bidder_id, end_time, version). ' +
          'Bid validation: amount > current_price + minimum_increment AND NOW() < end_time.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
        ],
      },
      {
        traffic: 10000,
        targetLatency: 100,
        successMsg: 'Optimistic locking preventing race conditions — no lost bids under concurrent load.',
        failMsg:
          '[RACE CONDITION] Two users bid simultaneously — both read current_price=$100, ' +
          'both see their bid of $105 as valid, but only one should win the race.',
        failNode: 'postgres',
        failTooltip:
          'Optimistic locking: ' +
          'SELECT current_price, version FROM auctions WHERE id=? -- version=42 ' +
          'Validate: new_bid > current_price + increment ' +
          'UPDATE auctions SET current_price=?, highest_bidder_id=?, version=version+1 ' +
          'WHERE id=? AND version=42 -- fails if someone else bid first ' +
          'Rows affected = 0? → bid was outbid. Retry with fresh price.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
      {
        traffic: 50000,
        targetLatency: 50,
        successMsg: 'SYSTEM STABLE — proxy bidding, sniper protection, and real-time bid updates all working.',
        failMsg:
          '[THUNDERING HERD] 1,000 users watching the same auction flooding the system in the final 30 seconds.',
        failNode: 'api_server',
        failTooltip:
          'Hot auction optimization: ' +
          'Cache current state in Redis: HSET auction:{id} current_price highest_bidder end_time version. ' +
          'Bid attempt: Lua script atomically validates and updates Redis. ' +
          'On Redis update: publish bid event to channel auction:{id}. ' +
          'WebSocket subscribers receive real-time bid updates without polling. ' +
          'Persist to Postgres asynchronously via Kafka consumer.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'How does proxy (autobid) bidding work?',
      hint: 'User sets a secret maximum; the system bids on their behalf.',
      answer:
        'Proxy bid: user sets max_bid = $500, but current price is $120. ' +
        'The system records the max bid privately and places the minimum competitive bid: $125. ' +
        'If another user bids $150: the system autobids $155 (min increment above $150). ' +
        'If a user bids $600 > proxy\'s $500: proxy is outbid. ' +
        'User notification: "You have been outbid." ' +
        'The max_bid is never shown publicly — only the current minimum competitive price. ' +
        'This is eBay\'s core bidding mechanism.',
    },
    {
      q: 'A user places a bid 10 seconds before auction end. How does sniper protection work?',
      hint: 'Extending the deadline.',
      answer:
        'Sniper protection rule: if a valid bid is placed within the last 5 minutes, extend end_time by 5 minutes. ' +
        'UPDATE auctions SET end_time = end_time + INTERVAL 5 minutes WHERE id=? AND end_time - NOW() < 5 minutes. ' +
        'This gives other bidders time to respond, preventing last-second sniping. ' +
        'The extension can happen multiple times: each late bid resets the 5-minute clock. ' +
        'Maximum extension: cap at some limit (e.g., 30 total extensions). ' +
        'Notify all watchers: "Auction extended to [new end time]" via WebSocket push.',
    },
    {
      q: 'How do you handle the auction settlement — determining the winner and charging payment?',
      hint: 'Timer expiry, winner notification, and payment.',
      answer:
        'Settlement flow: ' +
        '(1) Scheduler detects auctions where end_time < NOW() and status = ACTIVE. ' +
        '(2) Atomically: UPDATE auctions SET status=\'ENDED\' WHERE id=? AND status=\'ACTIVE\'. ' +
        '(3) Winner = highest_bidder_id. Winning price = current_price. ' +
        '(4) Charge winner\'s saved payment method. ' +
        '(5) On payment success: notify winner and seller, generate invoice. ' +
        '(6) On payment failure: offer to next-highest bidder (second-chance offer). ' +
        'Reserve price: if current_price < reserve_price, auction ends with no sale.',
    },
    {
      q: 'How do you prevent bid shielding — a fraudulent tactic where a bidder with a high proxy bid gets their shill bidder to drive up the price?',
      hint: 'Bid history analysis and account trust scoring.',
      answer:
        'Bid shielding: Attacker places a high proxy bid ($1000) to shield a legitimate high bid. ' +
        'Just before end, their shill retracts (if allowed), leaving the attacker\'s proxy exposed. ' +
        'Defenses: ' +
        '(1) Disallow bid retractions within 12 hours of auction end. ' +
        '(2) Detect shill patterns: account pairs that repeatedly bid together. ' +
        '(3) Require identity verification for high-value auctions. ' +
        '(4) Rate-limit late retractions per account. ' +
        'eBay\'s Trust and Safety team uses ML models to detect coordinated shill bidding.',
    },
  ],
};

export default challenge;
