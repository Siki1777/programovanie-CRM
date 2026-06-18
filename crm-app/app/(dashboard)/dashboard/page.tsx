import { sql } from "@/lib/db";
import { formatMena, formatDatum } from "@/lib/formatters";
import { getSession } from "@/lib/session";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TECH: Record<string, { label: string; ikona: string }> = {
  TEPELNE_CERPADLO: { label: "Tepelné čerpadlo", ikona: "🌡️" },
  KLIMATIZACIA:     { label: "Klimatizácia",      ikona: "❄️" },
  KOMIN:            { label: "Komín",              ikona: "🏠" },
  KRB:              { label: "Krb / Vložka",       ikona: "🔥" },
  FOTOVOLTIKA:      { label: "Fotovoltika",         ikona: "☀️" },
};

const FAZA: Record<string, { label: string; farba: string }> = {
  DOPYT:            { label: "Dopyt",              farba: "bg-gray-100 text-gray-700" },
  OBHLIADKA:        { label: "Obhliadka",           farba: "bg-blue-100 text-blue-700" },
  CENOVA_PONUKA:    { label: "Cenová ponuka",       farba: "bg-yellow-100 text-yellow-700" },
  SCHVALENIE_PLAN:  { label: "Schválenie & Plán",   farba: "bg-orange-100 text-orange-700" },
  REALIZACIA:       { label: "Realizácia",           farba: "bg-purple-100 text-purple-700" },
  SERVIS:           { label: "Servis & Záruka",      farba: "bg-green-100 text-green-700" },
};

const FAZA_ORDER = ["DOPYT","OBHLIADKA","CENOVA_PONUKA","SCHVALENIE_PLAN","REALIZACIA","SERVIS"];

