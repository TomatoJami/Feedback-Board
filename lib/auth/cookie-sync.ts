import pb from '@/lib/pocketbase';
import type { User } from '@/types';

/**
 * Build a minimal cookie that fits within the 4KB browser limit.
 * exportToCookie() includes the entire user record and easily exceeds 4KB.
 */
export function syncAuthCookie() {
  if (typeof document === 'undefined') return;

  if (pb.authStore.isValid && pb.authStore.token && pb.authStore.record) {
    const minimalData = JSON.stringify({
      token: pb.authStore.token,
      record: {
        id: pb.authStore.record.id,
        collectionId: pb.authStore.record.collectionId,
        role: (pb.authStore.record as unknown as User).role ?? 'user',
        status: (pb.authStore.record as unknown as User).status ?? 'active',
        plan: (pb.authStore.record as unknown as User).plan ?? 'free',
      },
    });
    document.cookie = `pb_auth=${encodeURIComponent(minimalData)}; path=/; SameSite=Lax; max-age=2592000`;
  } else {
    clearAuthCookie();
  }
}

/**
 * Clear the auth cookie.
 */
export function clearAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
