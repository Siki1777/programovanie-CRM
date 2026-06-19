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

  // Po úspechu zatvor formulár
  const uspesny = state.success && !state.error;

  if (!otvoreny && !uspesny) {
    return (
      <button
        onClick={() => setOtvoreny(true)}
        className="min-h-[36px] px-3 text-xs font-semibold border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-700 transition-colors whitespace-nowrap"
      >
        {maHeslo ? "Zmeniť heslo" : "Nastaviť heslo"}
      </button>
    );
  }

  if (uspesny) {
    return (
      <span className="text-xs text-green-700 font-semibold bg-green-100 px-3 py-1.5 rounded-xl">
        ✓ Heslo uložené
      </span>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-2 w-full sm:w-auto">
      <input type="hidden" name="kolegaId" value={kolegaId} />

      {state.error && (
        <p className="text-xs text-red-600 font-semibold">{state.error}</p>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          name="heslo"
          type="password"
          required
          placeholder="Nové heslo (min. 8 znakov)"
          autoComplete="new-password"
          className="border-2 border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 min-w-[180px]"
        />
        <input
          name="potvrdit"
          type="password"
          required
          placeholder="Zopakuj heslo"
          autoComplete="new-password"
          className="border-2 border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 min-w-[180px]"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors whitespace-nowrap"
          >
            {pending ? "…" : "Uložiť"}
          </button>
          <button
            type="button"
            onClick={() => setOtvoreny(false)}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-xl transition-colors"
          >
            Zrušiť
          </button>
        </div>
      </div>
    </form>
  );
}
