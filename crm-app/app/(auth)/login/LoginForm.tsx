"use client";

import { useActionState } from "react";
import { prihlasit, type LoginState } from "@/app/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    prihlasit,
    {}
  );

  return (
    <form action={action} className="space-y-5">

      {state.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-red-500 text-xl flex-shrink-0">⚠️</span>
          <p className="text-red-700 font-semibold text-base">{state.error}</p>
        </div>
      )}

      {/* E-mail */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-gray-700">
          E-mail
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="martin@firma.sk"
          className="
            w-full border-2 border-gray-300 rounded-xl px-4
            min-h-[64px] md:min-h-[52px]
            text-xl md:text-base text-gray-900
            focus:outline-none focus:border-blue-500
            placeholder:text-gray-300
            transition-colors
          "
        />
      </div>

      {/* Heslo */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-gray-700">
          Heslo
        </label>
        <input
          name="heslo"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="
            w-full border-2 border-gray-300 rounded-xl px-4
            min-h-[64px] md:min-h-[52px]
            text-xl md:text-base text-gray-900
            focus:outline-none focus:border-blue-500
            placeholder:text-gray-300
            transition-colors
          "
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={pending}
        className="
          w-full min-h-[64px] md:min-h-[52px]
          bg-blue-600 hover:bg-blue-700 active:bg-blue-800
          disabled:opacity-60 disabled:cursor-not-allowed
          text-white font-bold text-xl md:text-base
          rounded-xl shadow-sm
          transition-colors
        "
      >
        {pending ? "Prihlasovanie…" : "Prihlásiť sa →"}
      </button>

    </form>
  );
}
