import Link from "next/link";
import { sql } from "@/lib/db";
import { formatMena, formatDatum } from "@/lib/formatters";
import { FAZY_ZAKAZKY, TECHNOLOGIE } from "@/types";

type ZakazkaRiadok = {
  id: string;
  cislo: string;
  faza: string;
  technologia: string;
  poznamka: string | null;
  zakaznik_meno: string;
  telefon: string;
  naklady_celkom: string;
  cenova_suma: string | null;
  created_at: Date;
};

async function getZakazky(faza?: string, technologia?: string) {
  return sql<ZakazkaRiadok[]>`
    SELECT
      z.id,
      z.cislo,
      z.faza,
      z.technologia,
      z.poznamka,
      zk.meno || ' ' || zk.priezvisko  AS zakaznik_meno,
      zk.telefon,
      COALESCE(SUM(n.suma), 0)::text    AS naklady_celkom,
      cp."celkovaCena"::text            AS cenova_suma,
      z."createdAt"                     AS created_at
    FROM zakazka z
    JOIN zakaznik zk ON z."zakaznikId" = zk.id
    LEFT JOIN naklad n ON n."zakazkaId" = z.id
    LEFT JOIN LATERAL (
      SELECT "celkovaCena"
      FROM   cenova_ponuka
      WHERE  "zakazkaId" = z.id AND schvalena = true
      ORDER  BY verzia DESC
      LIMIT  1
    ) cp ON true
    WHERE 1 = 1
      ${faza        ? sql`AND z.faza        = ${faza}`        : sql``}
      ${technologia ? sql`AND z.technologia = ${technologia}` : sql``}
    GROUP BY z.id, zk.meno, zk.priezvisko, zk.telefon, cp."celkovaCena"
    ORDER BY z."createdAt" DESC
  `;
}

function fazaBadge(faza: string) {
  return FAZY_ZAKAZKY.find((f) => f.key === faza.toLowerCase()) ?? {
    label: faza,
    farba: "bg-gray-100 text-gray-700",
  };
}

function techInfo(technologia: string) {
  return TECHNOLOGIE.find((t) => t.key === technologia.toLowerCase()) ?? {
    label: technologia,
    ikona: "🔧",
  };
}

