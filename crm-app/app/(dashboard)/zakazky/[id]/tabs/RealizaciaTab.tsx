import { ulozSerioveČíslo } from "@/app/actions/zakazky";
import { PodpisCanvas } from "./PodpisCanvas";
import type { ZakazkaRow } from "../types";

export function RealizaciaTab({ zakazka }: { zakazka: ZakazkaRow }) {
  return (
    <div className="space-y-4">

      {/* Sériové číslo zariadenia */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">
          🏷️ Sériové číslo zariadenia
        </h2>
        <form
          action={async (formData: FormData) => {
            "use server";
            await ulozSerioveČíslo(
              formData.get("zakazkaId") as string,
              formData.get("serialoveCislo") as string
            );
          }}
          className="space-y-3"
        >
          <input type="hidden" name="zakazkaId" value={zakazka.id} />
          <input
            name="serialoveCislo"
            type="text"
            defaultValue={zakazka.serialoveCislo ?? ""}
            placeholder="napr. DAI-FTXM25M-2024-SK11924"
            className="
              w-full border border-gray-300 rounded-xl px-4
              min-h-[60px] md:min-h-[44px]
              text-xl md:text-base font-mono text-gray-900
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              placeholder:text-gray-300
            "
          />
          <button
            type="submit"
            className="
              w-full min-h-[60px] md:min-h-[44px]
              bg-blue-600 text-white font-bold text-xl md:text-base
              rounded-xl hover:bg-blue-700 transition-colors
            "
          >
            💾 Uložiť sériové číslo
          </button>
        </form>
        {zakazka.serialoveCislo && (
          <div className="mt-3 flex items-center gap-2 text-green-700">
            <span className="text-xl">✓</span>
            <span className="text-sm font-semibold">Uložené: <code className="font-mono">{zakazka.serialoveCislo}</code></span>
          </div>
        )}
      </div>

      {/* Preberací protokol – digitálny podpis */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-4">
          ✍️ Preberací protokol – podpis zákazníka
        </h2>
        <PodpisCanvas
          zakazkaId={zakazka.id}
          existingDataUrl={zakazka.podpisDataUrl}
        />
      </div>

      {/* Finálna dokumentácia – placeholder */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-3">
          📋 Finálna technická dokumentácia
        </h2>
        <div className="space-y-2">
          {[
            "Revízna správa elektroinštalácie",
            "Protokol o odovzdaní zariadenia",
            "Záručný list výrobcu",
          ].map((dok) => (
            <label
              key={dok}
              className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50"
            >
              <input
                type="file"
                className="sr-only"
                accept=".pdf,.doc,.docx,image/*"
              />
              <span className="text-2xl">📄</span>
              <span className="text-sm text-gray-700 flex-1">{dok}</span>
              <span className="text-blue-500 text-sm">Nahrať</span>
            </label>
          ))}
        </div>
      </div>

    </div>
  );
}
