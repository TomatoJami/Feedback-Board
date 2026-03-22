'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import DOMPurify from 'isomorphic-dompurify';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  resizable?: boolean;
}

export default function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder = 'Поддерживается Markdown...', 
  minHeight = '200px',
  resizable = true
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');

  return (
    <div className="flex flex-col border border-white/10 rounded-xl overflow-hidden bg-black/20 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
        <button
          type="button"
          onClick={() => setTab('write')}
          className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors ${tab === 'write' ? 'bg-indigo-500 text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
        >
          Редактор
        </button>
        <button
          type="button"
          onClick={() => setTab('preview')}
          className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors ${tab === 'preview' ? 'bg-indigo-500 text-white shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
        >
          Превью
        </button>
        <div className="ml-auto text-xs text-zinc-500 font-medium">✨ Markdown</div>
      </div>
      
      <div className="p-0 relative">
        {tab === 'write' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-transparent p-4 outline-none text-white font-mono text-sm leading-relaxed ${resizable ? 'resize-y' : 'resize-none'}`}
            style={{ minHeight }}
          />
        ) : (
          <div className="w-full p-4 overflow-y-auto markdown-body text-zinc-300 text-sm leading-relaxed" style={{ minHeight }}>
            {value.trim() ? (
            <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize]}
                components={{
                  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline" />,
                  code: ({node, inline, ...props}: any) => 
                    inline 
                      ? <code className="bg-white/10 px-1 rounded text-indigo-300" {...props} />
                      : <pre className="bg-black/40 p-4 rounded-xl overflow-x-auto text-[0.85em] mb-4 border border-white/10"><code {...props} /></pre>
                }}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-zinc-600 italic">Предпросмотр пуст...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
