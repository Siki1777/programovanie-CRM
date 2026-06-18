import { sql } from "@/lib/db";
import Link from "next/link";
import { formatDatum } from "@/lib/formatters";
import { Avatar } from "@/components/Avatar";
import { FotoUploadButton } from "@/components/FotoUploadButton";

export const dynamic = "force-dynamic";

const TECH_IKONA: Record<string, string> = {
  TEPELNE_CERPADLO: "🌡️",
  KLIMATIZACIA:     "❄️",
  KOMIN:            "🏠",
  KRB:              "🔥",
  FOTOVOLTIKA:      "☀️",
};

const FAZA_FARBA: Record<string, string> = {
  DOPYT:           "bg-gray-100 text-gray-700",
  OBHLIADKA:       "bg-blue-100 text-blue-700",
  CENOVA_PONUKA:   "bg-yellow-100 text-yellow-700",
  SCHVALENIE_PLAN: "bg-orange-100 text-orange-700",
  REALIZACIA:      "bg-purple-100 text-purple-700",
  SERVIS:          "bg-green-100 text-green-700",
};

const FAZA_LABEL: Record<string, string> = {
  DOPYT:           "Dopyt",
  OBHLIADKA:       "Obhliadka",
  CENOVA_PONUKA:   "Cenová ponuka",
  SCHVALENIE_PLAN: "Schválenie & Plán",
  REALIZACIA:      "Realizácia",
  SERVIS:          "Servis & Záruka",
};

