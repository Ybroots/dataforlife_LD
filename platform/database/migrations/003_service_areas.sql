BEGIN;

CREATE TABLE IF NOT EXISTS service_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  locality_id uuid NOT NULL REFERENCES localities(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  legacy_ward_code text,
  group_name text,
  description text,
  display_color text NOT NULL DEFAULT '#216B86'
    CHECK (display_color ~ '^#[0-9A-Fa-f]{6}$'),
  display_order integer NOT NULL DEFAULT 0,
  area_km2 numeric(14, 4),
  geom geometry(MultiPolygon, 4326) NOT NULL,
  label_geom geometry(Point, 4326) NOT NULL,
  is_demo boolean NOT NULL DEFAULT true,
  visibility text NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'private', 'internal')),
  provenance_status text NOT NULL DEFAULT 'reference_reconstructed'
    CHECK (provenance_status IN ('reference_reconstructed', 'manually_verified', 'official')),
  source_system text NOT NULL,
  source_id text NOT NULL,
  source_url text,
  source_version text,
  raw_source jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (locality_id, legacy_ward_code)
);

CREATE INDEX IF NOT EXISTS service_areas_geom_gix ON service_areas USING gist (geom);
CREATE INDEX IF NOT EXISTS service_areas_locality_idx ON service_areas (locality_id, display_order);

ALTER TABLE directory_entries
  ADD COLUMN IF NOT EXISTS service_area_id uuid REFERENCES service_areas(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS directory_entries_service_area_idx ON directory_entries (service_area_id);

CREATE OR REPLACE VIEW public_service_areas AS
SELECT
  sa.id,
  l.code AS locality_code,
  sa.code,
  sa.name,
  sa.legacy_ward_code,
  sa.group_name,
  sa.description,
  sa.display_color,
  sa.display_order,
  sa.area_km2,
  sa.geom,
  sa.label_geom,
  sa.is_demo,
  sa.provenance_status,
  sa.source_system,
  sa.source_url,
  sa.source_version
FROM service_areas sa
JOIN localities l ON l.id = sa.locality_id
WHERE sa.visibility = 'public' AND l.visibility = 'public';

COMMIT;
