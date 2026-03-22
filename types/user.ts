import { RecordModel } from 'pocketbase';


export interface User extends RecordModel {
  email: string;
  name: string;
  avatar: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  plan?: 'free' | 'pro';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_price_id?: string;
  stripe_current_period_end?: string;
}
