"use server";

import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";

export type SablonaState = { error?: string; success?: boolean };

// ── Šablóny: vytvorenie ─────────────────────────────────────────────
export async function vytvorSablonu(
  _prev: SablonaState,
  formData: FormData
): Promise<SablonaState> {
  const session = await getSession();
  if (!session?.vidiFinancie) return { error: "Len admin môže spravovať šablóny." };

  const nazov = (formData.get("nazov") as string)?.trim();
  if (!nazov) return { error: "Názov šablóny je povinný." };

  const polozkyRaw = formData.get("polozky") as string;
  let polozky: string[];
  try {
    polozky = (JSON.parse(polozkyRaw) as string[]).filter((p) => p.trim());
  } catch {
    return { error: "Neplatný formát položiek." };
  }
  if (polozky.length === 0) return { error: "Šablóna musí mať aspoň jednu položku." };

  await sql`
    INSERT INTO checklist_template (id, nazov, polozky)
    VALUES (gen_random_uuid()::text, ${nazov}, ${JSON.stringify(polozky)}::jsonb)
  `;
  revalidatePath("/nastavenia");
  return { success: true };
}

// ── Šablóny: úprava ─────────────────────────────────────────────────
export async function upravSablonu(
  _prev: SablonaState,
  formData: FormData
): Promise<SablonaState> {
  const session = await getSession();
  if (!session?.vidiFinancie) return { error: "Len admin môže spravovať šablóny." };

  const id = (formData.get("id") as string)?.trim();
  const nazov = (formData.get("nazov") as string)?.trim();
  if (!id || !nazov) return { error: "Chýbajú povinné polia." };

  const polozkyRaw = formData.get("polozky") as string;
  let polozky: string[];
  try {
    polozky = (JSON.parse(polozkyRaw) as string[]).filter((p) => p.trim());
  } catch {
    return { error: "Neplatný formát položiek." };
  }
  if (polozky.length === 0) return { error: "Šablóna musí mať aspoň jednu položku." };

  await sql`
    UPDATE checklist_template
    SET nazov = ${nazov}, polozky = ${JSON.stringify(polozky)}::jsonb
    WHERE id = ${id}
  `;
  revalidatePath("/nastavenia");
  return { success: true };
}

// ── Šablóny: vymazanie ──────────────────────────────────────────────
export async function vymazSablonu(id: string): Promise<void> {
  const session = await getSession();
  if (!session?.vidiFinancie || !id) return;
  await sql`DELETE FROM checklist_template WHERE id = ${id}`;
  revalidatePath("/nastavenia");
}

// ── Zákazka: aplikovanie šablóny (nahradí existujúci checklist) ─────
export async function aplikujSablonuNaZakazku(
  zakazkaId: string,
  sablonId: string
): Promise<void> {
  await sql`
    UPDATE zakazka
    SET "checklistObhliadka" = (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id',      gen_random_uuid()::text,
          'text',    value::text,
          'splnena', false
        )
      ), '[]'::jsonb)
      FROM jsonb_array_elements_text((
        SELECT polozky FROM checklist_template WHERE id = ${sablonId}
      ))
    )
    WHERE id = ${zakazkaId}
  `;
  revalidatePath(`/zakazky/${zakazkaId}`);
}

// ── Zákazka checklist: prepnutie položky ────────────────────────────
export async function togglePolozkuChecklistu(
  zakazkaId: string,
  polozkaId: string
): Promise<void> {
  await sql`
    UPDATE zakazka
    SET "checklistObhliadka" = (
      SELECT COALESCE(jsonb_agg(
        CASE
          WHEN elem->>'id' = ${polozkaId}
          THEN jsonb_set(elem, '{splnena}', to_jsonb(NOT (elem->>'splnena')::boolean))
          ELSE elem
        END
      ), '[]'::jsonb)
      FROM jsonb_array_elements("checklistObhliadka") elem
    )
    WHERE id = ${zakazkaId}
  `;
  revalidatePath(`/zakazky/${zakazkaId}`);
}

// ── Zákazka checklist: pridanie položky ─────────────────────────────
export async function pridajPolozkuChecklistu(
  zakazkaId: string,
  text: string
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;
  await sql`
    UPDATE zakazka
    SET "checklistObhliadka" = COALESCE("checklistObhliadka", '[]'::jsonb) ||
      jsonb_build_array(jsonb_build_object(
        'id',      gen_random_uuid()::text,
        'text',    ${trimmed},
        'splnena', false
      ))
    WHERE id = ${zakazkaId}
  `;
  revalidatePath(`/zakazky/${zakazkaId}`);
}

// ── Zákazka checklist: premenovanie položky ─────────────────────────
export async function upravPolozkuChecklistu(
  zakazkaId: string,
  polozkaId: string,
  text: string
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;
  await sql`
    UPDATE zakazka
    SET "checklistObhliadka" = (
      SELECT COALESCE(jsonb_agg(
        CASE
          WHEN elem->>'id' = ${polozkaId}
          THEN jsonb_set(elem, '{text}', to_jsonb(${trimmed}::text))
          ELSE elem
        END
      ), '[]'::jsonb)
      FROM jsonb_array_elements("checklistObhliadka") elem
    )
    WHERE id = ${zakazkaId}
  `;
  revalidatePath(`/zakazky/${zakazkaId}`);
}

// ── Zákazka checklist: vymazanie položky ────────────────────────────
export async function vymazPolozkuChecklistu(
  zakazkaId: string,
  polozkaId: string
): Promise<void> {
  await sql`
    UPDATE zakazka
    SET "checklistObhliadka" = (
      SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
      FROM jsonb_array_elements("checklistObhliadka") elem
      WHERE elem->>'id' != ${polozkaId}
    )
    WHERE id = ${zakazkaId}
  `;
  revalidatePath(`/zakazky/${zakazkaId}`);
}
