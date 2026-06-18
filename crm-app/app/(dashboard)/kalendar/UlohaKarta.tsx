"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toggleUloha } from "@/app/actions/zakazky";
import { formatDatum } from "@/lib/formatters";

const TECH_IKONA: Record<string, string> = {
  TEPELNE_CERPADLO: "🌡️",
  KLIMATIZACIA:     "❄️",
  KOMIN:            "🏠",
  KRB:              "🔥",
  FOTOVOLTIKA:      "☀️",
};

export type UlohaKartaProps = {
  id: string;
  zakazkaId: string;
  nazov: string;
  termin: string | null;
  splnena: boolean;
  kolegaId: string | null;
  cislo: string;
  zak_meno: string;
  zak_priezvisko: string;
  technologia: string;
  kol_meno: string | null;
  kol_priezvisko: string | null;
};

export function UlohaKarta(props: UlohaKartaProps) {
  const [pending, start] = useTransition();

  const terminDate = props.termin ? new Date(props.termin) : null;
  const dnesStart  = new Date(); dnesStart.setHours(0, 0, 0, 0);
  const isOverdue  = terminDate && !props.splnena && terminDate < dnesStart;
  const isDnes     = terminDate && !isOverdue &&
    terminDate < new Date(dnesStart.getTime() + 86_400_000);

  return (
    <div className={[
      "flex items-start gap-4 p-4 md:p-3 rounded-2xl border transition-all",
      pending   ? "opacity-50" : "",
      props.splnena ? "bg-gray-50 border-gray-100"
        : isOverdue   ? "bg-red-50 border-red-200 shadow-sm"
        : isDnes      ? "bg-blue-50 border-blue-200 shadow-sm"
        :               "bg-white border-gray-200 shadow-sm",
    ].join(" ")}>

      {/* Obrie zaškrtávacie políčko */}
      <button
        onClick={() => start(() => toggleUloha(props.id, !props.splnena, props.zakazkaId))}
        disabled={pending}
        aria-label={props.splnena ? "Označiť ako nesplnené" : "Označiť ako splnené"}
        className={[
          "flex-shrink-0 rounded-xl border-2 transition-all active:scale-95",
          "flex items-center justify-center font-bold",
          "w-14 h-14 md:w-10 md:h-10 text-3xl md:text-xl",
          props.splnena
            ? "bg-green-500 border-green-500 text-white"
            : isOverdue
            ? "border-red-300 hover:border-green-400 hover:bg-green-50"
            : "border-gray-300 hover:border-green-400 hover:bg-green-50",
        ].join(" ")}
      >
        {props.splnena ? "✓" : ""}
      </button>

      {/* Obsah úlohy */}
      <div className="flex-1 min-w-0">
        <p className={[
          "text-xl md:text-base font-semibold leading-tight",
          props.splnena ? "line-through text-gray-400" : "text-gray-900",
        ].join(" ")}>
          {props.nazov}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2">

          {/* Zákazka link */}
          <Link
            href={`/zakazky/${props.zakazkaId}?tab=schvalenie_plan`}
            className="flex items-center gap-1.5 text-blue-600 hover:underline"
          >
            <span className="text-base">{TECH_IKONA[props.technologia] ?? "📦"}</span>
            <span className="text-xs font-mono">{props.cislo}</span>
            <span className="text-xs text-blue-500">
              – {props.zak_meno} {props.zak_priezvisko}
            </span>
          </Link>

          {/* Zodpovedný kolega */}
          {props.kol_meno && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              👤 {props.kol_meno} {props.kol_priezvisko?.[0]}.
            </span>
          )}

          {/* Termín badge */}
          {terminDate && (
            <span className={[
              "text-xs px-2 py-0.5 rounded-full font-medium",
              isOverdue ? "bg-red-100 text-red-700"
                : isDnes  ? "bg-blue-100 text-blue-700"
                :           "bg-gray-100 text-gray-600",
            ].join(" ")}>
              ⏰ {isOverdue ? "Po termíne – " : isDnes ? "Dnes – " : ""}
              {formatDatum(props.termin!)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
