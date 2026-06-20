"use client";

import { useRef, useState, useActionState, useTransition } from "react";
import { nahrajPrilohu, vymazPrilohu, type PrilohaState } from "@/app/actions/prilohy";
import { formatDatum } from "@/lib/formatters";

export type PrilohaRow = {
  id: string;
  nazov: string;
  url: string;
  velkost: number;
  mimeTyp: string;
  createdAt: Date;
};

function formatVelkost(bytes: number): string {
  if (bytes < 1024)          return `${bytes} B`;
  if (bytes < 1024 * 1024)   return `${Math.round(bytes / 1024)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ikonaSuboru(mime: string): string {
  if (mime === "application/pdf")          return "📕";
  if (mime.includes("word"))               return "📝";
  if (mime.includes("excel") || mime.includes("spreadsheet")) return "📊";
  if (mime.includes("powerpoint") || mime.includes("presentation")) return "📑";
  if (mime.startsWith("image/"))           return "🖼";
  if (mime === "text/plain")               return "📄";
  return "📎";
}

const POVOLENE_PRIPONY =
  ".pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .jpg, .jpeg, .png, .webp, .txt";

export function PrilohaUpload({
  zakazkaId,
  prilohy,
}: {
  zakazkaId: string;
  prilohy: PrilohaRow[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [deletePending, startDeleteTransition] = useTransition();

  const [uploadState, uploadAction, uploadPending] = useActionState<PrilohaState, FormData>(
    nahrajPrilohu, {}
  );

  function odosliSubor(file: File) {
    if (file.size > 25 * 1024 * 1024) {
      alert("Súbor je príliš veľký (max 25 MB).");
      return;
    }
    const fd = new FormData();
    fd.append("file", file);
    fd.append("zakazkaId", zakazkaId);
    uploadAction(fd);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) odosliSubor(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) odosliSubor(file);
  }

  function handleVymaz(p: PrilohaRow) {
    if (!confirm(`Zmazať súbor „${p.nazov}"? Táto akcia je nevratná.`)) return;
    startDeleteTransition(async () => {
      await vymazPrilohu(p.id, p.url, zakazkaId);
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-800">📎 Priložené súbory</h2>
        <p className="text-xs text-gray-400 mt-0.5">
          PDF ponuky, výkresy, zmluvy. Max 25 MB na súbor.
        </p>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={[
          "flex flex-col items-center justify-center gap-2 min-h-[100px]",
          "border-2 border-dashed rounded-xl cursor-pointer transition-colors",
          uploadPending
            ? "border-blue-400 bg-blue-50 pointer-events-none"
            : dragOver
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept={POVOLENE_PRIPONY}
          className="sr-only"
          onChange={handleInputChange}
          disabled={uploadPending}
        />
        {uploadPending ? (
          <>
            <span className="text-2xl animate-pulse">⏳</span>
            <p className="text-sm text-blue-600 font-semibold">Nahrávam súbor…</p>
          </>
        ) : (
          <>
            <span className="text-3xl">{dragOver ? "📂" : "📁"}</span>
            <p className="text-sm font-semibold text-gray-600">
              Presuň sem alebo <span className="text-blue-600">klikni pre výber</span>
            </p>
            <p className="text-xs text-gray-400">PDF · Word · Excel · PowerPoint · obrázky</p>
          </>
        )}
      </div>

      {uploadState.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          ⚠ {uploadState.error}
        </div>
      )}
      {uploadState.success && (
        <p className="text-sm text-green-600">✓ Súbor bol úspešne nahraný.</p>
      )}

      {/* Zoznam nahraných súborov */}
      {prilohy.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-2">
          Zatiaľ žiadne priložené súbory.
        </p>
      ) : (
        <div className="divide-y divide-gray-100">
          {prilohy.map((p) => (
            <div key={p.id} className="flex items-center gap-3 py-3">
              <span className="text-2xl flex-shrink-0 leading-none">
                {ikonaSuboru(p.mimeTyp)}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate" title={p.nazov}>
                  {p.nazov}
                </p>
                <p className="text-xs text-gray-400">
                  {formatVelkost(p.velkost)} · {formatDatum(p.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[36px] px-3 flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl transition-colors"
                  title="Otvoriť / stiahnuť"
                >
                  ↓ Stiahnuť
                </a>
                <button
                  onClick={() => handleVymaz(p)}
                  disabled={deletePending}
                  title="Zmazať súbor"
                  className="min-h-[36px] w-9 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-40"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
