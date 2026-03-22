import PocketBase from 'pocketbase';

import { logger } from './logger';

const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL;

let pb: PocketBase;

export function createPocketBase() {
  return new PocketBase(POCKETBASE_URL);
}

if (typeof window !== 'undefined') {
  // Client-side: use singleton
  if (!(window as unknown as { __pb: PocketBase }).__pb) {
    (window as unknown as { __pb: PocketBase }).__pb = new PocketBase(POCKETBASE_URL);
  }
  pb = (window as unknown as { __pb: PocketBase }).__pb;
} else {
  // Server-side: create new instance per request
  pb = new PocketBase(POCKETBASE_URL);
  // Prevent authStore mutation on the shared server instance
  pb.authStore.save = () => { logger.warn('Attempted to mutate shared server PocketBase authStore. Use createPocketBase() instead.'); };
}

let adminPb: PocketBase | null = null;

export async function getAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('getAdminClient can only be used on the server');
  }

  // Check if we have a valid cached session
  if (adminPb && adminPb.authStore.isValid) {
    return adminPb;
  }

  const client = new PocketBase(POCKETBASE_URL);
  
  if (!process.env.PB_ADMIN_EMAIL || !process.env.PB_ADMIN_PASSWORD) {
    throw new Error('PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD must be defined');
  }

  try {
    await client.admins.authWithPassword(
      process.env.PB_ADMIN_EMAIL,
      process.env.PB_ADMIN_PASSWORD
    );
    adminPb = client;
    return adminPb;
  } catch (err) {
    logger.error('Failed to authenticate as admin:', err);
    throw err;
  }
}

export default pb;
export { POCKETBASE_URL };

