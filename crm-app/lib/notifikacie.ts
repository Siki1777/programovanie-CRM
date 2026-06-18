// ══════════════════════════════════════════════════════════════════════════════
// NOTIFIKAČNÝ MODUL – CRM Inštalačná firma
// ══════════════════════════════════════════════════════════════════════════════
// Každý kanál (WhatsApp, Email, Google Kalendár) má vlastnú funkciu.
// Napoj externé API sem – Server Actions volajú len `odosliNotifikaciu()`.
// ══════════════════════════════════════════════════════════════════════════════

export type TypNotifikacie =
  | "PRIRADENIE_ULOHY"     // kolega dostane novú úlohu
  | "ZMENA_TERMINU"        // termín úlohy bol zmenený
  | "REVIZNA_UPOMIENKA"    // 1 mesiac pred revíziou zariadenia
  | "ZÁRUKA_KONCI";        // 1 mesiac pred koncom záruky

export interface NotifikaciaPayload {
  typ: TypNotifikacie;
  // Príjemca
  meno: string;
  email: string;
  telefon?: string | null;
  // Kontext
  cisloZakazky: string;
  nazovUlohy: string;
  sprava: string;          // ľudsky čitateľná správa (WhatsApp / Email body)
  datumTerminu?: string;   // ISO dátum pre Google Kalendár event
}

// ── 📱 WhatsApp ───────────────────────────────────────────────────────────────
async function sendWhatsApp(p: NotifikaciaPayload): Promise<void> {
  if (!p.telefon) return;

  // NAPOJENIE: Twilio WhatsApp API
  // const res = await fetch(
  //   `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
  //   {
  //     method: "POST",
  //     headers: {
  //       Authorization: `Basic ${btoa(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`)}`,
  //       "Content-Type": "application/x-www-form-urlencoded",
  //     },
  //     body: new URLSearchParams({
  //       From: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
  //       To: `whatsapp:${p.telefon}`,
  //       Body: p.sprava,
  //     }),
  //   }
  // );
  // if (!res.ok) throw new Error(`WhatsApp chyba: ${res.status}`);

  console.log(`[📱 WhatsApp → ${p.telefon}] ${p.sprava}`);
}

// ── 📧 Email ──────────────────────────────────────────────────────────────────
async function sendEmail(p: NotifikaciaPayload): Promise<void> {
  if (!p.email) return;

  // NAPOJENIE: Resend.com API
  // const res = await fetch("https://api.resend.com/emails", {
  //   method: "POST",
  //   headers: {
  //     Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({
  //     from: "CRM Firma <noreply@vasadomena.sk>",
  //     to: [p.email],
  //     subject: `[CRM ${p.cisloZakazky}] ${p.nazovUlohy}`,
  //     text: p.sprava,
  //   }),
  // });
  // if (!res.ok) throw new Error(`Email chyba: ${res.status}`);

  console.log(`[📧 Email → ${p.email}] ${p.nazovUlohy} | ${p.sprava}`);
}

// ── 📅 Google Kalendár ────────────────────────────────────────────────────────
async function addToGoogleCalendar(p: NotifikaciaPayload): Promise<void> {
  if (!p.datumTerminu) return;

  // NAPOJENIE: googleapis npm package
  // import { google } from "googleapis";
  // const auth = new google.auth.GoogleAuth({
  //   credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!),
  //   scopes: ["https://www.googleapis.com/auth/calendar"],
  // });
  // const calendar = google.calendar({ version: "v3", auth });
  // await calendar.events.insert({
  //   calendarId: p.email,   // alebo zdieľaný kalendár ID
  //   requestBody: {
  //     summary: `[${p.cisloZakazky}] ${p.nazovUlohy}`,
  //     description: p.sprava,
  //     start: { date: p.datumTerminu },
  //     end:   { date: p.datumTerminu },
  //   },
  // });

  console.log(`[📅 Google Kalendár → ${p.email}] ${p.nazovUlohy} (${p.datumTerminu})`);
}

// ══════════════════════════════════════════════════════════════════════════════
// Hlavná funkcia – volaná zo Server Actions
// Spúšťa všetky kanály paralelne; chyba jedného kanálu nezastaví ostatné.
// ══════════════════════════════════════════════════════════════════════════════
export async function odosliNotifikaciu(p: NotifikaciaPayload): Promise<void> {
  const vysledky = await Promise.allSettled([
    sendWhatsApp(p),
    sendEmail(p),
    addToGoogleCalendar(p),
  ]);

  for (const v of vysledky) {
    if (v.status === "rejected") {
      console.error("[NOTIFIKÁCIA chyba]", v.reason);
    }
  }
}
