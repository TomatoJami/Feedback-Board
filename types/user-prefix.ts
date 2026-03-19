import { RecordModel } from 'pocketbase';

export interface UserPrefix extends RecordModel {
  name: string;
  color: string;
}
