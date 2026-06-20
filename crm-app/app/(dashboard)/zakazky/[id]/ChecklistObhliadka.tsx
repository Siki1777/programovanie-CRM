"use client";

import { useState, useTransition, useOptimistic } from "react";
import {
  togglePolozkuChecklistu,
  pridajPolozkuChecklistu,
  upravPolozkuChecklistu,
  vymazPolozkuChecklistu,
  aplikujSablonuNaZakazku,
} from "@/app/actions/checklist";

export type PolozkaChecklistu = { id: string; text: string; splnena: boolean };
export type ChecklistSablona  = { id: string; nazov: string; polozky: string[] };

type Action =
  | { op: "toggle"; id: string }
  | { op: "add";    id: string; text: string }
  | { op: "delete"; id: string }
  | { op: "rename"; id: string; text: string }
  | { op: "apply";  items: PolozkaChecklistu[] };

function applyAction(state: PolozkaChecklistu[], a: Action): PolozkaChecklistu[] {
  switch (a.op) {
    case "toggle":  return state.map((p) => p.id === a.id ? { ...p, splnena: !p.splnena } : p);
    case "add":     return [...state, { id: a.id, text: a.text, splnena: false }];
    case "delete":  return state.filter((p) => p.id !== a.id);
    case "rename":  return state.map((p) => p.id === a.id ? { ...p, text: a.text } : p);
    case "apply":   return a.items;
  }
}

export function ChecklistObhliadka({
  zakazkaId,
  initialPolozky,
  sablony,
}: {
  zakazkaId: string;
  initialPolozky: PolozkaChecklistu[];
  sablony: ChecklistSablona[];
}) {
  const [isPending, startTransition] = useTransition();
  const [polozky, applyOptimistic] = useOptimistic(initialPolozky, applyAction);

  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [editText,    setEditText]    = useState("");
  const [newItemText, setNewItemText] = useState("");
  const [selectedSablonId, setSelectedSablonId] = useState(sablony[0]?.id ?? "");

  const splnene = polozky.filter((p) => p.splnena).length;
  const total   = polozky.length;
  const percent = total > 0 ? Math.round((splnene / total) * 100) : 0;

  function handleToggle(id: string) {
    startTransition(async () => {
      applyOptimistic({ op: "toggle", id });
      await togglePolozkuChecklistu(zakazkaId, id);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      applyOptimistic({ op: "delete", id });
      await vymazPolozkuChecklistu(zakazkaId, id);
    });
  }

  function startEditing(item: PolozkaChecklistu) {
    setEditingId(item.id);
    setEditText(item.text);
  }

  function handleRenameCommit(id: string) {
    const original = polozky.find((p) => p.id === id)?.text ?? "";
    const trimmed  = editText.trim();
    setEditingId(null);
    if (!trimmed || trimmed === original) return;
    startTransition(async () => {
      applyOptimistic({ op: "rename", id, text: trimmed });
      await upravPolozkuChecklistu(zakazkaId, id, trimmed);
    });
  }

  function handleAdd() {
    const trimmed = newItemText.trim();
    if (!trimmed) return;
    const tempId = `tmp-${Date.now()}`;
    setNewItemText("");
    startTransition(async () => {
      applyOptimistic({ op: "add", id: tempId, text: trimmed });
      await pridajPolozkuChecklistu(zakazkaId, trimmed);
    });
  }

  function handleApplyTemplate() {
    if (!selectedSablonId) return;
    if (
      polozky.length > 0 &&
      !window.confirm("Existujúce položky checklistu budú nahradené vzor. Pokračovať?")
    ) return;
    const sablona = sablony.find((s) => s.id === selectedSablonId);
    if (!sablona) return;
    const items: PolozkaChecklistu[] = sablona.polozky.map((text, i) => ({
      id: `tmp-${Date.now()}-${i}`,
      text,
      splnena: false,
    }));
    startTransition(async () => {
      applyOptimistic({ op: "apply", items });
      await aplikujSablonuNaZakazku(zakazkaId, selectedSablonId);
    });
  }

  return (
    <div className="space-y-4">

      {/* Hlavička + progress + výber vzoru */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">🔍 Technický checklist</h2>
          <span className={`text-sm font-semibold tabular-nums ${
            total === 0 ? "text-gray-400"
            : splnene === total ? "text-green-600"
            : "text-gray-500"
          }`}>
            {splnene}/{total}{total > 0 && ` (${percent} %)`}
          </span>
        </div>

        {total > 0 && (
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                splnene === total ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        )}

        {/* Výber vzoru */}
        {sablony.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedSablonId}
              onChange={(e) => setSelectedSablonId(e.target.value)}
              className="flex-1 min-w-0 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:border-blue-400 transition-colors"
            >
              {sablony.map((s) => (
                <option key={s.id} value={s.id}>{s.nazov}</option>
              ))}
            </select>
            <button
              onClick={handleApplyTemplate}
              disabled={!selectedSablonId || isPending}
              className="flex-shrink-0 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Načítať vzor
            </button>
          </div>
        )}
      </div>

      {/* Zoznam položiek + pridanie */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {polozky.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-400">
            <p className="text-4xl mb-2">📋</p>
            <p className="text-sm">Checklist je prázdny.</p>
            <p className="text-xs mt-1">Načítaj vzor alebo pridaj vlastné položky nižšie.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {polozky.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 min-h-[60px] md:min-h-[52px]">

                {/* Checkbox */}
                <button
                  onClick={() => handleToggle(item.id)}
                  disabled={isPending}
                  title={item.splnena ? "Označiť ako nesplnené" : "Označiť ako splnené"}
                  className={[
                    "flex-shrink-0 w-10 h-10 md:w-8 md:h-8 rounded-lg border-2",
                    "flex items-center justify-center text-xl md:text-base transition-all",
                    item.splnena
                      ? "bg-green-500 border-green-500 text-white shadow-sm"
                      : "border-gray-300 hover:border-blue-400 active:bg-gray-50",
                  ].join(" ")}
                >
                  {item.splnena ? "✓" : ""}
                </button>

                {/* Text / inline edit */}
                {editingId === item.id ? (
                  <input
                    autoFocus
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={() => handleRenameCommit(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); handleRenameCommit(item.id); }
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="flex-1 bg-blue-50 border-2 border-blue-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:outline-none"
                  />
                ) : (
                  <span
                    className={`flex-1 text-sm font-medium leading-snug cursor-text ${
                      item.splnena ? "line-through text-gray-400" : "text-gray-800"
                    }`}
                    onClick={() => startEditing(item)}
                    title="Klikni na text pre premenovanie"
                  >
                    {item.text}
                  </span>
                )}

                {/* Akcie */}
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={() => startEditing(item)}
                    title="Premenovať"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors text-sm"
                  >✏</button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={isPending}
                    title="Vymazať"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors text-sm disabled:opacity-40"
                  >🗑</button>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Pridanie novej položky */}
        <div className="border-t border-gray-100 px-4 py-3 flex gap-2">
          <input
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
            placeholder="Pridať vlastnú položku…"
            className="flex-1 border-2 border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 transition-colors"
          />
          <button
            onClick={handleAdd}
            disabled={!newItemText.trim() || isPending}
            className="flex-shrink-0 w-11 h-11 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-xl"
          >
            +
          </button>
        </div>

      </div>
    </div>
  );
}
