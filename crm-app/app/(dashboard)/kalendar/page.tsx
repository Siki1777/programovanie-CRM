import { sql } from "@/lib/db";
import Link from "next/link";
import { UlohaKarta, type UlohaKartaProps } from "./UlohaKarta";

export const dynamic = "force-dynamic";

type UlohaRow = UlohaKartaProps;

type Skupiny = {
  poTermine: UlohaRow[];
  dnes: UlohaRow[];
  tyzdeen: UlohaRow[];
  neskor: UlohaRow[];
  bezTerminu: UlohaRow[];
  splnene: UlohaRow[];
};

function skupiny(ulohy: UlohaRow[]): Skupiny {
  const dnes = new Date(); dnes.setHours(0, 0, 0, 0);
  const zajtrajsi = new Date(dnes.getTime() + 86_400_000);
  const tyzdeo    = new Date(dnes.getTime() + 7 * 86_400_000);

  const g: Skupiny = {
    poTermine: [], dnes: [], tyzdeen: [], neskor: [], bezTerminu: [], splnene: [],
  };

  for (const u of ulohy) {
    if (u.splnena) { g.splnene.push(u); continue; }
    if (!u.termin) { g.bezTerminu.push(u); continue; }
    const t = new Date(u.termin);
    if (t < dnes)        g.poTermine.push(u);
    else if (t < zajtrajsi) g.dnes.push(u);
    else if (t < tyzdeo)    g.tyzdeen.push(u);
    else                    g.neskor.push(u);
  }
  return g;
}

