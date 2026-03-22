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
    
    // Authenticate as Admin
    try {
      if (!process.env.PB_ADMIN_EMAIL || !process.env.PB_ADMIN_PASSWORD) {
         throw new Error('PB_ADMIN_EMAIL or PB_ADMIN_PASSWORD is not set.');
      }
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL,
        process.env.PB_ADMIN_PASSWORD
      );
    } catch (e: any) {
      console.error('Failed to auth PB Admin in webhook:', e.message);
      return new NextResponse(`Admin Auth Error: ${e.message}`, { status: 500 });
    }

    console.log('Processing event type:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription' && session.client_reference_id) {
          try {
            const subscriptionId = session.subscription as string;
            console.log('Retrieving subscription details:', subscriptionId);
            const customerId = session.customer as string;
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            
            // Access the timestamp from either the top level or nested items
            const ts = (subscription as any).items?.data[0]?.current_period_end 
              || (subscription as any).current_period_end;
            
            const priceId = (subscription as any).items?.data[0]?.price?.id;

            // Format date for PB: YYYY-MM-DD HH:MM:SS
            const endDate = ts 
              ? new Date(ts * 1000).toISOString().replace('T', ' ').split('.')[0]
              : null;

            console.log(`Success! Updating user ${session.client_reference_id} with date ${endDate}`);

            await pb.collection('users').update(session.client_reference_id, {
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              stripe_price_id: priceId,
              stripe_current_period_end: endDate,
              plan: 'pro',
            });
          } catch (updateErr: any) {
            console.error('ERROR updating user record in PB:', updateErr.message);
            throw updateErr;
          }
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        try {
          const record = await pb.collection('users').getFirstListItem(`stripe_customer_id="${customerId}"`);
          
          if (event.type === 'customer.subscription.deleted' || subscription.status === 'canceled' || subscription.status === 'unpaid') {
            await pb.collection('users').update(record.id, {
              plan: 'free',
              stripe_subscription_id: '',
              stripe_price_id: '',
            });
          } else {
            const ts = (subscription as any).current_period_end 
              || (subscription as any).items?.data[0]?.current_period_end;
            const endDate = ts ? new Date(ts * 1000).toISOString().replace('T', ' ').split('.')[0] : null;

            await pb.collection('users').update(record.id, {
              stripe_subscription_id: subscription.id,
              stripe_price_id: (subscription as any).items.data[0].price.id,
              stripe_current_period_end: endDate,
              plan: 'pro',
            });
          }
        } catch (e: any) {
          console.error(`User not found or update failed for customerId: ${customerId}`, e.message);
        }
        break;
      }
      default:
        console.warn(`Unhandled event type: ${event.type}`);
    }

    return new NextResponse('Webhook processing successful', { status: 200 });
  } catch (error: any) {
    console.error('Webhook TOP-LEVEL Error:', error.message);
    return new NextResponse(`Internal Webhook Error: ${error.message}`, { status: 500 });
  }
}
