"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { odosliNotifikaciu } from "@/lib/notifikacie";

export type ActionState = { error?: string };

// ── Vytvorenie novej zákazky ────────────────────────────────────────────────
export async function vytvorZakazku(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const meno = (formData.get("meno") as string)?.trim();
  const priezvisko = (formData.get("priezvisko") as string)?.trim();
  const telefon = (formData.get("telefon") as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const adresa = (formData.get("adresa") as string)?.trim() || null;
  const technologia = formData.get("technologia") as string;
  const poznamka = (formData.get("poznamka") as string)?.trim() || null;

  if (!meno || !priezvisko || !telefon)
    return { error: "Meno, priezvisko a telefón sú povinné." };
  if (!technologia) return { error: "Vyber typ technológie." };

  const validTech = ["TEPELNE_CERPADLO", "KLIMATIZACIA", "KOMIN", "KRB", "FOTOVOLTIKA"];
  if (!validTech.includes(technologia)) return { error: "Neplatná technológia." };

  const [zakaznik] = await sql`
    INSERT INTO zakaznik (id, meno, priezvisko, telefon, email, adresa)
    VALUES (gen_random_uuid()::text, ${meno}, ${priezvisko}, ${telefon}, ${email}, ${adresa})
    RETURNING id
  `;

  const year = new Date().getFullYear();
  const prefix = `CRM-${year}-`;
  const [countRow] = await sql`
    SELECT COUNT(*) AS cnt FROM zakazka WHERE cislo LIKE ${prefix + "%"}
  `;
  const cislo = `${prefix}${String(Number(countRow.cnt) + 1).padStart(3, "0")}`;

  const [zakazka] = await sql`
    INSERT INTO zakazka (id, cislo, "zakaznikId", technologia, faza, poznamka)
    VALUES (gen_random_uuid()::text, ${cislo}, ${zakaznik.id}, ${technologia}, 'DOPYT', ${poznamka})
    RETURNING id
  `;

  redirect(`/zakazky?nova=${zakazka.id}`);
}

// ── Tab 4 + Kalendár: Prepnutie splnenia úlohy ──────────────────────────────
export async function toggleUloha(
  ulohaId: string,
  splnena: boolean,
  zakazkaId: string
): Promise<void> {
  await sql`UPDATE uloha SET splnena = ${splnena} WHERE id = ${ulohaId}`;
  revalidatePath(`/zakazky/${zakazkaId}`);
  revalidatePath("/kalendar");
  revalidatePath("/dashboard");
}

// ── Tab 4: Zmena zodpovedného kolegu + notifikácia ──────────────────────────
export async function zmenZodpovedneho(
  ulohaId: string,
  kolegaId: string,
  zakazkaId: string
): Promise<void> {
  const [[uloha], [kolega], [zakazka]] = await Promise.all([
    sql<{ nazov: string }[]>`SELECT nazov FROM uloha WHERE id = ${ulohaId}`,
    sql<{ meno: string; priezvisko: string; email: string; telefon: string | null }[]>`
      SELECT meno, priezvisko, email, telefon FROM kolega WHERE id = ${kolegaId}
    `,
    sql<{ cislo: string }[]>`SELECT cislo FROM zakazka WHERE id = ${zakazkaId}`,
  ]);

  await sql`UPDATE uloha SET "kolegaId" = ${kolegaId} WHERE id = ${ulohaId}`;

  // ── Notifikácia – reálne odoslanie cez lib/notifikacie.ts ─────────────────
  await odosliNotifikaciu({
    typ: "PRIRADENIE_ULOHY",
    meno: kolega.meno,
    email: kolega.email,
    telefon: kolega.telefon,
    cisloZakazky: zakazka.cislo,
    nazovUlohy: uloha.nazov,
    sprava:
      `Ahoj ${kolega.meno}, bol si určený ako zodpovedný za úlohu ` +
      `"${uloha.nazov}" pre zákazku ${zakazka.cislo}. ` +
      `Skontroluj si detaily v CRM.`,
    datumTerminu: undefined,
  });

  revalidatePath(`/zakazky/${zakazkaId}`);
  revalidatePath("/kalendar");
}

// ── Tab 5: Sériové číslo zariadenia ─────────────────────────────────────────
export async function ulozSerioveČíslo(
  zakazkaId: string,
  hodnota: string
): Promise<void> {
  await sql`
    UPDATE zakazka SET "serialoveCislo" = ${hodnota.trim() || null}
    WHERE id = ${zakazkaId}
  `;
  revalidatePath(`/zakazky/${zakazkaId}`);
}

// ── Tab 5: Digitálny podpis zákazníka ───────────────────────────────────────
export async function ulozPodpis(
  zakazkaId: string,
  dataUrl: string
): Promise<void> {
  await sql`
    UPDATE zakazka SET "podpisDataUrl" = ${dataUrl}
    WHERE id = ${zakazkaId}
  `;
  revalidatePath(`/zakazky/${zakazkaId}`);
}

// ── Tab 6: Dátum nasledujúcej revízie ───────────────────────────────────────
export async function nastavReviziu(formData: FormData): Promise<void> {
  const zakazkaId = formData.get("zakazkaId") as string;
  const datum = formData.get("datum") as string;
  if (!datum || !zakazkaId) return;
  await sql`
    UPDATE zakazka SET "nasledujucaRevizia" = ${datum}::date
    WHERE id = ${zakazkaId}
  `;
  revalidatePath(`/zakazky/${zakazkaId}`);
}
