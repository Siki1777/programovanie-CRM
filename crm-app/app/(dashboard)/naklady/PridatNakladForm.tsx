"use client";

import { useActionState, useState, useEffect } from "react";
import { pridajNaklad, type NakladState } from "@/app/actions/naklady";

type ZakazkaOption = { id: string; cislo: string; meno: string; priezvisko: string };

const KATEGORIE = [
  { key: "MATERIAL", label: "Materiál",  emoji: "🧱", farba: "border-blue-400   bg-blue-50   text-blue-700  peer-checked:bg-blue-500   peer-checked:text-white peer-checked:border-blue-500" },
  { key: "DOPRAVA",  label: "Doprava",   emoji: "🚚", farba: "border-yellow-400 bg-yellow-50 text-yellow-700 peer-checked:bg-yellow-500 peer-checked:text-white peer-checked:border-yellow-500" },
  { key: "PRACA",    label: "Práca",     emoji: "🔨", farba: "border-purple-400 bg-purple-50 text-purple-700 peer-checked:bg-purple-500 peer-checked:text-white peer-checked:border-purple-500" },
  { key: "INY",      label: "Iné",       emoji: "📦", farba: "border-gray-300   bg-gray-50   text-gray-600  peer-checked:bg-gray-500   peer-checked:text-white peer-checked:border-gray-500" },
];

export function PridatNakladForm({ zakazky }: { zakazky: ZakazkaOption[] }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<NakladState, FormData>(pridajNaklad, {});

  // Zatvoriť formulár + resetovať po úspechu
  useEffect(() => {
    if (state.success) {
      setOpen(false);
      // Po 2s resetujem správu
      const t = setTimeout(() => {}, 2000);
      return () => clearTimeout(t);
    }
  }, [state.success]);

  return (
    <div className="space-y-3">

      {/* Flash úspech */}
      {state.success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-300 rounded-2xl px-5 py-4">
          <span className="text-2xl">✓</span>
          <p className="text-green-800 font-semibold">Náklad bol uložený.</p>
        </div>
      )}

      {/* Hlavný toggle tlačidlo */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="
            w-full flex items-center justify-center gap-4
            min-h-[80px] md:min-h-[56px]
            bg-green-600 hover:bg-green-700 active:bg-green-800
            text-white text-3xl md:text-xl font-bold
            rounded-2xl shadow-md transition-colors
          "
        >
          <span className="text-4xl md:text-2xl">➕</span>
          Pridať náklad
        </button>
      )}

      {/* Rozbalený formulár */}
      {open && (
        <div className="bg-white rounded-2xl border-2 border-green-400 shadow-md overflow-hidden">
          <div className="bg-green-600 px-5 py-3 flex items-center justify-between">
            <h2 className="text-white font-bold text-xl">➕ Nový náklad</h2>
            <button
              onClick={() => setOpen(false)}
              className="text-green-200 hover:text-white text-2xl font-light leading-none"
            >
              ✕
            </button>
          </div>

          <form action={action} className="p-5 space-y-5">

            {/* Error */}
            {state.error && (
              <p className="text-red-600 font-semibold text-base bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                ⚠️ {state.error}
              </p>
            )}

            {/* Zákazka dropdown */}
            <div className="space-y-2">
              <label className="block text-xl md:text-sm font-bold text-gray-700">
                📋 Zákazka <span className="text-red-500">*</span>
              </label>
              <select
                name="zakazkaId"
                required
                className="
                  w-full border-2 border-gray-300 rounded-xl px-4
                  min-h-[64px] md:min-h-[44px]
                  text-xl md:text-base text-gray-900
                  focus:outline-none focus:border-blue-500
                  bg-white
                "
              >
                <option value="">— Vyber zákazku —</option>
                {zakazky.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.cislo} – {z.meno} {z.priezvisko}
                  </option>
                ))}
              </select>
            </div>

            {/* Suma */}
            <div className="space-y-2">
              <label className="block text-xl md:text-sm font-bold text-gray-700">
                💶 Suma (€) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="suma"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                required
                className="
                  w-full border-2 border-gray-300 rounded-xl px-4
                  min-h-[72px] md:min-h-[52px]
                  text-3xl md:text-xl font-bold text-gray-900
                  focus:outline-none focus:border-blue-500
                  placeholder:text-gray-300
                "
              />
            </div>

            {/* Kategória – veľké tlačidlá */}
            <div className="space-y-2">
              <p className="text-xl md:text-sm font-bold text-gray-700">
                🏷️ Kategória <span className="text-red-500">*</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                {KATEGORIE.map((kat, i) => (
                  <label key={kat.key} className="cursor-pointer">
                    <input
                      type="radio"
                      name="kategoria"
                      value={kat.key}
                      defaultChecked={i === 0}
                      className="peer sr-only"
                    />
                    <div className={`
                      flex flex-col items-center justify-center gap-1
                      min-h-[72px] md:min-h-[56px]
                      border-2 rounded-xl font-bold transition-all
                      ${kat.farba}
                    `}>
                      <span className="text-3xl md:text-2xl">{kat.emoji}</span>
                      <span className="text-base md:text-sm">{kat.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Popis (voliteľný) */}
            <div className="space-y-2">
              <label className="block text-xl md:text-sm font-bold text-gray-700">
                📝 Popis (voliteľné)
              </label>
              <input
                type="text"
                name="popis"
                placeholder="napr. Daikin FTXM 2.5 kW"
                className="
                  w-full border-2 border-gray-300 rounded-xl px-4
                  min-h-[64px] md:min-h-[44px]
                  text-xl md:text-base text-gray-900
                  focus:outline-none focus:border-blue-500
                  placeholder:text-gray-300
                "
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={pending}
                className="
                  flex-1 min-h-[72px] md:min-h-[52px]
                  bg-green-600 hover:bg-green-700 disabled:opacity-50
                  text-white font-bold text-2xl md:text-lg
                  rounded-2xl transition-colors
                "
              >
                {pending ? "Ukladám…" : "✓ Uložiť"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="
                  px-6 min-h-[72px] md:min-h-[52px]
                  border-2 border-gray-300 rounded-2xl
                  text-gray-500 text-xl md:text-base font-semibold
                  hover:border-gray-400 transition-colors
                "
              >
                Zrušiť
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
