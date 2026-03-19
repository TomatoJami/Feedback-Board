import { RecordModel } from 'pocketbase';

export interface Category extends RecordModel {
  name: string;
  icon: string;
}
