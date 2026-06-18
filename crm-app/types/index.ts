export type Technologia = "tepelne_cerpadlo" | "klimatizacia" | "kominovid" | "krb" | "fotovoltika";

export type ZdrójDopytu = "web" | "odporucanie" | "socialne_siete" | "telefon" | "iny";

export type FazaZakazky =
  | "dopyt"
  | "obhliadka"
  | "cenova_ponuka"
  | "schvalenie_plan"
  | "realizacia"
  | "servis";

export type KategoraNakladu = "material" | "doprava" | "praca" | "iny";

export type NotifikacnyKanal = "whatsapp" | "email" | "google_kalendar";

export interface Zakaznik {
  id: string;
  meno: string;
  priezvisko: string;
  telefon: string;
  email?: string;
  adresa?: string;
  poznamka?: string;
  vytvorenyAt: Date;
}

export interface Kolega {
  id: string;
  meno: string;
  priezvisko: string;
  telefon: string;
  email: string;
  notifikacnyKanal: NotifikacnyKanal;
}

export interface Zakazka {
  id: string;
  cislo: string;
  zakaznikId: string;
  technologia: Technologia;
  faza: FazaZakazky;
  zodpovednyId: string;
  zdrojDopytu: ZdrójDopytu;
  poznamka?: string;
  vytvorenaAt: Date;
  aktualizovanaAt: Date;
}

export interface CenovaPonuka {
  id: string;
  zakazkaId: string;
  verzia: number;
  cenaZariadenie: number;
  cenaMaterial: number;
  marza: number;       // fixná 1000 €
  dph: number;         // 23 % pre FO
  celkovaCena: number;
  schvalena: boolean;
  pdfUrl?: string;
  vytvorenaAt: Date;
}

export interface Naklad {
  id: string;
  zakazkaId: string;
  suma: number;
  kategoria: KategoraNakladu;
  popis?: string;
  fotkaUrl?: string;
  zadanyKim: string;
  vytvorenyAt: Date;
}

export interface Uloha {
  id: string;
  zakazkaId: string;
  nazov: string;
  popis?: string;
  zodpovednyId: string;
  termin?: Date;
  splnena: boolean;
}

export interface ServisnyProtokol {
  id: string;
  zakazkaId: string;
  datum: Date;
  popis: string;
  technikId: string;
  dalsiaReviziaAt?: Date;
}

export const FAZY_ZAKAZKY: { key: FazaZakazky; label: string; farba: string }[] = [
  { key: "dopyt",           label: "Dopyt",              farba: "bg-gray-100 text-gray-700" },
  { key: "obhliadka",       label: "Obhliadka",          farba: "bg-blue-100 text-blue-700" },
  { key: "cenova_ponuka",   label: "Cenová ponuka",      farba: "bg-yellow-100 text-yellow-700" },
  { key: "schvalenie_plan", label: "Schválenie & Plán",  farba: "bg-orange-100 text-orange-700" },
  { key: "realizacia",      label: "Realizácia",         farba: "bg-purple-100 text-purple-700" },
  { key: "servis",          label: "Servis & Záruka",    farba: "bg-green-100 text-green-700" },
];

export const TECHNOLOGIE: { key: Technologia; label: string; ikona: string }[] = [
  { key: "tepelne_cerpadlo", label: "Tepelné čerpadlo", ikona: "🌡️" },
  { key: "klimatizacia",     label: "Klimatizácia",     ikona: "❄️" },
  { key: "kominovid",        label: "Komín",            ikona: "🏠" },
  { key: "krb",              label: "Krb / Vložka",     ikona: "🔥" },
  { key: "fotovoltika",      label: "Fotovoltika",      ikona: "☀️" },
];
