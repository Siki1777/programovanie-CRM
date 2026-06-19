"use client";

import { useActionState, useState } from "react";
import { nastavHeslo, type HesloState } from "@/app/actions/kolegovia";

type Props = {
  kolegaId: string;
  maHeslo: boolean;
};

export function NastavHesloForm({ kolegaId, maHeslo }: Props) {
  const [otvoreny, setOtvoreny] = useState(false);
  const [state, action, pending] = useActionState<HesloState, FormData>(
    nastavHeslo,
    {}
  );

  const uspesny = state.success && !state.error;

  if (uspesny) {
    return (
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
        <span className="text-green-600 text-base">✓</span>
        <span className="text-sm text-green-700 font-semibold">Heslo bolo uložené</span>
      </div>
    );
  }

  if (!otvoreny) {
    return (
      <button
        onClick={() => setOtvoreny(true)}
        className="
          min-h-[38px] px-4
          text-sm font-semibold
          border-2 border-dashed border-gray-300 rounded-xl
          text-gray-500 hover:border-blue-400 hover:text-blue-700
          transition-colors
        "
      >
        {maHeslo ? "Zmeniť heslo" : "Nastaviť heslo"}
      </button>
    );
  }

  return (
    <form
      action={action}
      className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4"
    >
      <input type="hidden" name="kolegaId" value={kolegaId} />

      {state.error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <span className="text-red-500 flex-shrink-0">⚠</span>
          <p className="text-sm text-red-700 font-semibold">{state.error}</p>
        </div>
      )}

      {/* Inputy vedľa seba na desktop, pod sebou na mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
            Nové heslo
          </label>
          <input
            name="heslo"
            type="password"
            required
            autoComplete="new-password"
            placeholder="min. 8 znakov"
            className="
              w-full bg-white border-2 border-gray-300
              rounded-xl px-3.5 py-3
              text-sm text-gray-900 placeholder:text-gray-400
              focus:outline-none focus:border-blue-500 focus:bg-white
              transition-colors
            "
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
            Potvrdenie hesla
          </label>
          <input
            name="potvrdit"
            type="password"
            required
            autoComplete="new-password"
            placeholder="zopakuj heslo"
            className="
              w-full bg-white border-2 border-gray-300
              rounded-xl px-3.5 py-3
              text-sm text-gray-900 placeholder:text-gray-400
              focus:outline-none focus:border-blue-500 focus:bg-white
              transition-colors
            "
          />
        </div>

      </div>

      {/* Tlačidlá */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="
            min-h-[44px] px-6
            bg-blue-600 hover:bg-blue-700 active:bg-blue-800
            disabled:opacity-60 disabled:cursor-not-allowed
            text-white text-sm font-bold
            rounded-xl shadow-sm
            transition-colors
          "
        >
          {pending ? "Ukladám…" : "Uložiť heslo"}
        </button>
        <button
          type="button"
          onClick={() => setOtvoreny(false)}
          className="
            min-h-[44px] px-4
            text-sm font-semibold text-gray-500
            hover:text-gray-700 hover:bg-gray-200
            rounded-xl transition-colors
          "
        >
          Zrušiť
        </button>
      </div>

    </form>
  );
}
