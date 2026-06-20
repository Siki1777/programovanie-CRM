/**
 * Google Calendar integrácia cez OAuth 2.0 Refresh Token.
 * Nevyžaduje service account JSON kľúč — stačí jednorazový setup cez OAuth Playground.
 * Žiadne externé balíčky — iba Node.js fetch.
 *
 * Prerekvizity (.env):
 *   GOOGLE_CLIENT_ID      – OAuth 2.0 Client ID z Google Cloud Console
 *   GOOGLE_CLIENT_SECRET  – OAuth 2.0 Client Secret
 *   GOOGLE_REFRESH_TOKEN  – vygenerovaný cez OAuth Playground (jednorazovo)
 *   GOOGLE_CALENDAR_ID    – "primary" alebo ID firemného zdieľaného kalendára
 *   NEXT_PUBLIC_APP_URL   – napr. https://crm.domterm.sk
 */

const TIMEZONE    = "Europe/Bratislava";
const DURATION_MS = 2 * 60 * 60 * 1000; // 2 hodiny

// ── Token cache (platný 55 minút z 60) ──────────────────────────────
let tokenCache: { token: string; expiry: number } | null = null;

export function isGoogleCalendarConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN &&
    process.env.GOOGLE_CALENDAR_ID
  );
}

async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiry) return tokenCache.token;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type:    "refresh_token",
    }),
  });

  if (!res.ok) throw new Error(`Google OAuth chyba: ${await res.text()}`);
  const data = (await res.json()) as { access_token: string };
  tokenCache = { token: data.access_token, expiry: Date.now() + 55 * 60 * 1000 };
  return data.access_token;
}

function calUrl(eventId?: string): string {
  const calId = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID!);
  const base  = `https://www.googleapis.com/calendar/v3/calendars/${calId}/events`;
  return eventId ? `${base}/${encodeURIComponent(eventId)}` : base;
}

export type KalendarEventInput = {
  cisloZakazky:   string;
  menoZakaznika:  string;
  zakazkaId:      string;
  datumObhliadky: Date;
  technikEmail?:  string;
};

function buildEventBody(data: KalendarEventInput) {
  const start = new Date(data.datumObhliadky);
  const end   = new Date(start.getTime() + DURATION_MS);
  const url   = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://crm.domterm.sk"}/zakazky/${data.zakazkaId}`;

  return {
    summary:     `🔍 Obhliadka – ${data.cisloZakazky} – ${data.menoZakaznika}`,
    description: `Detail zákazky v CRM:\n${url}`,
    start: { dateTime: start.toISOString(), timeZone: TIMEZONE },
    end:   { dateTime: end.toISOString(),   timeZone: TIMEZONE },
    attendees:   data.technikEmail ? [{ email: data.technikEmail }] : [],
    sendUpdates: "all",
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 1440 }, // deň pred
        { method: "popup", minutes: 60  },  // hodinu pred
      ],
    },
  };
}

/** Vytvorí novú udalosť. Vráti eventId alebo null (ak nie je nakonfigurované / chyba). */
export async function vytvorKalendarEvent(data: KalendarEventInput): Promise<string | null> {
  if (!isGoogleCalendarConfigured()) return null;
  try {
    const token = await getAccessToken();
    const res = await fetch(`${calUrl()}?sendUpdates=all`, {
      method:  "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body:    JSON.stringify(buildEventBody(data)),
    });
    if (!res.ok) { console.error("Calendar CREATE chyba:", await res.text()); return null; }
    const created = (await res.json()) as { id: string };
    return created.id;
  } catch (err) {
    console.error("Calendar CREATE exception:", err);
    return null;
  }
}

/** Aktualizuje existujúcu udalosť. Technik dostane notifikáciu o zmene. Pri 404 vytvorí novú. */
export async function aktualizujKalendarEvent(
  eventId: string,
  data: KalendarEventInput
): Promise<string | null> {
  if (!isGoogleCalendarConfigured()) return null;
  try {
    const token = await getAccessToken();
    const res = await fetch(`${calUrl(eventId)}?sendUpdates=all`, {
      method:  "PUT",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body:    JSON.stringify(buildEventBody(data)),
    });
    if (res.status === 404) return vytvorKalendarEvent(data);
    if (!res.ok) { console.error("Calendar UPDATE chyba:", await res.text()); return null; }
    return eventId;
  } catch (err) {
    console.error("Calendar UPDATE exception:", err);
    return null;
  }
}

/** Zmaže udalosť z kalendára. Chyby sú tiché. */
export async function vymazKalendarEvent(eventId: string): Promise<void> {
  if (!isGoogleCalendarConfigured() || !eventId) return;
  try {
    const token = await getAccessToken();
    await fetch(`${calUrl(eventId)}?sendUpdates=all`, {
      method:  "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error("Calendar DELETE exception:", err);
  }
}
