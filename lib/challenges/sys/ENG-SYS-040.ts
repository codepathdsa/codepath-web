import type { Challenge } from '../types';

const challenge: Challenge = {
  id: 'ENG-SYS-040',
  type: 'System Design',
  badgeClass: 'badge-design',
  title: 'Design Amazon (E-Commerce Checkout)',
  companies: ['Amazon', 'Shopify', 'Walmart'],
  timeEst: '~55 min',
  level: 'Senior',
  status: 'Not Started',
  desc:
    'Design Amazon\'s checkout and order processing flow. A customer adds items to cart, ' +
    'proceeds to checkout, confirms the order, and payment is charged. ' +
    'The system must handle 100k orders/minute at peak (Black Friday), ' +
    'ensure inventory is not oversold, and process payments reliably even if services fail mid-flow.',
  solution:
    'A saga pattern coordinates the multi-step checkout: ' +
    'reserve inventory → charge payment → confirm order → trigger fulfillment. ' +
    'Each step has a compensating action (rollback): ' +
    'if payment fails → release inventory reservation. ' +
    'Inventory reservation uses Redis atomic DECR with a 15-minute TTL. ' +
    'Each order has an idempotency key to prevent duplicate charges.',

  simulation: {
    constraints: [
      { label: 'Peak orders/minute', value: '100,000' },
      { label: 'Inventory items', value: '1B SKUs' },
      { label: 'Payment provider SLA', value: '99.9% success rate' },
      { label: 'Double-charge tolerance', value: 'Zero' },
      { label: 'Checkout timeout', value: '30 seconds' },
    ],
    levels: [
      {
        traffic: 10000,
        targetLatency: 2000,
        successMsg: 'Order placement working — orders persisting with correct status transitions.',
        failMsg: '[FATAL] Checkout failing. Connect Checkout → Payment → Order Service.',
        failNode: 'api_server',
        failTooltip:
          'Order state machine: CART → PENDING → PAYMENT_PROCESSING → CONFIRMED → SHIPPED. ' +
          'Each step persists to Postgres. If any step fails, the order remains in the last known state.',
        checks: [
          { type: 'hasPath', source: 'client', target: 'api_server' },
          { type: 'hasEdge', source: 'api_server', target: 'postgres' },
        ],
      },
      {
        traffic: 50000,
        targetLatency: 1000,
        successMsg: 'Inventory reservation active — items held for 15 minutes during checkout.',
        failMsg:
          '[OVERSOLD] Multiple customers bought the last unit simultaneously. ' +
          'Add atomic inventory reservation (Redis DECR) before charging.',
        failNode: 'postgres',
        failTooltip:
          'Two-phase: ' +
          '1. Reserve: DECR inventory:{sku} (Redis atomic). If < 0, rollback and show "sold out". ' +
          '2. Charge: payment API call. If fails, INCR inventory to release. ' +
          '3. Confirm: write order to Postgres. ' +
          'Reservation expires in 15 min (TTL) if user abandons checkout.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'api_server', target: 'kafka' },
        ],
      },
      {
        traffic: 100000,
        targetLatency: 500,
        successMsg: 'SYSTEM STABLE — 100k orders/min, saga pattern handling failures gracefully.',
        failMsg:
          '[DOUBLE CHARGE] Payment API timeout caused a retry, and the customer was charged twice.',
        failNode: 'api_server',
        failTooltip:
          'Idempotency key: generate a unique key per checkout attempt. ' +
          'Pass to payment API as X-Idempotency-Key header. ' +
          'On retry, the payment provider returns the same result — no double charge. ' +
          'Stripe and Braintree support idempotency keys natively.',
        checks: [
          { type: 'hasEdge', source: 'api_server', target: 'redis' },
          { type: 'hasEdge', source: 'kafka', target: 'worker' },
        ],
      },
    ],
  },

  questions: [
    {
      q: 'What is the saga pattern and why is it used in distributed e-commerce transactions?',
      hint: 'Distributed transactions without a 2-phase commit.',
      answer:
        'A saga is a sequence of local transactions, each with a compensating transaction for rollback. ' +
        'E-commerce flow: reserve inventory → charge payment → confirm order → ship. ' +
        'If charging fails: run compensation = release inventory reservation. ' +
        'If shipment fails: run compensation = refund payment + release inventory. ' +
        'Sagas avoid distributed 2-phase commit (which is slow and fragile). ' +
        'Trade-off: eventual consistency — the system may be briefly inconsistent between steps.',
    },
    {
      q: 'How does Amazon handle the case where a customer\'s payment fails but inventory was already reserved?',
      hint: 'Compensating transaction.',
      answer:
        'The saga coordinator catches the payment failure and triggers the compensation: ' +
        'Release inventory: INCR inventory:{sku} in Redis. ' +
        'Update order status: PAYMENT_FAILED. ' +
        'Notify customer: send email/push "Payment failed, please update your payment method". ' +
        'A background job periodically sweeps for expired reservations (TTL exceeded) ' +
        'and releases them to prevent items from being permanently held.',
    },
    {
      q: 'How do you handle the order confirmation email? If the email service is down, should the order fail?',
      hint: 'Synchronous vs asynchronous side effects.',
      answer:
        'Decouple confirmation email from order confirmation. ' +
        'Order CONFIRMED state is set synchronously when payment succeeds. ' +
        'Email is a side effect: publish order_confirmed event to Kafka. ' +
        'Email service consumes the event and sends the email asynchronously. ' +
        'If the email service is down, the order is still confirmed. ' +
        'Email is retried when the service recovers (Kafka retains the event).',
    },
    {
      q: 'A user has items in their cart from 3 days ago. The price of one item changed. What do you show?',
      hint: 'Cart price vs checkout price.',
      answer:
        'Display the current price (not the cart-added price) in the cart UI. ' +
        'Show a price change indicator if the price changed since the item was added. ' +
        'At checkout, always charge the current price at time of order confirmation. ' +
        'Amazon shows "Price changed from $X to $Y since you added this to your cart." ' +
        'Never lock a price in the cart — it creates inventory-like reservation complexity.',
    },
    {
      q: 'How would you design the shopping cart for 100M users with carts that persist across sessions?',
      hint: 'Guest vs authenticated users.',
      answer:
        'Authenticated users: cart stored in Redis (HASH cart:{userId}: {sku: quantity}). ' +
        'TTL: 30 days. Persisted to Postgres on checkout for order history. ' +
        'Guest users: cart stored in browser localStorage with a guest_cart_id (UUID). ' +
        'On login: merge guest cart into user cart (take max quantity if same item). ' +
        'Cart reads are primarily Redis; Postgres is the durable backup.',
    },
  ],
};

export default challenge;
