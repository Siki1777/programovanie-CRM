"use client";

import { useActionState } from "react";
import Link from "next/link";
import { vytvorZakaznika, type ZakaznikState } from "@/app/actions/zakaznici";

export function NovyZakaznikForm() {
  const [state, action, pending] = useActionState<ZakaznikState, FormData>(
    vytvorZakaznika,
    {}
  );

  return (
    <form action={action} className="space-y-5 max-w-xl">

      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-700 font-semibold text-base">⚠️ {state.error}</p>
        </div>
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
            placeholder="Peter"
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
            placeholder="Mrkvička"
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

      {/* Telefón */}
      <div className="space-y-2">
        <label className="block text-xl md:text-sm font-bold text-gray-700">
          📞 Telefón <span className="text-red-500">*</span>
        </label>
        <input
          name="telefon"
          type="tel"
          required
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

      {/* Email */}
      <div className="space-y-2">
        <label className="block text-xl md:text-sm font-bold text-gray-700">
          📧 E-mail
        </label>
        <input
          name="email"
          type="email"
          placeholder="peter@email.sk"
          className="
            w-full border-2 border-gray-300 rounded-xl px-4
            min-h-[60px] md:min-h-[44px]
            text-xl md:text-base text-gray-900
            focus:outline-none focus:border-blue-500
            placeholder:text-gray-300
          "
        />
      </div>

      {/* Adresa */}
      <div className="space-y-2">
        <label className="block text-xl md:text-sm font-bold text-gray-700">
          📍 Adresa
        </label>
        <input
          name="adresa"
          type="text"
          placeholder="Hlavná 1, Bratislava"
          className="
            w-full border-2 border-gray-300 rounded-xl px-4
            min-h-[60px] md:min-h-[44px]
            text-xl md:text-base text-gray-900
            focus:outline-none focus:border-blue-500
            placeholder:text-gray-300
          "
        />
      </div>

      {/* Poznámka */}
      <div className="space-y-2">
        <label className="block text-xl md:text-sm font-bold text-gray-700">
          📝 Poznámka
        </label>
        <textarea
          name="poznamka"
          rows={3}
          placeholder="Rodinný dom, záujem o tepelné čerpadlo..."
          className="
            w-full border-2 border-gray-300 rounded-xl px-4 py-3
            text-xl md:text-base text-gray-900
            focus:outline-none focus:border-blue-500
            placeholder:text-gray-300 resize-none
          "
        />
      </div>

      {/* Akcie */}
      <div className="flex gap-3 pt-2">
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
          {pending ? "Ukladám…" : "✓ Uložiť zákazníka"}
        </button>
        <Link
          href="/zakaznici"
          className="
            px-6 min-h-[64px] md:min-h-[48px] flex items-center justify-center
            border-2 border-gray-300 rounded-2xl
            text-gray-500 text-xl md:text-base font-semibold
            hover:border-gray-400 transition-colors
          "
        >
          Zrušiť
        </Link>
      </div>
    </form>
  );
}
