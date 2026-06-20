"use client";

import { useState, useActionState, useEffect } from "react";
import {
  ulozPlanObhliadky,
  zrusObhliadku,
  type ObhliadkaState,
} from "@/app/actions/obhliadka";

type KolegaOpt = { id: string; meno: string; priezvisko: string };

function toDatetimeLocal(date: Date | null): string {
  if (!date) return "";
  try {
    // sv-SE dáva "YYYY-MM-DD HH:mm:ss" – slice + replace pre datetime-local
    return new Date(date)
      .toLocaleString("sv-SE", { timeZone: "Europe/Bratislava" })
      .slice(0, 16)
      .replace(" ", "T");
  } catch {
    return new Date(date).toISOString().slice(0, 16);
  }
}

function formatDatumSK(date: Date): string {
  try {
    return new Date(date).toLocaleString("sk-SK", {
      timeZone:  "Europe/Bratislava",
      weekday:   "short",
      day:       "numeric",
      month:     "long",
      year:      "numeric",
      hour:      "2-digit",
      minute:    "2-digit",
    });
  } catch {
    return new Date(date).toLocaleString();
  }
}

export function ObhliadkaPlanForm({
  zakazkaId,
  datumObhliadky,
  technikId,
  calendarEventId,
  kolegovia,
}: {
  zakazkaId:       string;
  datumObhliadky:  Date | null;
  technikId:       string | null;
  calendarEventId: string | null;
  kolegovia:       KolegaOpt[];
}) {
  const isPlanned = !!(datumObhliadky && technikId);
  const [editMode, setEditMode] = useState(!isPlanned);

  const [saveState, saveAction, savePending] = useActionState<ObhliadkaState, FormData>(
    ulozPlanObhliadky, {}
  );
  const [cancelState, cancelAction, cancelPending] = useActionState<ObhliadkaState, FormData>(
    zrusObhliadku, {}
  );

  // Po úspešnom uložení zavri formulár
  useEffect(() => {
    if (saveState.success) setEditMode(false);
  }, [saveState.success]);

  // Po zrušení obhliadky otvor formulár (nová obhliadka)
  useEffect(() => {
    if (cancelState.success) setEditMode(true);
  }, [cancelState.success]);

  const technik = kolegovia.find((k) => k.id === technikId);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">

      <h2 className="text-lg font-bold text-gray-800">📅 Plánovanie obhliadky</h2>

      {/* ── Pohľad: naplánovaná obhliadka ── */}
      {isPlanned && !editMode ? (
        <div className="space-y-3">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-1.5">
            <p className="text-sm font-bold text-blue-900">
              {formatDatumSK(datumObhliadky!)}
            </p>
            <p className="text-sm text-blue-700">
              Technik: <span className="font-semibold">
                {technik ? `${technik.meno} ${technik.priezvisko}` : "—"}
              </span>
            </p>
            {calendarEventId ? (
              <p className="text-xs text-green-700 font-medium mt-1">
                ✓ Synchronizované s Google Kalendárom
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">
                Kalendár nie je synchronizovaný
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setEditMode(true)}
              className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors"
            >
              ✎ Zmeniť termín
            </button>

            <form action={cancelAction}>
              <input type="hidden" name="zakazkaId" value={zakazkaId} />
              <button
                type="submit"
                disabled={cancelPending}
                className="text-sm text-red-500 hover:text-red-700 font-semibold transition-colors disabled:opacity-60"
              >
                {cancelPending ? "Rušim…" : "× Zrušiť obhliadku"}
              </button>
            </form>
          </div>

          {cancelState.error && (
            <p className="text-xs text-red-600">⚠ {cancelState.error}</p>
          )}
        </div>

      ) : (
        /* ── Formulár: nová / upravovaná obhliadka ── */
        <form action={saveAction} className="space-y-4">
          <input type="hidden" name="zakazkaId" value={zakazkaId} />

          {saveState.error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              ⚠ {saveState.error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                Technik
              </label>
              <select
                name="technikId"
                defaultValue={technikId ?? ""}
                required
                className="w-full border-2 border-gray-300 rounded-xl px-3.5 py-3 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="" disabled>Vybrať technika…</option>
                {kolegovia.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.meno} {k.priezvisko}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                Dátum a čas
              </label>
              <input
                type="datetime-local"
                name="datum"
                defaultValue={toDatetimeLocal(datumObhliadky)}
                required
                className="w-full border-2 border-gray-300 rounded-xl px-3.5 py-3 text-sm text-gray-900 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="submit"
              disabled={savePending}
              className="min-h-[44px] px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
            >
              {savePending ? "Ukladám…" : "💾 Uložiť a synch. kalendár"}
            </button>
            {isPlanned && (
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="min-h-[44px] px-4 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Zrušiť
              </button>
            )}
          </div>

          {saveState.success && (
            <div className="flex items-center gap-2 text-sm text-green-700">
              <span>✓ Uložené</span>
              {saveState.calendarSynced && (
                <span className="text-xs bg-green-100 px-2 py-0.5 rounded-full font-semibold">
                  Google Kalendár synchronizovaný
                </span>
              )}
              {saveState.calendarSynced === false && (
                <span className="text-xs text-gray-400">
                  (Kalendár nesynchronizovaný – skontroluj nastavenia)
                </span>
              )}
            </div>
          )}

          {!isPlanned && (
            <p className="text-xs text-gray-400">
              💡 Po uložení dostane technik pozvánku do Google Kalendára na zadaný e-mail.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
