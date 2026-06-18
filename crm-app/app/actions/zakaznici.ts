"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ZakaznikState = { error?: string };

export async function vytvorZakaznika(
  _prev: ZakaznikState,
  formData: FormData
): Promise<ZakaznikState> {
  const meno      = (formData.get("meno")      as string)?.trim();
  const priezvisko= (formData.get("priezvisko")as string)?.trim();
  const telefon   = (formData.get("telefon")   as string)?.trim();
  const email     = (formData.get("email")     as string)?.trim() || null;
  const adresa    = (formData.get("adresa")    as string)?.trim() || null;
  const poznamka  = (formData.get("poznamka")  as string)?.trim() || null;

  if (!meno || !priezvisko || !telefon)
    return { error: "Meno, priezvisko a telefón sú povinné." };

  // ID generuje PostgreSQL DEFAULT (gen_random_uuid()::text)
  await sql`
    INSERT INTO zakaznik (meno, priezvisko, telefon, email, adresa, poznamka)
    VALUES (${meno}, ${priezvisko}, ${telefon}, ${email}, ${adresa}, ${poznamka})
  `;

  revalidatePath("/zakaznici");
  redirect("/zakaznici");
}
