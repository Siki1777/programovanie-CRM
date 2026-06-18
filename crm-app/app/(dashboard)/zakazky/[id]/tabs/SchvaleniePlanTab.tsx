"use client";

import { useTransition } from "react";
import { toggleUloha, zmenZodpovedneho } from "@/app/actions/zakazky";
import { formatDatum } from "@/lib/formatters";
import type { UlohaRow, KolegaRow } from "../types";

function UlohaRiadok({
  uloha,
  kolegovia,
  zakazkaId,
}: {
  uloha: UlohaRow;
  kolegovia: KolegaRow[];
  zakazkaId: string;
}) {
  const [toggling, startToggle] = useTransition();
  const [changing, startChange] = useTransition();

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-gray-100 last:border-0 transition-opacity ${toggling || changing ? "opacity-60" : ""}`}>

      {/* Obrie zaškrtávacie políčko */}
      <button
        onClick={() => startToggle(() => toggleUloha(uloha.id, !uloha.splnena, zakazkaId))}
        disabled={toggling}
        className={[
          "flex-shrink-0 w-14 h-14 md:w-10 md:h-10 rounded-xl border-2",
          "flex items-center justify-center text-3xl md:text-2xl",
          "transition-all active:scale-95",
          uloha.splnena
            ? "bg-green-500 border-green-500 text-white shadow-sm"
            : "border-gray-300 hover:border-green-400 hover:bg-green-50",
        ].join(" ")}
        aria-label={uloha.splnena ? "Označiť ako nesplnené" : "Označiť ako splnené"}
      >
        {uloha.splnena ? "✓" : ""}
      </button>

      {/* Názov + termín */}
      <div className="flex-1 min-w-0">
        <p className={`text-xl md:text-base font-semibold leading-tight ${uloha.splnena ? "line-through text-gray-400" : "text-gray-900"}`}>
          {uloha.nazov}
        </p>
        {uloha.termin && (
          <p className={`text-sm mt-0.5 ${new Date(uloha.termin) < new Date() && !uloha.splnena ? "text-red-500 font-semibold" : "text-gray-400"}`}>
            📅 {formatDatum(uloha.termin)}
            {new Date(uloha.termin) < new Date() && !uloha.splnena && " – Po termíne!"}
          </p>
        )}
      </div>

      {/* Dropdown – zodpovedný kolega */}
      <div className="sm:w-48 flex-shrink-0">
        <select
          value={uloha.kolegaId ?? ""}
          disabled={changing}
          onChange={(e) => {
            const val = e.target.value;
            if (val) startChange(() => zmenZodpovedneho(uloha.id, val, zakazkaId));
          }}
          className="
            w-full border border-gray-200 rounded-xl
            px-3 py-2 min-h-[44px]
            text-lg md:text-sm text-gray-700
            bg-white hover:border-blue-400 focus:outline-none
            focus:ring-2 focus:ring-blue-500 transition-colors
          "
        >
          <option value="">— Priradiť —</option>
          {kolegovia.map((k) => (
            <option key={k.id} value={k.id}>
              {k.meno} {k.priezvisko}
            </option>
          ))}
        </select>
        {changing && (
          <p className="text-xs text-blue-500 mt-1 pl-1">Ukladám…</p>
        )}
      </div>
    </div>
  );
}

export function SchvaleniePlanTab({
  ulohy,
  kolegovia,
  zakazkaId,
}: {
  ulohy: UlohaRow[];
  kolegovia: KolegaRow[];
  zakazkaId: string;
}) {
  const splnene = ulohy.filter((u) => u.splnena).length;

  return (
    <div className="space-y-4">

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">📅 Plán úloh</h2>
          <span className="text-sm font-semibold text-gray-500">
            {splnene}/{ulohy.length} splnených
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all"
            style={{ width: ulohy.length ? `${(splnene / ulohy.length) * 100}%` : "0%" }}
          />
        </div>
      </div>

      {/* Zoznam úloh */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {ulohy.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p className="text-4xl mb-2">📋</p>
            <p className="text-sm">Žiadne úlohy. Pridaj šablónu úloh.</p>
          </div>
        ) : (
          ulohy.map((u) => (
            <UlohaRiadok key={u.id} uloha={u} kolegovia={kolegovia} zakazkaId={zakazkaId} />
          ))
        )}
      </div>

      {/* Notifikačný info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <p className="text-sm text-blue-800 font-medium">💬 Notifikácie pri zmene zodpovedného</p>
        <p className="text-xs text-blue-600 mt-1">
          Keď zmeníš zodpovedného kolegu, systém automaticky odošle správu (WhatsApp / Email / Google Kalendár)
          podľa nastavení v profile kolegu. <span className="font-semibold">Napojenie je pripravené v kóde.</span>
        </p>
      </div>

      {/* Materiál – placeholder */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-3">📦 Materiál na naskladnenie</h2>
        <p className="text-gray-400 text-sm">Správa materiálu – bude dostupná v ďalšej verzii.</p>
      </div>

    </div>
  );
}
