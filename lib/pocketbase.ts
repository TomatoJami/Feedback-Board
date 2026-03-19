import PocketBase from 'pocketbase';
import { logger } from './logger';

const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

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

export default pb;
export { POCKETBASE_URL };
