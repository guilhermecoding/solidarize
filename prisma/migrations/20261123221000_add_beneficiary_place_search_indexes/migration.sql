DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;

  CREATE INDEX IF NOT EXISTS "beneficiary_neighborhood_search_idx"
  ON "public"."beneficiary"
  USING gin (("system-auth".immutable_unaccent(lower("neighborhood"))) public.gin_trgm_ops);

  CREATE INDEX IF NOT EXISTS "beneficiary_city_search_idx"
  ON "public"."beneficiary"
  USING gin (("system-auth".immutable_unaccent(lower("city"))) public.gin_trgm_ops);

  CREATE INDEX IF NOT EXISTS "family_member_neighborhood_search_idx"
  ON "public"."family_member"
  USING gin (("system-auth".immutable_unaccent(lower("neighborhood"))) public.gin_trgm_ops);

  CREATE INDEX IF NOT EXISTS "family_member_city_search_idx"
  ON "public"."family_member"
  USING gin (("system-auth".immutable_unaccent(lower("city"))) public.gin_trgm_ops);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_trgm indisponível; a busca segue sem índice trigram: %', SQLERRM;
END $$;
