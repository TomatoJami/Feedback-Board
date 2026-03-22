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
         throw new Error('PB_ADMIN_EMAIL or PB_ADMIN_PASSWORD is not set in environment variables.');
      }
      
      console.log('Attempting PB Admin login...');
      await pb.admins.authWithPassword(
        process.env.PB_ADMIN_EMAIL,
        process.env.PB_ADMIN_PASSWORD
      );
      console.log('PB Admin login successful.');
    } catch (e: any) {
      console.error('CRITICAL: Failed to auth PB Admin in webhook:', e.message);
      return new NextResponse(`Admin Auth Error: ${e.message}`, { status: 500 });
    }

    console.log('Processing event type:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);
        console.log('Client Reference ID (User ID):', session.client_reference_id);

        if (session.mode === 'subscription' && session.client_reference_id) {
          try {
            const subscriptionId = session.subscription as string;
            const customerId = session.customer as string;
            
            console.log('Retrieving subscription details:', subscriptionId);
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const priceId = subscription.items.data[0].price.id;

            const planType = 'pro'; // Default to pro for now

            console.log(`Updating user ${session.client_reference_id} to ${planType} plan...`);
            
            await pb.collection('users').update(session.client_reference_id, {
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              stripe_price_id: priceId,
              stripe_current_period_end: (subscription as any).current_period_end 
                ? new Date((subscription as any).current_period_end * 1000).toISOString() 
                : null,
              plan: planType,
            });
            
            console.log(`SUCCESS: Updated user ${session.client_reference_id} to ${planType} plan.`);
          } catch (updateErr: any) {
            console.error('ERROR updating user record in PB:', updateErr.message);
            throw updateErr;
          }
        } else {
          console.warn('Session mode is not subscription or missing client_reference_id');
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        console.log('Subscription updated for customer:', customerId);

        try {
          const record = await pb.collection('users').getFirstListItem(`stripe_customer_id="${customerId}"`);
          const priceId = subscription.items.data[0].price.id;
          const planType = 'pro';

          if (subscription.status === 'active' || subscription.status === 'trialing') {
            await pb.collection('users').update(record.id, {
              stripe_subscription_id: subscription.id,
              stripe_price_id: priceId,
              stripe_current_period_end: (subscription as any).current_period_end
                ? new Date((subscription as any).current_period_end * 1000).toISOString()
                : null,
              plan: planType,
            });
            console.log(`Updated subscription for user ${record.id}`);
          } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            await pb.collection('users').update(record.id, {
              plan: 'free',
            });
            console.log(`Downgraded user ${record.id} to free due to status: ${subscription.status}`);
          }
        } catch (e: any) {
          console.error(`User not found or update failed for customerId: ${customerId}`, e.message);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        console.log('Subscription deleted for customer:', customerId);

        try {
          const record = await pb.collection('users').getFirstListItem(`stripe_customer_id="${customerId}"`);
          await pb.collection('users').update(record.id, {
            plan: 'free',
            stripe_subscription_id: '',
            stripe_price_id: '',
          });
          console.log(`Reset user ${record.id} to free plan.`);
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
