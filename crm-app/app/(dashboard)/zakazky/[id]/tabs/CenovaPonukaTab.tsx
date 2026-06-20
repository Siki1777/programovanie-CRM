import { sql } from "@/lib/db";
import { formatMena } from "@/lib/formatters";
import type { ZakazkaRow, NakladRow } from "../types";
import { CenovaPonukaKlient, type CenovaPonukaRow } from "../CenovaPonukaKlient";
import { PrilohaUpload, type PrilohaRow } from "../PrilohaUpload";

const KATEGORIE: Record<string, { label: string; farba: string }> = {
  MATERIAL: { label: "Materiál",  farba: "bg-blue-100 text-blue-700"   },
  DOPRAVA:  { label: "Doprava",   farba: "bg-yellow-100 text-yellow-700" },
  PRACA:    { label: "Práca",     farba: "bg-purple-100 text-purple-700" },
  INY:      { label: "Iný",       farba: "bg-gray-100 text-gray-600"   },
};

export async function CenovaPonukaTab({
  zakazka,
  naklady,
}: {
  zakazka: ZakazkaRow;
  naklady: NakladRow[];
}) {
  const [ponuky, prilohy] = await Promise.all([
    sql<CenovaPonukaRow[]>`
      SELECT id, verzia,
             "cenaZariadenie"::text AS "cenaZariadenie",
             "cenaMaterial"::text   AS "cenaMaterial",
             marza::text            AS marza,
             "celkovaCena"::text    AS "celkovaCena",
             schvalena,
             "createdAt"
      FROM   cenova_ponuka
      WHERE  "zakazkaId" = ${zakazka.id}
      ORDER  BY verzia DESC
    `.catch(() => [] as CenovaPonukaRow[]),
    sql<PrilohaRow[]>`
      SELECT id, nazov, url, velkost,
             mime_typ AS "mimeTyp",
             "createdAt"
      FROM   priloha
      WHERE  "zakazkaId" = ${zakazka.id}
      ORDER  BY "createdAt" DESC
    `.catch(() => [] as PrilohaRow[]),
  ]);

  const schvalena = ponuky.find((p) => p.schvalena);
  const celkovaCena = schvalena ? Number(schvalena.celkovaCena) : null;

  const celkoveNaklady = naklady.reduce((s, n) => s + Number(n.suma), 0);
  const cistyZisk = celkovaCena !== null ? celkovaCena - celkoveNaklady : null;

  return (
    <div className="space-y-4">

      {/* ── Tvorba a správa ponúk (klientský komponent) ─────────────── */}
      <CenovaPonukaKlient zakazkaId={zakazka.id} ponuky={ponuky} />

      {/* ── Evidencia nákladov ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <h2 className="text-lg font-bold text-gray-800">🧾 Evidencia nákladov</h2>
          <span className="text-base font-bold text-gray-700">{formatMena(celkoveNaklady)}</span>
        </div>

        {naklady.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">
            Žiadne náklady. Zadaj ich v záložke Realizácia.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {naklady.map((n) => {
              const kat = KATEGORIE[n.kategoria] ?? { label: n.kategoria, farba: "bg-gray-100 text-gray-600" };
              return (
                <div key={n.id} className="flex items-center gap-3 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${kat.farba}`}>
                    {kat.label}
                  </span>
                  <span className="flex-1 text-sm text-gray-700">{n.popis ?? "—"}</span>
                  <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                    {formatMena(n.suma)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Čistý zisk (iba ak je schválená ponuka) ─────────────────── */}
      {/* ── Priložené súbory ─────────────────────────────────────── */}
      <PrilohaUpload zakazkaId={zakazka.id} prilohy={prilohy} />

      {cistyZisk !== null && (
        <div className={`rounded-2xl p-5 border ${
          cistyZisk >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">Čistý zisk</p>
              <p className="text-xs text-gray-400">Schválená cena − Celkové náklady</p>
            </div>
            <p className={`text-3xl font-bold ${
              cistyZisk >= 0 ? "text-green-700" : "text-red-600"
            }`}>
              {formatMena(cistyZisk)}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
