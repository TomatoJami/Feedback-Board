import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

import { logger } from '@/lib/logger';
import { POCKETBASE_URL } from '@/lib/pocketbase';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { priceId } = await req.json();

    // Verify authentication
    const pb = new PocketBase(POCKETBASE_URL);
    const authHeader = req.headers.get('Authorization');
    const cookieStore = await cookies();
    const pbAuthCookie = cookieStore.get('pb_auth');
    
    try {
      if (authHeader) {
        pb.authStore.save(authHeader, null);
      } else if (pbAuthCookie) {
        pb.authStore.loadFromCookie(pbAuthCookie.value);
      }

      if (!pb.authStore.isValid) {
        return new NextResponse('Unauthorized (Invalid Token)', { status: 401 });
      }

      // Refresh to get the latest user model and verify token with PB
      await pb.collection('users').authRefresh();
      
      if (!pb.authStore.model) {
        return new NextResponse('Unauthorized (No Model)', { status: 401 });
      }
    } catch (err: unknown) {
      logger.error('Auth Verification Error:', err);
      return new NextResponse('Unauthorized (Verification Failed)', { status: 401 });
    }

    const user = pb.authStore.model;

    // Check if user already has a Stripe customer ID
    // We fetch a fresh user record because authStore might be stale
    const freshUser = await pb.collection('users').getOne(user.id, { requestKey: null });
    
    let stripeCustomerId = freshUser.stripe_customer_id;

    if (!stripeCustomerId) {
      // Create a new customer in Stripe if we don't have one
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          pocketbase_user_id: user.id
        }
      });
      stripeCustomerId = customer.id;
      
      // Note: We don't update PB here yet. The webhook will handle mapping.
      // But ideally we'd use Admin privileges to save stripeCustomerId to PB right now.
      // Let's rely on webhook or just pass client_reference_id.
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      customer: stripeCustomerId || undefined,
      customer_email: stripeCustomerId ? undefined : user.email,
      client_reference_id: user.id, // Very important for webhooks!
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL}/auth/settings?success=true`,
      cancel_url: `${req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL}/auth/settings?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    logger.error('Stripe Checkout Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
