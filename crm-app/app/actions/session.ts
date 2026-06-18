"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";

export async function prihlasitSa(kolegaId: string): Promise<void> {
  const rows = await sql<{ id: string; vidi_financie: boolean }[]>`
    SELECT id, vidi_financie FROM kolega WHERE id = ${kolegaId} LIMIT 1
  `;
  if (!rows[0]) return;

  const cookieStore = await cookies();
  cookieStore.set("crm_kolega_id", kolegaId, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 dní
  });
  cookieStore.set("crm_fin", rows[0].vidi_financie ? "1" : "0", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/dashboard");
}

export async function nastavVidiFinancie(
  kolegaId: string,
  hodnota: boolean
): Promise<void> {
  await sql`UPDATE kolega SET vidi_financie = ${hodnota} WHERE id = ${kolegaId}`;

  // Ak je to aktuálny prihlásený kolega, obnov aj cookie
  const cookieStore = await cookies();
  if (cookieStore.get("crm_kolega_id")?.value === kolegaId) {
    cookieStore.set("crm_fin", hodnota ? "1" : "0", {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
}
