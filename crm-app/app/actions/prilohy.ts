"use server";

import { del } from "@vercel/blob";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export type PrilohaState = { error?: string; success?: boolean };

const POVOLENE_TYPY = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
]);

export async function ulozPrilohuMetadata(
  zakazkaId: string,
  nazov: string,
  url: string,
  velkost: number,
  mimeTyp: string
): Promise<PrilohaState> {
  if (!zakazkaId || !url) return { error: "Chýbajúce parametre." };
  if (!POVOLENE_TYPY.has(mimeTyp)) return { error: `Nepodporovaný formát (${mimeTyp}).` };
  if (velkost > 25 * 1024 * 1024) return { error: "Súbor je príliš veľký (max 25 MB)." };

  await sql`
    INSERT INTO priloha ("zakazkaId", nazov, url, velkost, mime_typ)
    VALUES (${zakazkaId}, ${nazov}, ${url}, ${velkost}, ${mimeTyp})
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
