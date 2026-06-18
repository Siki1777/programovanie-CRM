-- CRM Alter 4 – profilové fotky
-- docker cp prisma/alter4.sql crm-app-db-1:/tmp/alter4.sql && docker exec crm-app-db-1 psql -U crm -d crm_db -f /tmp/alter4.sql

ALTER TABLE kolega   ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE zakaznik ADD COLUMN IF NOT EXISTS foto_url TEXT;

SELECT 'Alter4 OK – kolega: ' || COUNT(*) FROM kolega;
