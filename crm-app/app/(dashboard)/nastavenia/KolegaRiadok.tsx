"use client";

import { useState, useActionState, useEffect } from "react";
import { Avatar } from "@/components/Avatar";
import { FotoUploadButton } from "@/components/FotoUploadButton";
import { nastavVidiFinancie } from "@/app/actions/session";
import {
  nastavKanal,
  upravKolegu,
  vymazKolegu,
  type UpravitState,
  type VymazatState,
} from "@/app/actions/kolegovia";

const KANALY = [
  { value: "whatsapp",        label: "WhatsApp",        ikona: "💬" },
  { value: "email",           label: "E-mail",          ikona: "📧" },
  { value: "google_kalendar", label: "Google Kalendár", ikona: "📅" },
] as const;

type KolegaData = {
  id: string;
  meno: string;
  priezvisko: string;
  email: string;
  telefon: string | null;
  fotoUrl: string | null;
  notifikacnyKanal: string;
  vidiFinancie: boolean;
};

export function KolegaRiadok({
  kolega,
  jeAdmin,
  jeAktivny,
}: {
  kolega: KolegaData;
  jeAdmin: boolean;
  jeAktivny: boolean;
}) {
  const [rezim, setRezim] = useState<"view" | "edit" | "delete">("view");

  const [editState, editAction, editPending] = useActionState<UpravitState, FormData>(
    upravKolegu, {}
  );
  const [deleteState, deleteAction, deletePending] = useActionState<VymazatState, FormData>(
    vymazKolegu, {}
  );

  // Zatvor formulár po úspešnom uložení
  useEffect(() => {
    if (editState.success && !editState.error) setRezim("view");
  }, [editState.success, editState.error]);

  // Po vymazaní zobraz krátku správu (kým server re-render odstráni riadok)
  if (deleteState.success && !deleteState.error) {
    return (
      <div className="px-6 py-3 flex items-center gap-2 text-sm text-gray-400 italic">
        <span className="text-green-600 not-italic">✓</span>
        Kolega bol vymazaný
      </div>
    );
  }

  return (
    <div className="px-6 py-4 space-y-3">

      {/* ── Hlavný riadok: Avatar · Info · Tlačidlá ────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">

        {/* Avatar + foto upload */}
        <div className="relative flex-shrink-0">
          <Avatar
            meno={kolega.meno}
            priezvisko={kolega.priezvisko}
            email={kolega.email}
            fotoUrl={kolega.fotoUrl}
            size="md"
            className={jeAktivny ? "ring-2 ring-blue-500 ring-offset-1" : ""}
          />
          <FotoUploadButton typ="kolega" entityId={kolega.id} variant="overlay" />
        </div>

        {/* Meno + kontakty */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900 text-base">
              {kolega.meno} {kolega.priezvisko}
            </p>
            {jeAktivny && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                Ty
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap mt-0.5">
            <a href={`mailto:${kolega.email}`} className="text-xs text-blue-600 hover:underline">
              {kolega.email}
            </a>
            {kolega.telefon && (
              <a href={`tel:${kolega.telefon}`} className="text-xs text-gray-400 hover:text-gray-600">
                {kolega.telefon}
              </a>
            )}
          </div>
        </div>

        {/* Ovládacie prvky: Finance · Kanály · Edit · Delete */}
        <div className="flex items-center gap-2 flex-wrap">

          {jeAdmin && (
            <form action={nastavVidiFinancie.bind(null, kolega.id, !kolega.vidiFinancie)}>
              <button
                type="submit"
                className={[
                  "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all",
                  kolega.vidiFinancie
                    ? "bg-green-600 border-green-600 text-white"
                    : "border-gray-200 text-gray-400 hover:border-green-400 hover:text-green-600",
                ].join(" ")}
              >
                💶 {kolega.vidiFinancie ? "Financie ✓" : "Financie"}
              </button>
            </form>
          )}

          {KANALY.map((opt) => {
            const aktivny = kolega.notifikacnyKanal === opt.value;
            return (
              <form key={opt.value} action={nastavKanal.bind(null, kolega.id, opt.value)}>
                <button
                  type="submit"
                  className={[
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all",
                    aktivny
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : "border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600",
                  ].join(" ")}
                >
                  {opt.ikona} {opt.label}
                  {aktivny && <span className="opacity-80">✓</span>}
                </button>
              </form>
            );
          })}

          {/* Edit / Delete — len admin */}
          {jeAdmin && (
            <div className="flex items-center gap-1 border-l border-gray-200 pl-2 ml-1">
              <button
                onClick={() => setRezim(rezim === "edit" ? "view" : "edit")}
                title="Upraviť údaje kolegu"
                className={[
                  "w-9 h-9 flex items-center justify-center rounded-lg text-base transition-colors",
                  rezim === "edit"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-400 hover:text-blue-600 hover:bg-blue-50",
                ].join(" ")}
              >
                ✏
              </button>
              <button
                onClick={() => setRezim(rezim === "delete" ? "view" : "delete")}
                title="Vymazať kolegu"
                className={[
                  "w-9 h-9 flex items-center justify-center rounded-lg text-base transition-colors",
                  rezim === "delete"
                    ? "bg-red-100 text-red-700"
                    : "text-gray-400 hover:text-red-600 hover:bg-red-50",
                ].join(" ")}
              >
                🗑
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ── Editovací formulár (rozbalí sa pod riadkom) ────────────── */}
      {rezim === "edit" && (
        <form action={editAction} className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
          <input type="hidden" name="kolegaId" value={kolega.id} />

          {editState.error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <span className="text-red-500 flex-shrink-0">⚠</span>
              <p className="text-sm text-red-700 font-semibold">{editState.error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                Meno
              </label>
              <input
                name="meno"
                defaultValue={kolega.meno}
                required
                className="w-full bg-white border-2 border-gray-300 rounded-xl px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                Priezvisko
              </label>
              <input
                name="priezvisko"
                defaultValue={kolega.priezvisko}
                required
                className="w-full bg-white border-2 border-gray-300 rounded-xl px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                E-mail
              </label>
              <input
                name="email"
                type="email"
                defaultValue={kolega.email}
                required
                className="w-full bg-white border-2 border-gray-300 rounded-xl px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide">
                Telefón{" "}
                <span className="font-normal normal-case text-gray-400">(nepovinné)</span>
              </label>
              <input
                name="telefon"
                type="tel"
                defaultValue={kolega.telefon ?? ""}
                placeholder="+421 xxx xxx xxx"
                className="w-full bg-white border-2 border-gray-300 rounded-xl px-3.5 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={editPending}
              className="min-h-[44px] px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
            >
              {editPending ? "Ukladám…" : "Uložiť zmeny"}
            </button>
            <button
              type="button"
              onClick={() => setRezim("view")}
              className="min-h-[44px] px-4 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Zrušiť
            </button>
          </div>

        </form>
      )}

      {/* ── Potvrdenie vymazania ────────────────────────────────────── */}
      {rezim === "delete" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">

          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0 leading-none">🗑</span>
            <div>
              <p className="text-sm font-bold text-red-800">
                Naozaj vymazať {kolega.meno} {kolega.priezvisko}?
              </p>
              <p className="text-xs text-red-600 mt-0.5">
                Táto akcia je nevratná. Vymažú sa všetky dáta tohto kolegu.
              </p>
            </div>
          </div>

          {deleteState.error && (
            <p className="text-sm text-red-700 font-semibold bg-red-100 rounded-lg px-3 py-2">
              ⚠ {deleteState.error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <form action={deleteAction}>
              <input type="hidden" name="kolegaId" value={kolega.id} />
              <button
                type="submit"
                disabled={deletePending}
                className="min-h-[44px] px-5 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors"
              >
                {deletePending ? "Mažem…" : "Áno, vymazať"}
              </button>
            </form>
            <button
              onClick={() => setRezim("view")}
              className="min-h-[44px] px-4 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Zrušiť
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
