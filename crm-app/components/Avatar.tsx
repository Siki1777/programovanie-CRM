"use client";

import { useState } from "react";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const SIZES: Record<Size, string> = {
  xs: "w-6  h-6  text-[10px]",
  sm: "w-8  h-8  text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-xl",
};

type AvatarProps = {
  meno: string;
  priezvisko: string;
  email?: string | null;
  fotoUrl?: string | null;
  size?: Size;
  className?: string;
};

export function Avatar({
  meno,
  priezvisko,
  email,
  fotoUrl,
  size = "md",
  className = "",
}: AvatarProps) {
  const initials = `${meno[0] ?? "?"}${priezvisko[0] ?? ""}`;
  const sizeClass = SIZES[size];

  // Priorita: nahraný súbor > Gravatar > iniciály
  const gravatarUrl = email
    ? `https://unavatar.io/gravatar/${encodeURIComponent(email.toLowerCase().trim())}`
    : null;

  const [imgSrc, setImgSrc] = useState<string | null>(fotoUrl ?? gravatarUrl);

  const base = `${sizeClass} rounded-full flex-shrink-0 overflow-hidden ${className}`;

  if (imgSrc) {
    return (
      <div className={base}>
        <img
          src={imgSrc}
          alt={`${meno} ${priezvisko}`}
          className="w-full h-full object-cover"
          onError={() => setImgSrc(null)}
        />
      </div>
    );
  }

  return (
    <div className={`${base} bg-blue-100 text-blue-700 font-bold flex items-center justify-center`}>
      {initials}
    </div>
  );
}
