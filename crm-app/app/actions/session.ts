"use server";

import { cookies } from "next/headers";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

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
    revalidatePath("/", "layout");
  }
}
