import { sql } from "@/lib/db";
import { formatMena, formatDatum } from "@/lib/formatters";
import { PridatNakladForm } from "./PridatNakladForm";

export const dynamic = "force-dynamic";

const KAT: Record<string, { label: string; farba: string }> = {
  MATERIAL: { label: "Materiál",  farba: "bg-blue-100 text-blue-700" },
  DOPRAVA:  { label: "Doprava",   farba: "bg-yellow-100 text-yellow-700" },
  PRACA:    { label: "Práca",     farba: "bg-purple-100 text-purple-700" },
  INY:      { label: "Iné",       farba: "bg-gray-100 text-gray-700" },
};

export default async function NakladyPage({
  searchParams,
}: {
  searchParams: Promise<{ od?: string; do?: string; kat?: string }>;
}) {
  const sp    = await searchParams;
  const od    = sp.od  || "";
  const datDo = sp.do  || "";
  const kat   = sp.kat || "";

  const [zakazkyList, nakladyRaw, sumaRow] = await Promise.all([

    // Dropdown zákaziek
    sql<{ id: string; cislo: string; meno: string; priezvisko: string }[]>`
      SELECT z.id, z.cislo, zk.meno, zk.priezvisko
      FROM zakazka z
      JOIN zakaznik zk ON zk.id = z."zakaznikId"
      ORDER BY z."createdAt" DESC
    `,

    // Zoznam nákladov s filtrom
    sql<{
      id: string; zakazkaId: string; suma: string; kategoria: string;
      popis: string | null; createdAt: string;
      cislo: string; meno: string; priezvisko: string;
    }[]>`
      SELECT
        n.id, n."zakazkaId", n.suma::text, n.kategoria, n.popis, n."createdAt",
        z.cislo, zk.meno, zk.priezvisko
      FROM naklad n
      JOIN zakazka z ON z.id = n."zakazkaId"
      JOIN zakaznik zk ON zk.id = z."zakaznikId"
      WHERE TRUE
        ${od     ? sql`AND n."createdAt" >= ${od}::date`                              : sql``}
        ${datDo  ? sql`AND n."createdAt" <  (${datDo}::date + INTERVAL '1 day')`     : sql``}
        ${kat    ? sql`AND n.kategoria = ${kat}`                                      : sql``}
      ORDER BY n."createdAt" DESC
    `,

    // Sumár pre aktívny filter
    sql<{ celkom: string; pocet: string }[]>`
      SELECT
        COALESCE(SUM(n.suma), 0)::text AS celkom,
        COUNT(*)::text AS pocet
      FROM naklad n
      WHERE TRUE
        ${od     ? sql`AND n."createdAt" >= ${od}::date`                           : sql``}
        ${datDo  ? sql`AND n."createdAt" <  (${datDo}::date + INTERVAL '1 day')`  : sql``}
        ${kat    ? sql`AND n.kategoria = ${kat}`                                   : sql``}
    `,
  ]);

  const celkom = Number(sumaRow[0]?.celkom ?? 0);
  const pocet  = Number(sumaRow[0]?.pocet  ?? 0);
  const filterActive = !!(od || datDo || kat);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Nadpis */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">🧾 Náklady</h1>
        {filterActive && (
          <a
            href="/naklady"
            className="text-sm text-blue-600 hover:underline"
          >
            × Zrušiť filter
          </a>
        )}
      </div>

      {/* Formulár – obrie tlačidlo na mobile */}
      <PridatNakladForm zakazky={zakazkyList} />

      {/* Sumár karty */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Celkové náklady",  hodnota: formatMena(celkom), farba: "border-red-400" },
          { label: "Počet položiek",   hodnota: String(pocet),       farba: "border-gray-400" },
          { label: filterActive ? "Filtrované" : "Všetky záznamy", hodnota: filterActive ? "Áno" : "Nie", farba: "border-blue-400" },
          { label: "Priemerný náklad", hodnota: pocet > 0 ? formatMena(celkom / pocet) : "—", farba: "border-orange-400" },
        ].map((k) => (
          <div key={k.label} className={`bg-white rounded-xl border-l-4 ${k.farba} border border-gray-200 p-4 shadow-sm`}>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{k.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{k.hodnota}</p>
          </div>
        ))}
      </div>

      {/* Filter panel (desktop) */}
      <form
        method="GET"
        action="/naklady"
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
      >
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          🔍 Filter
        </p>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Od dátumu</label>
            <input
              type="date"
              name="od"
              defaultValue={od}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Do dátumu</label>
            <input
              type="date"
              name="do"
              defaultValue={datDo}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Kategória</label>
            <select
              name="kat"
              defaultValue={kat}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="">Všetky</option>
              {Object.entries(KAT).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Použiť filter
          </button>
          {filterActive && (
            <a
              href="/naklady"
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:border-gray-400 transition-colors"
            >
              Zrušiť
            </a>
          )}
        </div>
      </form>

      {/* Zoznam – MOBILE karty */}
      <div className="md:hidden space-y-3">
        {nakladyRaw.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-400">
            <p className="text-4xl mb-2">🧾</p>
            <p className="text-sm">Žiadne náklady pre zvolený filter.</p>
          </div>
        ) : (
          nakladyRaw.map((n) => {
            const k = KAT[n.kategoria] ?? { label: n.kategoria, farba: "bg-gray-100 text-gray-600" };
            return (
              <div key={n.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${k.farba}`}>
                        {k.label}
                      </span>
                      <a href={`/zakazky/${n.zakazkaId}`} className="text-xs text-blue-600 font-mono hover:underline">
                        {n.cislo}
                      </a>
                    </div>
                    <p className="text-base font-semibold text-gray-800">
                      {n.meno} {n.priezvisko}
                    </p>
                    {n.popis && <p className="text-sm text-gray-500 mt-0.5">{n.popis}</p>}
                    <p className="text-xs text-gray-400 mt-1">{formatDatum(n.createdAt)}</p>
                  </div>
                  <p className="text-xl font-bold text-red-600 whitespace-nowrap flex-shrink-0">
                    {formatMena(n.suma)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tabuľka – DESKTOP */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {nakladyRaw.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-4xl mb-3">🧾</p>
            <p className="text-sm">Žiadne náklady pre zvolený filter.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-32">Dátum</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-28">Kategória</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-32">Zákazka</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Zákazník</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Popis</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 w-28">Suma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {nakladyRaw.map((n) => {
                const k = KAT[n.kategoria] ?? { label: n.kategoria, farba: "bg-gray-100 text-gray-600" };
                return (
                  <tr key={n.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {formatDatum(n.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${k.farba}`}>
                        {k.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`/zakazky/${n.zakazkaId}`} className="text-blue-600 font-mono text-xs hover:underline">
                        {n.cislo}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-gray-800 font-medium whitespace-nowrap">
                      {n.meno} {n.priezvisko}
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">
                      {n.popis ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-red-600 whitespace-nowrap">
                      {formatMena(n.suma)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td colSpan={5} className="px-4 py-3 font-semibold text-gray-700">
                  Spolu ({pocet} položiek)
                </td>
                <td className="px-4 py-3 text-right font-bold text-red-700 text-base">
                  {formatMena(celkom)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

    </div>
  );
}
