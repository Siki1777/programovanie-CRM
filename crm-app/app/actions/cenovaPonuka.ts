"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type CenovaPonukaState = { error?: string; success?: boolean };

// ── Vytvor nový návrh cenovej ponuky ────────────────────────────────
export async function vytvorCenovuPonuku(
  _prev: CenovaPonukaState,
  formData: FormData
): Promise<CenovaPonukaState> {
  const zakazkaId   = (formData.get("zakazkaId")      as string)?.trim();
  const zariadRaw   = (formData.get("cenaZariadenie") as string)?.replace(",", ".").trim();
  const materialRaw = (formData.get("cenaMaterial")   as string)?.replace(",", ".").trim();
  const marzaRaw    = (formData.get("marza")          as string)?.replace(",", ".").trim() || "1000";

  if (!zakazkaId) return { error: "Chýba ID zákazky." };

  const cenaZariadenie = Number(zariadRaw);
  const cenaMaterial   = Number(materialRaw);
  const marza          = Number(marzaRaw);

  if (!zariadRaw || isNaN(cenaZariadenie) || cenaZariadenie < 0)
    return { error: "Zadaj platnú cenu zariadenia." };
  if (!materialRaw || isNaN(cenaMaterial) || cenaMaterial < 0)
    return { error: "Zadaj platnú cenu materiálu." };
  if (isNaN(marza) || marza < 0)
    return { error: "Zadaj platnú maržu." };

  const zaklad      = cenaZariadenie + cenaMaterial + marza;
  const celkovaCena = +(zaklad * 1.23).toFixed(2);

  const [maxRow] = await sql<{ max_v: number | null }[]>`
    SELECT MAX(verzia) AS max_v FROM cenova_ponuka WHERE "zakazkaId" = ${zakazkaId}
  `;
  const verzia = (maxRow?.max_v ?? 0) + 1;

  await sql`
    INSERT INTO cenova_ponuka
      ("zakazkaId", verzia, "cenaZariadenie", "cenaMaterial", marza, dph, "celkovaCena", schvalena)
    VALUES
      (${zakazkaId}, ${verzia}, ${cenaZariadenie}, ${cenaMaterial}, ${marza}, 0.23, ${celkovaCena}, FALSE)
  `;

  // Ak je zákazka ešte v úvodnej fáze, posuň na CENOVA_PONUKA
  await sql`
    UPDATE zakazka SET faza = 'CENOVA_PONUKA', "updatedAt" = NOW()
    WHERE id = ${zakazkaId} AND faza IN ('DOPYT', 'OBHLIADKA')
  `;

  revalidatePath(`/zakazky/${zakazkaId}`);
  revalidatePath("/zakazky");
  revalidatePath("/dashboard");
  return { success: true };
}

// ── Zákazník schválil ponuku ─────────────────────────────────────────
export async function schvalCenovuPonuku(
  ponukaId: string,
  zakazkaId: string
): Promise<void> {
  // Zruš schválenie všetkých verzií tejto zákazky, potom schváľ vybranú
  await sql`
    UPDATE cenova_ponuka SET schvalena = FALSE WHERE "zakazkaId" = ${zakazkaId}
  `;
  await sql`
    UPDATE cenova_ponuka SET schvalena = TRUE WHERE id = ${ponukaId}
  `;
  // Posuň zákazku na SCHVALENIE_PLAN (iba ak nie je ešte ďalej)
  await sql`
    UPDATE zakazka SET faza = 'SCHVALENIE_PLAN', "updatedAt" = NOW()
    WHERE id = ${zakazkaId}
      AND faza IN ('DOPYT', 'OBHLIADKA', 'CENOVA_PONUKA')
  `;
  revalidatePath(`/zakazky/${zakazkaId}`);
  revalidatePath("/zakazky");
  revalidatePath("/dashboard");
}

// ── Zmaž neschválený návrh ──────────────────────────────────────────
export async function vymazCenovuPonuku(
  ponukaId: string,
  zakazkaId: string
): Promise<void> {
  await sql`
    DELETE FROM cenova_ponuka WHERE id = ${ponukaId} AND schvalena = FALSE
  `;
  revalidatePath(`/zakazky/${zakazkaId}`);
}
