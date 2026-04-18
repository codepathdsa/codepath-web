/**
 * app/api/webhooks/stripe/route.ts
 * Handles Stripe webhook events and syncs subscription status to Neon Postgres.
 *
 * Required env vars:
 *   STRIPE_WEBHOOK_SECRET  — from Stripe Dashboard > Webhooks
 *   DATABASE_URL           — Neon Postgres connection string
 */
import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/config';
import { sql } from '@/lib/db';
import type Stripe from 'stripe';

const TIER_MAP: Record<string, 'pro' | 'legendary'> = {
  [process.env.STRIPE_PRICE_PRO ?? 'price_pro']:             'pro',
  [process.env.STRIPE_PRICE_LEGENDARY ?? 'price_legendary']: 'legendary',
};

async function syncSubscription(subscription: Stripe.Subscription, customerId: string) {
  // Find user by stripe_customer_id
  const rows = await sql`
    SELECT id FROM user_profiles
    WHERE stripe_customer_id = ${customerId}
    LIMIT 1
  `;
  const profile = rows[0];
  if (!profile) return;

  const priceId = subscription.items.data[0]?.price.id ?? '';
  const tier = TIER_MAP[priceId] ?? 'pro';
  const isActive = subscription.status === 'active' || subscription.status === 'trialing';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renewsAt = isActive ? new Date(((subscription as any).current_period_end as number) * 1000).toISOString() : null;

  await sql`
    UPDATE user_profiles SET
      stripe_subscription_id  = ${subscription.id},
      subscription_tier       = ${isActive ? tier : 'free'},
      is_premium              = ${isActive},
      subscription_renews_at  = ${renewsAt}
    WHERE id = ${profile.id}
  `;

  if (isActive) {
    await sql`
      INSERT INTO notifications (user_id, category, icon, title, body, action_url)
      VALUES (
        ${profile.id}, 'system', '⚡',
        ${`You're now on the ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan!`},
        'All premium features are now unlocked. Welcome to the top tier.',
        '/dashboard'
      )
    `;
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return new NextResponse('Missing stripe-signature or webhook secret', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new NextResponse(`Webhook signature verification failed: ${message}`, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== 'subscription') break;

      // Save stripe_customer_id on first checkout
      if (session.customer && session.metadata?.userId) {
        await sql`
          UPDATE user_profiles
          SET stripe_customer_id = ${String(session.customer)}
          WHERE id = ${session.metadata.userId}
        `;
      }

      if (session.subscription) {
        const sub = await stripe.subscriptions.retrieve(String(session.subscription));
        await syncSubscription(sub, String(session.customer));
      }
      break;
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const sub = event.data.object as Stripe.Subscription;
      await syncSubscription(sub, String(sub.customer));
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await sql`
        UPDATE user_profiles SET
          subscription_tier       = 'free',
          is_premium              = false,
          stripe_subscription_id  = NULL,
          subscription_renews_at  = NULL
        WHERE stripe_customer_id  = ${String(sub.customer)}
      `;
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const rows = await sql`
        SELECT id FROM user_profiles
        WHERE stripe_customer_id = ${String(invoice.customer)}
        LIMIT 1
      `;
      const profile = rows[0];
      if (profile) {
        await sql`
          INSERT INTO notifications (user_id, category, icon, title, body, action_url)
          VALUES (
            ${profile.id}, 'system', '⚠️',
            'Payment failed — update your billing info',
            'Your subscription payment failed. Please update your payment method to keep your access.',
            '/settings?section=subscription'
          )
        `;
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
