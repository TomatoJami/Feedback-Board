'use client';

import { 
  ChatBubbleLeftRightIcon, 
  ChevronLeftIcon, 
  MapPinIcon,
  PlusIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';

import CommentItem from '@/components/comments/CommentItem';
import FilterSection from '@/components/suggestions/FilterSection';
import SuggestionCard from '@/components/suggestions/SuggestionCard';
import SuggestionDetailCard from '@/components/suggestions/SuggestionDetailCard';
import HomeHeader from '@/components/workspace/HomeHeader';
import { Category, Status, Suggestion, SuggestionComment } from '@/types';

export default function LivePreview() {
  const [selectedSuggestion, setSelectedSuggestion] = React.useState<Suggestion | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('All');
  const [status, setStatus] = React.useState('All');
  const [sortBy, setSortBy] = React.useState<'votes' | 'newest' | 'oldest'>('votes');

  const MOCK_CATEGORIES = React.useMemo<Category[]>(() => [
    { id: 'cat1', name: 'Интерфейс', icon: '🎨', workspace_id: 'w1', collectionId: 'c', collectionName: 'categories', created: '', updated: '', is_default: false, order: 1 },
    { id: 'cat2', name: 'Интеграции', icon: '🔗', workspace_id: 'w1', collectionId: 'c', collectionName: 'categories', created: '', updated: '', is_default: false, order: 2 },
    { id: 'cat3', name: 'Производительность', icon: '⚡', workspace_id: 'w1', collectionId: 'c', collectionName: 'categories', created: '', updated: '', is_default: false, order: 3 },
  ], []);

  const MOCK_STATUSES = React.useMemo<Status[]>(() => [
    { id: 'stat1', name: 'В работе', color: '#f59e0b', workspace_id: 'w1', collectionId: 'st', collectionName: 'statuses', created: '', updated: '', is_default: false, order: 1 },
    { id: 'stat2', name: 'В планах', color: '#a855f7', workspace_id: 'w1', collectionId: 'st', collectionName: 'statuses', created: '', updated: '', is_default: false, order: 2 },
    { id: 'stat3', name: 'Открыто', color: '#3b82f6', workspace_id: 'w1', collectionId: 'st', collectionName: 'statuses', created: '', updated: '', is_default: true, order: 0 },
  ], []);

  const MOCK_SUGGESTIONS = React.useMemo<Suggestion[]>(() => [
    {
      id: 'mock1',
      collectionId: 's',
      collectionName: 'suggestions',
      created: '2024-03-24T12:00:00.000Z',
      updated: '2024-03-24T12:00:00.000Z',
      title: 'Темная тема для интерфейса 🌙',
      description: 'Было бы круто добавить возможность переключаться на темную тему, чтобы было комфортно работать в вечернее время.',
      category_id: 'cat1',
      status: 'In_Progress',
      author: 'user1',
      is_public: true,
      votes_count: 142,
      workspace_id: 'w1',
      pinned: true,
      image: '',
      expand: {
        category_id: MOCK_CATEGORIES[0],
        status_id: MOCK_STATUSES[0],
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
      created: '2024-03-25T10:00:00.000Z',
      updated: '2024-03-26T12:00:00.000Z',
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
        category_id: MOCK_CATEGORIES[1],
        status_id: MOCK_STATUSES[1],
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
    },
    {
      id: 'mock3',
      collectionId: 's',
      collectionName: 'suggestions',
      created: '2024-03-26T09:00:00.000Z',
      updated: '2024-03-26T09:00:00.000Z',
      title: 'API для внешней аналитики',
      description: 'Интеграция с Google Analytics и Mixpanel для отслеживания активности на досках.',
      category_id: 'cat2',
      status: 'Open',
      author: 'user3',
      is_public: true,
      votes_count: 31,
      workspace_id: 'w1',
      image: '',
      expand: {
        category_id: MOCK_CATEGORIES[1],
        status_id: MOCK_STATUSES[2],
        author: {
          id: 'user3',
          collectionId: 'u',
          collectionName: 'users',
          created: '',
          updated: '',
          name: 'Дмитрий К.',
          username: 'dima',
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
  ], [MOCK_CATEGORIES, MOCK_STATUSES]);

  const MOCK_COMMENTS = React.useMemo<SuggestionComment[]>(() => [
    {
      id: 'mock_comment_1',
      collectionId: 'comments',
      collectionName: 'comments',
      created: '2024-03-25T14:30:00.000Z',
      updated: '2024-03-25T14:30:00.000Z',
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
          name: 'Дмитрий К.',
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
      created: '2024-03-25T15:45:00.000Z',
      updated: '2024-03-25T15:45:00.000Z',
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
          name: 'Мария С.',
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
  ], []);

  const filteredSuggestions = React.useMemo(() => {
    let result = MOCK_SUGGESTIONS;
    
    if (searchQuery) {
      result = result.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (categoryId !== 'All') {
      result = result.filter(s => s.category_id === categoryId);
    }

    if (status !== 'All') {
      result = result.filter(s => {
          const sStatus = s.status_id || 'None';
          return sStatus === status;
      });
    }

    // Sort mock
    if (sortBy === 'newest') {
      result = [...result].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    } else if (sortBy === 'oldest') {
      result = [...result].sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());
    } else {
      result = [...result].sort((a, b) => b.votes_count - a.votes_count);
    }

    return result;
  }, [searchQuery, MOCK_SUGGESTIONS, categoryId, status, sortBy]);

  return (
    <div id="demo-preview" className="w-full max-w-5xl pt-24 pb-0 px-6 flex flex-col items-center">
      <div className="text-center mb-16">
        <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 tracking-tight">
          Почувствуйте <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">реальный интерфейс</span>
        </h2>
        <p className="text-zinc-400 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
          Все продумано до мелочей. Попробуйте нажать на предложение или воспользуйтесь поиском в интерактивном демо ниже.
        </p>
      </div>

      {/* Browser Window Mockup */}
      <div className="w-full bg-[#09090b] rounded-[32px] border border-white/10 shadow-[0_0_50px_-12px_rgba(99,102,241,0.3)] overflow-hidden flex flex-col min-h-[700px] animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Browser Top Bar */}
        <div className="h-12 border-b border-white/5 bg-white/[0.02] flex items-center px-6 gap-4 shrink-0">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-white/5 px-4 py-1 rounded-full text-[10px] font-medium text-zinc-500 border border-white/5 tracking-wider uppercase">
              Feedback Board — Demo Workspace
            </div>
          </div>
        </div>

        {/* Mock Application Navbar (Matching Real Navbar) */}
        <nav className="h-16 border-b border-white/5 bg-[#09090b] flex items-center px-6 shrink-0 sticky top-0 z-50 backdrop-blur-md">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="url(#logo-gradient-demo)" />
                <path d="M10 16l4 4 8-8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="logo-gradient-demo" x1="0" y1="0" x2="32" y2="32">
                    <stop stopColor="#6366f1" />
                    <stop offset="1" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="font-black text-white text-base tracking-tight hidden sm:block">Feedback Board</span>
            </div>
            
            <div className="flex items-center gap-2">
               <button className="btn btn-primary !py-1.5 !px-4 !text-xs !rounded-full flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Новое
               </button>
               
               <div className="hidden md:flex items-center gap-1 ml-2">
                  <button className="btn btn-ghost !py-1.5 !px-3 !text-xs !rounded-full flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                      <path d="M9 20l-5.447-2.724A2 2 0 013 15.483V5.517a2 2 0 011.053-1.758L9 1m0 19l6-3m-6 3V1m6 19l5.447 2.724A2 2 0 0021 21.483V11.517a2 2 0 00-1.053-1.758L15 7m-6 13V7m6 13V7" />
                    </svg>
                    Roadmap
                  </button>
                  <button className="btn btn-ghost !py-1.5 !px-3 !text-xs !rounded-full flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                    Управление
                  </button>
               </div>

               <div className="h-4 w-px bg-white/10 mx-2" />
               
               <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors relative">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-zinc-400">
                   <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
                 </svg>
                 <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#09090b]" />
               </div>

               <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border border-white/20 flex items-center justify-center text-[11px] font-black text-white shadow-lg cursor-pointer hover:scale-105 transition-transform">
                 JD
               </div>
            </div>
          </div>
        </nav>

        {/* Workspace Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#09090b]">
          <div className="max-w-4xl mx-auto py-8 px-6 sm:px-10">
            {selectedSuggestion ? (
              /* DETAIL VIEW */
              <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <nav className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-2">
                  <span className="hover:text-white cursor-pointer" onClick={() => setSelectedSuggestion(null)}>Воркспейс</span>
                  <span>/</span>
                  <span className="hover:text-white cursor-pointer" onClick={() => setSelectedSuggestion(null)}>Предложения</span>
                  <span>/</span>
                  <span className="text-indigo-400 truncate max-w-[200px]">{selectedSuggestion.title}</span>
                </nav>

                <button 
                  onClick={() => setSelectedSuggestion(null)} 
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors w-fit mb-2"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  <span className="text-sm font-semibold">Назад</span>
                </button>
                
                <SuggestionDetailCard 
                    suggestion={selectedSuggestion}
                    authorName={selectedSuggestion.expand?.author?.name || 'Аноним'}
                    authorColor="#6366f1"
                    statusLabel={selectedSuggestion.expand?.status_id?.name || 'Открыто'}
                    statusColor={selectedSuggestion.expand?.status_id?.color || '#3b82f6'}
                    categoryName={selectedSuggestion.expand?.category_id?.name || 'Без категории'}
                    categoryIcon={selectedSuggestion.expand?.category_id?.icon || '📋'}
                    imageUrl={null}
                    score={selectedSuggestion.votes_count}
                    scoreClass="positive"
                    voteType={null}
                    isPending={false}
                    remainingSeconds={0}
                    voteLoading={false}
                    user={null}
                    onVote={() => {}}
                    onShowDelete={() => {}}
                    showDeleteBtn={false}
                    authorPrefixes={[]}
                />
                
                <div className="w-full h-px bg-white/5 my-4" />
                
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2.5">
                    <ChatBubbleLeftRightIcon className="w-5 h-5 text-indigo-400" />
                    Комментарии (2)
                  </h3>
                  
                  <div className="space-y-4">
                    {MOCK_COMMENTS.map(c => (
                      <div key={c.id} className="pointer-events-none border-b border-white/[0.03] pb-4 last:border-0">
                        <CommentItem
                          comment={c}
                          allComments={MOCK_COMMENTS}
                          user={null}
                          userVotes={{}}
                          pendingVotes={{}}
                          onVote={async () => {}}
                          onReply={async () => {}}
                          onUpdate={async () => {}}
                          onDelete={async () => {}}
                          isAdmin={false}
                          workspaceId="w1"
                          authorPrefixes={[]}
                          isSuggestionAuthor={false}
                        />
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 bg-white/[0.02] rounded-2xl p-4 flex items-center justify-between border border-white/5 opacity-50 cursor-not-allowed">
                    <span className="text-zinc-500 text-sm">Написать комментарий...</span>
                    <button className="px-4 py-2 bg-indigo-500/50 text-white rounded-lg font-bold text-xs">
                      Отправить
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* LIST VIEW */
              <div className="space-y-10 animate-in fade-in duration-500">
                {/* Home Header Component */}
                <HomeHeader isMine={false} />

                {/* Filter Section Component */}
                <FilterSection
                    categoryId={categoryId}
                    setCategoryId={setCategoryId}
                    status={status}
                    setStatus={setStatus}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    categories={MOCK_CATEGORIES}
                    statuses={MOCK_STATUSES}
                    user={null}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                />

                {/* Suggestions List */}
                <div className="grid gap-4">
                  {filteredSuggestions.length > 0 ? (
                    filteredSuggestions.map((suggestion, index) => (
                      <div 
                        key={suggestion.id} 
                        className="group relative cursor-pointer active:scale-[0.98] transition-all"
                        style={{ animation: `fadeIn 0.3s ease-out ${index * 0.1}s both` }}
                        onClick={() => setSelectedSuggestion(suggestion)}
                      >
                        <div className="[&_.suggestion-card]:!mb-0 transition-colors pointer-events-none">
                          <SuggestionCard suggestion={suggestion} workspaceSlug="demo" commentsCount={index === 0 ? 2 : 0} />
                        </div>
                        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent group-hover:ring-white/10 transition-all" />
                      </div>
                    ))
                  ) : (
                    <div className="py-20 flex flex-col items-center text-center">
                       <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
                         <PlusIcon className="w-8 h-8 text-zinc-600 rotate-45" />
                       </div>
                       <h3 className="text-white font-bold mb-1">Ничего не найдено</h3>
                       <p className="text-zinc-500 text-sm">Попробуйте изменить запрос поиска или сбросить фильтры</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mock Footer / Bottom Shade */}
        <div className="h-6 border-t border-white/5 bg-white/[0.01] flex items-center justify-center">
            <div className="h-1 w-12 rounded-full bg-white/10" />
        </div>
      </div>

      {/* Increased margin after the demo and before the button as per instructions */}
      <div className="mt-32 flex flex-col items-center gap-6">
        <Link
          href="/auth/register"
          className="btn btn-primary !px-12 !py-5 !text-xl h-auto !rounded-2xl shadow-2xl shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all outline-none border-none font-bold"
        >
          Создать свой борд
        </Link>
      </div>
    </div>
  );
}
