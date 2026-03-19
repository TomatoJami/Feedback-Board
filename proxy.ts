import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // base64url → base64 → decode
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const authCookie = request.cookies.get('pb_auth');
  const path = request.nextUrl.pathname;
  
  const isAdminPage = path.startsWith('/admin');
  const isNewSuggestionPage = path.startsWith('/suggestions/new');

  // If trying to access protected pages without a cookie, redirect to login
  if ((isAdminPage || isNewSuggestionPage) && !authCookie) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  // Server-side admin role check: securely verify Token against PocketBase
  if (isAdminPage && authCookie) {
    try {
      // Decode URL-encoded cookie value
      const rawValue = authCookie.value.startsWith('%') 
        ? decodeURIComponent(authCookie.value) 
        : authCookie.value;

      const cookieData = JSON.parse(rawValue);
      const token = cookieData?.token;
      
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }

      // Securely verify token and get user profile directly from PocketBase
      // We don't verify signature locally, we let PocketBase do it for 100% safety
      const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';
      
      const response = await fetch(`${pbUrl}/api/collections/users/auth-refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // Don't cache this request, we need real-time validation for admin access
        cache: 'no-store'
      });

      if (!response.ok) {
        console.warn(`Middleware: Token validation failed with status ${response.status}`);
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }

      const authData = await response.json();
      const user = authData?.record;

      if (user?.role !== 'admin') {
        console.warn(`Middleware: Access denied for verified user ${user?.id} with role ${user?.role}`);
        return NextResponse.redirect(new URL('/', request.url));
      }

      console.log(`Middleware: Secure access granted for verified admin ${user.id}`);
    } catch (e) {
      console.error('Middleware: Error processing auth verification', e);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/suggestions/new'],
};
