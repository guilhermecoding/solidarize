-- translate is immutable and covers Portuguese accents without the unaccent
-- contrib package. pg_trgm indexes are created when that extension exists.
CREATE OR REPLACE FUNCTION "system-auth".immutable_unaccent(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
STRICT
AS $$
  SELECT translate(
    lower(input),
    'áàâãäåāăąéèêëēĕėęěíìîïīĭįıóòôõöōŏőúùûüūŭůűçćčĉċñńňýÿŷ',
    'aaaaaaaaaeeeeeeeeeiiiiiiiioooooooouuuuuuuucccccnnnyyy'
  )
$$;

DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;

  CREATE INDEX "user_name_search_idx"
  ON "system-auth"."user"
  USING gin (("system-auth".immutable_unaccent(lower("name"))) public.gin_trgm_ops);

  CREATE INDEX "user_cpf_trgm_idx"
  ON "system-auth"."user"
  USING gin ("cpf" public.gin_trgm_ops);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_trgm indisponível; a busca segue sem índice trigram: %', SQLERRM;
END $$;