export default async function KalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ kto?: string }>;
}) {
  const { kto } = await searchParams;

  const [ulohy, kolegovia] = await Promise.all([

    sql<UlohaRow[]>`
      SELECT
        u.id,
        u."zakazkaId",
        u.nazov,
        u.termin::text AS termin,
        u.splnena,
        u."kolegaId",
        z.cislo,
        z.technologia,
        zk.meno  AS zak_meno,
        zk.priezvisko AS zak_priezvisko,
        k.meno   AS kol_meno,
        k.priezvisko  AS kol_priezvisko
      FROM uloha u
      JOIN   zakazka  z  ON z.id   = u."zakazkaId"
      JOIN   zakaznik zk ON zk.id  = z."zakaznikId"
      LEFT JOIN kolega k ON k.id   = u."kolegaId"
      ${kto ? sql`WHERE u."kolegaId" = ${kto}` : sql``}
      ORDER BY
        u.splnena ASC,
        CASE WHEN u.termin IS NULL THEN 1 ELSE 0 END ASC,
        u.termin ASC
    `,

    sql<{ id: string; meno: string; priezvisko: string }[]>`
      SELECT id, meno, priezvisko FROM kolega ORDER BY meno
    `,
  ]);

  const g = skupiny(ulohy);
  const aktivne = ulohy.filter((u) => !u.splnena).length;

  const sekcie = [
    { kluc: "poTermine", label: "🔴 Po termíne",      farba: "text-red-700",  data: g.poTermine  },
    { kluc: "dnes",      label: "📅 Dnes",             farba: "text-blue-700", data: g.dnes       },
    { kluc: "tyzdeen",   label: "📆 Tento týždeň",     farba: "text-gray-700", data: g.tyzdeen    },
    { kluc: "neskor",    label: "🗓️ Neskôr",           farba: "text-gray-500", data: g.neskor     },
    { kluc: "bezTerminu",label: "📋 Bez termínu",      farba: "text-gray-400", data: g.bezTerminu },
  ] as const;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* Nadpis */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📅 Úlohy & Plán</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {aktivne} aktívnych{kto ? " · Filtrované podľa kolegu" : " celkom"}
          </p>
        </div>
        <Link
          href="/zakazky"
          className="text-sm text-blue-600 hover:underline"
        >
          + Nová zákazka
        </Link>
      </div>

      {/* ── Kolega filter – horizontálne posuvné záložky ────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max border-b border-gray-100">

            <Link
              href="/kalendar"
              className={[
                "flex items-center gap-2 px-5 py-4 border-b-[3px] transition-colors whitespace-nowrap",
                "text-xl md:text-sm font-semibold min-h-[60px] md:min-h-0",
                !kto
                  ? "border-blue-600 text-blue-700 bg-blue-50"
                  : "border-transparent text-gray-500 hover:bg-gray-50",
              ].join(" ")}
            >
              <span>👥</span> Všetky
              <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full ml-1">
                {aktivne}
              </span>
            </Link>

            {kolegovia.map((k) => {
              const pocet = ulohy.filter(
                (u) => !u.splnena && u.kolegaId === k.id
              ).length;
              return (
                <Link
                  key={k.id}
                  href={`/kalendar?kto=${k.id}`}
                  className={[
                    "flex items-center gap-2 px-5 py-4 border-b-[3px] transition-colors whitespace-nowrap",
                    "text-xl md:text-sm font-semibold min-h-[60px] md:min-h-0",
                    kto === k.id
                      ? "border-blue-600 text-blue-700 bg-blue-50"
                      : "border-transparent text-gray-500 hover:bg-gray-50",
                  ].join(" ")}
                >
                  <span>👤</span> {k.meno}
                  {pocet > 0 && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ml-1 ${
                      kto === k.id ? "bg-blue-200 text-blue-700" : "bg-gray-200 text-gray-600"
                    }`}>
                      {pocet}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Meno vybraného kolegu pod filtrom (mobile) */}
        {kto && (
          <div className="sm:hidden px-4 py-2 bg-blue-50 border-b border-blue-100">
            <p className="text-sm font-semibold text-blue-700">
              👤 {kolegovia.find((k) => k.id === kto)?.meno ?? kto}
            </p>
          </div>
        )}
      </div>

      {/* ── Prázdny stav ────────────────────────────────────────────────────── */}
      {ulohy.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-5xl mb-3">✅</p>
          <p className="text-gray-500 font-semibold">
            {kto ? "Vybraný kolega nemá žiadne úlohy." : "Žiadne úlohy."}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Úlohy sa zadávajú v detaile zákazky →{" "}
            <Link href="/zakazky" className="text-blue-600 hover:underline">
              záložka Schválenie & Plán
            </Link>
          </p>
        </div>
      )}

      {/* ── Sekcie podľa termínu ────────────────────────────────────────────── */}
      {sekcie.map(({ kluc, label, farba, data }) =>
        data.length === 0 ? null : (
          <section key={kluc} className="space-y-3">
            <h2 className={`text-lg md:text-xs font-bold uppercase tracking-wide ${farba}`}>
              {label}{" "}
              <span className="font-normal text-base md:text-xs">({data.length})</span>
            </h2>
            <div className="space-y-3">
              {data.map((u) => (
                <UlohaKarta key={u.id} {...u} />
              ))}
            </div>
          </section>
        )
      )}

      {/* ── Splnené úlohy – skladacie ────────────────────────────────────────── */}
      {g.splnene.length > 0 && (
        <details className="group">
          <summary className="
            cursor-pointer select-none
            flex items-center gap-2
            text-lg md:text-xs font-bold uppercase tracking-wide text-gray-400
            hover:text-gray-600 transition-colors
          ">
            <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
            ✅ Splnené ({g.splnene.length})
          </summary>
          <div className="mt-3 space-y-3">
            {g.splnene.map((u) => (
              <UlohaKarta key={u.id} {...u} />
            ))}
          </div>
        </details>
      )}

      {/* ── Legenda – informačná ─────────────────────────────────────────────── */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-xs text-gray-500 space-y-1">
        <p className="font-semibold text-gray-600 mb-2">Ako to funguje:</p>
        <p>✓ Klikni na <strong>obrie políčko</strong> vľavo od úlohy – uloží sa hneď do databázy.</p>
        <p>👤 Zobraz <strong>Moje úlohy</strong> výberom svojho mena v záložkách vyššie.</p>
        <p>📋 Nové úlohy zadáš v detaile zákazky → záložka <strong>Schválenie & Plán</strong>.</p>
      </div>

    </div>
  );
}
