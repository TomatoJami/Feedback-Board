import { RecordModel } from 'pocketbase';
import type { User } from '@/types/user';

export interface Workspace extends RecordModel {
  name: string;
  slug: string;
  isPrivate: boolean;
  owner: string;
  expand?: {
    owner?: User;
  };
}

export interface CreateWorkspaceDTO {
  name: string;
  slug: string;
  isPrivate?: boolean;
}
