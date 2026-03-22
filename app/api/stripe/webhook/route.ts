import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import PocketBase from 'pocketbase';
import { POCKETBASE_URL } from '@/lib/pocketbase';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
      console.error('Webhook error: Missing signature or secret');
      return new NextResponse('Webhook Error: Missing signature or secret', { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const pb = new PocketBase(POCKETBASE_URL);
    
    // Authenticate as Admin to update user records safely
    try {
      if (!process.env.PB_ADMIN_EMAIL || !process.env.PB_ADMIN_PASSWORD) {
         console.error('PB_ADMIN_EMAIL or PB_ADMIN_PASSWORD is not set. Webhook cannot update user records.');
         return new NextResponse('Admin credentials not configured', { status: 500 });
      }
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL,
        process.env.PB_ADMIN_PASSWORD
      );
    } catch (e) {
      console.error('Failed to auth PB Admin in webhook', e);
      return new NextResponse('PB Error', { status: 500 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode === 'subscription' && session.client_reference_id) {
          const subscriptionId = session.subscription as string;
          const customerId = session.customer as string;
          
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0].price.id;

          // You might have a map of Price IDs to Plan names (e.g. 'pro', 'business')
          // Let's assume you store the plan type in Stripe price metadata
          // or just fallback to 'pro' for now.
          const planType = (subscription.items.data[0].price.lookup_key || 'pro') as 'pro';

          await pb.collection('users').update(session.client_reference_id, {
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: priceId,
            stripe_current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            plan: planType,
          });
          console.log(`Updated user ${session.client_reference_id} to ${planType} plan.`);
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        // Find user by customerId
        try {
          const record = await pb.collection('users').getFirstListItem(`stripe_customer_id="${customerId}"`);
          const priceId = subscription.items.data[0].price.id;
          const planType = (subscription.items.data[0].price.lookup_key || 'pro') as 'pro';

          if (subscription.status === 'active' || subscription.status === 'trialing') {
            await pb.collection('users').update(record.id, {
              stripe_subscription_id: subscription.id,
              stripe_price_id: priceId,
              stripe_current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
              plan: planType,
            });
          } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            await pb.collection('users').update(record.id, {
              plan: 'free',
            });
          }
        } catch (e) {
          console.error(`User not found for customerId: ${customerId}`);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        try {
          const record = await pb.collection('users').getFirstListItem(`stripe_customer_id="${customerId}"`);
          await pb.collection('users').update(record.id, {
            plan: 'free',
            stripe_subscription_id: '',
            stripe_price_id: '',
          });
        } catch (e) {
          console.error(`User not found for customerId: ${customerId}`);
        }
        break;
      }
      default:
        console.warn(`Unhandled event type: ${event.type}`);
    }

    return new NextResponse('Webhook processing successful', { status: 200 });
  } catch (error: any) {
    console.error('Webhook Top-level Error:', error);
    return new NextResponse('Internal Webhook Error', { status: 500 });
  }
}
