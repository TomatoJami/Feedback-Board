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

export function proxy(request: NextRequest) {
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

  // Server-side admin role check: decode JWT and verify role
  if (isAdminPage && authCookie) {
    try {
      // Decode URL-encoded cookie value if necessary
      const rawValue = authCookie.value.startsWith('%') 
        ? decodeURIComponent(authCookie.value) 
        : authCookie.value;

      const cookieData = JSON.parse(rawValue);
      const token = cookieData?.token;
      const user = cookieData?.record ?? cookieData?.model;
      
      if (token && user) {
        // Check role from the model stored in the cookie
        // Note: Client can spoof this to VIEW the page, but PocketBase rules 
        // will still prevent them from DOING anything without a valid admin token.
        if (user.role !== 'admin') {
          console.log(`Middleware: Access denied for user ${user.id} with role ${user.role}`);
          return NextResponse.redirect(new URL('/', request.url));
        }
        console.log(`Middleware: Access granted for admin ${user.id}`);
      } else {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    } catch (e) {
      console.error('Middleware: Error parsing auth cookie', e);
      // If cookie is malformed, better to ask for login
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/suggestions/new'],
};
