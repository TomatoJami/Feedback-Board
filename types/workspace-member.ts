import { RecordModel } from 'pocketbase';

import type { User } from '@/types/user';
import type { Workspace } from '@/types/workspace';

export type WorkspaceRole = 'admin' | 'moderator' | 'user';

export interface WorkspaceMember extends RecordModel {
  workspace: string;
  user: string;
  role: WorkspaceRole;
  expand?: {
    workspace?: Workspace;
    user?: User;
  };
}
