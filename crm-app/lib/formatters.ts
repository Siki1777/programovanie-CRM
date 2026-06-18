export function formatMena(suma: number | string | null | undefined): string {
  if (suma === null || suma === undefined) return "—";
  return new Intl.NumberFormat("sk-SK", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(Number(suma));
}

export function formatDatum(datum: Date | string | null | undefined): string {
  if (!datum) return "—";
  return new Date(datum).toLocaleDateString("sk-SK", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

export function formatCislo(cislo: string): string {
  return cislo;
}
