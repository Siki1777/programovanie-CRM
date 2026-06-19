import { type NextRequest, NextResponse } from "next/server";

const VEREJNE   = ["/login"];
const FINANCNE  = ["/cenove-ponuky", "/naklady", "/reporty"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Verejné cesty – vždy voľný prechod ────────────────────────────────
  if (VEREJNE.some((p) => pathname.startsWith(p)))
    return NextResponse.next();

  // ── Autentifikácia – vyžaduje sa pre všetky ostatné cesty ─────────────
  const kolegaId = request.cookies.get("crm_kolega_id")?.value;
  if (!kolegaId) {
    const loginUrl = new URL("/login", request.url);
    // Zapamätaj pôvodnú cestu, aby sme po prihlásení mohli presmerovať späť
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Finančné stránky – vyžaduje sa dodatočné oprávnenie ───────────────
  if (FINANCNE.some((p) => pathname.startsWith(p))) {
    if (request.cookies.get("crm_fin")?.value !== "1")
      return NextResponse.redirect(new URL("/pristup-odmietnuiy", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Ochráni všetky cesty okrem: Next.js interných, statických súborov, nahratých fotiek
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|uploads/).*)"],
};
