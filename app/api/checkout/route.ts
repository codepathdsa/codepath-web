import { NextResponse } from 'next/server';
import { stripe } from '@/utils/stripe/config';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      customer_email: user.email,
      metadata: { userId: user.id },
      line_items: [
        {
          price: priceId, // The exact ID of the exact tier in the Stripe Dashboard
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch {
    // Do not expose internal error details to the client
    return new NextResponse('Internal server error', { status: 500 });
  }
}
