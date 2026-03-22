import { RecordModel } from 'pocketbase';

export interface Settings extends RecordModel {
  default_status: string;
  deletable_statuses: string[];
  workspace_id: string;
}
