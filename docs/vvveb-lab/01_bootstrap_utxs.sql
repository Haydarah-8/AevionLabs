-- Run in Supabase SQL Editor on project utxsrxhzdmvyrulnxehq ONLY
-- Creates isolated vvveb schema + login role for Vvveb CMS lab

CREATE SCHEMA IF NOT EXISTS vvveb;

DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'vvveb_lab') THEN
    CREATE ROLE vvveb_lab LOGIN PASSWORD 'uxNOCmWVJR82F0l1EkZhsBSq';
  ELSE
    ALTER ROLE vvveb_lab WITH LOGIN PASSWORD 'uxNOCmWVJR82F0l1EkZhsBSq';
  END IF;
END $$;

GRANT USAGE, CREATE ON SCHEMA vvveb TO vvveb_lab;
GRANT ALL ON SCHEMA vvveb TO vvveb_lab;
ALTER ROLE vvveb_lab SET search_path TO vvveb, public;
GRANT ALL ON SCHEMA vvveb TO postgres;
GRANT ALL ON SCHEMA vvveb TO service_role;
REVOKE ALL ON SCHEMA vvveb FROM anon, authenticated;

COMMENT ON SCHEMA vvveb IS 'Vvveb CMS lab for Aevion — isolated from Website Factory public tables';
