import { sql } from "@/lib/db";
import { formatMena, formatDatum } from "@/lib/formatters";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TECH: Record<string, { label: string; ikona: string }> = {
  TEPELNE_CERPADLO: { label: "Tepelné čerpadlo", ikona: "🌡️" },
  KLIMATIZACIA:     { label: "Klimatizácia",      ikona: "❄️" },
  KOMIN:            { label: "Komín",              ikona: "🏠" },
  KRB:              { label: "Krb / Vložka",       ikona: "🔥" },
  FOTOVOLTIKA:      { label: "Fotovoltika",         ikona: "☀️" },
};

export default async function CenovePonukyPage({
  searchParams,
}: {
  searchParams: Promise<{ stav?: string }>;
}) {
  const { stav } = await searchParams;
  const filter = stav === "schvalena" ? true : stav === "navrh" ? false : null;

  const ponuky = await sql<{
    id: string;
    zakazkaId: string;
    verzia: number;
    cenaZariadenie: string;
    cenaMaterial: string;
    marza: string;
    dph: string;
    celkovaCena: string;
    schvalena: boolean;
    createdAt: string;
    cislo: string;
    faza: string;
    technologia: string;
    meno: string;
    priezvisko: string;
    telefon: string;
  }[]>`
    SELECT
      cp.id,
      cp."zakazkaId",
      cp.verzia,
      cp."cenaZariadenie"::text,
      cp."cenaMaterial"::text,
      cp.marza::text,
      cp.dph::text,
      cp."celkovaCena"::text,
      cp.schvalena,
      cp."createdAt",
      z.cislo,
      z.faza,
      z.technologia,
      zk.meno,
      zk.priezvisko,
      zk.telefon
    FROM cenova_ponuka cp
    JOIN zakazka  z  ON z.id   = cp."zakazkaId"
    JOIN zakaznik zk ON zk.id  = z."zakaznikId"
    ${filter !== null ? sql`WHERE cp.schvalena = ${filter}` : sql``}
    ORDER BY cp."createdAt" DESC
  `;

  const celkovaSuma    = ponuky.reduce((s, p) => s + Number(p.celkovaCena), 0);
  const schvalenaSuma  = ponuky.filter((p) => p.schvalena)
                               .reduce((s, p) => s + Number(p.celkovaCena), 0);
  const pocetSchval    = ponuky.filter((p) => p.schvalena).length;
  const pocetNavrh     = ponuky.filter((p) => !p.schvalena).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Nadpis */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">💶 Cenové ponuky</h1>
          <p className="text-sm text-gray-400 mt-0.5">{ponuky.length} ponúk</p>
        </div>
      </div>

      {/* Súhrnné karty */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Všetky ponuky",    hodnota: String(ponuky.length),  farba: "border-gray-400" },
          { label: "Schválené",        hodnota: String(pocetSchval),    farba: "border-green-500" },
          { label: "Návrhy",           hodnota: String(pocetNavrh),     farba: "border-yellow-400" },
          { label: "Schválená hodnota", hodnota: formatMena(schvalenaSuma), farba: "border-blue-500" },
        ].map((k) => (
          <div key={k.label}
            className={`bg-white rounded-xl border-l-4 ${k.farba} border border-gray-200 p-4 shadow-sm`}
          >
            <p className="text-xs text-gray-500 uppercase tracking-wide">{k.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{k.hodnota}</p>
          </div>
        ))}
      </div>

      {/* Filter + vzorec */}
      <div className="flex flex-col sm:flex-row gap-4">

        {/* Filter tlačidlá */}
        <div className="flex gap-2 flex-wrap">
          {[
            { label: "Všetky",     href: "/cenove-ponuky",              active: filter === null },
            { label: "✅ Schválené", href: "/cenove-ponuky?stav=schvalena", active: filter === true },
            { label: "📝 Návrhy",   href: "/cenove-ponuky?stav=navrh",   active: filter === false },
          ].map((b) => (
            <Link
              key={b.label}
              href={b.href}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                b.active
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-gray-600 hover:border-blue-400"
              }`}
            >
              {b.label}
            </Link>
          ))}
        </div>

        {/* Vzorec (kompaktný) */}
        <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 px-4 py-2 font-mono text-xs text-gray-600 hidden sm:flex items-center gap-4 flex-wrap">
          <span>Základ = Zariadenie + Materiál + Marža</span>
          <span className="text-gray-300">|</span>
          <span className="font-bold text-gray-800">Celkom = Základ × 1,23 (DPH)</span>
        </div>
      </div>

      {/* Prázdny stav */}
      {ponuky.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-5xl mb-3">💶</p>
          <p className="text-gray-500 font-semibold">
            {filter !== null ? "Žiadne ponuky pre zvolený filter." : "Žiadne cenové ponuky."}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Ponuky sa vytvárajú v detaile zákazky →{" "}
            <Link href="/zakazky" className="text-blue-600 hover:underline">
              záložka Cenová ponuka
            </Link>
          </p>
        </div>
      )}

      {/* ── MOBILE – veľké karty ─────────────────────────────────────────────── */}
      {ponuky.length > 0 && (
        <div className="md:hidden space-y-3">
          {ponuky.map((p) => {
            const t   = TECH[p.technologia] ?? { label: p.technologia, ikona: "📦" };
            const zak = Number(p.cenaZariadenie);
            const mat = Number(p.cenaMaterial);
            const mar = Number(p.marza);
            const zaklad = zak + mat + mar;
            return (
              <Link
                key={p.id}
                href={`/zakazky/${p.zakazkaId}?tab=cenova_ponuka`}
                className="block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden active:bg-gray-50"
              >
                {/* Hlavička karty */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                  <span className="text-3xl">{t.ikona}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-bold text-gray-900 leading-tight">
                      {p.meno} {p.priezvisko}
                    </p>
                    <p className="text-sm text-gray-500 font-mono">{p.cislo}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-blue-700">
                      {formatMena(Number(p.celkovaCena))}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      p.schvalena ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {p.schvalena ? "✅ Schválená" : "📝 Návrh"}
                    </span>
                  </div>
                </div>

                {/* Rozpad ceny */}
                <div className="px-4 py-3 grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <p className="text-gray-400 text-xs">Zariadenie</p>
                    <p className="font-semibold text-gray-800">{formatMena(zak)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Materiál</p>
                    <p className="font-semibold text-gray-800">{formatMena(mat)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Marža</p>
                    <p className="font-semibold text-gray-800">{formatMena(mar)}</p>
                  </div>
                </div>

                {/* Základ + DPH */}
                <div className="px-4 pb-3 flex items-center justify-between text-xs text-gray-400 border-t border-gray-50 pt-2">
                  <span>Základ {formatMena(zaklad)} + DPH {Math.round(Number(p.dph) * 100)} %</span>
                  <span className="text-blue-500 font-medium">{t.label} · v{p.verzia}</span>
                </div>
              </Link>
            );
          })}

          {/* Celkový súčet (mobile) */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex justify-between items-center">
            <span className="text-sm font-semibold text-blue-800">
              Celková zobrazená hodnota
            </span>
            <span className="text-xl font-bold text-blue-700">{formatMena(celkovaSuma)}</span>
          </div>
        </div>
      )}

      {/* ── DESKTOP – tabuľka ───────────────────────────────────────────────── */}
      {ponuky.length > 0 && (
        <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Zákazník</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Zákazka</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Divízia</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Zariadenie</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Materiál</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Marža</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">DPH</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Celkom s DPH</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Stav</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Dátum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ponuky.map((p) => {
                const t   = TECH[p.technologia] ?? { label: p.technologia, ikona: "📦" };
                const zak = Number(p.cenaZariadenie);
                const mat = Number(p.cenaMaterial);
                const mar = Number(p.marza);
                const dph = (zak + mat + mar) * Number(p.dph);
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gray-900">{p.meno} {p.priezvisko}</p>
                      <p className="text-xs text-gray-400">{p.telefon}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/zakazky/${p.zakazkaId}?tab=cenova_ponuka`}
                        className="text-blue-600 font-mono text-xs hover:underline"
                      >
                        {p.cislo}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">v{p.verzia}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span>{t.ikona}</span>
                        <span className="text-gray-700">{t.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                      {formatMena(zak)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                      {formatMena(mat)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                      {formatMena(mar)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 tabular-nums">
                      {formatMena(dph)}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-blue-700 tabular-nums text-base">
                      {formatMena(Number(p.celkovaCena))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        p.schvalena
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {p.schvalena ? "✅ Schválená" : "📝 Návrh"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {formatDatum(p.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50 border-t-2 border-gray-200">
              <tr>
                <td colSpan={7} className="px-5 py-3 font-semibold text-gray-700">
                  Spolu ({ponuky.length} ponúk) · Schválené: {formatMena(schvalenaSuma)}
                </td>
                <td className="px-5 py-3 text-right font-bold text-blue-700 text-base tabular-nums">
                  {formatMena(celkovaSuma)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

    </div>
  );
}
