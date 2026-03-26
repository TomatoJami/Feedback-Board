import { RecordModel } from 'pocketbase';

import type { User } from '@/types/user';


export interface SuggestionComment extends RecordModel {
  user: string;
  suggestion: string;
  text: string;
  parent_id?: string;
  merged_from_suggestion?: string;
  upvotes?: number;
  downvotes?: number;
  expand?: {
    user?: User;
    workspace_id?: string;
    suggestion?: any;
    parent_id?: any;
  };
  workspace_id?: string;
}

export interface CommentVote extends RecordModel {
  user: string;
  comment: string;
  type: 'upvote' | 'downvote';
}
