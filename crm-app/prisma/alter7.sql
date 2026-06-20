-- ── alter7: Plánovanie obhliadky + Google Kalendár ──────────────────
-- Spusti na lokálnej DB alebo v Neon SQL Editore.

-- 1. Zákazka: dátum obhliadky, pridelený technik, ID udalosti v Google Kalendári
ALTER TABLE zakazka
  ADD COLUMN IF NOT EXISTS datum_obhliadky   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS technik_id        TEXT REFERENCES kolega(id),
  ADD COLUMN IF NOT EXISTS calendar_event_id TEXT;

-- 2. Kolega: Google e-mail pre pozvánky do kalendára
--    (môže byť iný ako pracovný email, napr. osobný Gmail)
ALTER TABLE kolega
  ADD COLUMN IF NOT EXISTS google_email TEXT;

SELECT 'alter7 OK' AS status;
SELECT 'Zákazky s novými poľami:' AS info, COUNT(*) FROM zakazka;
SELECT 'Kolegovia s novými poľami:' AS info, COUNT(*) FROM kolega;
