-- ── alter6: Checklist šablóny ────────────────────────────────────────
-- Spusti na lokálnej DB alebo v Neon SQL Editore (ak migrácia už bola
-- spustená a pridávaš len nové funkcie).

-- 1. Nová tabuľka šablón
CREATE TABLE IF NOT EXISTS checklist_template (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  nazov       TEXT        NOT NULL,
  polozky     JSONB       NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Zmeň default checklistObhliadka z {} na [] (nový formát: pole objektov)
ALTER TABLE zakazka ALTER COLUMN "checklistObhliadka" SET DEFAULT '[]';

-- 3. Nuluj staré záznamy v {} formáte (boli nefunkčné, bezpečné)
UPDATE zakazka
SET "checklistObhliadka" = '[]'::jsonb
WHERE jsonb_typeof("checklistObhliadka") = 'object';

-- 4. Seed: predvolené šablóny pre 5 technológií
INSERT INTO checklist_template (id, nazov, polozky) VALUES
  ('ct-1', 'Tepelné čerpadlo (vzduch-voda)', '[
    "Umiestnenie vonkajšej jednotky – priestor a vzdialenosť od susedov",
    "Dostupnosť pre montáž a budúci servis",
    "Stav elektroinštalácie (1-fáza / 3-fáza, istič, kábel)",
    "Existujúca sústava ÚK – radiátory alebo podlahové kúrenie",
    "Max. teplota vykurovanej vody (≤ 55 °C pre TČ)",
    "Rozmery technickej miestnosti",
    "Prívod a tlak studenej vody",
    "Odvod kondenzátu do kanalizácie",
    "Stav zásobníka TÚV",
    "Vzdialenosť od okien a obytných priestorov (hluk)"
  ]'::jsonb),
  ('ct-2', 'Klimatizácia / Multi-split', '[
    "Miesto inštalácie vonkajšej jednotky",
    "Miesto inštalácie vnútornej jednotky – typ montáže",
    "Dĺžka a trasa vedenia chladiva",
    "Stav elektrickej prípojky (230 V, istič)",
    "Odvod kondenzátu z vnútornej jednotky",
    "Priechodka cez stenu / strop – hrúbka a materiál",
    "Klimatizovaná plocha (m²) a počet miestností",
    "Multi-split – počet vnútorných jednotiek"
  ]'::jsonb),
  ('ct-3', 'Komín', '[
    "Výška komína nad hrebeňom strechy",
    "Vnútorný priemer komínového prierezu (DN)",
    "Stav existujúcej vložky / výmurovky",
    "Kontrola ťahu komína",
    "Prístupnosť revízneho otvoru",
    "Vzdialenosť od horľavých konštrukcií",
    "Typ paliva (drevo, plyn, pelety)",
    "Plánovaný spotrebič (kotol, krb, sporák)"
  ]'::jsonb),
  ('ct-4', 'Krb / Krbová vložka', '[
    "Rozmer otvoru v murive (šírka × výška × hĺbka)",
    "Rozmer komínového hrdla (DN)",
    "Typ paliva – drevo alebo pelety",
    "Výhrevnosť miestnosti – objem priestoru (m³)",
    "Prívod spaľovacieho vzduchu",
    "Vzdialenosť krbovej vložky od horľavých materiálov",
    "Potreba vybúrania existujúceho krbu",
    "Typ podlahy pred krbom – protipožiarna platňa"
  ]'::jsonb),
  ('ct-5', 'Fotovoltika', '[
    "Orientácia strechy (J / JZ / JV)",
    "Sklon strechy (stupne)",
    "Typ strešnej krytiny (škridla, plech, fólia)",
    "Zaclonenie – stromy, komíny, susedné budovy",
    "Stav elektroinštalácie – rozvádzač a hlavné istenie",
    "Umiestnenie invertorov a prípadnej batérie",
    "Požiadavky – ostrovný alebo sieťový systém",
    "Statika strechy – potreba statického posudku",
    "Trasa DC káblov zo strechy k invertoru"
  ]'::jsonb)
ON CONFLICT (id) DO NOTHING;

SELECT '✓ alter6 OK – checklist_template vytvorená' AS status;
SELECT COUNT(*) AS pocet_sablon FROM checklist_template;
