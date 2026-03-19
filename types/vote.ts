import { RecordModel } from 'pocketbase';

export type VoteType = 'upvote' | 'downvote';

export interface Vote extends RecordModel {
  user: string;
  suggestion: string;
  type: VoteType;
}
