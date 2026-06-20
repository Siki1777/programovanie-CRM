-- ── alter8: Prílohy zákaziek (dokumenty, PDF ponuky, výkresy) ────────
-- Spusti v Neon SQL Editore alebo lokálne.

CREATE TABLE IF NOT EXISTS priloha (
  id           TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "zakazkaId"  TEXT        NOT NULL REFERENCES zakazka(id) ON DELETE CASCADE,
  nazov        TEXT        NOT NULL,
  url          TEXT        NOT NULL,
  velkost      INTEGER     NOT NULL DEFAULT 0,
  mime_typ     TEXT        NOT NULL DEFAULT 'application/octet-stream',
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_priloha_zakazka ON priloha("zakazkaId");

SELECT 'alter8 OK' AS status;
SELECT COUNT(*) AS prilohy FROM priloha;
