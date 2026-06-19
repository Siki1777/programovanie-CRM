import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const maCookie = request.cookies.has('crm_kolega_id');
  const path = request.nextUrl.pathname;

  if (path.startsWith('/_next') || path.includes('.') || path.startsWith('/api')) {
    return NextResponse.next();
  }

  // Ak nie je prihlásený a nejde na /login, presmerujeme ho
  if (!maCookie && path !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Ak je prihlásený a ide na /login, presmerujeme ho na dashboard
  if (maCookie && path === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}
