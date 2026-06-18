-- CRM Alter 2 – pridať notifikačný kanál ku kolegom
-- Spusti: docker cp prisma/alter2.sql crm-app-db-1:/tmp/alter2.sql && docker exec crm-app-db-1 psql -U crm -d crm_db -f /tmp/alter2.sql

ALTER TABLE kolega
  ADD COLUMN IF NOT EXISTS "notifikacnyKanal" TEXT NOT NULL DEFAULT 'email'
    CHECK ("notifikacnyKanal" IN ('whatsapp', 'email', 'google_kalendar'));

SELECT 'Alter2 OK – kolegovia s kanálom: ' || COUNT(*)::text FROM kolega;
