'use client';

import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import pb from '@/lib/pocketbase';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import ConfirmModal from '@/components/ConfirmModal';

export default function NewSuggestionPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set default category when loaded
  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submitForm = async () => {
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category_id', categoryId);
      formData.append('author', user.id);
      formData.append('status', 'Open');
      formData.append('votes_count', '0');
      formData.append('is_public', 'true');
      if (image) {
        formData.append('image', image);
      }

      await pb.collection('suggestions').create(formData);
      toast.success('Предложение успешно опубликовано!');
      router.push('/');
    } catch (err: any) {
      console.error('Failed to create suggestion:', err);
      toast.error('Ошибка при создании предложения');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setShowConfirm(true);
    } else {
      submitForm();
    }
  };

  if (authLoading || categoriesLoading) return null;
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Новое предложение</h1>
        <p className="text-zinc-400">Опишите вашу идею или сообщите об ошибке.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-zinc-900/50 p-8 rounded-3xl border border-white/5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Заголовок</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-zinc-950 border border-white/10 rounded-xl p-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-700"
            placeholder="Краткое название идеи..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Категория</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`py-3 px-4 rounded-xl border font-semibold transition-all min-w-[100px] flex items-center justify-center gap-2 ${
                  categoryId === c.id 
                  ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' 
                  : 'bg-zinc-950 border-white/10 text-zinc-500 hover:border-white/20'
                }`}
                onClick={() => setCategoryId(c.id)}
              >
                {c.icon && <span>{c.icon}</span>}
                {c.name}
              </button>
            ))}
            {categories.length === 0 && (
              <p className="text-zinc-600 text-sm">Нет доступных категорий. Обратитесь к админу.</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Описание (опционально)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-zinc-950 border border-white/10 rounded-xl p-4 min-h-[160px] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-700 resize-none"
            placeholder="Расскажите подробнее..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Скриншот</label>
          {!preview ? (
            <div 
              className="border-2 border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-white/20 transition-all bg-zinc-950/50 group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
              </div>
              <p className="text-sm text-zinc-500 font-medium">Нажмите, чтобы загрузить скриншот</p>
              <p className="text-xs text-zinc-600 mt-1">PNG, JPG, WEBP до 5MB</p>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-950">
              <img src={preview} alt="Preview" className="w-full max-h-64 object-contain" />
              <button 
                type="button"
                className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"
                onClick={removeImage}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !title.trim() || !categoryId}
          className="btn btn-primary w-full py-4 text-lg justify-center mt-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/20"
        >
          {isSubmitting ? 'Отправляем...' : 'Опубликовать'}
        </button>
      </form>

      <ConfirmModal
        isOpen={showConfirm}
        title="Пустое описание"
        message="Вы уверены, что хотите отправить предложение без подробного описания?"
        confirmText="Да, отправить"
        cancelText="Вернуться"
        onConfirm={() => {
          setShowConfirm(false);
          submitForm();
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
