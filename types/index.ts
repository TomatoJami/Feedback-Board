import { RecordModel } from 'pocketbase';

// ── Category ────────────────────────────────────────────────
export interface Category extends RecordModel {
  name: string;
  icon: string;
}

// ── Suggestion ──────────────────────────────────────────────
export type SuggestionStatus = 'Open' | 'Planned' | 'In_Progress' | 'Completed';

export interface Suggestion extends RecordModel {
  title: string;
  description: string;
  category_id: string;
  status: SuggestionStatus;
  image: string;
  author: string;
  is_public: boolean;
  votes_count: number;
  expand?: {
    author?: User;
    category_id?: Category;
  };
}

export interface CreateSuggestionDTO {
  title: string;
  description?: string;
  category_id: string;
  image?: File;
  is_public?: boolean;
}

// ── Vote ─────────────────────────────────────────────────────
export type VoteType = 'upvote' | 'downvote';

export interface Vote extends RecordModel {
  user: string;
  suggestion: string;
  type: VoteType;
}

// ── Comment ──────────────────────────────────────────────────
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
  type: VoteType;
}

// ── Notification ─────────────────────────────────────────────
export interface Notification extends RecordModel {
  user: string;
  message: string;
  read: boolean;
}

// ── User ─────────────────────────────────────────────────────
export interface User extends RecordModel {
  email: string;
  name: string;
  avatar: string;
  role?: string;
}
