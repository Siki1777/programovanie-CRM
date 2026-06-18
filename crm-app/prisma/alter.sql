-- CRM Alter Script – nové stĺpce + tabuľka kolega
-- Spusti: docker cp prisma/alter.sql crm-app-db-1:/tmp/alter.sql && docker exec crm-app-db-1 psql -U crm -d crm_db -f /tmp/alter.sql

-- ── Nové stĺpce na zákazka ─────────────────────────────────────────────────
ALTER TABLE zakazka
  ADD COLUMN IF NOT EXISTS "serialoveCislo"      TEXT,
  ADD COLUMN IF NOT EXISTS "podpisDataUrl"        TEXT,
  ADD COLUMN IF NOT EXISTS "nasledujucaRevizia"   DATE,
  ADD COLUMN IF NOT EXISTS "checklistObhliadka"   JSONB DEFAULT '{}';

-- ── Tabuľka kolegovia ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kolega (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  meno       TEXT NOT NULL,
  priezvisko TEXT NOT NULL,
  telefon    TEXT,
  email      TEXT NOT NULL
);

INSERT INTO kolega (id, meno, priezvisko, telefon, email) VALUES
  ('k-1', 'Martin',  'Novák',   '+421 900 100 001', 'martin@crm.sk'),
  ('k-2', 'Lukáš',   'Horváth', '+421 900 100 002', 'lukas@crm.sk'),
  ('k-3', 'Tomáš',   'Baláž',   '+421 900 100 003', 'tomas@crm.sk'),
  ('k-4', 'Richard', 'Oravec',  '+421 900 100 004', 'richard@crm.sk')
ON CONFLICT (id) DO NOTHING;

-- ── Väzba úloha → kolega ────────────────────────────────────────────────────
ALTER TABLE uloha
  ADD COLUMN IF NOT EXISTS "kolegaId" TEXT REFERENCES kolega(id);

-- Priradiť ukážkové úlohy kolegom
UPDATE uloha SET "kolegaId" = 'k-2' WHERE nazov LIKE 'Doručiť%';
UPDATE uloha SET "kolegaId" = 'k-3' WHERE nazov LIKE 'Montáž%';
UPDATE uloha SET "kolegaId" = 'k-2' WHERE nazov LIKE 'Inštalácia%';
UPDATE uloha SET "kolegaId" = 'k-3' WHERE nazov LIKE 'Tlaková%';
UPDATE uloha SET "kolegaId" = 'k-1' WHERE nazov LIKE 'Odovzdanie%';

-- Ukážkové sériové číslo pre zákazku v Realizácii
UPDATE zakazka SET "serialoveCislo" = 'DAI-FTXM25M-2024-SK11924' WHERE id = 'z-3';

SELECT 'Alter OK – kolegovia: ' || COUNT(*)::text FROM kolega;
