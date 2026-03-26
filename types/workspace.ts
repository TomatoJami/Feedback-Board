import { RecordModel } from 'pocketbase';

import type { User } from '@/types/user';

export interface Workspace extends RecordModel {
  name: string;
  slug: string;
  isPrivate: boolean;
  is_frozen: boolean;
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
