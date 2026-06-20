"use server";

import { put, del } from "@vercel/blob";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type PrilohaState = { error?: string; success?: boolean };

const POVOLENE_TYPY: Record<string, boolean> = {
  "application/pdf": true,
  "application/msword": true,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
  "application/vnd.ms-excel": true,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": true,
  "application/vnd.ms-powerpoint": true,
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": true,
  "image/jpeg": true,
  "image/png": true,
  "image/webp": true,
  "text/plain": true,
};

const MAX_VELKOST = 25 * 1024 * 1024; // 25 MB

export async function nahrajPrilohu(
  _prev: PrilohaState,
  formData: FormData
): Promise<PrilohaState> {
  const file      = formData.get("file")      as File | null;
  const zakazkaId = (formData.get("zakazkaId") as string)?.trim();

  if (!file || !zakazkaId) return { error: "Chýbajúce parametre." };
  if (file.size === 0)     return { error: "Súbor je prázdny." };
  if (file.size > MAX_VELKOST) return { error: "Súbor je príliš veľký (max 25 MB)." };
  if (!POVOLENE_TYPY[file.type])
    return { error: `Nepodporovaný formát súboru (${file.type}).` };

  // Sanitizovaný názov: zachová pôvodné meno, odstráni nebezpečné znaky
  const safeName = file.name
    .replace(/[^a-zA-Z0-9._\-À-ɏ]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 100);

  const blob = await put(
    `crm/zakazky/${zakazkaId}/${Date.now()}-${safeName}`,
    file,
    { access: "public", contentType: file.type }
  );

  await sql`
    INSERT INTO priloha ("zakazkaId", nazov, url, velkost, mime_typ)
    VALUES (${zakazkaId}, ${file.name}, ${blob.url}, ${file.size}, ${file.type})
  `;

  revalidatePath(`/zakazky/${zakazkaId}`);
  return { success: true };
}

export async function vymazPrilohu(
  prilohaId: string,
  blobUrl: string,
  zakazkaId: string
): Promise<void> {
  await del(blobUrl);
  await sql`DELETE FROM priloha WHERE id = ${prilohaId}`;
  revalidatePath(`/zakazky/${zakazkaId}`);
}
