'use client';

import React from 'react';
import Link from 'next/link';
import SuggestionCard from '@/components/SuggestionCard';
import CommentItem from '@/components/CommentItem';
import { Suggestion, SuggestionComment } from '@/types';
import { ChatBubbleLeftRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

const MOCK_SUGGESTIONS: Suggestion[] = [
  {
    id: 'mock1',
    collectionId: 's',
    collectionName: 'suggestions',
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    title: 'Темная тема для интерфейса 🌙',
    description: 'Было бы круто добавить возможность переключаться на темную тему, чтобы было комфортно работать в вечернее время.',
    category_id: 'cat1',
    status: 'In_Progress',
    author: 'user1',
    is_public: true,
    votes_count: 142,
    workspace_id: 'w1',
    image: '',
    expand: {
      category_id: {
        id: 'cat1',
        collectionId: 'c',
        collectionName: 'categories',
        created: '',
        updated: '',
        name: 'Интерфейс',
        icon: '🎨',
        workspace_id: 'w1',
        is_default: false,
        order: 1
      },
      status_id: {
        id: 'stat1',
        collectionId: 'st',
        collectionName: 'statuses',
        created: '',
        updated: '',
        name: 'В работе',
        color: '#f59e0b',
        workspace_id: 'w1',
        is_default: false,
        order: 1
      },
      author: {
        id: 'user1',
        collectionId: 'u',
        collectionName: 'users',
        created: '',
        updated: '',
        name: 'Алексей С.',
        username: 'alex',
        email: '',
        emailVisibility: false,
        verified: true,
        avatar: '',
        role: 'user',
        status: 'active',
        workspaces: []
      }
    }
  },
  {
    id: 'mock2',
    collectionId: 's',
    collectionName: 'suggestions',
    created: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated: new Date().toISOString(),
    title: 'Менеджмент ролей пользователей',
    description: 'Назначать права модераторов и администраторов проверенным участникам доски.',
    category_id: 'cat2',
    status: 'Planned',
    author: 'user2',
    is_public: true,
    votes_count: 89,
    workspace_id: 'w1',
    image: '',
    expand: {
      category_id: {
        id: 'cat2',
        collectionId: 'c',
        collectionName: 'categories',
        created: '',
        updated: '',
        name: 'Интеграции',
        icon: '🔗',
        workspace_id: 'w1',
        is_default: false,
        order: 2
      },
      status_id: {
        id: 'stat2',
        collectionId: 'st',
        collectionName: 'statuses',
        created: '',
        updated: '',
        name: 'В планах',
        color: '#a855f7',
        workspace_id: 'w1',
        is_default: false,
        order: 2
      },
      author: {
        id: 'user2',
        collectionId: 'u',
        collectionName: 'users',
        created: '',
        updated: '',
        name: 'Мария В.',
        username: 'maria',
        email: '',
        emailVisibility: false,
        verified: true,
        avatar: '',
        role: 'user',
        status: 'active',
        workspaces: []
      }
    }
  }
];

export default function LivePreview() {
  const [selectedSuggestion, setSelectedSuggestion] = React.useState<Suggestion | null>(null);

  const MOCK_COMMENTS: SuggestionComment[] = [
    {
      id: 'mock_comment_1',
      collectionId: 'comments',
      collectionName: 'comments',
      created: new Date(Date.now() - 7200000).toISOString(),
      updated: new Date().toISOString(),
      text: 'Отличная идея, очень жду этот функционал!',
      suggestion_id: 'mock1',
      suggestion: 'mock1',
      user: 'user3',
      workspace_id: 'w1',
      upvotes: 5,
      downvotes: 0,
      score: 5,
      expand: {
        user: {
          id: 'user3',
          name: 'Alex D.',
          email: '',
          emailVisibility: false,
          verified: true,
          role: 'user',
          status: 'active',
          workspaces: [],
          collectionId: 'u',
          collectionName: 'users',
          created: '',
          updated: '',
          avatar: ''
        }
      }
    },
    {
      id: 'mock_comment_2',
      collectionId: 'comments',
      collectionName: 'comments',
      created: new Date(Date.now() - 3600000).toISOString(),
      updated: new Date().toISOString(),
      text: 'Согласна! Это сильно упростит нам работу.',
      suggestion_id: 'mock1',
      suggestion: 'mock1',
      user: 'user4',
      workspace_id: 'w1',
      upvotes: 12,
      downvotes: 0,
      score: 12,
      expand: {
        user: {
          id: 'user4',
          name: 'Maria S.',
          email: '',
          emailVisibility: false,
          verified: true,
          role: 'user',
          status: 'active',
          workspaces: [],
          collectionId: 'u',
          collectionName: 'users',
          created: '',
          updated: '',
          avatar: ''
        }
      }
    }
  ];

  return (
    <div id="demo-preview" className="w-full max-w-4xl pb-12 relative" style={{ margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 className="text-4xl font-bold text-white mb-4">
        Живой пример
      </h2>
      <p className="text-zinc-400 text-xl leading-relaxed max-w-2xl mb-16" style={{ textAlign: 'center', margin: '0 auto 64px auto', width: '100%' }}>
        Удобные карточки с голосованием, статусами и тегами. Нажмите на предложение, чтобы открыть детали.
      </p>

      {selectedSuggestion ? (
        <div className="flex flex-col gap-6 text-left relative z-30 w-full mb-16 bg-white/[0.015] p-8 rounded-[40px] border border-white/5 backdrop-blur-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
           <button 
             onClick={() => setSelectedSuggestion(null)} 
             className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-2 w-fit"
           >
             <ChevronLeftIcon className="w-5 h-5" />
             Назад к списку
           </button>
           
           <div className="pointer-events-none">
             <SuggestionCard suggestion={selectedSuggestion} workspaceSlug="demo" />
           </div>
           
           <div className="w-full h-px bg-white/5 my-2" />
           
           <div>
             <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
               <ChatBubbleLeftRightIcon className="w-6 h-6 text-indigo-400" />
               Комментарии (2)
             </h3>
             <div className="flex flex-col gap-4 mb-8 w-full max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
               {MOCK_COMMENTS.map(c => (
                 <div key={c.id} className="pointer-events-none">
                   <CommentItem
                     comment={c}
                     allComments={MOCK_COMMENTS}
                     user={null}
                     userVotes={{}}
                     onVote={async () => {}}
                     onReply={async () => {}}
                     onUpdate={async () => {}}
                     onDelete={async () => {}}
                     isAdmin={false}
                     workspaceId="w1"
                     authorPrefixes={
                       c.user === 'user4' 
                         ? [{ id: 'p1', name: 'Moderator', color: '#a855f7' }] 
                         : []
                     }
                     isSuggestionAuthor={false}
                   />
                 </div>
               ))}
             </div>
             
             <div className="w-full bg-white/5 rounded-2xl p-4 flex items-center justify-between border border-white/10 opacity-70 cursor-not-allowed">
               <span className="text-zinc-500 text-sm">Написать комментарий...</span>
               <button className="px-5 py-2.5 bg-indigo-500 text-white rounded-xl font-bold text-sm pointer-events-none">
                 Отправить
               </button>
             </div>
           </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 text-left relative z-10 w-full mb-16 bg-white/[0.015] p-8 rounded-[40px] border border-white/5 backdrop-blur-sm shadow-2xl animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-8 pb-4 border-bottom border-white/5">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
            </div>
            <div className="text-xs font-mono text-zinc-600 uppercase tracking-widest hidden sm:block">Public Board Mockup</div>
          </div>

          {MOCK_SUGGESTIONS.map((suggestion) => (
            <div 
              key={suggestion.id} 
              className="opacity-90 hover:opacity-100 hover:-translate-y-1 transition-all cursor-pointer relative z-30 group"
              onClick={() => setSelectedSuggestion(suggestion)}
            >
              <div className="pointer-events-none [&_.suggestion-card]:!mb-0">
                <SuggestionCard suggestion={suggestion} workspaceSlug="demo" />
              </div>
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-500/30 rounded-3xl transition-colors pointer-events-none" />
            </div>
          ))}

          <div className="absolute -bottom-2 left-0 w-full h-32 bg-gradient-to-t from-black via-black/80 to-transparent z-20 pointer-events-none rounded-b-[40px]" />
        </div>
      )}

      <div className="relative z-30">
        <Link
          href="/auth/register"
          className="btn btn-primary !px-12 !py-5 !text-xl h-auto !rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all outline-none border-none font-bold"
        >
          Создать свой борд
        </Link>
      </div>
    </div>
  );
}
