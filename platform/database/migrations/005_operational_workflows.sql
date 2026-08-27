BEGIN;

CREATE TABLE IF NOT EXISTS workflow_actors (
  id text PRIMARY KEY,
  actor_type text NOT NULL
    CHECK (actor_type IN ('citizen', 'officer', 'supervisor', 'system')),
  display_name text NOT NULL,
  locality_id uuid REFERENCES localities(id) ON DELETE SET NULL,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO workflow_actors (id, actor_type, display_name, locality_id, metadata)
SELECT 'officer-demo-xuan-huong', 'officer', 'CSKV trực địa bàn Xuân Hương', l.id,
       '{"mode":"local_mock","shift":"day"}'::jsonb
FROM localities l
WHERE l.code = '24781'
ON CONFLICT (id) DO UPDATE SET locality_id = EXCLUDED.locality_id, updated_at = now();

INSERT INTO workflow_actors (id, actor_type, display_name, locality_id, metadata)
SELECT 'supervisor-demo-xuan-huong', 'supervisor', 'Chỉ huy trực Xuân Hương', l.id,
       '{"mode":"local_mock","shift":"day"}'::jsonb
FROM localities l
WHERE l.code = '24781'
ON CONFLICT (id) DO UPDATE SET locality_id = EXCLUDED.locality_id, updated_at = now();

CREATE TABLE IF NOT EXISTS incident_reports (
  id uuid PRIMARY KEY,
  receipt_code text NOT NULL UNIQUE,
  client_request_id text NOT NULL,
  citizen_external_id text NOT NULL,
  contact_phone text,
  category text NOT NULL
    CHECK (category IN ('security', 'traffic', 'public_order', 'administrative', 'environment', 'other')),
  summary text NOT NULL CHECK (char_length(summary) BETWEEN 10 AND 180),
  description text NOT NULL CHECK (char_length(description) BETWEEN 10 AND 4000),
  location_note text,
  geom geometry(Point, 4326) NOT NULL,
  accuracy_m numeric(10, 2) CHECK (accuracy_m IS NULL OR accuracy_m >= 0),
  locality_id uuid NOT NULL REFERENCES localities(id) ON DELETE RESTRICT,
  service_area_id uuid REFERENCES service_areas(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'received', 'assigned', 'verifying', 'processing', 'resolved', 'closed', 'rejected')),
  priority text NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_officer_id text REFERENCES workflow_actors(id) ON DELETE SET NULL,
  operational_mode text NOT NULL DEFAULT 'local_sandbox'
    CHECK (operational_mode IN ('local_sandbox', 'pilot', 'production')),
  received_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (citizen_external_id, client_request_id)
);

CREATE INDEX IF NOT EXISTS incident_reports_geom_gix ON incident_reports USING gist (geom);
CREATE INDEX IF NOT EXISTS incident_reports_queue_idx
  ON incident_reports (locality_id, status, priority, created_at DESC);
CREATE INDEX IF NOT EXISTS incident_reports_citizen_idx
  ON incident_reports (citizen_external_id, created_at DESC);

CREATE TABLE IF NOT EXISTS incident_status_history (
  id bigserial PRIMARY KEY,
  incident_id uuid NOT NULL REFERENCES incident_reports(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  actor_id text NOT NULL,
  actor_role text NOT NULL,
  note text,
  public_message boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS incident_status_history_case_idx
  ON incident_status_history (incident_id, created_at, id);

CREATE TABLE IF NOT EXISTS sos_events (
  id uuid PRIMARY KEY,
  receipt_code text NOT NULL UNIQUE,
  idempotency_key text NOT NULL,
  citizen_external_id text NOT NULL,
  contact_phone text,
  category text NOT NULL
    CHECK (category IN ('security', 'traffic_accident', 'fire_rescue', 'medical', 'other_emergency')),
  note text CHECK (note IS NULL OR char_length(note) <= 500),
  geom geometry(Point, 4326) NOT NULL,
  accuracy_m numeric(10, 2) CHECK (accuracy_m IS NULL OR accuracy_m >= 0),
  device_timestamp timestamptz NOT NULL,
  locality_id uuid NOT NULL REFERENCES localities(id) ON DELETE RESTRICT,
  service_area_id uuid REFERENCES service_areas(id) ON DELETE SET NULL,
  dispatch_unit_id uuid REFERENCES police_units(id) ON DELETE SET NULL,
  assigned_officer_id text REFERENCES workflow_actors(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'triggered'
    CHECK (status IN ('triggered', 'dispatched', 'acknowledged', 'responding', 'escalated', 'resolved', 'closed', 'cancelled_by_citizen')),
  operational_mode text NOT NULL DEFAULT 'local_sandbox'
    CHECK (operational_mode IN ('local_sandbox', 'pilot', 'production')),
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (citizen_external_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS sos_events_geom_gix ON sos_events USING gist (geom);
CREATE INDEX IF NOT EXISTS sos_events_queue_idx
  ON sos_events (locality_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS sos_events_citizen_idx
  ON sos_events (citizen_external_id, created_at DESC);

CREATE TABLE IF NOT EXISTS sos_status_history (
  id bigserial PRIMARY KEY,
  sos_event_id uuid NOT NULL REFERENCES sos_events(id) ON DELETE CASCADE,
  from_status text,
  to_status text NOT NULL,
  actor_id text NOT NULL,
  actor_role text NOT NULL,
  note text,
  public_message boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sos_status_history_case_idx
  ON sos_status_history (sos_event_id, created_at, id);

CREATE TABLE IF NOT EXISTS workflow_audit_events (
  id bigserial PRIMARY KEY,
  aggregate_type text NOT NULL CHECK (aggregate_type IN ('incident', 'sos')),
  aggregate_id uuid NOT NULL,
  action text NOT NULL,
  actor_id text NOT NULL,
  actor_role text NOT NULL,
  request_id text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workflow_audit_aggregate_idx
  ON workflow_audit_events (aggregate_type, aggregate_id, created_at, id);

CREATE TABLE IF NOT EXISTS workflow_outbox (
  id bigserial PRIMARY KEY,
  aggregate_type text NOT NULL CHECK (aggregate_type IN ('incident', 'sos')),
  aggregate_id uuid NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  available_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workflow_outbox_pending_idx
  ON workflow_outbox (available_at, id) WHERE processed_at IS NULL;

COMMIT;
