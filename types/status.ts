import { RecordModel } from 'pocketbase';

export interface Status extends RecordModel {
  name: string;
  color: string;
  workspace_id: string;
}
