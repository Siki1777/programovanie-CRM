-- CRM Init Script – tabuľky + seed dáta
-- Spusti: docker exec -i crm-app-db-1 psql -U crm -d crm_db < prisma/init.sql

-- Cleanup (bezpečné opakované spustenie)
DROP TABLE IF EXISTS uloha        CASCADE;
DROP TABLE IF EXISTS cenova_ponuka CASCADE;
DROP TABLE IF EXISTS naklad        CASCADE;
DROP TABLE IF EXISTS zakazka       CASCADE;
DROP TABLE IF EXISTS zakaznik      CASCADE;

-- ── Zákazník ────────────────────────────────────────────────────────────────
CREATE TABLE zakaznik (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  meno        TEXT        NOT NULL,
  priezvisko  TEXT        NOT NULL,
  telefon     TEXT        NOT NULL,
  email       TEXT,
  adresa      TEXT,
  poznamka    TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Zákazka ─────────────────────────────────────────────────────────────────
CREATE TABLE zakazka (
  id           TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  cislo        TEXT        UNIQUE NOT NULL,
  "zakaznikId" TEXT        NOT NULL REFERENCES zakaznik(id) ON DELETE RESTRICT,
  technologia  TEXT        NOT NULL
                           CHECK (technologia IN ('TEPELNE_CERPADLO','KLIMATIZACIA','KOMIN','KRB','FOTOVOLTIKA')),
  faza         TEXT        NOT NULL DEFAULT 'DOPYT'
                           CHECK (faza IN ('DOPYT','OBHLIADKA','CENOVA_PONUKA','SCHVALENIE_PLAN','REALIZACIA','SERVIS')),
  poznamka     TEXT,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Náklad ──────────────────────────────────────────────────────────────────
CREATE TABLE naklad (
  id           TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "zakazkaId"  TEXT        NOT NULL REFERENCES zakazka(id) ON DELETE CASCADE,
  suma         DECIMAL(10,2) NOT NULL,
  kategoria    TEXT        NOT NULL
                           CHECK (kategoria IN ('MATERIAL','DOPRAVA','PRACA','INY')),
  popis        TEXT,
  "fotkaUrl"   TEXT,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Cenová ponuka ────────────────────────────────────────────────────────────
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

-- ── Úloha ────────────────────────────────────────────────────────────────────
CREATE TABLE uloha (
  id           TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "zakazkaId"  TEXT        NOT NULL REFERENCES zakazka(id) ON DELETE CASCADE,
  nazov        TEXT        NOT NULL,
  popis        TEXT,
  termin       TIMESTAMPTZ,
  splnena      BOOLEAN     NOT NULL DEFAULT FALSE,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- SEED DÁT
-- ══════════════════════════════════════════════════════════════════════════════

INSERT INTO zakaznik (id, meno, priezvisko, telefon, email, adresa) VALUES
  ('zk-1', 'Peter',  'Mrkvička', '+421 901 111 222', 'mrkvicka@gmail.com', 'Hlavná 1, Bratislava'),
  ('zk-2', 'Ján',    'Kováč',    '+421 902 333 444', 'kovac@gmail.com',    'Malá 5, Trnava'),
  ('zk-3', 'Tibor',  'Molnár',   '+421 903 555 666', 'molnar@gmail.com',   'Veľká 12, Nitra');

INSERT INTO zakazka (id, cislo, "zakaznikId", technologia, faza, poznamka) VALUES
  ('z-1', 'CRM-2024-001', 'zk-1', 'TEPELNE_CERPADLO', 'DOPYT',     'Záujem o vzduch-voda TČ, rodinný dom 180 m²'),
  ('z-2', 'CRM-2024-002', 'zk-2', 'KRB',              'OBHLIADKA', 'Obývacia izba 40 m², krbová vložka Romotop'),
  ('z-3', 'CRM-2024-003', 'zk-3', 'KLIMATIZACIA',     'REALIZACIA','Multi-split systém, 3 interiérové jednotky');

-- Náklady
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

-- Cenové ponuky  (základ = zariadenie + materiál + marža, celkovo × 1.23 DPH)
-- z-2: (1850 + 820 + 1000) × 1.23 = 4 514.10 €
-- z-3: (3200 + 580 + 1000) × 1.23 = 5 879.40 €
INSERT INTO cenova_ponuka ("zakazkaId", verzia, "cenaZariadenie", "cenaMaterial", marza, dph, "celkovaCena", schvalena) VALUES
  ('z-2', 1, 1850.00, 820.00, 1000.00, 0.23, 4514.10, TRUE),
  ('z-3', 1, 3200.00, 580.00, 1000.00, 0.23, 5879.40, TRUE);

-- Ukážkové úlohy pre zákazku v realizácii
INSERT INTO uloha ("zakazkaId", nazov, splnena, termin) VALUES
  ('z-3', 'Doručiť jednotky na stavbu',         TRUE,  NOW() - INTERVAL '5 days'),
  ('z-3', 'Montáž vonkajšej jednotky',           TRUE,  NOW() - INTERVAL '3 days'),
  ('z-3', 'Inštalácia 3 interiérových jednotiek',TRUE,  NOW() - INTERVAL '2 days'),
  ('z-3', 'Tlaková skúška chladivového okruhu',  FALSE, NOW() + INTERVAL '1 day'),
  ('z-3', 'Odovzdanie a zaškolenie zákazníka',   FALSE, NOW() + INTERVAL '3 days');

SELECT 'Seed OK – zákazníci: ' || COUNT(*)::text FROM zakaznik;
SELECT 'Zákazky: ' || COUNT(*)::text FROM zakazka;
SELECT 'Náklady: ' || COUNT(*)::text FROM naklad;
