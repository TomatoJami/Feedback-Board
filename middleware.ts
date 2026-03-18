import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('pb_auth');
  const path = request.nextUrl.pathname;
  
  const isAdminPage = path.startsWith('/admin');
  const isNewSuggestionPage = path.startsWith('/suggestions/new');

  // If trying to access protected pages without a cookie, redirect to login
  if ((isAdminPage || isNewSuggestionPage) && !authCookie) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('redirect', path); // Optional: comeback later
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/suggestions/new'],
};
