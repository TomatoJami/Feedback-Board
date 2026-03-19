import { RecordModel } from 'pocketbase';
import type { UserPrefix } from '@/types/user-prefix';


export interface User extends RecordModel {
  email: string;
  name: string;
  avatar: string;
  role?: string;
  prefixes?: string[];
  expand?: {
    prefixes?: UserPrefix[];
  };
}
