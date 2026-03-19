import { RecordModel } from 'pocketbase';
import type { User } from '@/types/user';


export interface SuggestionComment extends RecordModel {
  user: string;
  suggestion: string;
  text: string;
  parent_id?: string;
  upvotes?: number;
  downvotes?: number;
  expand?: {
    user?: User;
  };
}

export interface CommentVote extends RecordModel {
  user: string;
  comment: string;
  type: 'upvote' | 'downvote';
}
