import { RecordModel } from 'pocketbase';

import type { Category } from '@/types/category';
import type { Status } from '@/types/status';
import type { User } from '@/types/user';
import type { Workspace } from '@/types/workspace';

export interface Suggestion extends RecordModel {
  title: string;
  description: string;
  category_id: string;
  image: string;
  author: string;
  is_public: boolean;
  votes_count: number;
  status_id?: string;
  pinned?: boolean;
  merged_into?: string;
  assigned_user?: string | null;
  workspace_id: string;
  expand?: {
    author?: User;
    category_id?: Category;
    status_id?: Status;
    workspace_id?: Workspace;
  };
}

export interface CreateSuggestionDTO {
  title: string;
  description?: string;
  category_id: string;
  workspace_id: string;
  image?: File;
  is_public?: boolean;
}
