"use server";
import { sql } from "@/lib/db";

export async function prihlasit(_prev: any, formData: FormData) {
  try {
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    // Skúsime nájsť presne tohto používateľa
    const rows = await sql`SELECT email, heslo FROM kolega WHERE email = ${email}`;
    
    if (rows.length === 0) {
      return { error: "DEBUG: Používateľ s týmto e-mailom v DB neexistuje." };
    }
    
    return { error: "DEBUG: Používateľ nájdený! Hash v DB začína na: " + rows[0].heslo.substring(0, 7) };
  } catch (e: any) {
    return { error: "DEBUG: CHYBA PRIPOJENIA: " + e.message };
  }
}
