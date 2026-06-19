import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { nastavVidiFinancie } from "@/app/actions/session";
import { Avatar } from "@/components/Avatar";
import { FotoUploadButton } from "@/components/FotoUploadButton";
import { PridatKoleguForm } from "./PridatKoleguForm";
import { NastavHesloForm } from "./NastavHesloForm";

export const dynamic = "force-dynamic";

const KANALY = [
  { value: "whatsapp",        label: "WhatsApp",        ikona: "💬" },
  { value: "email",           label: "E-mail",          ikona: "📧" },
  { value: "google_kalendar", label: "Google Kalendár", ikona: "📅" },
] as const;

type Kolega = {
  id: string;
  meno: string;
  priezvisko: string;
  email: string;
  telefon: string | null;
  fotoUrl: string | null;
  notifikacnyKanal: string;
  vidiFinancie: boolean;
  maHeslo: boolean;
};

export default async function NastaveniePage() {
  const [kolegovia, session] = await Promise.all([
    sql<Kolega[]>`
      SELECT id, meno, priezvisko, email, telefon,
             foto_url          AS "fotoUrl",
             "notifikacnyKanal",
             vidi_financie     AS "vidiFinancie",
             (heslo IS NOT NULL) AS "maHeslo"
      FROM kolega
      ORDER BY meno, priezvisko
    `,
    getSession(),
  ]);

  const jeAdmin = session?.vidiFinancie ?? false;

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">⚙️ Nastavenia</h1>

      {/* ── Správa hesiel (len Admin) ─────────────────────────────────── */}
      {jeAdmin && (
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800 text-lg">🔑 Správa hesiel</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Nastav alebo zmeň heslo pre každého kolegu. Každý sa potom prihlasuje sám cez{" "}
              <span className="font-mono">/login</span>.
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {kolegovia.map((k) => (
              <div key={k.id} className="px-6 py-4 space-y-3">

                {/* Riadok 1: Avatar + info + stav hesla */}
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <Avatar
                      meno={k.meno}
                      priezvisko={k.priezvisko}
                      email={k.email}
                      fotoUrl={k.fotoUrl}
                      size="sm"
                      className={session?.kolegaId === k.id ? "ring-2 ring-blue-500 ring-offset-1" : ""}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm">
                        {k.meno} {k.priezvisko}
                      </p>
                      {k.vidiFinancie && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                          Admin
                        </span>
                      )}
                      {session?.kolegaId === k.id && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                          Ty
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{k.email}</p>
                  </div>

                  {/* Stav hesla — vpravo */}
                  <div className="flex-shrink-0 ml-auto">
                    {k.maHeslo ? (
                      <span className="text-xs text-gray-400 whitespace-nowrap">🔒 Nastavené</span>
                    ) : (
                      <span className="text-xs text-orange-500 font-semibold whitespace-nowrap">⚠ Bez hesla</span>
                    )}
                  </div>
                </div>

                {/* Riadok 2: Formulár pre heslo — vždy pod menom, full-width */}
                <NastavHesloForm kolegaId={k.id} maHeslo={k.maHeslo} />

              </div>
            ))}
          </div>

          <div className="px-6 py-3 bg-amber-50 border-t border-amber-100 text-xs text-amber-700">
            💡 Kolegovia bez nastaveného hesla sa nemôžu prihlásiť.
          </div>
        </section>
      )}

      {/* ── Kolegovia & notifikácie ──────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <h2 className="font-bold text-gray-800 text-lg">👥 Kolegovia &amp; notifikácie</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Notifikačný kanál a prístup k financiám. Financie môže meniť iba Admin.
            </p>
          </div>
          <PridatKoleguForm />
        </div>

        {kolegovia.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p className="text-4xl mb-2">👤</p>
            <p className="text-sm">Žiadni kolegovia.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {kolegovia.map((k) => (
              <div
                key={k.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4"
              >
                {/* Avatar + upload */}
                <div className="relative flex-shrink-0">
                  <Avatar
                    meno={k.meno}
                    priezvisko={k.priezvisko}
                    email={k.email}
                    fotoUrl={k.fotoUrl}
                    size="md"
                    className={session?.kolegaId === k.id ? "ring-2 ring-blue-500 ring-offset-1" : ""}
                  />
                  <FotoUploadButton typ="kolega" entityId={k.id} variant="overlay" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-base">
                      {k.meno} {k.priezvisko}
                    </p>
                    {session?.kolegaId === k.id && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                        Ty
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <a href={`mailto:${k.email}`} className="text-xs text-blue-600 hover:underline">
                      {k.email}
                    </a>
                    {k.telefon && (
                      <a href={`tel:${k.telefon}`} className="text-xs text-gray-400 hover:text-gray-600">
                        {k.telefon}
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">

                  {/* Finance toggle – len admin */}
                  {jeAdmin && (
                    <form
                      action={async () => {
                        "use server";
                        await nastavVidiFinancie(k.id, !k.vidiFinancie);
                        revalidatePath("/nastavenia");
                        revalidatePath("/", "layout");
                      }}
                    >
                      <button
                        type="submit"
                        className={[
                          "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all",
                          k.vidiFinancie
                            ? "bg-green-600 border-green-600 text-white"
                            : "border-gray-200 text-gray-400 hover:border-green-400 hover:text-green-600",
                        ].join(" ")}
                      >
                        💶 {k.vidiFinancie ? "Financie ✓" : "Financie"}
                      </button>
                    </form>
                  )}

                  {/* Kanál */}
                  {KANALY.map((opt) => {
                    const aktivny = k.notifikacnyKanal === opt.value;
                    return (
                      <form
                        key={opt.value}
                        action={async () => {
                          "use server";
                          await sql`UPDATE kolega SET "notifikacnyKanal" = ${opt.value} WHERE id = ${k.id}`;
                          revalidatePath("/nastavenia");
                        }}
                      >
                        <button
                          type="submit"
                          className={[
                            "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all",
                            aktivny
                              ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                              : "border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600",
                          ].join(" ")}
                        >
                          {opt.ikona} {opt.label}
                          {aktivny && <span className="opacity-80">✓</span>}
                        </button>
                      </form>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
          {kolegovia.length} člen{kolegovia.length === 1 ? "" : "ov"} tímu
          {!jeAdmin && (
            <span className="text-orange-500 ml-2">
              · Zmeny prístupu k financiám môže robiť iba Admin (💶)
            </span>
          )}
        </div>
      </section>

      {/* ── Automatické oslovovanie ──────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 text-lg mb-1">🤖 Automatické oslovovanie klientov</h2>
        <p className="text-xs text-gray-400 mb-4">
          Cron skript sa spustí <strong>11 mesiacov</strong> po dátume realizácie zákazky.
        </p>
        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
          <div>
            <p className="text-sm font-semibold text-gray-700">Servisná pripomienka po 11 mesiacoch</p>
            <p className="text-xs text-gray-400 mt-0.5">Odošle zákazníkovi správu s ponukou ročnej revízie</p>
          </div>
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            ✓ Aktívne
          </div>
        </div>
      </section>

      {/* ── Vzorec kalkulácie (len admin) ───────────────────────────────── */}
      {jeAdmin && (
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="font-bold text-gray-800 text-lg mb-3">💶 Vzorec kalkulácie cien</h2>
          <div className="font-mono text-sm bg-gray-50 rounded-xl p-4 space-y-1.5 text-gray-700 border border-gray-100">
            <p>Základ  = Cena zariadenia + Cena materiálu + Marža (1 000 €)</p>
            <p>DPH    = Základ × 23 % <span className="text-gray-400 font-sans text-xs">(pre fyzické osoby)</span></p>
            <p className="font-bold text-gray-900 border-t border-gray-200 pt-1.5 mt-1.5">
              Celková cena = Základ + DPH
            </p>
          </div>
        </section>
      )}

    </div>
  );
}
