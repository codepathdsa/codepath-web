import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-053',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design a Cryptocurrency Exchange',
  companies: ['Coinbase', 'Binance', 'Kraken'],
  timeEst: '~60 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design the order matching engine for a cryptocurrency exchange. ' +
    'Users place buy/sell orders for BTC/USDT. ' +
    'The matching engine must process 100k orders/sec, match buyers with sellers at the best price, ' +
    'and execute trades atomically. The order book must be consistent — no double-fills.',
  solution:
    'An order book per trading pair: two sorted structures (bids sorted by price DESC, asks sorted by price ASC). ' +
    'When a new order arrives: match against the opposing side in price-time priority. ' +
    'The matching engine runs in a single-threaded event loop for consistency (no concurrent modification). ' +
    'Fill events are published to Kafka for account balance updates and trade history. ' +
    'Order book state is maintained in memory; persisted to a WAL for crash recovery.',

  simulation: {
    constraints: [
      { label: 'Orders/sec', value: '100,000' },
      { label: 'Active trading pairs', value: '500' },
      { label: 'Order book depth', value: '~1000 price levels per side' },
      { label: 'Match latency target', value: '< 1ms' },
      { label: 'Consistency requirement', value: 'No double-fills, exact accounting' },
    ],
    levels: [
      {
        traffic: 1000,
        targetLatency: 5,
        successMsg: 'Order matching working — buy and sell orders matching at correct prices.',
        failMsg: '[FATAL] Orders not matching. Implement order book with price-time priority.',
        failNode: 'api_server',
        failTooltip:
          'Order book: bids (buy orders) sorted by price DESC. Asks (sell orders) sorted by price ASC. ' +
          'Match: if best bid >= best ask, a trade occurs. ' +
          'Price-time priority: at same price, oldest order gets filled first.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
        ],
      },
      {
        traffic: 10000,
        targetLatency: 1,
        successMsg: 'Single-threaded matching engine achieving 10k orders/sec with zero race conditions.',
        failMsg:
          '[DOUBLE FILL] Two orders matched against the same counterparty simultaneously. ' +
          'The matching engine must be single-threaded to prevent concurrent modifications.',
        failNode: 'redis',
        failTooltip:
          'A concurrent matching engine would require locks on every price level. ' +
          'A single-threaded event loop is simpler and faster: process orders sequentially. ' +
          'At 100k orders/sec, a single core can handle the matching (modern CPUs process billions of ops/sec).',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 1,
        successMsg: 'SYSTEM STABLE — 100k orders/sec, full fills and partial fills handled.',
        failMsg:
          '[CRASH RECOVERY] Matching engine crashed — in-memory order book is lost. ' +
          'Add a Write-Ahead Log (WAL) to persist every order before processing.',
        failNode: 'api_server',
        failTooltip:
          'WAL: append every incoming order to a durable log before adding to the order book. ' +
          'On crash: replay the WAL to reconstruct the order book state. ' +
          'Kafka doubles as a WAL: orders are durably written to Kafka before the matching engine processes them.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
          { type: 'hasEdge', source: 'kafka', target: 'worker' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'What is price-time priority in an order book?',
      hint: 'How do you decide which order gets filled when multiple orders are at the same price?',
      answer:
        'Price priority: orders at better prices are matched first. ' +
        'A bid at $50,000 fills before a bid at $49,999. ' +
        'Time priority (FIFO): at the same price, the order placed earliest gets filled first. ' +
        'This rewards traders who commit early and prevents gaming. ' +
        'Pro-rata matching (alternative): at the same price, orders are filled proportionally by size. ' +
        'Used by some futures markets. Most spot exchanges use price-time (FIFO).',
    },
    {
      q: 'How do you handle a partial fill? A buy order for 1 BTC is partially filled for 0.3 BTC.',
      hint: 'Order state machine.',
      answer:
        'Order states: NEW → PARTIALLY_FILLED → FILLED (or CANCELLED). ' +
        'On a partial fill: ' +
        '(1) Create a trade record (0.3 BTC filled at $49,500). ' +
        '(2) Update the order\'s filled_quantity += 0.3, status = PARTIALLY_FILLED. ' +
        '(3) The remaining 0.7 BTC stays in the order book, waiting for more matching sell orders. ' +
        'The user\'s account is updated with 0.3 BTC immediately — ' +
        'no need to wait for the full fill.',
    },
    {
      q: 'How do you update account balances atomically when a trade occurs?',
      hint: 'Two accounts change simultaneously.',
      answer:
        'Trade: Alice sells 1 BTC to Bob for $50,000. ' +
        'Alice\'s BTC decreases by 1, USDT increases by $50,000. ' +
        'Bob\'s USDT decreases by $50,000, BTC increases by 1. ' +
        'This is a double-entry transaction — must be atomic. ' +
        'Post-fill Kafka event: the account service consumes trade events and updates balances in a DB transaction. ' +
        'Funds are pre-reserved (locked) when an order is placed — released only on cancel or fill.',
    },
    {
      q: 'How do you prevent a user from placing an order they can\'t afford (insufficient balance)?',
      hint: 'Pre-trade validation and balance locking.',
      answer:
        'On order placement: check available_balance >= order_value. ' +
        'If yes: lock the funds (available_balance -= order_value, locked_balance += order_value). ' +
        'The order is submitted to the matching engine. ' +
        'On fill: transfer locked funds to counterparty (locked_balance -= fill_value). ' +
        'On cancel: release locked funds back to available. ' +
        'The lock prevents the same funds from being used in two simultaneous orders.',
    },
    {
      q: 'How would you design a circuit breaker for market halt during extreme volatility?',
      hint: 'Automated trading pauses.',
      answer:
        'A circuit breaker monitors the last N trades. ' +
        'If price moves more than X% in Y seconds, halt trading for that pair. ' +
        'Example: BTC price drops 10% in 60 seconds → trading paused for 15 minutes. ' +
        'During the halt: cancel orders are accepted, but no new orders. ' +
        'On resume: a 5-minute "call auction" collects orders before continuous trading resumes. ' +
        'Stock markets have had automated circuit breakers since the 1987 crash.',
    },
  ],
};

export default challenge;
