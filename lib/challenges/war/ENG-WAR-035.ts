import type { Challenge } from '../types';

// ─── ENG-WAR-035 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-035',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Webhook Delivery Failure (Event Ordering)',
          companies: ['Stripe', 'Shopify'],
            timeEst: '~25 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `Stripe's webhook system delivers events asynchronously and explicitly warns that events may be delivered out of order. A payment.succeeded event might arrive before payment.created at the receiving end. Shopify webhooks have similar behavior. Customer checkout systems that assume strict ordering (update order status only on payment.succeeded, expecting payment.created to have already run) break when events arrive out of sequence.`,
                    desc: `Your order management system processes Stripe webhooks. Orders are getting stuck in a "pending payment" state even after customers are successfully charged. Logs show: payment.succeeded webhook processed at 14:00:02, but payment.created webhook processed at 14:00:05 (3 seconds later). Your handler for payment.succeeded tries to update order status, but fails because the order doesn't exist yet — payment.created hadn't been processed yet.`,
                      solution: `Never assume webhook delivery order. For each incoming webhook event, the handler should be idempotent and resilient to out-of-order delivery: (1) when payment.succeeded arrives and the order doesn't exist yet, queue the event for retry. (2) When payment.created arrives, process it and also check if there's a queued payment.succeeded — if so, process it now. Or: make your webhook handler upsert the order from any event, carrying all relevant state.`,
                        explanation: `Webhook ordering guarantees: most webhook systems (Stripe, GitHub, Shopify) explicitly state "we don't guarantee ordering." Design for this: (1) Idempotency: processing the same event twice should be safe (use event IDs to deduplicate). (2) Out-of-order resilience: design handlers to upsert state rather than requiring specific prior state. (3) Retry queues: when an event's dependencies aren't met yet, re-queue with a delay. Stripe's recommendation: look up the object from the API on each webhook rather than trusting only the event payload.`,
                          options: [
                            { label: 'A', title: 'Add a 5-second delay before processing all webhooks to allow ordering', sub: 'Queue all webhooks with a 5-second delay before processing', isCorrect: false },
                            { label: 'B', title: 'Design idempotent handlers with retry queues for out-of-order events', sub: 'Upsert order state on any event; queue for retry if dependencies missing', isCorrect: true },
                            { label: 'C', title: 'Subscribe to all Stripe webhook events and sort by created timestamp before processing', sub: 'Buffer events for 30s, sort by event.created, then process in order', isCorrect: false },
                            { label: 'D', title: 'Switch from webhooks to polling the Stripe API every 10 seconds', sub: 'Cron: poll stripe.charges.list() every 10s', isCorrect: false },
                          ]
};

export default challenge;
