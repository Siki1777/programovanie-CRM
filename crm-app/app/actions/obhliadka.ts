"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  vytvorKalendarEvent,
  aktualizujKalendarEvent,
  vymazKalendarEvent,
  isGoogleCalendarConfigured,
} from "@/lib/googleCalendar";

export type ObhliadkaState = {
  error?:          string;
  success?:        boolean;
  calendarSynced?: boolean;
};

// ── Uložiť / aktualizovať plán obhliadky ────────────────────────────
export async function ulozPlanObhliadky(
  _prev: ObhliadkaState,
  formData: FormData
): Promise<ObhliadkaState> {
  const zakazkaId = (formData.get("zakazkaId") as string)?.trim();
  const technikId = (formData.get("technikId") as string)?.trim();
  const datumStr  = (formData.get("datum")     as string)?.trim();

  if (!zakazkaId) return { error: "Chýba ID zákazky." };
  if (!technikId) return { error: "Vyber technika." };
  if (!datumStr)  return { error: "Zadaj dátum a čas obhliadky." };

  // Načítaj zákazku + techniku paralelne
  const [zakazkaRows, technikRows] = await Promise.all([
    sql<{
      cislo: string;
      meno: string;
      priezvisko: string;
      calendar_event_id: string | null;
    }[]>`
      SELECT z.cislo, zk.meno, zk.priezvisko, z.calendar_event_id
      FROM   zakazka z
      JOIN   zakaznik zk ON z."zakaznikId" = zk.id
      WHERE  z.id = ${zakazkaId}
    `,
    sql<{ id: string; google_email: string | null }[]>`
      SELECT id, google_email FROM kolega WHERE id = ${technikId} LIMIT 1
    `,
  ]);

  const zakazka = zakazkaRows[0];
  const technik = technikRows[0];

  if (!zakazka) return { error: "Zákazka nenájdená." };
  if (!technik) return { error: "Technik nenájdený." };

  // Ulož do DB – datum interpretuj ako Slovakia čas (AT TIME ZONE)
  await sql`
    UPDATE zakazka
    SET datum_obhliadky   = (${datumStr}::timestamp AT TIME ZONE 'Europe/Bratislava'),
        technik_id         = ${technikId},
        "updatedAt"        = NOW()
    WHERE id = ${zakazkaId}
  `;

  // Načítaj uložený dátum z DB (UTC) pre Google Kalendár
  const [saved] = await sql<{ datum_obhliadky: Date }[]>`
    SELECT datum_obhliadky FROM zakazka WHERE id = ${zakazkaId}
  `;

  // ── Google Kalendár ──────────────────────────────────────────────
  let calendarSynced = false;
  const eventData = {
    cisloZakazky:   zakazka.cislo,
    menoZakaznika:  `${zakazka.meno} ${zakazka.priezvisko}`,
    zakazkaId,
    datumObhliadky: saved.datum_obhliadky,
    technikEmail:   technik.google_email ?? undefined,
  };

  let newEventId: string | null = zakazka.calendar_event_id;

  if (isGoogleCalendarConfigured()) {
    if (zakazka.calendar_event_id) {
      newEventId = await aktualizujKalendarEvent(zakazka.calendar_event_id, eventData);
    } else {
      newEventId = await vytvorKalendarEvent(eventData);
    }
    calendarSynced = newEventId !== null;

    // Ulož event ID (mohlo sa zmeniť ak bola udalosť externe zmazaná)
    if (newEventId !== zakazka.calendar_event_id) {
      await sql`
        UPDATE zakazka SET calendar_event_id = ${newEventId} WHERE id = ${zakazkaId}
      `;
    }
  }

  revalidatePath(`/zakazky/${zakazkaId}`);
  return { success: true, calendarSynced };
}

// ── Zrušiť plán obhliadky ────────────────────────────────────────────
export async function zrusObhliadku(
  _prev: ObhliadkaState,
  formData: FormData
): Promise<ObhliadkaState> {
  const zakazkaId = (formData.get("zakazkaId") as string)?.trim();
  if (!zakazkaId) return { error: "Chýba ID zákazky." };

  const [row] = await sql<{ calendar_event_id: string | null }[]>`
    SELECT calendar_event_id FROM zakazka WHERE id = ${zakazkaId}
  `;

  if (row?.calendar_event_id) {
    await vymazKalendarEvent(row.calendar_event_id);
  }

  await sql`
    UPDATE zakazka
    SET datum_obhliadky   = NULL,
        technik_id         = NULL,
        calendar_event_id  = NULL,
        "updatedAt"        = NOW()
    WHERE id = ${zakazkaId}
  `;

  revalidatePath(`/zakazky/${zakazkaId}`);
  return { success: true };
}
