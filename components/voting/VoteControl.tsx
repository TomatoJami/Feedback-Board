'use client';

import React from 'react';
import { useVote } from '@/hooks/useVote';
import { useAuth } from '@/hooks/useAuth';

interface VoteControlProps {
  suggestionId: string;
  initialVotesCount: number;
  authorId: string;
}

export default function VoteControl({ suggestionId, initialVotesCount, authorId }: VoteControlProps) {
  const { user } = useAuth();
  const { voteType, isPending, remainingSeconds, isLoading, vote, optimisticScore } = useVote(suggestionId, initialVotesCount);

  const scoreClass = optimisticScore > 0 ? 'positive' : optimisticScore < 0 ? 'negative' : 'zero';

  return (
    <div className="vote-column" onClick={(e) => e.preventDefault()}>
      <button
        className={`vote-btn ${voteType === 'upvote' ? 'voted' : ''}`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); vote('upvote', authorId); }}
        disabled={!user || isLoading || user.id === authorId}
        title={!user ? 'Войдите, чтобы голосовать' : user.id === authorId ? 'Вы не можете голосовать за свое предложение' : 'Upvote'}
        style={user?.id === authorId ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
      >
        <svg className="vote-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>

      <span className={`vote-score ${scoreClass}`}>{optimisticScore}</span>

      <button
        className={`vote-btn-down ${voteType === 'downvote' ? 'voted' : ''}`}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); vote('downvote', authorId); }}
        disabled={!user || isLoading || user.id === authorId}
        title={!user ? 'Войдите, чтобы голосовать' : user.id === authorId ? 'Вы не можете голосовать за свое предложение' : 'Downvote'}
        style={user?.id === authorId ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
      >
        <svg className="vote-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </button>

      {isPending && (
        <div className="vote-timer-ring" title="Вы можете изменить голос">
          <svg viewBox="0 0 36 36" className="vote-timer-svg">
            <circle
              cx="18" cy="18" r="15.5"
              fill="none"
              stroke="rgba(99, 102, 241, 0.15)"
              strokeWidth="3"
            />
            <circle
              cx="18" cy="18" r="15.5"
              fill="none"
              stroke="url(#timerGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(remainingSeconds / 15) * 97.4} 97.4`}
              style={{ transition: 'stroke-dasharray 1s linear', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
          <span className="vote-timer-number">{remainingSeconds}</span>
        </div>
      )}
    </div>
  );
}