export default async function DashboardPage() {

  const session = await getSession();
  const vidiFinancie = session?.vidiFinancie ?? false;

  const [statsRow, mesiacRow, fazaRows, techRows, posledneRows, ulohaRow] = await Promise.all([

    sql<{ aktivne: string; celkomZak: string }[]>`
      SELECT
        COUNT(CASE WHEN z.faza != 'SERVIS' THEN 1 END)::text AS aktivne,
        (SELECT COUNT(*)::text FROM zakaznik) AS "celkomZak"
      FROM zakazka z
    `,

    // Finančné dotazy – spúšťa sa vždy, ale hodnoty sa zobrazia len s povolením
    sql<{ prijmy: string; naklady: string }[]>`
      WITH
        cp AS (SELECT "zakazkaId", SUM("celkovaCena") p FROM cenova_ponuka WHERE schvalena GROUP BY "zakazkaId"),
        n  AS (SELECT "zakazkaId", SUM(suma)          c FROM naklad                        GROUP BY "zakazkaId")
      SELECT
        COALESCE(SUM(cp.p), 0)::text AS prijmy,
        COALESCE(SUM(n.c),  0)::text AS naklady
      FROM zakazka z
      LEFT JOIN cp ON cp."zakazkaId" = z.id
      LEFT JOIN n  ON n."zakazkaId"  = z.id
      WHERE date_trunc('month', z."createdAt") = date_trunc('month', CURRENT_TIMESTAMP)
    `,

    sql<{ faza: string; pocet: string }[]>`
      SELECT faza, COUNT(*)::text AS pocet FROM zakazka GROUP BY faza
    `,

    sql<{ technologia: string; pocet: string; prijmy: string; naklady: string; zisk: string }[]>`
      WITH
        cp AS (SELECT "zakazkaId", SUM("celkovaCena") p FROM cenova_ponuka WHERE schvalena GROUP BY "zakazkaId"),
        n  AS (SELECT "zakazkaId", SUM(suma)          c FROM naklad                        GROUP BY "zakazkaId")
      SELECT
        z.technologia,
        COUNT(z.id)::text                                         AS pocet,
        COALESCE(SUM(cp.p), 0)::text                              AS prijmy,
        COALESCE(SUM(n.c),  0)::text                              AS naklady,
        (COALESCE(SUM(cp.p), 0) - COALESCE(SUM(n.c), 0))::text   AS zisk
      FROM zakazka z
      LEFT JOIN cp ON cp."zakazkaId" = z.id
      LEFT JOIN n  ON n."zakazkaId"  = z.id
      GROUP BY z.technologia
      ORDER BY COALESCE(SUM(cp.p), 0) DESC
    `,

    sql<{ id: string; cislo: string; faza: string; technologia: string; meno: string; priezvisko: string; createdAt: string }[]>`
      SELECT z.id, z.cislo, z.faza, z.technologia, zk.meno, zk.priezvisko, z."createdAt"
      FROM zakazka z
      JOIN zakaznik zk ON zk.id = z."zakaznikId"
      ORDER BY z."createdAt" DESC
      LIMIT 5
    `,

    sql<{ pocet: string }[]>`
      SELECT COUNT(*)::text AS pocet
      FROM uloha
      WHERE splnena = false
        AND termin >= date_trunc('week', CURRENT_DATE)
        AND termin <  date_trunc('week', CURRENT_DATE) + INTERVAL '7 days'
    `,
  ]);

  const aktivne    = Number(statsRow[0]?.aktivne   ?? 0);
  const celkomZak  = Number(statsRow[0]?.celkomZak ?? 0);
  const ulohy      = Number(ulohaRow[0]?.pocet     ?? 0);
  const prijmy     = Number(mesiacRow[0]?.prijmy   ?? 0);
  const nakladyM   = Number(mesiacRow[0]?.naklady  ?? 0);
  const ziskMesiac = prijmy - nakladyM;

  const fazaMap = Object.fromEntries(fazaRows.map((r) => [r.faza, Number(r.pocet)]));

  const totalPrijmy  = techRows.reduce((s, r) => s + Number(r.prijmy),  0);
  const totalNaklady = techRows.reduce((s, r) => s + Number(r.naklady), 0);
  const totalZisk    = totalPrijmy - totalNaklady;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">📊 Prehľad</h1>
        <Link
          href="/zakazky/nova"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nová zákazka
        </Link>
      </div>

      {/* ── Stat karty ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        <Link href="/zakazky" className="bg-white rounded-xl border-l-4 border-blue-500 border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow block">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Aktívne zákazky</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{aktivne}</p>
          <p className="text-xs text-gray-400 mt-1">Fázy 1–5 (bez servisu)</p>
        </Link>

        <Link href="/zakaznici" className="bg-white rounded-xl border-l-4 border-gray-400 border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow block">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Zákazníci celkom</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{celkomZak}</p>
          <p className="text-xs text-gray-400 mt-1">V databáze</p>
        </Link>

        <Link href="/kalendar" className="bg-white rounded-xl border-l-4 border-orange-500 border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow block">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Úlohy tento týždeň</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{ulohy}</p>
          <p className="text-xs text-gray-400 mt-1">Nesplnené s termínom</p>
        </Link>

        {/* 4. karta: Zisk (len admin) alebo zamknutý placeholder */}
        {vidiFinancie ? (
          <Link href="/naklady" className={`bg-white rounded-xl border-l-4 ${ziskMesiac >= 0 ? "border-green-500" : "border-red-500"} border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow block`}>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Zisk tento mesiac</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{formatMena(ziskMesiac)}</p>
            <p className="text-xs text-gray-400 mt-1">
              {ziskMesiac >= 0 ? `Príjmy ${formatMena(prijmy)} − Náklady ${formatMena(nakladyM)}` : "Zatiaľ v strate"}
            </p>
          </Link>
        ) : (
          <div className="bg-gray-50 rounded-xl border-l-4 border-gray-300 border border-gray-200 p-5 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Zisk tento mesiac</p>
            <p className="text-3xl font-bold text-gray-300 mt-1 select-none">🔒 ••••</p>
            <p className="text-xs text-gray-400 mt-1">Prístup k financiám nie je povolený</p>
          </div>
        )}

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Zákazky podľa fázy ─────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">📋 Zákazky podľa fázy</h2>
          <div className="space-y-2">
            {FAZA_ORDER.map((key) => {
              const count = fazaMap[key] ?? 0;
              const f = FAZA[key];
              const maxCount = Math.max(...Object.values(fazaMap), 1);
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 w-32 text-center ${f.farba}`}>
                    {f.label}
                  </span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-700 w-6 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Divízie – len admin ────────────────────────────────────────── */}
        {vidiFinancie ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-gray-800 mb-1">💰 Divízie — čistý zisk</h2>
            <p className="text-xs text-gray-400 mb-4">Príjmy (sch. ponuka) − Náklady = Čistý zisk</p>

            {techRows.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Žiadne dáta.</p>
            ) : (
              <div className="space-y-3">
                {techRows.map((r) => {
                  const t    = TECH[r.technologia] ?? { label: r.technologia, ikona: "📦" };
                  const zisk = Number(r.zisk);
                  return (
                    <div key={r.technologia} className="flex items-center gap-3">
                      <span className="text-xl flex-shrink-0">{t.ikona}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm font-semibold text-gray-800 truncate">{t.label}</span>
                          <span className={`text-sm font-bold whitespace-nowrap ${zisk >= 0 ? "text-green-700" : "text-red-600"}`}>
                            {formatMena(zisk)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {r.pocet} zák. · príjmy {formatMena(Number(r.prijmy))} · náklady {formatMena(Number(r.naklady))}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-600">Celkový zisk (all-time)</span>
              <span className={`text-lg font-bold ${totalZisk >= 0 ? "text-green-700" : "text-red-600"}`}>
                {formatMena(totalZisk)}
              </span>
            </div>
            <div className="text-xs text-gray-400 flex justify-between mt-1">
              <span>Príjmy: {formatMena(totalPrijmy)}</span>
              <span>Náklady: {formatMena(totalNaklady)}</span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center gap-3">
            <div className="text-4xl select-none">🔒</div>
            <p className="text-sm font-semibold text-gray-500">Finančný prehľad je uzamknutý</p>
            <p className="text-xs text-gray-400 max-w-xs">
              Požiadaj správcu o povolenie prístupu k financiám v sekcii Nastavenia.
            </p>
            <Link href="/nastavenia" className="text-xs text-blue-500 hover:underline mt-1">
              Ísť do Nastavení →
            </Link>
          </div>
        )}

      </div>

      {/* ── Posledné zákazky ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">🕐 Posledné zákazky</h2>
          <Link href="/zakazky" className="text-sm text-blue-600 hover:underline">
            Zobraziť všetky →
          </Link>
        </div>

        {posledneRows.length === 0 ? (
          <p className="text-gray-400 text-sm">
            Zatiaľ žiadne zákazky.{" "}
            <Link href="/zakazky/nova" className="text-blue-600 hover:underline">
              Vytvoriť prvú zákazku →
            </Link>
          </p>
        ) : (
          <div className="space-y-0 divide-y divide-gray-100">
            {posledneRows.map((z) => {
              const t = TECH[z.technologia] ?? { ikona: "📦", label: z.technologia };
              const f = FAZA[z.faza] ?? { label: z.faza, farba: "bg-gray-100 text-gray-600" };
              return (
                <Link
                  key={z.id}
                  href={`/zakazky/${z.id}`}
                  className="flex items-center gap-4 py-3 hover:bg-gray-50 -mx-6 px-6 transition-colors"
                >
                  <span className="text-2xl flex-shrink-0">{t.ikona}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">
                      {z.meno} {z.priezvisko}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">{z.cislo}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${f.farba}`}>
                    {f.label}
                  </span>
                  <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">
                    {formatDatum(z.createdAt)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
