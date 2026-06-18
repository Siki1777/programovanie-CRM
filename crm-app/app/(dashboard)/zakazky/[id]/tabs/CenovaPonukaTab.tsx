import { formatMena } from "@/lib/formatters";
import type { ZakazkaRow, NakladRow } from "../types";

const KATEGORIE: Record<string, { label: string; farba: string }> = {
  MATERIAL: { label: "Materiál",  farba: "bg-blue-100 text-blue-700" },
  DOPRAVA:  { label: "Doprava",   farba: "bg-yellow-100 text-yellow-700" },
  PRACA:    { label: "Práca",     farba: "bg-purple-100 text-purple-700" },
  INY:      { label: "Iný",       farba: "bg-gray-100 text-gray-600" },
};

export function CenovaPonukaTab({
  zakazka,
  naklady,
}: {
  zakazka: ZakazkaRow;
  naklady: NakladRow[];
}) {
  const maCenuPonuku = zakazka.celkovaCena !== null;
  const celkovaCena = Number(zakazka.celkovaCena ?? 0);
  const cenaZariadenie = Number(zakazka.cenaZariadenie ?? 0);
  const cenaMaterial = Number(zakazka.cenaMaterial ?? 0);
  const marza = Number(zakazka.marza ?? 1000);

  const celkoveNaklady = naklady.reduce((s, n) => s + Number(n.suma), 0);
  const cistyZisk = maCenuPonuku ? celkovaCena - celkoveNaklady : null;

  return (
    <div className="space-y-4">

      {/* Schválená cenová ponuka */}
      {maCenuPonuku ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">
            💶 Schválená cenová ponuka
          </h2>

          {/* Vzorec */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 font-mono text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Zariadenie</span>
              <span>{formatMena(cenaZariadenie)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Materiál</span>
              <span>{formatMena(cenaMaterial)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Marža (fixná)</span>
              <span>{formatMena(marza)}</span>
            </div>
            <div className="flex justify-between text-gray-500 border-t pt-2">
              <span>DPH 23 %</span>
              <span>{formatMena((cenaZariadenie + cenaMaterial + marza) * 0.23)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2">
              <span>CELKOVÁ CENA</span>
              <span className="text-green-700">{formatMena(celkovaCena)}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
          <p className="text-4xl mb-2">💶</p>
          <p className="text-gray-500">Zatiaľ žiadna schválená cenová ponuka.</p>
        </div>
      )}

      {/* Náklady */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <h2 className="text-lg font-bold text-gray-800">🧾 Evidencia nákladov</h2>
          <span className="text-base font-bold text-gray-700">{formatMena(celkoveNaklady)}</span>
        </div>

        {naklady.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Žiadne náklady.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {naklady.map((n) => {
              const kat = KATEGORIE[n.kategoria] ?? { label: n.kategoria, farba: "bg-gray-100 text-gray-600" };
              return (
                <div key={n.id} className="flex items-center gap-3 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${kat.farba}`}>
                    {kat.label}
                  </span>
                  <span className="flex-1 text-sm text-gray-700">{n.popis ?? "—"}</span>
                  <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                    {formatMena(n.suma)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Čistý zisk */}
      {cistyZisk !== null && (
        <div className={`rounded-2xl p-5 border ${cistyZisk >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">Čistý zisk</p>
              <p className="text-xs text-gray-400">Cena ponuky − Celkové náklady</p>
            </div>
            <p className={`text-3xl font-bold ${cistyZisk >= 0 ? "text-green-700" : "text-red-600"}`}>
              {formatMena(cistyZisk)}
            </p>
          </div>
        </div>
      )}

      {/* Priložené súbory (placeholder) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-3">📎 Priložené súbory</h2>
        <div className="space-y-2">
          {[
            { nazov: "Cenova_ponuka_v1.pdf",   datum: "18.6.2024", size: "245 kB" },
            { nazov: "Technicka_sprava.docx",  datum: "18.6.2024", size: "87 kB" },
          ].map((f) => (
            <div key={f.nazov} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50">
              <span className="text-2xl">📄</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{f.nazov}</p>
                <p className="text-xs text-gray-400">{f.datum} · {f.size}</p>
              </div>
              <span className="text-blue-600 text-sm font-medium hover:underline cursor-pointer">↓</span>
            </div>
          ))}
          <label className="flex items-center gap-2 p-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 text-gray-400 hover:text-blue-600 transition-colors">
            <input type="file" className="sr-only" multiple />
            <span className="text-xl">＋</span>
            <span className="text-sm font-medium">Nahrať súbor</span>
          </label>
        </div>
      </div>

    </div>
  );
}
