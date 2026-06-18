import { toggleChecklist } from "@/app/actions/zakazky";
import type { ZakazkaRow } from "../types";

const CHECKLIST = [
  { key: "dymovod",     label: "Priemer / stav dymovodu" },
  { key: "elektro",     label: "Stav ističov a elektro prípojky" },
  { key: "vykurovanie", label: "Typ vykurovacieho systému" },
  { key: "priestor",    label: "Dostupnosť priestoru pre vonkajšiu jednotku" },
  { key: "rozvody",     label: "Vzdialenosť od rozvodov" },
  { key: "fasada",      label: "Stav fasády / strechy" },
  { key: "fotky",       label: "Fotodokumentácia vyhotovená" },
];

export function ObhliadkaTab({ zakazka }: { zakazka: ZakazkaRow }) {
  const checklist = zakazka.checklistObhliadka ?? {};
  const splnene = CHECKLIST.filter((c) => checklist[c.key]).length;

  return (
    <div className="space-y-4">

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">🔍 Technický checklist</h2>
          <span className="text-sm font-semibold text-gray-500">
            {splnene}/{CHECKLIST.length}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${(splnene / CHECKLIST.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Checklist položky – každá je form (Server Action, funguje bez JS) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {CHECKLIST.map((item) => {
            const checked = !!checklist[item.key];
            return (
              <form
                key={item.key}
                action={async () => {
                  "use server";
                  await toggleChecklist(zakazka.id, item.key, checked);
                }}
              >
                <button
                  type="submit"
                  className="
                    w-full flex items-center gap-4 px-5
                    min-h-[72px] md:min-h-[56px]
                    text-left hover:bg-gray-50 active:bg-gray-100
                    transition-colors group
                  "
                >
                  {/* Veľký checkbox */}
                  <span
                    className={[
                      "flex-shrink-0 w-10 h-10 md:w-8 md:h-8 rounded-lg border-2",
                      "flex items-center justify-center text-2xl md:text-xl",
                      "transition-all",
                      checked
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300 group-hover:border-blue-400",
                    ].join(" ")}
                  >
                    {checked ? "✓" : ""}
                  </span>
                  <span className={`text-xl md:text-base font-medium ${checked ? "line-through text-gray-400" : "text-gray-800"}`}>
                    {item.label}
                  </span>
                </button>
              </form>
            );
          })}
        </div>
      </div>

      {/* Simulované tlačidlo na fotenie */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-4">📸 Fotodokumentácia</h2>
        <label className="
          flex items-center justify-center gap-3
          w-full min-h-[80px] md:min-h-[60px]
          border-2 border-dashed border-gray-300
          hover:border-blue-400 hover:bg-blue-50
          rounded-2xl cursor-pointer transition-colors
          text-2xl md:text-lg font-bold text-gray-600 hover:text-blue-600
        ">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            multiple
          />
          <span className="text-3xl">📷</span>
          Odfotiť / nahrať
        </label>
        <p className="text-xs text-gray-400 text-center mt-2">
          Na mobile otvorí kameru. Fotky budú automaticky zmenšené.
        </p>
      </div>

    </div>
  );
}
