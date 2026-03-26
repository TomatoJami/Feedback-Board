import { RecordModel } from 'pocketbase';

export interface Notification extends RecordModel {
  user: string;
  message: string;
  read: boolean;
  link?: string;
  type?: 'comment' | 'vote' | 'status' | 'merge' | 'system';
}
