import type { ZakazkaRow } from "../types";
import { TECHNOLOGIE } from "@/types";

export function DopytTab({ zakazka }: { zakazka: ZakazkaRow }) {
  const techInfo = TECHNOLOGIE.find((t) => t.key === zakazka.technologia.toLowerCase());
  const mapsUrl = zakazka.adresa
    ? `https://maps.google.com/?q=${encodeURIComponent(zakazka.adresa)}`
    : null;

  return (
    <div className="space-y-4">

      {/* Zákazník – kontaktné info */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">
          👤 Kontakt zákazníka
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Meno</p>
            <p className="text-xl md:text-base font-bold text-gray-900">
              {zakazka.meno} {zakazka.priezvisko}
            </p>
          </div>
          {zakazka.email && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">E-mail</p>
              <a
                href={`mailto:${zakazka.email}`}
                className="text-blue-600 text-xl md:text-base hover:underline break-all"
              >
                {zakazka.email}
              </a>
            </div>
          )}
        </div>

        {/* Telefón – obrie zelené tlačidlo */}
        <a
          href={`tel:${zakazka.telefon}`}
          className="
            flex items-center justify-center gap-4
            w-full min-h-[72px] md:min-h-[56px]
            bg-green-600 hover:bg-green-700 active:bg-green-800
            text-white text-2xl md:text-lg font-bold
            rounded-2xl shadow-md transition-colors
          "
        >
          <span className="text-3xl">📞</span>
          {zakazka.telefon}
        </a>

        {/* Adresa + Google Mapy */}
        {zakazka.adresa && (
          <div className="space-y-2">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Adresa</p>
            <p className="text-xl md:text-base text-gray-800">{zakazka.adresa}</p>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex items-center justify-center gap-3
                  w-full min-h-[64px] md:min-h-[48px]
                  bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                  text-white text-xl md:text-base font-bold
                  rounded-2xl shadow-sm transition-colors
                "
              >
                <span className="text-2xl">🗺️</span>
                Navigovať na adresu
              </a>
            )}
          </div>
        )}
      </div>

      {/* Typ technológie + zdroj */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">
          🔧 Predmet zákazky
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-5xl">{techInfo?.ikona ?? "🔧"}</span>
          <div>
            <p className="text-2xl md:text-xl font-bold text-gray-900">{techInfo?.label ?? zakazka.technologia}</p>
            <p className="text-sm text-gray-400 mt-1">Technológia</p>
          </div>
        </div>
        {zakazka.poznamka && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Poznámka</p>
            <p className="text-base text-gray-700">{zakazka.poznamka}</p>
          </div>
        )}
      </div>

    </div>
  );
}
