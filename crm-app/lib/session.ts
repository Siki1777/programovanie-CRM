import { cookies } from "next/headers";
import { sql } from "./db";

export type Session = {
  kolegaId: string;
  meno: string;
  priezvisko: string;
  email: string;
  fotoUrl: string | null;
  vidiFinancie: boolean;
};

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const kolegaId = cookieStore.get("crm_kolega_id")?.value;
  if (!kolegaId) return null;

  const rows = await sql<Session[]>`
    SELECT
      id            AS "kolegaId",
      meno,
      priezvisko,
      email,
      foto_url      AS "fotoUrl",
      vidi_financie AS "vidiFinancie"
    FROM kolega
    WHERE id = ${kolegaId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}
