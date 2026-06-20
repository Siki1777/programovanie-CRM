export type ZakazkaRow = {
  id: string;
  cislo: string;
  faza: string;
  technologia: string;
  poznamka: string | null;
  serialoveCislo: string | null;
  podpisDataUrl: string | null;
  nasledujucaRevizia: Date | null;
  checklistObhliadka: { id: string; text: string; splnena: boolean }[];
  datumObhliadky:     Date | null;
  technikId:          string | null;
  calendarEventId:    string | null;
  createdAt: Date;
  updatedAt: Date;
  // Zákazník (JOIN)
  zakaznikId: string;
  meno: string;
  priezvisko: string;
  telefon: string;
  email: string | null;
  adresa: string | null;
  zakaznikFotoUrl: string | null;
  // Cenová ponuka (LATERAL JOIN, môže byť null)
  celkovaCena: string | null;
  cenaZariadenie: string | null;
  cenaMaterial: string | null;
  marza: string | null;
  cpSchvalena: boolean | null;
};

export type NakladRow = {
  id: string;
  zakazkaId: string;
  suma: string;
  kategoria: string;
  popis: string | null;
  createdAt: Date;
};

export type UlohaRow = {
  id: string;
  zakazkaId: string;
  nazov: string;
  popis: string | null;
  termin: Date | null;
  splnena: boolean;
  kolegaId: string | null;
  kolega_meno: string | null;
  kolega_priezvisko: string | null;
};

export type KolegaRow = {
  id: string;
  meno: string;
  priezvisko: string;
};
