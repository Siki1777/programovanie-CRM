"use server";
import { sql } from "@/lib/db";
import { redirect } from "next/navigation";

export async function prihlasit(_prev: any, formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  
  try {
    const rows = await sql`SELECT id, email FROM kolega WHERE LOWER(email) = ${email} LIMIT 1`;
    if (rows.length === 0) {
      return { error: "DEBUG: E-mail '" + email + "' nebol v databáze nájdený." };
    }
    return { error: "DEBUG: E-mail nájdený! ID je: " + rows[0].id };
  } catch (e) {
    return { error: "DEBUG: Chyba spojenia: " + String(e) };
  }
}
