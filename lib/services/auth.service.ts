import type { AuthRecord } from 'pocketbase';

import pb from '@/lib/pocketbase';
import type { User } from '@/types';

/**
 * Map a PocketBase AuthRecord to the application User type.
 */
export function mapAuthRecord(record: AuthRecord | null): User | null {
  if (!record) return null;
  return {
    id: record.id,
    collectionId: record.collectionId,
    collectionName: record.collectionName,
    email: record.email ?? '',
    name: record.name ?? '',
    avatar: record.avatar ?? '',
    role: (record as unknown as User).role ?? 'user',
    status: (record as unknown as User).status ?? 'active',
    plan: (record as unknown as User).plan ?? 'free',
    created: record.created,
    updated: record.updated,
  };
}

/**
 * Login with email and password.
 */
export async function loginWithPassword(email: string, password: string) {
  return pb.collection('users').authWithPassword(email, password);
}

/**
 * Login with Google OAuth2.
 */
export async function loginWithOAuth() {
  return pb.collection('users').authWithOAuth2({
    provider: 'google',
    requestKey: null,
    createData: {
      role: 'user',
      status: 'active',
      plan: 'free',
      emailVisibility: true,
    },
  });
}

/**
 * Register a new user and immediately log them in.
 */
export async function registerUser(
  name: string,
  email: string,
  password: string,
  passwordConfirm: string,
) {
  await pb.collection('users').create({
    name,
    email,
    password,
    passwordConfirm,
    emailVisibility: true,
    role: 'user',
    status: 'active',
    plan: 'free',
  });
  return pb.collection('users').authWithPassword(email, password);
}

/**
 * Refresh the current auth session.
 */
export async function refreshAuth() {
  return pb.collection('users').authRefresh({ requestKey: null });
}

/**
 * Clear the auth store (logout).
 */
export function clearAuth() {
  pb.authStore.clear();
}
