import { sql } from "@/lib/db";
import type { ZakazkaRow } from "../types";
import { ChecklistObhliadka, type PolozkaChecklistu, type ChecklistSablona } from "../ChecklistObhliadka";

function parseChecklist(raw: unknown): PolozkaChecklistu[] {
  if (Array.isArray(raw)) return raw as PolozkaChecklistu[];
  return [];
}

export async function ObhliadkaTab({ zakazka }: { zakazka: ZakazkaRow }) {
  const sablony = await sql<ChecklistSablona[]>`
    SELECT id, nazov, polozky FROM checklist_template ORDER BY nazov
  `.catch(() => [] as ChecklistSablona[]);

  const polozky = parseChecklist(zakazka.checklistObhliadka);

  return (
    <div className="space-y-4">

      <ChecklistObhliadka
        zakazkaId={zakazka.id}
        initialPolozky={polozky}
        sablony={sablony}
      />

      {/* Fotodokumentácia */}
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
