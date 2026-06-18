"use client";

import { useActionState, useState, useEffect } from "react";
import { pridajKolegu, type KolegaState } from "@/app/actions/kolegovia";

const KANALY = [
  { value: "email",           label: "E-mail",          ikona: "📧", desc: "Najspoľahlivejší" },
  { value: "whatsapp",        label: "WhatsApp",        ikona: "💬", desc: "Okamžité správy"  },
  { value: "google_kalendar", label: "Google Kalendár", ikona: "📅", desc: "Udalosti do kalen." },
] as const;

export function PridatKoleguForm() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<KolegaState, FormData>(
    pridajKolegu, {}
  );

  useEffect(() => {
    if (state.success) setOpen(false);
  }, [state.success]);

  return (
    <div className="space-y-3">

      {/* Úspech flash */}
      {state.success && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-300 rounded-xl px-4 py-3">
          <span className="text-xl">✓</span>
          <p className="text-green-800 font-semibold">Kolega bol pridaný do tímu.</p>
        </div>
      )}

      {/* Toggle tlačidlo */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="
            w-full sm:w-auto flex items-center justify-center gap-3
            min-h-[60px] px-6
            bg-blue-600 hover:bg-blue-700 active:bg-blue-800
            text-white text-xl md:text-base font-bold
            rounded-2xl shadow-sm transition-colors
          "
        >
          <span className="text-2xl md:text-xl">➕</span>
          Pridať kolegu
        </button>
      )}

      {/* Rozbalený formulár */}
      {open && (
        <div className="bg-white rounded-2xl border-2 border-blue-400 shadow-md overflow-hidden">
          <div className="bg-blue-600 px-5 py-3 flex items-center justify-between">
            <h3 className="text-white font-bold text-lg">➕ Nový kolega</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-blue-200 hover:text-white text-2xl font-light leading-none"
            >
              ✕
            </button>
          </div>

          <form action={action} className="p-5 space-y-5">

            {state.error && (
              <p className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 font-semibold text-base">
                ⚠️ {state.error}
              </p>
            )}

            {/* Meno + Priezvisko */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xl md:text-sm font-bold text-gray-700">
                  Meno <span className="text-red-500">*</span>
                </label>
                <input
                  name="meno"
                  type="text"
                  required
                  placeholder="Martin"
                  className="
                    w-full border-2 border-gray-300 rounded-xl px-4
                    min-h-[60px] md:min-h-[44px]
                    text-xl md:text-base text-gray-900
                    focus:outline-none focus:border-blue-500
                    placeholder:text-gray-300
                  "
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xl md:text-sm font-bold text-gray-700">
                  Priezvisko <span className="text-red-500">*</span>
                </label>
                <input
                  name="priezvisko"
                  type="text"
                  required
                  placeholder="Novák"
                  className="
                    w-full border-2 border-gray-300 rounded-xl px-4
                    min-h-[60px] md:min-h-[44px]
                    text-xl md:text-base text-gray-900
                    focus:outline-none focus:border-blue-500
                    placeholder:text-gray-300
                  "
                />
              </div>
            </div>

            {/* E-mail */}
            <div className="space-y-2">
              <label className="block text-xl md:text-sm font-bold text-gray-700">
                📧 E-mail <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="martin@firma.sk"
                className="
                  w-full border-2 border-gray-300 rounded-xl px-4
                  min-h-[60px] md:min-h-[44px]
                  text-xl md:text-base text-gray-900
                  focus:outline-none focus:border-blue-500
                  placeholder:text-gray-300
                "
              />
            </div>

            {/* Telefón */}
            <div className="space-y-2">
              <label className="block text-xl md:text-sm font-bold text-gray-700">
                📞 Telefón
              </label>
              <input
                name="telefon"
                type="tel"
                placeholder="+421 900 000 000"
                className="
                  w-full border-2 border-gray-300 rounded-xl px-4
                  min-h-[60px] md:min-h-[44px]
                  text-xl md:text-base text-gray-900
                  focus:outline-none focus:border-blue-500
                  placeholder:text-gray-300
                "
              />
            </div>

            {/* Preferovaný notifikačný kanál */}
            <div className="space-y-2">
              <p className="text-xl md:text-sm font-bold text-gray-700">
                🔔 Preferovaný kanál notifikácií
              </p>
              <div className="grid grid-cols-3 gap-3">
                {KANALY.map((k, i) => (
                  <label key={k.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="kanal"
                      value={k.value}
                      defaultChecked={i === 0}
                      className="peer sr-only"
                    />
                    <div className="
                      flex flex-col items-center text-center gap-1 p-3
                      border-2 border-gray-200 rounded-xl
                      text-gray-500 transition-all
                      peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700
                      hover:border-gray-300 min-h-[80px] md:min-h-[64px] justify-center
                    ">
                      <span className="text-2xl">{k.ikona}</span>
                      <span className="text-sm md:text-xs font-bold">{k.label}</span>
                      <span className="text-xs text-gray-400 hidden md:block">{k.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Akcie */}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={pending}
                className="
                  flex-1 min-h-[64px] md:min-h-[48px]
                  bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                  text-white font-bold text-2xl md:text-base
                  rounded-2xl transition-colors
                "
              >
                {pending ? "Ukladám…" : "✓ Pridať do tímu"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="
                  px-6 min-h-[64px] md:min-h-[48px]
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
