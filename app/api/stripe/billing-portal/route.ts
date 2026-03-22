import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import PocketBase from 'pocketbase';
import { POCKETBASE_URL } from '@/lib/pocketbase';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const pb = new PocketBase(POCKETBASE_URL);
    const cookieStore = await cookies();
    const pbAuthCookie = cookieStore.get('pb_auth');
    
    if (pbAuthCookie) {
      pb.authStore.loadFromCookie(pbAuthCookie.value);
    }
    
    if (!pb.authStore.isValid || !pb.authStore.model) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = pb.authStore.model;

    // Fetch a fresh user record
    const freshUser = await pb.collection('users').getOne(user.id, { requestKey: null });
    
    let stripeCustomerId = freshUser.stripe_customer_id;

    if (!stripeCustomerId) {
       return new NextResponse('User has no Stripe Customer ID. Cannot open Billing Portal.', { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL}/auth/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Billing Portal Error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
