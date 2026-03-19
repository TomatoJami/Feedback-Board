import { RecordModel } from 'pocketbase';
import type { UserPrefix } from '@/types/user-prefix';


export interface User extends RecordModel {
  email: string;
  name: string;
  avatar: string;
  role?: string;
  global_role?: 'user' | 'owner';
  plan?: 'free' | 'pro';
  prefixes?: string[];
  expand?: {
    prefixes?: UserPrefix[];
  };
}