export default async function ZakazniciPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const hladaj = q?.trim() || "";

  const zakaznici = await sql<{
    id: string;
    meno: string;
    priezvisko: string;
    telefon: string;
    email: string | null;
    adresa: string | null;
    poznamka: string | null;
    fotoUrl: string | null;
    createdAt: string;
    pocetZakaziek: string;
    poslednaZakazkaId: string | null;
    poslednaZakazkaCislo: string | null;
    poslednaZakazkaFaza: string | null;
    poslednaZakazkaTech: string | null;
  }[]>`
    SELECT
      zk.id,
      zk.meno,
      zk.priezvisko,
      zk.telefon,
      zk.email,
      zk.adresa,
      zk.poznamka,
      zk.foto_url    AS "fotoUrl",
      zk."createdAt",
      COUNT(z.id)::text                                       AS "pocetZakaziek",
      (
        SELECT z2.id FROM zakazka z2
        WHERE z2."zakaznikId" = zk.id
        ORDER BY z2."createdAt" DESC LIMIT 1
      )                                                        AS "poslednaZakazkaId",
      (
        SELECT z2.cislo FROM zakazka z2
        WHERE z2."zakaznikId" = zk.id
        ORDER BY z2."createdAt" DESC LIMIT 1
      )                                                        AS "poslednaZakazkaCislo",
      (
        SELECT z2.faza FROM zakazka z2
        WHERE z2."zakaznikId" = zk.id
        ORDER BY z2."createdAt" DESC LIMIT 1
      )                                                        AS "poslednaZakazkaFaza",
      (
        SELECT z2.technologia FROM zakazka z2
        WHERE z2."zakaznikId" = zk.id
        ORDER BY z2."createdAt" DESC LIMIT 1
      )                                                        AS "poslednaZakazkaTech"
    FROM zakaznik zk
    LEFT JOIN zakazka z ON z."zakaznikId" = zk.id
    ${hladaj
      ? sql`WHERE
          zk.meno        ILIKE ${"%" + hladaj + "%"} OR
          zk.priezvisko  ILIKE ${"%" + hladaj + "%"} OR
          zk.telefon     ILIKE ${"%" + hladaj + "%"} OR
          zk.email       ILIKE ${"%" + hladaj + "%"} OR
          zk.adresa      ILIKE ${"%" + hladaj + "%"}`
      : sql``}
    GROUP BY zk.id
    ORDER BY zk."createdAt" DESC
  `;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Nadpis + tlačidlo */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">👥 Zákazníci</h1>
          <p className="text-sm text-gray-400 mt-0.5">{zakaznici.length} zákazníkov v databáze</p>
        </div>
        <Link
          href="/zakaznici/novy"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Nový zákazník
        </Link>
      </div>

      {/* Vyhľadávanie */}
      <form method="GET" action="/zakaznici" className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="search"
          name="q"
          defaultValue={hladaj}
          placeholder="Hľadať zákazníka (meno, telefón, adresa, e-mail)..."
          className="
            w-full pl-10 pr-4 py-3
            border border-gray-300 rounded-xl text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            bg-white
          "
        />
        {hladaj && (
          <a
            href="/zakaznici"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg"
          >
            ×
          </a>
        )}
      </form>

      {/* Prázdny stav */}
      {zakaznici.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-5xl mb-3">👥</p>
          <p className="text-gray-500 font-semibold">
            {hladaj ? `Žiadny zákazník nezodpovedá „${hladaj}".` : "Žiadni zákazníci."}
          </p>
          {!hladaj && (
            <Link
              href="/zakaznici/novy"
              className="inline-block mt-4 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              + Pridať prvého zákazníka
            </Link>
          )}
        </div>
      )}

      {/* MOBILE – karty */}
      {zakaznici.length > 0 && (
        <div className="md:hidden space-y-3">
          {zakaznici.map((zk) => (
            <div key={zk.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <Avatar
                      meno={zk.meno}
                      priezvisko={zk.priezvisko}
                      email={zk.email}
                      fotoUrl={zk.fotoUrl}
                      size="md"
                    />
                    <FotoUploadButton typ="zakaznik" entityId={zk.id} variant="overlay" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-bold text-gray-900">
                      {zk.meno} {zk.priezvisko}
                    </p>
                    <a
                      href={`tel:${zk.telefon}`}
                      className="text-base text-blue-600 font-medium hover:underline"
                    >
                      📞 {zk.telefon}
                    </a>
                    {zk.adresa && (
                      <p className="text-sm text-gray-500 mt-1">📍 {zk.adresa}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0 mt-1">
                    {Number(zk.pocetZakaziek)} zák.
                  </span>
                </div>

                {zk.poslednaZakazkaId && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{TECH_IKONA[zk.poslednaZakazkaTech ?? ""] ?? "📦"}</span>
                      <span className="text-xs font-mono text-gray-600">{zk.poslednaZakazkaCislo}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${FAZA_FARBA[zk.poslednaZakazkaFaza ?? ""] ?? "bg-gray-100 text-gray-600"}`}>
                        {FAZA_LABEL[zk.poslednaZakazkaFaza ?? ""] ?? zk.poslednaZakazkaFaza}
                      </span>
                    </div>
                    <Link
                      href={`/zakazky/${zk.poslednaZakazkaId}`}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Detail →
                    </Link>
                  </div>
                )}

                {!zk.poslednaZakazkaId && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <Link
                      href={`/zakazky/nova?zakaznikId=${zk.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      + Pridať zákazku
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DESKTOP – tabuľka */}
      {zakaznici.length > 0 && (
        <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Zákazník</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Kontakt</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Adresa</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Posledná zákazka</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 w-16">Zák.</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-28">Pridaný</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {zakaznici.map((zk) => (
                <tr key={zk.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <Avatar meno={zk.meno} priezvisko={zk.priezvisko} email={zk.email} fotoUrl={zk.fotoUrl} size="sm" />
                        <FotoUploadButton typ="zakaznik" entityId={zk.id} variant="overlay" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{zk.meno} {zk.priezvisko}</p>
                        {zk.poznamka && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[160px]">{zk.poznamka}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`tel:${zk.telefon}`} className="text-blue-600 hover:underline block">
                      {zk.telefon}
                    </a>
                    {zk.email && (
                      <a href={`mailto:${zk.email}`} className="text-gray-400 text-xs hover:underline">
                        {zk.email}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate">
                    {zk.adresa ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {zk.poslednaZakazkaId ? (
                      <div className="flex items-center gap-2">
                        <span>{TECH_IKONA[zk.poslednaZakazkaTech ?? ""] ?? "📦"}</span>
                        <Link
                          href={`/zakazky/${zk.poslednaZakazkaId}`}
                          className="text-blue-600 font-mono text-xs hover:underline"
                        >
                          {zk.poslednaZakazkaCislo}
                        </Link>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${FAZA_FARBA[zk.poslednaZakazkaFaza ?? ""] ?? "bg-gray-100 text-gray-600"}`}>
                          {FAZA_LABEL[zk.poslednaZakazkaFaza ?? ""] ?? zk.poslednaZakazkaFaza}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-bold ${Number(zk.pocetZakaziek) > 0 ? "text-blue-600" : "text-gray-400"}`}>
                      {zk.pocetZakaziek}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {formatDatum(zk.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/zakazky/nova`}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      + Zákazka
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
