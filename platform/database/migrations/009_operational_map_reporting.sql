BEGIN;

CREATE TABLE IF NOT EXISTS operational_map_points (
  id uuid PRIMARY KEY,
  locality_id uuid NOT NULL REFERENCES localities(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(name) BETWEEN 3 AND 160),
  point_type text NOT NULL CHECK (point_type IN ('police_post','camera','risk_point','patrol_checkpoint','public_facility')),
  description text,
  contact_phone text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','maintenance')),
  visibility text NOT NULL DEFAULT 'officer' CHECK (visibility IN ('officer','public')),
  geom geometry(Point, 4326) NOT NULL,
  created_by text NOT NULL REFERENCES workflow_actors(id),
  updated_by text NOT NULL REFERENCES workflow_actors(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS operational_map_points_locality_idx
  ON operational_map_points (locality_id, status, point_type, updated_at DESC);
CREATE INDEX IF NOT EXISTS operational_map_points_geom_gix
  ON operational_map_points USING gist (geom);

COMMIT;
