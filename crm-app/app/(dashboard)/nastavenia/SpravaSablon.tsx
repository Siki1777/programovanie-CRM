"use client";

import { useState, useTransition } from "react";
import { vytvorSablonu, upravSablonu, vymazSablonu } from "@/app/actions/checklist";

type Sablona = { id: string; nazov: string; polozky: string[] };

function SablonaForm({
  sablona,
  isPending,
  formError,
  formPolozky,
  onPolozkyChange,
  onSubmit,
  onCancel,
}: {
  sablona: Sablona | null;
  isPending: boolean;
  formError: string;
  formPolozky: string[];
  onPolozkyChange: (p: string[]) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  function addPolozka() { onPolozkyChange([...formPolozky, ""]); }
  function removePolozka(i: number) { onPolozkyChange(formPolozky.filter((_, idx) => idx !== i)); }
  function updatePolozka(i: number, val: string) {
    onPolozkyChange(formPolozky.map((p, idx) => (idx === i ? val : p)));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {sablona && <input type="hidden" name="id" value={sablona.id} />}
      <input type="hidden" name="polozky" value={JSON.stringify(formPolozky.filter((p) => p.trim()))} />

      {formError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          ⚠ {formError}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
          Názov šablóny
        </label>
        <input
          name="nazov"
          defaultValue={sablona?.nazov ?? ""}
          required
          placeholder="napr. Tepelné čerpadlo"
          className="w-full bg-white border-2 border-gray-300 rounded-xl px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
          Položky checklistu
        </label>
        {formPolozky.map((p, i) => (
          <div key={i} className="flex gap-2 items-center">
            <span className="flex-shrink-0 w-5 text-center text-xs text-gray-400 font-mono">
              {i + 1}.
            </span>
            <input
              value={p}
              onChange={(e) => updatePolozka(i, e.target.value)}
              placeholder={`Položka ${i + 1}`}
              className="flex-1 bg-white border-2 border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {formPolozky.length > 1 && (
              <button
                type="button"
                onClick={() => removePolozka(i)}
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-base"
                title="Odstrániť"
              >
                ×
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addPolozka}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold py-1 px-2 rounded-lg hover:bg-blue-50 transition-colors"
        >
          + Pridať položku
        </button>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="min-h-[44px] px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
        >
          {isPending ? "Ukladám…" : sablona ? "Uložiť zmeny" : "Vytvoriť šablónu"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[44px] px-4 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
        >
          Zrušiť
        </button>
      </div>
    </form>
  );
}

export function SpravaSablon({ sablony }: { sablony: Sablona[] }) {
  const [rezim, setRezim] = useState<"list" | "add" | "edit">("list");
  const [editSablona, setEditSablona] = useState<Sablona | null>(null);
  const [formPolozky, setFormPolozky] = useState<string[]>([""]);
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  function openAdd() {
    setEditSablona(null);
    setFormPolozky([""]);
    setFormError("");
    setRezim("add");
  }

  function openEdit(s: Sablona) {
    setEditSablona(s);
    setFormPolozky(s.polozky.length > 0 ? [...s.polozky] : [""]);
    setFormError("");
    setRezim("edit");
  }

  function cancelForm() {
    setRezim("list");
    setEditSablona(null);
    setFormError("");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    // hidden input "polozky" is already set via controlled state in SablonaForm
    setFormError("");
    startTransition(async () => {
      const result =
        rezim === "add"
          ? await vytvorSablonu({}, formData)
          : await upravSablonu({}, formData);
      if (result.error) {
        setFormError(result.error);
      } else {
        setRezim("list");
      }
    });
  }

  function handleDelete(id: string, nazov: string) {
    if (!window.confirm(`Naozaj vymazať šablónu „${nazov}"?`)) return;
    startTransition(async () => {
      await vymazSablonu(id);
    });
  }

  return (
    <div className="space-y-4">
      {rezim !== "list" ? (
        <SablonaForm
          sablona={editSablona}
          isPending={isPending}
          formError={formError}
          formPolozky={formPolozky}
          onPolozkyChange={setFormPolozky}
          onSubmit={handleSubmit}
          onCancel={cancelForm}
        />
      ) : (
        <>
          {sablony.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              <p className="text-4xl mb-2">📋</p>
              <p className="text-sm">Žiadne šablóny. Vytvor prvú šablónu checklistu.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sablony.map((s) => (
                <div key={s.id} className="flex items-center gap-3 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{s.nazov}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {s.polozky.length} položiek
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(s)}
                      title="Upraviť šablónu"
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors text-sm"
                    >✏</button>
                    <button
                      onClick={() => handleDelete(s.id, s.nazov)}
                      disabled={isPending}
                      title="Vymazať šablónu"
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors text-sm disabled:opacity-40"
                    >🗑</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={openAdd}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 rounded-xl text-sm text-gray-500 hover:text-blue-600 font-semibold transition-colors"
          >
            + Nová šablóna
          </button>
        </>
      )}
    </div>
  );
}
