import { RecordModel } from 'pocketbase';

export interface Notification extends RecordModel {
  user: string;
  message: string;
  read: boolean;
}
