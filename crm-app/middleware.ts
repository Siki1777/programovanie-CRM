import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const maCookie = request.cookies.has('crm_kolega_id');

  // Dekódujeme URL, aby sme spoľahlivo prečítali "prihlásenie" s diakritikou
  const dekodovanaCesta = decodeURIComponent(url.pathname);

  // Ignorujeme statické súbory a API, aby sme nezablokovali aplikáciu
  if (
    url.pathname.startsWith('/_next') || 
    url.pathname.includes('.') ||
    url.pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  // 1. Ochrana dashboardu - ak nie je cookie a ide do chránenej zóny
  if (!maCookie && !dekodovanaCesta.startsWith('/prihlásenie')) {
    url.pathname = encodeURI('/prihlásenie');
    return NextResponse.redirect(url);
  }

  // 2. Ak je prihlásený a pokúša sa ísť znova na login, hodíme ho na dashboard
  if (maCookie && dekodovanaCesta.startsWith('/prihlásenie')) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
