/**
 * app/api/checkout/route.ts
 * Create a Stripe Checkout session for subscription upgrades.
 * Auth: Auth.js session (replaces Supabase auth)
 */
import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/config';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id || !session.user.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { priceId } = await req.json();

    // SECURITY: validate priceId against known allowed values.
    // Prevents an attacker from injecting arbitrary Stripe price IDs to
    // bypass pricing tiers or trigger unintended charges.
    const ALLOWED_PRICE_IDS = [
      process.env.STRIPE_PRICE_PRO,
      process.env.STRIPE_PRICE_LEGENDARY,
    ].filter(Boolean) as string[];

    if (!priceId || typeof priceId !== 'string' || !ALLOWED_PRICE_IDS.includes(priceId)) {
      return new NextResponse('Invalid price', { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      customer_email: session.user.email,
      metadata: { userId: session.user.id },
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch {
    return new NextResponse('Internal server error', { status: 500 });
  }
}
