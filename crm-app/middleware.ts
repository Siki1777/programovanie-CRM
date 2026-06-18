import { type NextRequest, NextResponse } from "next/server";

const FINANCNE_CESTY = ["/cenove-ponuky", "/naklady", "/reporty"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const jeFinancna = FINANCNE_CESTY.some((p) => pathname.startsWith(p));
  if (!jeFinancna) return NextResponse.next();

  const fin = request.cookies.get("crm_fin")?.value;
  if (fin !== "1") {
    return NextResponse.redirect(
      new URL("/pristup-odmietnuiy", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cenove-ponuky/:path*", "/naklady/:path*", "/reporty/:path*"],
};
