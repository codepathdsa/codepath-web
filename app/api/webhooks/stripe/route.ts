/**
 * app/api/webhooks/stripe/route.ts
 * Handles Stripe webhook events and syncs subscription status to Supabase.
 *
 * Required env vars:
 *   STRIPE_WEBHOOK_SECRET  — from Stripe Dashboard > Webhooks
 *   SUPABASE_SERVICE_ROLE_KEY  — bypasses RLS for trusted server writes
 */
import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/config';
import { createClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';

// Service-role client bypasses RLS — safe only in trusted server contexts
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  return createClient(url, key);
}

const TIER_MAP: Record<string, 'pro' | 'legendary'> = {
  // Map your Stripe price IDs to tiers
  // These should be set in env vars or config; using placeholders here
  [process.env.STRIPE_PRICE_PRO ?? 'price_pro']:             'pro',
  [process.env.STRIPE_PRICE_LEGENDARY ?? 'price_legendary']: 'legendary',
};

async function syncSubscription(subscription: Stripe.Subscription, customerId: string) {
  const supabase = getAdminClient();

  // Find user by stripe_customer_id
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!profile) return;

  const priceId = subscription.items.data[0]?.price.id ?? '';
  const tier = TIER_MAP[priceId] ?? 'pro';
  const isActive = subscription.status === 'active' || subscription.status === 'trialing';

  await supabase.from('user_profiles').update({
    stripe_subscription_id: subscription.id,
    subscription_tier: isActive ? tier : 'free',
    is_premium: isActive,
    subscription_renews_at: isActive
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? new Date(((subscription as any).current_period_end as number) * 1000).toISOString()
      : null,
  }).eq('id', profile.id);

  // Send an in-app notification
  if (isActive) {
    await supabase.from('notifications').insert({
      user_id: profile.id,
      category: 'system',
      icon: '⚡',
      title: `You're now on the ${tier.charAt(0).toUpperCase() + tier.slice(1)} plan!`,
      body: 'All premium features are now unlocked. Welcome to the top tier.',
      action_url: '/dashboard',
    });
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

  const supabase = getAdminClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== 'subscription') break;

      // Save stripe_customer_id on first checkout
      if (session.customer && session.customer_email) {
        await supabase.from('user_profiles')
          .update({ stripe_customer_id: String(session.customer) })
          .eq('id', (session.metadata?.userId ?? ''));
      }

      // Retrieve and sync the full subscription
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
      await supabase.from('user_profiles')
        .update({
          subscription_tier: 'free',
          is_premium: false,
          stripe_subscription_id: null,
          subscription_renews_at: null,
        })
        .eq('stripe_customer_id', String(sub.customer));
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      // Find user and notify them
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('stripe_customer_id', String(invoice.customer))
        .single();

      if (profile) {
        await supabase.from('notifications').insert({
          user_id: profile.id,
          category: 'system',
          icon: '⚠️',
          title: 'Payment failed — update your billing info',
          body: 'Your subscription payment failed. Please update your payment method to keep your access.',
          action_url: '/settings?section=subscription',
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
