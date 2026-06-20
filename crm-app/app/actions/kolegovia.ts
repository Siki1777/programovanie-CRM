"use server";

import bcryptjs from "bcryptjs";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";

export type KolegaState = { error?: string; success?: boolean };
export type HesloState  = { error?: string; success?: boolean };

const VALID_KANALY = ["whatsapp", "email", "google_kalendar"] as const;

export async function pridajKolegu(
  _prev: KolegaState,
  formData: FormData
): Promise<KolegaState> {
  const meno       = (formData.get("meno")       as string)?.trim();
  const priezvisko = (formData.get("priezvisko") as string)?.trim();
  const email      = (formData.get("email")      as string)?.trim();
  const telefon    = (formData.get("telefon")    as string)?.trim() || null;
  const kanal      = (formData.get("kanal")      as string)?.trim() || "email";

  if (!meno || !priezvisko)
    return { error: "Meno a priezvisko sú povinné." };
  if (!email || !email.includes("@"))
    return { error: "Zadaj platný e-mail." };
  if (!VALID_KANALY.includes(kanal as (typeof VALID_KANALY)[number]))
    return { error: "Neplatný notifikačný kanál." };

  const existuje = await sql`SELECT id FROM kolega WHERE email = ${email} LIMIT 1`;
  if (existuje.length > 0)
    return { error: `Kolega s e-mailom ${email} už existuje.` };

  await sql`
    INSERT INTO kolega (meno, priezvisko, telefon, email, "notifikacnyKanal")
    VALUES (${meno}, ${priezvisko}, ${telefon}, ${email}, ${kanal})
  `;

  revalidatePath("/nastavenia");
  return { success: true };
}

export type UpravitState = { error?: string; success?: boolean };

export async function upravKolegu(
  _prev: UpravitState,
  formData: FormData
): Promise<UpravitState> {
  const session = await getSession();
  if (!session?.vidiFinancie) return { error: "Nemáš oprávnenie." };

  const kolegaId    = (formData.get("kolegaId")    as string)?.trim();
  const meno        = (formData.get("meno")        as string)?.trim();
  const priezvisko  = (formData.get("priezvisko")  as string)?.trim();
  const email       = (formData.get("email")       as string)?.trim().toLowerCase();
  const telefon     = (formData.get("telefon")     as string)?.trim() || null;
  const googleEmail = (formData.get("googleEmail") as string)?.trim().toLowerCase() || null;

  if (!kolegaId) return { error: "Chybajúce ID kolegu." };
  if (!meno || !priezvisko) return { error: "Meno a priezvisko sú povinné." };
  if (!email || !email.includes("@")) return { error: "Zadaj platný e-mail." };
  if (googleEmail && !googleEmail.includes("@")) return { error: "Zadaj platný Google e-mail." };

  const exists = await sql`SELECT id FROM kolega WHERE LOWER(email) = ${email} AND id != ${kolegaId} LIMIT 1`;
  if (exists.length > 0) return { error: `E-mail ${email} je už obsadený iným kolegom.` };

  await sql`
    UPDATE kolega
    SET meno = ${meno}, priezvisko = ${priezvisko}, email = ${email},
        telefon = ${telefon}, google_email = ${googleEmail}
    WHERE id = ${kolegaId}
  `;

  revalidatePath("/nastavenia");
  revalidatePath("/", "layout");
  return { success: true };
}

export type VymazatState = { error?: string; success?: boolean };

export async function vymazKolegu(
  _prev: VymazatState,
  formData: FormData
): Promise<VymazatState> {
  const session = await getSession();
  if (!session?.vidiFinancie) return { error: "Nemáš oprávnenie." };

  const kolegaId = (formData.get("kolegaId") as string)?.trim();
  if (!kolegaId) return { error: "Chybajúce ID kolegu." };
  if (session.kolegaId === kolegaId) return { error: "Nemôžeš vymazať sám seba." };

  const pocet = await sql<{ cnt: string }[]>`SELECT COUNT(*) AS cnt FROM kolega`;
  if (Number(pocet[0]?.cnt ?? 0) <= 1)
    return { error: "Nemôžeš vymazať posledného člena tímu." };

  await sql`DELETE FROM kolega WHERE id = ${kolegaId}`;

  revalidatePath("/nastavenia");
  return { success: true };
}

export async function nastavKanal(kolegaId: string, kanal: string): Promise<void> {
  if (!VALID_KANALY.includes(kanal as (typeof VALID_KANALY)[number])) return;
  await sql`UPDATE kolega SET "notifikacnyKanal" = ${kanal} WHERE id = ${kolegaId}`;
  revalidatePath("/nastavenia");
}

export async function nastavHeslo(
  _prev: HesloState,
  formData: FormData
): Promise<HesloState> {
  const session = await getSession();
  if (!session?.vidiFinancie) return { error: "Nemáš oprávnenie meniť heslá." };

  const kolegaId = (formData.get("kolegaId") as string)?.trim();
  const heslo    = (formData.get("heslo")    as string) ?? "";
  const potvrdit = (formData.get("potvrdit") as string) ?? "";

  if (!kolegaId) return { error: "Chybajúce ID kolegu." };
  if (heslo.length < 8) return { error: "Heslo musí mať aspoň 8 znakov." };
  if (heslo !== potvrdit) return { error: "Heslá sa nezhodujú." };

  const hash = await bcryptjs.hash(heslo, 12);
  await sql`UPDATE kolega SET heslo = ${hash} WHERE id = ${kolegaId}`;

  revalidatePath("/nastavenia");
  return { success: true };
}
