-- CRM Alter 5 – heslo pre kolegov (produkčná autentifikácia)
-- docker cp prisma/alter5.sql crm-app-db-1:/tmp/alter5.sql && docker exec crm-app-db-1 psql -U crm -d crm_db -f /tmp/alter5.sql

ALTER TABLE kolega
  ADD COLUMN IF NOT EXISTS heslo TEXT;

-- Existujúce záznamy nemajú heslo → Admin im ho musí nastaviť v /nastavenia
SELECT id, meno, priezvisko, email,
       CASE WHEN heslo IS NULL THEN 'BEZ HESLA' ELSE 'nastavené' END AS stav_hesla
FROM kolega ORDER BY id;
