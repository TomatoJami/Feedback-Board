'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import pb from '@/lib/pocketbase';
import toast from 'react-hot-toast';

export default function GlobalAdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [wsRecords, userRecords] = await Promise.all([
        pb.collection('workspaces').getFullList({ sort: '-created', expand: 'owner' }),
        pb.collection('users').getFullList({ sort: '-created' }),
      ]);
      setWorkspaces(wsRecords);
      setUsers(userRecords);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && (!user || user.global_role !== 'owner')) {
      router.push('/');
      return;
    }
    if (user && user.global_role === 'owner') {
      fetchData();
    }
  }, [user, isLoading, router, fetchData]);

  const handleDeleteWorkspace = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete workspace "${name}"?
This will not automatically delete associated suggestions/categories unless DB relations cascade.`)) return;
    try {
      await pb.collection('workspaces').delete(id);
      setWorkspaces(prev => prev.filter(w => w.id !== id));
      toast.success('Workspace deleted');
    } catch (err) {
      toast.error('Failed to delete workspace');
    }
  };

  const handleToggleBlockUser = async (u: any) => {
    const isBlocked = u.role === 'blocked';
    const newRole = isBlocked ? 'user' : 'blocked';
    try {
      await pb.collection('users').update(u.id, { role: newRole });
      setUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, role: newRole } : usr));
      toast.success(isBlocked ? 'User unblocked' : 'User blocked');
    } catch (err) {
      toast.error('Failed to update user status');
    }
  };

  const handleTogglePro = async (u: any) => {
    const isPro = u.plan === 'pro';
    const newPlan = isPro ? 'free' : 'pro';
    try {
      await pb.collection('users').update(u.id, { plan: newPlan });
      setUsers(prev => prev.map(usr => usr.id === u.id ? { ...usr, plan: newPlan } : usr));
      toast.success(isPro ? 'Pro plan revoked' : 'Pro plan granted');
    } catch (err) {
      toast.error('Failed to update user plan');
    }
  };

  if (isLoading || loadingData) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto py-12">
        <div className="h-10 w-64 bg-white/5 animate-pulse rounded-lg" />
        <div className="h-96 bg-white/5 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!user || user.global_role !== 'owner') return null;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Global Owner Panel</h1>
        <p className="text-slate-400">Manage all platform workspaces and users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Workspaces List */}
        <div className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Workspaces</h2>
            <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-1 rounded-full font-medium">
              {workspaces.length} Total
            </span>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-sm border-b border-white/5">
                  <th className="font-medium pb-3 pr-4">Name</th>
                  <th className="font-medium pb-3 pr-4">Owner</th>
                  <th className="font-medium pb-3 pr-4">Visibility</th>
                  <th className="font-medium pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {workspaces.map((w) => (
                  <tr key={w.id} className="text-sm">
                    <td className="py-4 pr-4">
                      <div className="text-white font-medium">{w.name}</div>
                      <div className="text-slate-500 text-xs">/w/{w.slug}</div>
                    </td>
                    <td className="py-4 pr-4 text-slate-400">
                      {w.expand?.owner?.name || w.expand?.owner?.email || w.owner}
                    </td>
                    <td className="py-4 pr-4">
                      {w.isPrivate ? (
                        <span className="text-amber-400 text-xs bg-amber-400/10 px-2 py-1 rounded-md">Private</span>
                      ) : (
                        <span className="text-emerald-400 text-xs bg-emerald-400/10 px-2 py-1 rounded-md">Public</span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleDeleteWorkspace(w.id, w.name)}
                        className="text-red-400 hover:text-red-300 font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {workspaces.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">No workspaces exist.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Users</h2>
            <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-1 rounded-full font-medium">
              {users.length} Total
            </span>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-sm border-b border-white/5">
                  <th className="font-medium pb-3 pr-4">User</th>
                  <th className="font-medium pb-3 pr-4">Plan / Role</th>
                  <th className="font-medium pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {users.map((u) => (
                  <tr key={u.id} className="text-sm">
                    <td className="py-4 pr-4">
                      <div className="text-white font-medium">{u.name || 'No name'}</div>
                      <div className="text-slate-500 text-xs">{u.email}</div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-col gap-1 items-start">
                        {u.plan === 'pro' ? (
                          <span className="text-indigo-400 text-xs bg-indigo-500/20 px-2 py-1 rounded-md font-bold uppercase">Pro</span>
                        ) : (
                          <span className="text-slate-400 text-xs bg-slate-800 px-2 py-1 rounded-md uppercase">Free</span>
                        )}
                        {u.role === 'blocked' && (
                          <span className="text-red-400 text-xs bg-red-400/10 px-2 py-1 rounded-md uppercase">Blocked</span>
                        )}
                        {u.global_role === 'owner' && (
                          <span className="text-fuchsia-400 text-xs bg-fuchsia-400/10 px-2 py-1 rounded-md uppercase">Owner</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-right flex flex-col items-end gap-2">
                      {u.id !== user.id && (
                        <>
                          <button
                            onClick={() => handleTogglePro(u)}
                            className="text-indigo-400 hover:text-indigo-300 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-colors w-full text-right"
                          >
                            {u.plan === 'pro' ? 'Revoke PRO' : 'Grant PRO'}
                          </button>
                          <button
                            onClick={() => handleToggleBlockUser(u)}
                            className={`${u.role === 'blocked' ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-red-400 hover:bg-red-500/10'} font-medium px-3 py-1.5 rounded-lg transition-colors w-full text-right`}
                          >
                            {u.role === 'blocked' ? 'Unblock' : 'Block User'}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
