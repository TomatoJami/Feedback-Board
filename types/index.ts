import { RecordModel } from 'pocketbase';

// ── Category ────────────────────────────────────────────────
export interface Category extends RecordModel {
  name: string;
  icon: string;
}

// ── Status ──────────────────────────────────────────────────
export interface Status extends RecordModel {
  name: string;
  color: string;
}

// ── User Prefix ─────────────────────────────────────────────
export interface UserPrefix extends RecordModel {
  name: string;
  color: string;
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
  status_id?: string;
  expand?: {
    author?: User;
    category_id?: Category;
    status_id?: Status;
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

// ── Settings ──────────────────────────────────────────────
export interface Settings extends RecordModel {
  default_status: string;
  deletable_statuses: string[];
}

// ── User ─────────────────────────────────────────────────────
export interface User extends RecordModel {
  email: string;
  name: string;
  avatar: string;
  role?: string;
  prefixes?: string[];
  expand?: {
    prefixes?: UserPrefix[];
  };
}
