import { nastavReviziu } from "@/app/actions/zakazky";
import { formatDatum } from "@/lib/formatters";
import type { ZakazkaRow } from "../types";

export function ServisTab({ zakazka }: { zakazka: ZakazkaRow }) {
  const dnesDate = new Date();

  // Záruka: 2 roky od vytvorenia zákazky
  const zarukaEnd = new Date(zakazka.createdAt);
  zarukaEnd.setFullYear(zarukaEnd.getFullYear() + 2);
  const zarukaDni = Math.ceil((zarukaEnd.getTime() - dnesDate.getTime()) / 86_400_000);
  const zarukaPlatna = zarukaDni > 0;

  // Nasledujúca revízia
  const reviziaDatum = zakazka.nasledujucaRevizia ? new Date(zakazka.nasledujucaRevizia) : null;
  const reviziaJeBlizko = reviziaDatum
    ? reviziaDatum.getTime() - dnesDate.getTime() < 30 * 86_400_000
    : false;
  const reviziaPoTermine = reviziaDatum ? reviziaDatum < dnesDate : false;

  // Predvyplnený dátum (ak nie je nastavený: +11 mesiacov od dnes)
  const defaultReviziaDate = reviziaDatum
    ? reviziaDatum.toISOString().split("T")[0]
    : new Date(Date.now() + 11 * 30 * 86_400_000).toISOString().split("T")[0];

  return (
    <div className="space-y-4">

      {/* Status záruky */}
      <div className={`rounded-2xl border p-5 ${zarukaPlatna ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
        <div className="flex items-center gap-4">
          <span className="text-5xl">{zarukaPlatna ? "🛡️" : "⚠️"}</span>
          <div>
            <p className="text-lg font-bold text-gray-900">
              {zarukaPlatna ? "Záruka platná" : "Záruka vypršala"}
            </p>
            <p className={`text-base ${zarukaPlatna ? "text-green-700" : "text-red-600"}`}>
              {zarukaPlatna
                ? `Zostáva ${zarukaDni} dní (do ${formatDatum(zarukaEnd)})`
                : `Vypršala ${formatDatum(zarukaEnd)}`}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Zákazka vytvorená: {formatDatum(zakazka.createdAt)} · Záruka 2 roky
            </p>
          </div>
        </div>
      </div>

      {/* Nasledujúca revízia */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">
          ⭐ Nasledujúca revízia
        </h2>

        {reviziaDatum && (
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            reviziaPoTermine
              ? "bg-red-50 border-red-200"
              : reviziaJeBlizko
              ? "bg-orange-50 border-orange-200"
              : "bg-gray-50 border-gray-200"
          }`}>
            <span className="text-3xl">
              {reviziaPoTermine ? "🔴" : reviziaJeBlizko ? "🟠" : "🟢"}
            </span>
            <div>
              <p className="font-bold text-gray-900 text-lg">
                {formatDatum(reviziaDatum)}
              </p>
              <p className="text-sm text-gray-500">
                {reviziaPoTermine
                  ? "⚠️ Revízia je po termíne!"
                  : reviziaJeBlizko
                  ? "Revízia sa blíži (do 30 dní)"
                  : "Revízia naplánovaná"}
              </p>
            </div>
          </div>
        )}

        {/* Formulár na nastavenie/zmenu dátumu */}
        <form action={nastavReviziu} className="space-y-3">
          <input type="hidden" name="zakazkaId" value={zakazka.id} />
          <div>
            <label className="block text-xl md:text-sm font-semibold text-gray-700 mb-2">
              {reviziaDatum ? "Zmeniť dátum revízie" : "Nastaviť dátum revízie"}
            </label>
            <input
              type="date"
              name="datum"
              defaultValue={defaultReviziaDate}
              min={new Date().toISOString().split("T")[0]}
              className="
                w-full border border-gray-300 rounded-xl px-4
                min-h-[60px] md:min-h-[44px]
                text-xl md:text-base text-gray-900
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          </div>
          <button
            type="submit"
            className="
              w-full min-h-[60px] md:min-h-[44px]
              bg-blue-600 text-white font-bold text-xl md:text-base
              rounded-xl hover:bg-blue-700 transition-colors
            "
          >
            💾 Uložiť termín revízie
          </button>
        </form>
      </div>

      {/* Automatické oslovovanie */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <h2 className="text-base font-bold text-blue-800 mb-2">🤖 Automatické oslovovanie zákazníka</h2>
        <p className="text-sm text-blue-700">
          Systém automaticky odošle zákazníkovi správu <strong>1 mesiac pred termínom revízie</strong>
          s ponukou ročnej kontroly zariadenia.
          Táto funkcia generuje opakované tržby bez manuálnej práce.
        </p>
        <div className="mt-3 p-3 bg-white rounded-xl border border-blue-100">
          <p className="text-xs font-mono text-gray-600">
            📱 <em>&bdquo;Dobrý deň {zakazka.meno}, vaše zariadenie nainštalované nami
            si zaslúži ročnú revíziu. Kontaktujte nás pre dohodnutie termínu.&ldquo;</em>
          </p>
        </div>
      </div>

      {/* Servisný protokol – placeholder */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-3">🔧 Servisné protokoly</h2>
        <p className="text-gray-400 text-sm text-center py-4">
          Zatiaľ žiadne servisné návštevy. Vytvoria sa po prvej revízii.
        </p>
      </div>

    </div>
  );
}
