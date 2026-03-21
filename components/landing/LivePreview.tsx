'use client';

import React from 'react';
import Link from 'next/link';
import SuggestionCard from '@/components/SuggestionCard';
import { Suggestion } from '@/types/suggestion';

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
    title: 'Интеграция с Telegram-ботом',
    description: 'Получать уведомления о новых идеях и комментариях прямо в Telegram.',
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
  return (
    <div id="demo-preview" className="w-full max-w-4xl pb-12 relative" style={{ margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 className="text-4xl font-bold text-white mb-4">
        Живой пример
      </h2>
      <p className="text-zinc-400 text-xl leading-relaxed max-w-2xl mb-16" style={{ textAlign: 'center', margin: '0 auto 64px auto', width: '100%' }}>
        Удобные карточки с голосованием, статусами и тегами. Все самое важное на виду, чтобы ваши пользователи увлеченно делились идеями.
      </p>

      <div className="flex flex-col gap-4 text-left relative z-10 w-full mb-16 bg-white/[0.015] p-8 rounded-[40px] border border-white/5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-8 pb-4 border-bottom border-white/5">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <div className="text-xs font-mono text-zinc-600 uppercase tracking-widest">Public Board Mockup</div>
        </div>

        {MOCK_SUGGESTIONS.map((suggestion) => (
          <div key={suggestion.id} className="pointer-events-none opacity-90 hover:opacity-100 transition-opacity">
            <SuggestionCard suggestion={suggestion} workspaceSlug="demo" />
          </div>
        ))}

        <div className="absolute -bottom-2 left-0 w-full h-32 bg-gradient-to-t from-black via-black/80 to-transparent z-20 pointer-events-none" />
      </div>

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
