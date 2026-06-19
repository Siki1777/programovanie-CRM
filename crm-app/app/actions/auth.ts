"use server";

import { sql } from "@/lib/db";

export async function prihlasit(_prev: any, formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  
  // Zjednodušený dopyt na testovanie
  const rows = await sql`SELECT id FROM kolega WHERE LOWER(email) = ${email} LIMIT 1`;
  
  if (rows.length === 0) {
    return { error: "E-mail nenájdený." };
  }
  
  return { error: "Úspech: E-mail nájdený s ID " + rows[0].id };
}
