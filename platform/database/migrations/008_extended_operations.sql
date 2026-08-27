BEGIN;

CREATE TABLE IF NOT EXISTS public_alerts (
  id uuid PRIMARY KEY,
  locality_id uuid NOT NULL REFERENCES localities(id) ON DELETE CASCADE,
  created_by text NOT NULL REFERENCES workflow_actors(id),
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('security', 'traffic', 'fire_rescue', 'weather', 'other')),
  risk_level text NOT NULL CHECK (risk_level IN ('info', 'medium', 'high')),
  summary text NOT NULL,
  geom geometry(Point, 4326),
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'expired', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS public_alerts_active_idx
  ON public_alerts (locality_id, status, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS public_alerts_geom_gix ON public_alerts USING gist (geom);

CREATE TABLE IF NOT EXISTS incident_messages (
  id bigserial PRIMARY KEY,
  incident_id uuid NOT NULL REFERENCES incident_reports(id) ON DELETE CASCADE,
  author_id text NOT NULL,
  author_role text NOT NULL CHECK (author_role IN ('citizen', 'officer', 'supervisor')),
  message text NOT NULL,
  request_media boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS incident_messages_case_idx
  ON incident_messages (incident_id, created_at, id);

CREATE TABLE IF NOT EXISTS satisfaction_ratings (
  id uuid PRIMARY KEY,
  incident_id uuid NOT NULL UNIQUE REFERENCES incident_reports(id) ON DELETE CASCADE,
  citizen_external_id text NOT NULL,
  score smallint NOT NULL CHECK (score BETWEEN 1 AND 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS patrol_sessions (
  id uuid PRIMARY KEY,
  locality_id uuid NOT NULL REFERENCES localities(id) ON DELETE CASCADE,
  officer_id text NOT NULL REFERENCES workflow_actors(id),
  title text NOT NULL,
  route_note text,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'paused', 'completed')),
  scheduled_at timestamptz NOT NULL,
  started_at timestamptz,
  ended_at timestamptz,
  last_checkin_geom geometry(Point, 4326),
  last_checkin_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS patrol_sessions_locality_idx
  ON patrol_sessions (locality_id, scheduled_at DESC);

CREATE TABLE IF NOT EXISTS shift_reports (
  id uuid PRIMARY KEY,
  locality_id uuid NOT NULL REFERENCES localities(id) ON DELETE CASCADE,
  actor_id text NOT NULL REFERENCES workflow_actors(id),
  shift_date date NOT NULL,
  summary jsonb NOT NULL,
  note text,
  confirmed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (locality_id, actor_id, shift_date)
);

ALTER TABLE incident_attachments
  DROP CONSTRAINT IF EXISTS incident_attachments_mime_type_check,
  DROP CONSTRAINT IF EXISTS incident_attachments_size_bytes_check;

ALTER TABLE incident_attachments
  ADD CONSTRAINT incident_attachments_mime_type_check
    CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm')),
  ADD CONSTRAINT incident_attachments_size_bytes_check
    CHECK (size_bytes BETWEEN 1 AND 20971520),
  ADD COLUMN IF NOT EXISTS uploader_role text NOT NULL DEFAULT 'citizen'
    CHECK (uploader_role IN ('citizen', 'officer', 'supervisor')),
  ADD COLUMN IF NOT EXISTS purpose text NOT NULL DEFAULT 'initial'
    CHECK (purpose IN ('initial', 'supplemental', 'evidence'));

COMMIT;
