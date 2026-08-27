BEGIN;

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE TABLE IF NOT EXISTS localities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  locality_type text,
  level smallint NOT NULL DEFAULT 2,
  province_code text,
  province_name text,
  population integer,
  area_km2 numeric(14, 4),
  density_per_km2 numeric(14, 4),
  merger_note text,
  visibility text NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'private', 'internal')),
  source_system text NOT NULL DEFAULT 'firestore',
  source_id text,
  raw_source jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS boundaries (
  locality_id uuid PRIMARY KEY REFERENCES localities(id) ON DELETE CASCADE,
  geom geometry(MultiPolygon, 4326) NOT NULL,
  source_system text NOT NULL DEFAULT 'geojson',
  source_id text,
  vertex_count integer,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS boundaries_geom_gix ON boundaries USING gist (geom);

CREATE TABLE IF NOT EXISTS police_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  unit_type text NOT NULL
    CHECK (unit_type IN ('commune_police', 'department', 'industrial_post', 'provincial', 'other')),
  level smallint,
  locality_id uuid REFERENCES localities(id) ON DELETE SET NULL,
  parent_unit_id uuid REFERENCES police_units(id) ON DELETE SET NULL,
  visibility text NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'private', 'internal')),
  source_system text NOT NULL DEFAULT 'firestore',
  source_id text,
  provenance_status text NOT NULL DEFAULT 'source_record'
    CHECK (provenance_status IN ('source_record', 'synthesized_from_contact', 'manually_verified')),
  raw_source jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES police_units(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  geom geometry(Point, 4326),
  location_source text NOT NULL DEFAULT 'address_only'
    CHECK (location_source IN ('address_only', 'surveyed', 'official_coordinate', 'area_centroid')),
  visibility text NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'private', 'internal')),
  source_system text NOT NULL DEFAULT 'firestore',
  source_id text,
  raw_source jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (unit_id)
);

CREATE INDEX IF NOT EXISTS stations_geom_gix ON stations USING gist (geom);

CREATE TABLE IF NOT EXISTS directory_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_type text NOT NULL CHECK (entry_type IN ('officer', 'unit_contact')),
  unit_id uuid REFERENCES police_units(id) ON DELETE SET NULL,
  locality_id uuid REFERENCES localities(id) ON DELETE SET NULL,
  display_name text NOT NULL,
  rank text,
  role_title text,
  phone text NOT NULL,
  phone_normalized text NOT NULL,
  visibility text NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'private', 'internal')),
  source_system text NOT NULL DEFAULT 'firestore',
  source_id text NOT NULL,
  raw_source jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_system, source_id)
);

CREATE INDEX IF NOT EXISTS directory_entries_locality_idx ON directory_entries (locality_id);
CREATE INDEX IF NOT EXISTS directory_entries_unit_idx ON directory_entries (unit_id);

CREATE TABLE IF NOT EXISTS hotline_categories (
  code text PRIMARY KEY,
  label text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  visibility text NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'private', 'internal')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hotlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_code text NOT NULL REFERENCES hotline_categories(code) ON DELETE RESTRICT,
  label text NOT NULL,
  phone text NOT NULL,
  phone_normalized text NOT NULL,
  coverage_note text,
  visibility text NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'private', 'internal')),
  source_system text NOT NULL DEFAULT 'firestore',
  source_id text NOT NULL,
  raw_source jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_system, source_id)
);

CREATE INDEX IF NOT EXISTS hotlines_category_idx ON hotlines (category_code);

CREATE TABLE IF NOT EXISTS migration_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_name text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('plan', 'apply')),
  source_summary jsonb NOT NULL,
  result_summary jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;
