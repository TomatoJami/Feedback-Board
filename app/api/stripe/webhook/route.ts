import { NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import Stripe from 'stripe';

import { logger } from '@/lib/logger';
import { POCKETBASE_URL } from '@/lib/pocketbase';
import { stripe } from '@/lib/stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
      logger.error('Webhook error: Missing signature or secret');
      return new NextResponse('Webhook Error: Missing signature or secret', { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
      const error = err as Error;
      logger.error(`Webhook signature verification failed: ${error.message}`);
      return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
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
    } catch (e: unknown) {
      const error = e as Error;
      logger.error('Failed to auth PB Admin in webhook:', error.message);
      return new NextResponse(`Admin Auth Error: ${error.message}`, { status: 500 });
    }

    logger.info(`Processing event type: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription' && session.client_reference_id) {
          try {
            const subscriptionId = session.subscription as string;
            logger.info(`Retrieving subscription details: ${subscriptionId}`);
            const customerId = session.customer as string;
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            // Access the timestamp from either the top level or nested items
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const subExtended = subscription as any;
            const ts = subExtended.current_period_end;
            
            const priceId = subExtended.items.data[0]?.price?.id;

            // Format date for PB: YYYY-MM-DD HH:MM:SS
            const endDate = ts 
              ? new Date(ts * 1000).toISOString().replace('T', ' ').split('.')[0]
              : null;
            
            logger.info(`Success! Updating user ${session.client_reference_id} with date ${endDate}`);
            
            await pb.collection('users').update(session.client_reference_id, {
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              stripe_price_id: priceId,
              stripe_current_period_end: endDate,
              plan: 'pro',
            });
          } catch (updateErr: unknown) {
            const error = updateErr as Error;
            logger.error(`ERROR updating user record in PB: ${error.message}`);
            throw error;
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const subExtended = subscription as any;
            const ts = subExtended.current_period_end;
            const endDate = ts ? new Date(ts * 1000).toISOString().replace('T', ' ').split('.')[0] : null;

            await pb.collection('users').update(record.id, {
              stripe_subscription_id: subscription.id,
              stripe_price_id: subExtended.items.data[0].price.id,
              stripe_current_period_end: endDate,
              plan: 'pro',
            });
          }
        } catch (e: unknown) {
          const error = e as Error;
          logger.error(`User not found or update failed for customerId: ${customerId} - ${error.message}`);
        }
        break;
      }
      default:
        logger.warn(`Unhandled event type: ${event.type}`);
    }

    return new NextResponse('Webhook processing successful', { status: 200 });
  } catch (error: unknown) {
    const err = error as Error;
    logger.error(`Webhook TOP-LEVEL Error: ${err.message}`);
    return new NextResponse(`Internal Webhook Error: ${err.message}`, { status: 500 });
  }
}