export default async function ZakazkyPage({
  searchParams,
}: {
  searchParams: Promise<{ faza?: string; technologia?: string; nova?: string }>;
}) {
  const { faza, technologia, nova } = await searchParams;
  const zakazky = await getZakazky(faza, technologia);

  return (
    <div className="space-y-4 md:space-y-6">

      {/* Hlavička */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl md:text-2xl font-bold text-gray-900">Zákazky</h1>
        <Link
          href="/zakazky/nova"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 md:px-5
                     min-h-[60px] md:min-h-[44px] text-xl md:text-base
                     rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <span className="text-2xl md:text-base leading-none">＋</span>
          Nová zákazka
        </Link>
      </div>

      {/* Flash správa po vytvorení */}
      {nova && (
        <div className="bg-green-50 border border-green-300 text-green-800 rounded-xl
                        px-4 py-3 text-base md:text-sm font-medium">
          ✓ Zákazka bola úspešne vytvorená.
        </div>
      )}

      {/* Filtre – fáza */}
      <div className="space-y-2">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Fáza</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/zakazky"
            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors
              ${!faza ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            Všetky ({zakazky.length})
          </Link>
          {FAZY_ZAKAZKY.map((f) => {
            const count = zakazky.filter((z) => z.faza === f.key.toUpperCase()).length;
            const isActive = faza === f.key.toUpperCase();
            const params = new URLSearchParams();
            params.set("faza", f.key.toUpperCase());
            if (technologia) params.set("technologia", technologia);
            return (
              <Link
                key={f.key}
                href={`/zakazky?${params}`}
                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors
                  ${isActive ? "ring-2 ring-offset-1 ring-blue-500 " + f.farba : f.farba + " hover:opacity-80"}`}
              >
                {f.label} {count > 0 && `(${count})`}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Filtre – technológia */}
      <div className="flex flex-wrap gap-2">
        {TECHNOLOGIE.map((t) => {
          const isActive = technologia === t.key.toUpperCase();
          const params = new URLSearchParams();
          if (faza) params.set("faza", faza);
          params.set("technologia", t.key.toUpperCase());
          return (
            <Link
              key={t.key}
              href={isActive ? (faza ? `/zakazky?faza=${faza}` : "/zakazky") : `/zakazky?${params}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
                ${isActive
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:border-blue-400"}`}
            >
              {t.ikona} {t.label}
            </Link>
          );
        })}
      </div>

      {/* Zoznam – MOBILE: karty, DESKTOP: tabuľka */}
      {zakazky.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500 text-sm">Žiadne zákazky pre zvolený filter.</p>
          <Link href="/zakazky/nova" className="mt-4 inline-block text-blue-600 text-sm hover:underline">
            + Vytvoriť zákazku
          </Link>
        </div>
      ) : (
        <>
          {/* ── MOBILE karty (skryté na md+) ─────────────────────────────── */}
          <div className="flex flex-col gap-3 md:hidden">
            {zakazky.map((z) => {
              const f = fazaBadge(z.faza);
              const t = techInfo(z.technologia);
              const naklady = Number(z.naklady_celkom);
              const ponuka = z.cenova_suma ? Number(z.cenova_suma) : null;
              const zisk = ponuka !== null ? ponuka - naklady : null;

              return (
                // Karta = div (nie Link) — aby sme vedeli mať tel: link vnútri bez nestingu <a><a>
                <div
                  key={z.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  {/* Horný pás – číslo + fáza → kliknutím prejde na detail */}
                  <Link
                    href={`/zakazky/${z.id}`}
                    className="flex items-center justify-between px-5 pt-5 pb-3
                               border-b border-gray-100 active:bg-gray-50"
                  >
                    <span className="text-base font-bold text-gray-500">{z.cislo}</span>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${f.farba}`}>
                      {f.label}
                    </span>
                  </Link>

                  {/* Telo – zákazník + ikona */}
                  <Link
                    href={`/zakazky/${z.id}`}
                    className="flex items-start justify-between gap-3 px-5 pt-4 pb-1 active:bg-gray-50"
                  >
                    <div>
                      <p className="text-xl font-bold text-gray-900 leading-tight">
                        {z.zakaznik_meno}
                      </p>
                      <p className="text-base text-gray-500 mt-0.5">{t.label}</p>
                    </div>
                    <span className="text-4xl flex-shrink-0">{t.ikona}</span>
                  </Link>

                  {/* Telefón — samostatný tapovateľný odkaz (mimo Link = bez nestingu) */}
                  <div className="px-5 py-3">
                    <a
                      href={`tel:${z.telefon}`}
                      className="flex items-center gap-2 text-blue-600 text-xl font-semibold
                                 min-h-[48px] active:opacity-70"
                    >
                      📞 {z.telefon}
                    </a>
                  </div>

                  {/* Financie */}
                  <div className="grid grid-cols-3 gap-2 px-5 py-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Ponuka</p>
                      <p className="text-base font-bold text-gray-800">
                        {ponuka !== null ? formatMena(ponuka) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Náklady</p>
                      <p className="text-base font-bold text-gray-800">
                        {naklady > 0 ? formatMena(naklady) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase">Zisk</p>
                      <p className={`text-base font-bold ${
                        zisk === null ? "text-gray-400"
                        : zisk >= 0 ? "text-green-700" : "text-red-600"
                      }`}>
                        {zisk !== null ? formatMena(zisk) : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Dátum */}
                  <div className="px-5 pb-4 text-sm text-gray-400">
                    Vytvorená {formatDatum(z.created_at)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── DESKTOP tabuľka (skrytá na mobile) ──────────────────────── */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Číslo</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Zákazník</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Technológia</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Fáza</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Ponuka</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Náklady</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Zisk</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Dátum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {zakazky.map((z) => {
                  const f = fazaBadge(z.faza);
                  const t = techInfo(z.technologia);
                  const naklady = Number(z.naklady_celkom);
                  const ponuka = z.cenova_suma ? Number(z.cenova_suma) : null;
                  const zisk = ponuka !== null ? ponuka - naklady : null;

                  return (
                    <tr key={z.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/zakazky/${z.id}`} className="font-mono text-blue-600 hover:underline">
                          {z.cislo}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{z.zakaznik_meno}</p>
                        <p className="text-gray-400 text-xs">{z.telefon}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          <span>{t.ikona}</span>
                          <span className="text-gray-700">{t.label}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${f.farba}`}>
                          {f.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-800">
                        {ponuka !== null ? formatMena(ponuka) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-800">
                        {naklady > 0 ? formatMena(naklady) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {zisk !== null ? (
                          <span className={zisk >= 0 ? "text-green-700" : "text-red-600"}>
                            {formatMena(zisk)}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                        {formatDatum(z.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
