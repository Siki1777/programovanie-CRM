-- CRM Alter 3 – prístup k finančným reportom
-- Spusti: docker cp prisma/alter3.sql crm-app-db-1:/tmp/alter3.sql && docker exec crm-app-db-1 psql -U crm -d crm_db -f /tmp/alter3.sql

ALTER TABLE kolega
  ADD COLUMN IF NOT EXISTS vidi_financie BOOLEAN NOT NULL DEFAULT FALSE;

-- Prvý kolega (k-1, Martin Novák) = Admin, má prístup k financiám
UPDATE kolega SET vidi_financie = TRUE WHERE id = 'k-1';

SELECT id, meno, priezvisko, vidi_financie FROM kolega ORDER BY id;
