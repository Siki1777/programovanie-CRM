-- ═══════════════════════════════════════════════════════════════════
--  CRM – Kompletná migrácia pre Neon (produkcia)
--  Zahŕňa: init + alter 1–5 (všetky schémy a seed dáta)
--
--  POSTUP:
--  1. Otvor Neon Console → tvoj projekt → SQL Editor
--  2. Skopíruj a vlož celý obsah tohto súboru
--  3. Klikni "Run" (alebo Ctrl+Enter)
--
--  Bezpečné na opakované spustenie (DROP IF EXISTS + IF NOT EXISTS).
-- ═══════════════════════════════════════════════════════════════════


-- ── 1. Cleanup (prázdna DB → všetky DROP sú no-op) ──────────────────
DROP TABLE IF EXISTS uloha         CASCADE;
DROP TABLE IF EXISTS cenova_ponuka CASCADE;
DROP TABLE IF EXISTS naklad        CASCADE;
DROP TABLE IF EXISTS zakazka       CASCADE;
DROP TABLE IF EXISTS zakaznik      CASCADE;
DROP TABLE IF EXISTS kolega        CASCADE;


-- ── 2. Schéma: zakaznik ─────────────────────────────────────────────
CREATE TABLE zakaznik (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  meno        TEXT        NOT NULL,
  priezvisko  TEXT        NOT NULL,
  telefon     TEXT        NOT NULL,
  email       TEXT,
  adresa      TEXT,
  poznamka    TEXT,
  foto_url    TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 3. Schéma: zakazka ──────────────────────────────────────────────
CREATE TABLE zakazka (
  id                    TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  cislo                 TEXT        UNIQUE NOT NULL,
  "zakaznikId"          TEXT        NOT NULL REFERENCES zakaznik(id) ON DELETE RESTRICT,
  technologia           TEXT        NOT NULL
    CHECK (technologia IN ('TEPELNE_CERPADLO','KLIMATIZACIA','KOMIN','KRB','FOTOVOLTIKA')),
  faza                  TEXT        NOT NULL DEFAULT 'DOPYT'
    CHECK (faza IN ('DOPYT','OBHLIADKA','CENOVA_PONUKA','SCHVALENIE_PLAN','REALIZACIA','SERVIS')),
  poznamka              TEXT,
  "serialoveCislo"      TEXT,
  "podpisDataUrl"       TEXT,
  "nasledujucaRevizia"  DATE,
  "checklistObhliadka"  JSONB DEFAULT '{}',
  "createdAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 4. Schéma: naklad ───────────────────────────────────────────────
CREATE TABLE naklad (
  id           TEXT          PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "zakazkaId"  TEXT          NOT NULL REFERENCES zakazka(id) ON DELETE CASCADE,
  suma         DECIMAL(10,2) NOT NULL,
  kategoria    TEXT          NOT NULL
    CHECK (kategoria IN ('MATERIAL','DOPRAVA','PRACA','INY')),
  popis        TEXT,
  "fotkaUrl"   TEXT,
  "createdAt"  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);


-- ── 5. Schéma: cenova_ponuka ────────────────────────────────────────
CREATE TABLE cenova_ponuka (
  id               TEXT          PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "zakazkaId"      TEXT          NOT NULL REFERENCES zakazka(id) ON DELETE CASCADE,
  verzia           INTEGER       NOT NULL DEFAULT 1,
  "cenaZariadenie" DECIMAL(10,2) NOT NULL,
  "cenaMaterial"   DECIMAL(10,2) NOT NULL,
  marza            DECIMAL(10,2) NOT NULL DEFAULT 1000,
  dph              DECIMAL(5,4)  NOT NULL DEFAULT 0.23,
  "celkovaCena"    DECIMAL(10,2) NOT NULL,
  schvalena        BOOLEAN       NOT NULL DEFAULT FALSE,
  "createdAt"      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);


-- ── 6. Schéma: kolega ───────────────────────────────────────────────
CREATE TABLE kolega (
  id                 TEXT    PRIMARY KEY DEFAULT gen_random_uuid()::text,
  meno               TEXT    NOT NULL,
  priezvisko         TEXT    NOT NULL,
  telefon            TEXT,
  email              TEXT    NOT NULL,
  "notifikacnyKanal" TEXT    NOT NULL DEFAULT 'email'
    CHECK ("notifikacnyKanal" IN ('whatsapp', 'email', 'google_kalendar')),
  vidi_financie      BOOLEAN NOT NULL DEFAULT FALSE,
  foto_url           TEXT,
  heslo              TEXT
);


-- ── 7. Schéma: uloha (FK na kolega až po jeho vytvorení) ────────────
CREATE TABLE uloha (
  id           TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "zakazkaId"  TEXT        NOT NULL REFERENCES zakazka(id) ON DELETE CASCADE,
  "kolegaId"   TEXT        REFERENCES kolega(id),
  nazov        TEXT        NOT NULL,
  popis        TEXT,
  termin       TIMESTAMPTZ,
  splnena      BOOLEAN     NOT NULL DEFAULT FALSE,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ── 8. Seed: Kolegovia ──────────────────────────────────────────────
-- UPRAV mená, telefóny a e-maily podľa skutočného tímu!
-- Martin (k-1) je Admin (vidi_financie = TRUE) – musí dostať heslo cez /nastavenia.
INSERT INTO kolega (id, meno, priezvisko, telefon, email, vidi_financie) VALUES
  ('k-1', 'Martin',  'Novák',   '+421 900 100 001', 'martin@domterm.sk',  TRUE),
  ('k-2', 'Lukáš',   'Horváth', '+421 900 100 002', 'lukas@domterm.sk',   FALSE),
  ('k-3', 'Tomáš',   'Baláž',   '+421 900 100 003', 'tomas@domterm.sk',   FALSE),
  ('k-4', 'Richard', 'Oravec',  '+421 900 100 004', 'richard@domterm.sk', FALSE)
ON CONFLICT (id) DO NOTHING;


-- ── 9. Seed: Ukážkové dáta (VOLITEĽNÉ) ─────────────────────────────
-- Ak NECHCEŠ testovacie zákazky a zákazníkov v produkcii,
-- vymaž alebo zakomentuj nasledujúci blok.

INSERT INTO zakaznik (id, meno, priezvisko, telefon, email, adresa) VALUES
  ('zk-1', 'Peter',  'Mrkvička', '+421 901 111 222', 'mrkvicka@gmail.com', 'Hlavná 1, Bratislava'),
  ('zk-2', 'Ján',    'Kováč',    '+421 902 333 444', 'kovac@gmail.com',    'Malá 5, Trnava'),
  ('zk-3', 'Tibor',  'Molnár',   '+421 903 555 666', 'molnar@gmail.com',   'Veľká 12, Nitra')
ON CONFLICT (id) DO NOTHING;

INSERT INTO zakazka (id, cislo, "zakaznikId", technologia, faza, poznamka, "serialoveCislo") VALUES
  ('z-1', 'CRM-2024-001', 'zk-1', 'TEPELNE_CERPADLO', 'DOPYT',     'Záujem o vzduch-voda TČ, rodinný dom 180 m²', NULL),
  ('z-2', 'CRM-2024-002', 'zk-2', 'KRB',              'OBHLIADKA', 'Obývacia izba 40 m², krbová vložka Romotop',  NULL),
  ('z-3', 'CRM-2024-003', 'zk-3', 'KLIMATIZACIA',     'REALIZACIA','Multi-split systém, 3 interiérové jednotky',  'DAI-FTXM25M-2024-SK11924')
ON CONFLICT (id) DO NOTHING;

INSERT INTO naklad ("zakazkaId", suma, kategoria, popis) VALUES
  ('z-1',  250.00, 'DOPRAVA',  'Výjazd na obhliadku – 80 km'),
  ('z-2', 1850.00, 'MATERIAL', 'Krbová vložka Romotop Angle 2G L 67.50'),
  ('z-2',  320.00, 'MATERIAL', 'Šamotové tvarovky a tesniaci materiál'),
  ('z-2',  480.00, 'PRACA',    'Murárske práce – 2 dni'),
  ('z-2',  150.00, 'DOPRAVA',  'Doprava materiálu'),
  ('z-3', 3200.00, 'MATERIAL', 'Daikin FTXM-M Multi-split 3× 2.5 kW'),
  ('z-3',  580.00, 'MATERIAL', 'Chladiace potrubie, káble, konzoly'),
  ('z-3',  720.00, 'PRACA',    'Montáž 3 jednotiek – 2 technici, 2 dni'),
  ('z-3',   90.00, 'DOPRAVA',  'Doprava na stavbu');

INSERT INTO cenova_ponuka ("zakazkaId", verzia, "cenaZariadenie", "cenaMaterial", marza, dph, "celkovaCena", schvalena) VALUES
  ('z-2', 1, 1850.00, 820.00, 1000.00, 0.23, 4514.10, TRUE),
  ('z-3', 1, 3200.00, 580.00, 1000.00, 0.23, 5879.40, TRUE);

INSERT INTO uloha ("zakazkaId", "kolegaId", nazov, splnena, termin) VALUES
  ('z-3', 'k-2', 'Doručiť jednotky na stavbu',          TRUE,  NOW() - INTERVAL '5 days'),
  ('z-3', 'k-3', 'Montáž vonkajšej jednotky',            TRUE,  NOW() - INTERVAL '3 days'),
  ('z-3', 'k-2', 'Inštalácia 3 interiérových jednotiek', TRUE,  NOW() - INTERVAL '2 days'),
  ('z-3', 'k-3', 'Tlaková skúška chladivového okruhu',   FALSE, NOW() + INTERVAL '1 day'),
  ('z-3', 'k-1', 'Odovzdanie a zaškolenie zákazníka',    FALSE, NOW() + INTERVAL '3 days');

-- ── Koniec migrácie ─────────────────────────────────────────────────
SELECT '✓ Migrácia OK' AS status;
SELECT 'Kolegovia: ' || COUNT(*) AS info FROM kolega;
SELECT 'Zákazníci: ' || COUNT(*) AS info FROM zakaznik;
SELECT 'Zákazky:   ' || COUNT(*) AS info FROM zakazka;
