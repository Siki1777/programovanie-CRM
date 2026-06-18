"use client";

import { useRef, useTransition } from "react";
import { nahrajFoto } from "@/app/actions/upload";

type Variant = "overlay" | "standalone";

type Props = {
  typ: "kolega" | "zakaznik";
  entityId: string;
  /** overlay = malý kruh na avatar, standalone = väčšie tlačidlo vedľa avataru */
  variant?: Variant;
};

export function FotoUploadButton({ typ, entityId, variant = "overlay" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("typ", typ);
    fd.append("id", entityId);
    startTransition(async () => {
      await nahrajFoto(fd);
    });
    // Reset input so rovnaký súbor sa dá nahrať znova
    e.target.value = "";
  };

  const isOverlay = variant === "overlay";

  return (
    <label
      className={[
        "cursor-pointer select-none",
        isOverlay
          ? "absolute -bottom-1 -right-1 z-10"
          : "flex items-center gap-2",
        isPending ? "pointer-events-none" : "",
      ].join(" ")}
      title="Nahrať fotku"
    >
      {/* Skrytý file input – capture="environment" spustí fotoaparát na mobile */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...({ capture: "environment" } as any)}
        className="sr-only"
        onChange={handleChange}
        disabled={isPending}
      />

      {isOverlay ? (
        <div className={[
          "w-7 h-7 rounded-full flex items-center justify-center",
          "bg-blue-600 hover:bg-blue-700 text-white",
          "border-2 border-white shadow-md",
          "transition-all text-sm leading-none",
          isPending ? "opacity-60" : "",
        ].join(" ")}>
          {isPending ? "⏳" : "📷"}
        </div>
      ) : (
        <div className={[
          "flex items-center gap-2 px-4 min-h-[48px] rounded-xl",
          "bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm",
          "shadow-sm transition-all",
          isPending ? "opacity-60" : "",
        ].join(" ")}>
          <span>{isPending ? "⏳" : "📷"}</span>
          <span>{isPending ? "Nahrávam…" : "Nahrať fotku"}</span>
        </div>
      )}
    </label>
  );
}
