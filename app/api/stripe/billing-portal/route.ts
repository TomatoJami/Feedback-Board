import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

import { logger } from '@/lib/logger';
import { POCKETBASE_URL } from '@/lib/pocketbase';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
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

      await pb.collection('users').authRefresh();
      
      if (!pb.authStore.model) {
        return new NextResponse('Unauthorized (No Model)', { status: 401 });
      }
    } catch (err: unknown) {
      logger.error('Portal Auth Error:', err);
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = pb.authStore.model;

    // Fetch a fresh user record
    const freshUser = await pb.collection('users').getOne(user.id, { requestKey: null });
    
    const stripeCustomerId = freshUser.stripe_customer_id;

    if (!stripeCustomerId) {
       return new NextResponse('User has no Stripe Customer ID. Cannot open Billing Portal.', { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL}/auth/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    logger.error('Stripe Billing Portal Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
