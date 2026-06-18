"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type NakladState = { error?: string; success?: boolean };

export async function pridajNaklad(
  _prev: NakladState,
  formData: FormData
): Promise<NakladState> {
  const zakazkaId = (formData.get("zakazkaId") as string)?.trim();
  const sumaRaw  = (formData.get("suma") as string)?.replace(",", ".").trim();
  const kategoria = (formData.get("kategoria") as string)?.trim();
  const popis    = (formData.get("popis") as string)?.trim() || null;

  if (!zakazkaId) return { error: "Vyber zákazku." };

  const suma = Number(sumaRaw);
  if (!sumaRaw || isNaN(suma) || suma <= 0)
    return { error: "Zadaj platnú sumu (kladné číslo)." };

  const validKat = ["MATERIAL", "DOPRAVA", "PRACA", "INY"];
  if (!validKat.includes(kategoria))
    return { error: "Vyber kategóriu nákladu." };

  await sql`
    INSERT INTO naklad ("zakazkaId", suma, kategoria, popis)
    VALUES (${zakazkaId}, ${suma}, ${kategoria}, ${popis})
  `;

  revalidatePath("/naklady");
  revalidatePath("/dashboard");
  revalidatePath(`/zakazky/${zakazkaId}`);
  return { success: true };
}
