"use client";

import { useRef, useState, useTransition } from "react";
import { ulozPodpis } from "@/app/actions/zakazky";

export function PodpisCanvas({
  zakazkaId,
  existingDataUrl,
}: {
  zakazkaId: string;
  existingDataUrl: string | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [isSigned, setIsSigned] = useState(false);
  const [showCanvas, setShowCanvas] = useState(!existingDataUrl);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function getXY(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    canvasRef.current!.setPointerCapture(e.pointerId);
    isDrawing.current = true;
    lastPos.current = getXY(e);
    setIsSigned(true);
    setSaved(false);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current!.getContext("2d")!;
    const pos = getXY(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1d4ed8";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  }

  function onPointerUp() {
    isDrawing.current = false;
    lastPos.current = null;
  }

  function clearCanvas() {
    const canvas = canvasRef.current!;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
    setIsSigned(false);
    setSaved(false);
  }

  function handleSave() {
    const dataUrl = canvasRef.current!.toDataURL("image/png");
    startTransition(async () => {
      await ulozPodpis(zakazkaId, dataUrl);
      setSaved(true);
    });
  }

  // Ak existuje podpis a neukázali sme canvas
  if (existingDataUrl && !showCanvas) {
    return (
      <div className="space-y-3">
        <div className="border-2 border-green-400 rounded-2xl overflow-hidden bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={existingDataUrl}
            alt="Uložený podpis zákazníka"
            className="w-full max-h-40 object-contain"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-green-700 font-semibold">✓ Podpis zákazníka uložený</span>
        </div>
        <button
          onClick={() => setShowCanvas(true)}
          className="text-sm text-gray-500 underline hover:text-gray-700"
        >
          Podpísať znovu
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Zákazník sa podpíše prstom priamo na obrazovke.
      </p>

      {/* Canvas plátno */}
      <div className="relative border-2 border-gray-300 rounded-2xl overflow-hidden bg-white touch-none">
        <canvas
          ref={canvasRef}
          width={800}
          height={280}
          className="w-full cursor-crosshair"
          style={{ touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        />
        {!isSigned && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-300 text-xl font-medium select-none">
              ✍️ Podpíšte tu
            </p>
          </div>
        )}
      </div>

      {/* Ovládanie */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={!isSigned || isPending}
          className="
            flex-1 flex items-center justify-center gap-2
            bg-blue-600 text-white font-bold
            min-h-[60px] rounded-2xl text-xl md:text-base
            hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors
          "
        >
          {isPending ? "Ukladám…" : saved ? "✓ Uložené" : "💾 Uložiť podpis"}
        </button>
        <button
          onClick={clearCanvas}
          disabled={isPending}
          className="
            px-5 min-h-[60px] rounded-2xl border-2 border-gray-300
            text-gray-600 text-xl md:text-base font-semibold
            hover:border-gray-400 transition-colors
          "
        >
          Vymazať
        </button>
      </div>

      {saved && (
        <p className="text-sm text-green-700 font-medium text-center">
          ✓ Preberací protokol bol digitálne podpísaný a uložený.
        </p>
      )}
    </div>
  );
}
