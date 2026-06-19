import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const maCookie = request.cookies.has('crm_kolega_id');

  // Ak ide o systémové súbory, API alebo obrázky, neriešime
  if (
    request.nextUrl.pathname.startsWith('/_next') || 
    request.nextUrl.pathname.includes('.') ||
    request.nextUrl.pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  // Ak NIE JE prihlásený, pustíme ho LEN na prihlasovaciu stránku
  // Kontrolujeme iba čistý výskyt textu, aby sme obišli kódovanie diakritiky
  const naLogine = request.nextUrl.pathname.includes('prihlas') || request.nextUrl.pathname.includes('prihl%C3%A1s');
  
  if (!maCookie && !naLogine) {
    // Ak nie je prihlásený a ide inde, hodíme ho na login
    return NextResponse.redirect(new URL('/prihlásenie', request.url));
  }

  if (maCookie && naLogine) {
    // Ak je prihlásený a ide na login, hodíme ho na dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
