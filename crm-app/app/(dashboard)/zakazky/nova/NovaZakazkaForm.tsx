"use client";

import { useActionState } from "react";
import Link from "next/link";
import { vytvorZakazku, type ActionState } from "@/app/actions/zakazky";
import { TECHNOLOGIE } from "@/types";

const ZDROJ_OPTIONS = [
  { value: "odporucanie", label: "Odporúčanie" },
  { value: "web",         label: "Web / Google" },
  { value: "socialne_siete", label: "Sociálne siete" },
  { value: "telefon",     label: "Telefonát" },
  { value: "iny",         label: "Iný" },
];

// Spoločné štýly pre INPUT polia – veľké na mobile
const inputCls =
  "w-full border border-gray-300 rounded-xl px-4 py-3 " +
  "text-xl md:text-base text-gray-900 " +
  "min-h-[60px] md:min-h-[44px] " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 " +
  "placeholder:text-gray-400 bg-white";

const labelCls = "block text-xl md:text-sm font-semibold text-gray-700 mb-2";

export function NovaZakazkaForm() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    vytvorZakazku,
    {}
  );

  return (
    <form action={formAction} className="space-y-8">

      {state.error && (
        <div className="bg-red-50 border border-red-300 text-red-800 rounded-xl
                        px-5 py-4 text-xl md:text-sm font-medium">
          ⚠ {state.error}
        </div>
      )}

      {/* ── Zákazník ────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6 space-y-4">
        <h2 className="text-2xl md:text-lg font-bold text-gray-800 border-b border-gray-100 pb-3">
          👤 Zákazník
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="meno" className={labelCls}>Meno *</label>
            <input
              id="meno"
              name="meno"
              type="text"
              required
              autoComplete="given-name"
              placeholder="napr. Peter"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="priezvisko" className={labelCls}>Priezvisko *</label>
            <input
              id="priezvisko"
              name="priezvisko"
              type="text"
              required
              autoComplete="family-name"
              placeholder="napr. Mrkvička"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label htmlFor="telefon" className={labelCls}>Telefón *</label>
          <input
            id="telefon"
            name="telefon"
            type="tel"
            required
            autoComplete="tel"
            placeholder="+421 9XX XXX XXX"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className={labelCls}>
              E-mail <span className="text-gray-400 font-normal text-base md:text-xs">(nepovinné)</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="meno@email.sk"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="adresa" className={labelCls}>
              Adresa <span className="text-gray-400 font-normal text-base md:text-xs">(nepovinné)</span>
            </label>
            <input
              id="adresa"
              name="adresa"
              type="text"
              autoComplete="street-address"
              placeholder="Ulica, Mesto"
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* ── Technológia – veľké radio karty ────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">
        <h2 className="text-2xl md:text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">
          🔧 Typ technológie *
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {TECHNOLOGIE.map((t) => (
            <label key={t.key} className="cursor-pointer select-none">
              <input
                type="radio"
                name="technologia"
                value={t.key.toUpperCase()}
                className="sr-only peer"
                required
              />
              <div className="
                flex items-center gap-4
                border-2 border-gray-200 rounded-2xl
                px-5 min-h-[72px] md:min-h-[60px]
                transition-all
                peer-checked:border-blue-500 peer-checked:bg-blue-50
                hover:border-blue-300 hover:bg-gray-50
                peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400
              ">
                <span className="text-4xl md:text-3xl">{t.ikona}</span>
                <span className="text-xl md:text-base font-semibold text-gray-800">
                  {t.label}
                </span>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* ── Zdroj dopytu ───────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">
        <h2 className="text-2xl md:text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">
          📣 Odkiaľ sa zákazník dozvedel?
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {ZDROJ_OPTIONS.map((z) => (
            <label key={z.value} className="cursor-pointer select-none">
              <input
                type="radio"
                name="zdrojDopytu"
                value={z.value}
                className="sr-only peer"
              />
              <div className="
                flex items-center justify-center text-center
                border-2 border-gray-200 rounded-2xl
                px-3 min-h-[60px]
                transition-all text-xl md:text-sm font-semibold text-gray-700
                peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700
                hover:border-blue-300
              ">
                {z.label}
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* ── Poznámka ────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">
        <h2 className="text-2xl md:text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">
          📝 Poznámka
        </h2>
        <textarea
          name="poznamka"
          rows={4}
          placeholder="Typ objektu, požiadavky zákazníka, špeciálne podmienky..."
          className={`${inputCls} min-h-0 resize-none`}
        />
      </section>

      {/* ── Odoslať ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 pb-4">
        <button
          type="submit"
          disabled={isPending}
          className="
            flex-1 flex items-center justify-center gap-3
            bg-blue-600 text-white
            min-h-[72px] md:min-h-[52px]
            text-2xl md:text-lg font-bold
            rounded-2xl shadow-md
            hover:bg-blue-700 active:bg-blue-800
            disabled:opacity-60 disabled:cursor-not-allowed
            transition-colors
          "
        >
          {isPending ? (
            <><span className="animate-spin text-2xl">⏳</span> Ukladám zákazku…</>
          ) : (
            <><span>✅</span> Vytvoriť zákazku</>
          )}
        </button>

        <Link
          href="/zakazky"
          className="
            flex items-center justify-center
            bg-white border-2 border-gray-300 text-gray-700
            min-h-[72px] md:min-h-[52px]
            px-6 text-xl md:text-base font-semibold
            rounded-2xl hover:border-gray-400 transition-colors
          "
        >
          Zrušiť
        </Link>
      </div>
    </form>
  );
}
