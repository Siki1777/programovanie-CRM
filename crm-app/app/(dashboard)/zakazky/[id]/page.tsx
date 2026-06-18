import { notFound } from "next/navigation";
import Link from "next/link";
import { sql } from "@/lib/db";
import { FAZY_ZAKAZKY, TECHNOLOGIE } from "@/types";
import { formatDatum } from "@/lib/formatters";
import { getSession } from "@/lib/session";
import type { ZakazkaRow, NakladRow, UlohaRow, KolegaRow } from "./types";
import { TabNav } from "./TabNav";
import { Avatar } from "@/components/Avatar";
import { FotoUploadButton } from "@/components/FotoUploadButton";
import { DopytTab } from "./tabs/DopytTab";
import { ObhliadkaTab } from "./tabs/ObhliadkaTab";
import { CenovaPonukaTab } from "./tabs/CenovaPonukaTab";
import { SchvaleniePlanTab } from "./tabs/SchvaleniePlanTab";
import { RealizaciaTab } from "./tabs/RealizaciaTab";
import { ServisTab } from "./tabs/ServisTab";

export const dynamic = "force-dynamic";

async function fetchDetail(id: string) {
  const [zakazkyRows, nakladyRows, ulohaRows, kolegovia] = await Promise.all([
    sql<ZakazkaRow[]>`
      SELECT
        z.id, z.cislo, z.faza, z.technologia, z.poznamka,
        z."serialoveCislo", z."podpisDataUrl", z."nasledujucaRevizia",
        COALESCE(z."checklistObhliadka", '{}'::jsonb) AS "checklistObhliadka",
        z."createdAt", z."updatedAt",
        zk.id AS "zakaznikId",
        zk.meno, zk.priezvisko, zk.telefon, zk.email, zk.adresa,
        zk.foto_url AS "zakaznikFotoUrl",
        cp."celkovaCena"::text    AS "celkovaCena",
        cp."cenaZariadenie"::text AS "cenaZariadenie",
        cp."cenaMaterial"::text   AS "cenaMaterial",
        cp.marza::text            AS marza,
        cp.schvalena              AS "cpSchvalena"
      FROM zakazka z
      JOIN zakaznik zk ON z."zakaznikId" = zk.id
      LEFT JOIN LATERAL (
        SELECT "celkovaCena", "cenaZariadenie", "cenaMaterial", marza, schvalena
        FROM   cenova_ponuka
        WHERE  "zakazkaId" = z.id AND schvalena = TRUE
        ORDER  BY verzia DESC
        LIMIT  1
      ) cp ON TRUE
      WHERE z.id = ${id}
    `,
    sql<NakladRow[]>`
      SELECT id, "zakazkaId", suma::text AS suma, kategoria, popis, "createdAt"
      FROM   naklad
      WHERE  "zakazkaId" = ${id}
      ORDER  BY "createdAt" DESC
    `,
    sql<UlohaRow[]>`
      SELECT u.id, u."zakazkaId", u.nazov, u.popis, u.termin,
             u.splnena, u."kolegaId",
             k.meno   AS kolega_meno,
             k.priezvisko AS kolega_priezvisko
      FROM   uloha u
      LEFT JOIN kolega k ON u."kolegaId" = k.id
      WHERE  u."zakazkaId" = ${id}
      ORDER  BY u."createdAt" ASC
    `,
    sql<KolegaRow[]>`SELECT id, meno, priezvisko FROM kolega ORDER BY meno`,
  ]);

  return { zakazka: zakazkyRows[0] ?? null, naklady: nakladyRows, ulohy: ulohaRows, kolegovia };
}

export default async function ZakazkaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab = "dopyt" } = await searchParams;

  const [{ zakazka, naklady, ulohy, kolegovia }, session] = await Promise.all([
    fetchDetail(id),
    getSession(),
  ]);
  if (!zakazka) notFound();

  const vidiFinancie = session?.vidiFinancie ?? false;

  // Ak sa niekto pokúsi priamo na URL dostať na finančnú záložku → presmeruj na dopyt
  const effectiveTab =
    tab === "cenova_ponuka" && !vidiFinancie ? "dopyt" : tab;

  const fazaInfo = FAZY_ZAKAZKY.find((f) => f.key === zakazka.faza.toLowerCase());
  const techInfo = TECHNOLOGIE.find((t) => t.key === zakazka.technologia.toLowerCase());

  return (
    <div className="space-y-4 max-w-4xl mx-auto">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/zakazky" className="hover:text-blue-600 transition-colors">Zákazky</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium font-mono">{zakazka.cislo}</span>
      </div>

      {/* Hlavička zákazky */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl flex-shrink-0">{techInfo?.ikona ?? "🔧"}</span>
              {/* Profilová fotka zákazníka + tlačidlo nahrávania */}
              <div className="relative flex-shrink-0">
                <Avatar
                  meno={zakazka.meno}
                  priezvisko={zakazka.priezvisko}
                  email={zakazka.email}
                  fotoUrl={zakazka.zakaznikFotoUrl}
                  size="lg"
                />
                <FotoUploadButton typ="zakaznik" entityId={zakazka.zakaznikId} variant="overlay" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {zakazka.meno} {zakazka.priezvisko}
              </h1>
            </div>
            <p className="text-sm text-gray-500 mt-1 font-mono">{zakazka.cislo}</p>
            {zakazka.poznamka && (
              <p className="text-sm text-gray-600 mt-2 italic">&bdquo;{zakazka.poznamka}&ldquo;</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${fazaInfo?.farba ?? "bg-gray-100 text-gray-700"}`}>
              {fazaInfo?.label ?? zakazka.faza}
            </span>
            <span className="text-xs text-gray-400">{formatDatum(zakazka.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Tab navigácia */}
      <TabNav activeTab={effectiveTab} zakazkaId={id} vidiFinancie={vidiFinancie} />

      {/* Tab obsah */}
      <div className="pb-8">
        {effectiveTab === "obhliadka"       && <ObhliadkaTab       zakazka={zakazka} />}
        {effectiveTab === "cenova_ponuka"   && vidiFinancie
          && <CenovaPonukaTab zakazka={zakazka} naklady={naklady} />}
        {effectiveTab === "schvalenie_plan" && <SchvaleniePlanTab  ulohy={ulohy} kolegovia={kolegovia} zakazkaId={id} />}
        {effectiveTab === "realizacia"      && <RealizaciaTab      zakazka={zakazka} />}
        {effectiveTab === "servis"          && <ServisTab          zakazka={zakazka} />}
        {effectiveTab !== "obhliadka" && effectiveTab !== "cenova_ponuka"
          && effectiveTab !== "schvalenie_plan" && effectiveTab !== "realizacia"
          && effectiveTab !== "servis"
          && <DopytTab zakazka={zakazka} />}
      </div>
    </div>
  );
}
