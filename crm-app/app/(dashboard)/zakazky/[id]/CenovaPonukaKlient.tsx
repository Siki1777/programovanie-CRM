"use client";

import { useState, useActionState, useTransition } from "react";
import {
  vytvorCenovuPonuku,
  schvalCenovuPonuku,
  vymazCenovuPonuku,
  type CenovaPonukaState,
} from "@/app/actions/cenovaPonuka";
import { formatMena, formatDatum } from "@/lib/formatters";

export type CenovaPonukaRow = {
  id: string;
  verzia: number;
  cenaZariadenie: string;
  cenaMaterial: string;
  marza: string;
  celkovaCena: string;
  schvalena: boolean;
  createdAt: Date;
};

export function CenovaPonukaKlient({
  zakazkaId,
  ponuky,
}: {
  zakazkaId: string;
  ponuky: CenovaPonukaRow[];
}) {
  // Vstupy formulára pre živú kalkuláciu
  const [zariadenie, setZariadenie] = useState("");
  const [material, setMaterial] = useState("");
  const [marza, setMarza] = useState("1000");

  const [createState, createAction, createPending] = useActionState<CenovaPonukaState, FormData>(
    vytvorCenovuPonuku, {}
  );
  const [actionPending, startTransition] = useTransition();

  // Živá kalkulácia
  const cZ      = Math.max(0, Number(zariadenie.replace(",", ".")) || 0);
  const cM      = Math.max(0, Number(material.replace(",", ".")) || 0);
  const cMarza  = Math.max(0, Number(marza.replace(",", ".")) || 0);
  const zaklad  = cZ + cM + cMarza;
  const dph     = zaklad * 0.23;
  const celkova = zaklad * 1.23;

  const nasledujucaVerzia = (ponuky[0]?.verzia ?? 0) + 1;
  const maSchvalenú = ponuky.some((p) => p.schvalena);

  function handleSchvalit(ponuka: CenovaPonukaRow) {
    if (!confirm(
      `Potvrdiť, že zákazník schválil Verziu ${ponuka.verzia} (${formatMena(Number(ponuka.celkovaCena))})?` +
      `\n\nZákazka bude automaticky posunutá do fázy „Schválenie & Plán".`
    )) return;
    startTransition(async () => {
      await schvalCenovuPonuku(ponuka.id, zakazkaId);
    });
  }

  function handleVymazat(ponuka: CenovaPonukaRow) {
    if (!confirm(`Zmazať Verziu ${ponuka.verzia}? Táto akcia je nevratná.`)) return;
    startTransition(async () => {
      await vymazCenovuPonuku(ponuka.id, zakazkaId);
    });
  }

  return (
    <div className="space-y-4">

      {/* ── Formulár: Nová cenová ponuka ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">
            ➕ Nová cenová ponuka
            <span className="ml-2 text-sm font-normal text-gray-400">· Verzia {nasledujucaVerzia}</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Vypočíta cenu automaticky. Môžeš vytvoriť viac verzií a zákazník schváli tú, na ktorej sa dohodli.
          </p>
        </div>

        <form action={createAction} className="space-y-4">
          <input type="hidden" name="zakazkaId" value={zakazkaId} />

          {createState.error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              ⚠ {createState.error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                Cena zariadenia (€)
              </label>
              <input
                type="number"
                name="cenaZariadenie"
                min="0"
                step="0.01"
                value={zariadenie}
                onChange={(e) => setZariadenie(e.target.value)}
                required
                placeholder="0"
                className="w-full border-2 border-gray-300 rounded-xl px-3.5 py-3 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                Cena materiálu (€)
              </label>
              <input
                type="number"
                name="cenaMaterial"
                min="0"
                step="0.01"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                required
                placeholder="0"
                className="w-full border-2 border-gray-300 rounded-xl px-3.5 py-3 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                Marža (€)
              </label>
              <input
                type="number"
                name="marza"
                min="0"
                step="0.01"
                value={marza}
                onChange={(e) => setMarza(e.target.value)}
                required
                placeholder="1000"
                className="w-full border-2 border-gray-300 rounded-xl px-3.5 py-3 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Živá kalkulácia */}
          <div className={`rounded-xl p-4 space-y-1.5 font-mono text-sm transition-all ${
            zaklad > 0 ? "bg-blue-50 border border-blue-100" : "bg-gray-50 border border-gray-100"
          }`}>
            <p className="text-xs font-sans font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Náhľad kalkulácie
            </p>
            <div className="flex justify-between text-gray-600">
              <span>Zariadenie + Materiál + Marža</span>
              <span className={zaklad > 0 ? "text-gray-800 font-semibold" : "text-gray-300"}>
                {zaklad > 0 ? formatMena(zaklad) : "—"}
              </span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>DPH 23 %</span>
              <span className={zaklad > 0 ? "text-gray-600" : "text-gray-300"}>
                {zaklad > 0 ? formatMena(dph) : "—"}
              </span>
            </div>
            <div className={`flex justify-between text-base font-bold border-t pt-2 mt-1 ${
              zaklad > 0 ? "border-blue-200 text-blue-900" : "border-gray-200 text-gray-300"
            }`}>
              <span>CELKOVÁ CENA pre zákazníka</span>
              <span>{zaklad > 0 ? formatMena(celkova) : "—"}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={createPending}
            className="min-h-[44px] px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
          >
            {createPending ? "Vytváram…" : `💾 Vytvoriť Verziu ${nasledujucaVerzia}`}
          </button>

          {createState.success && (
            <p className="text-sm text-green-600">✓ Verzia {nasledujucaVerzia - 1} bola vytvorená.</p>
          )}
        </form>
      </div>

      {/* ── Zoznam verzií ────────────────────────────────────────────── */}
      {ponuky.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
          <p className="text-3xl mb-2">💶</p>
          <p className="text-gray-500 text-sm">Zatiaľ žiadna cenová ponuka. Vytvor prvú verziu hore.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide px-1">
            Všetky verzie ({ponuky.length})
          </h3>

          {ponuky.map((p) => {
            const cZ     = Number(p.cenaZariadenie);
            const cM     = Number(p.cenaMaterial);
            const cMarza = Number(p.marza);
            const zaklad = cZ + cM + cMarza;
            const dph    = zaklad * 0.23;
            const cena   = Number(p.celkovaCena);

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl border shadow-sm p-5 space-y-3 transition-all ${
                  p.schvalena
                    ? "border-green-300 ring-1 ring-green-200"
                    : "border-gray-200"
                }`}
              >
                {/* Hlavička */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-gray-900 text-base">
                      Verzia {p.verzia}
                    </span>
                    <span className="text-xs text-gray-400">{formatDatum(p.createdAt)}</span>
                    {p.schvalena ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-bold">
                        ✓ Schválená zákazníkom
                      </span>
                    ) : (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-semibold">
                        Návrh
                      </span>
                    )}
                  </div>

                  {!p.schvalena && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSchvalit(p)}
                        disabled={actionPending}
                        className="min-h-[36px] px-4 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition-colors"
                      >
                        ✓ Zákazník schválil
                      </button>
                      <button
                        onClick={() => handleVymazat(p)}
                        disabled={actionPending}
                        title="Zmazať návrh"
                        className="min-h-[36px] w-9 flex items-center justify-center border-2 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-400 rounded-xl transition-colors disabled:opacity-60"
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </div>

                {/* Kalkulácia */}
                <div className={`rounded-xl p-4 font-mono text-sm space-y-1.5 ${
                  p.schvalena ? "bg-green-50" : "bg-gray-50"
                }`}>
                  <div className="flex justify-between text-gray-600">
                    <span>Zariadenie</span>
                    <span>{formatMena(cZ)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Materiál</span>
                    <span>{formatMena(cM)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Marža</span>
                    <span>{formatMena(cMarza)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 border-t border-dashed pt-1.5 mt-0.5">
                    <span>DPH 23 %</span>
                    <span>{formatMena(dph)}</span>
                  </div>
                  <div className={`flex justify-between text-base font-bold border-t pt-1.5 ${
                    p.schvalena ? "border-green-200 text-green-800" : "border-gray-200 text-gray-900"
                  }`}>
                    <span>CELKOVÁ CENA</span>
                    <span>{formatMena(cena)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {maSchvalenú && (
        <p className="text-xs text-gray-400 text-center pb-2">
          💡 Zákazku môžeš ďalej posunúť ručne v záhlaví cez zmenu fázy, alebo pokračuj v záložke Schválenie &amp; Plán.
        </p>
      )}
    </div>
  );
}
