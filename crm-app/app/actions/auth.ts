"use server";

import bcryptjs from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { log } from "console";

export type LoginState = { error?: string };

export async function prihlasit(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const heslo = (formData.get("heslo") as string) ?? "";

  if (!email || !heslo) return { error: "Zadaj e-mail aj heslo." };

  const rows = await sql<{ id: string; heslo: string | null; vidi_financie: boolean }[]>`
    SELECT id, heslo, vidi_financie 
    FROM kolega 
    WHERE LOWER(email) = ${email} 
    LIMIT 1
  `;

  if (rows.length === 0 || !rows[0].heslo) return { error: "Nesprávny e-mail alebo heslo." };

  const kolega = rows[0];
  // Password check (with type safety)
  if (kolega.heslo != null) {
    console.log("Db: " + kolega.heslo + " Input: " + heslo);
    const spravne = await bcryptjs.compare(heslo, kolega.heslo);
    if (!spravne) return { error: "Nesprávny e-mail alebo heslo." };
  }
  
  const cookieStore = await cookies();
  const opts = { httpOnly: true, path: "/", sameSite: "lax" as const, maxAge: 60 * 60 * 24 * 30 };
  
  cookieStore.set("crm_kolega_id", kolega.id, opts);
  cookieStore.set("crm_fin", kolega.vidi_financie ? "1" : "0", opts);

  redirect("/dashboard");
}

export async function odhlasit(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("crm_kolega_id");
  cookieStore.delete("crm_fin");
  redirect("/login");
}
