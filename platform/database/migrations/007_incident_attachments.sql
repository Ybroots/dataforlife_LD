BEGIN;

CREATE TABLE IF NOT EXISTS incident_attachments (
  id uuid PRIMARY KEY,
  incident_id uuid NOT NULL REFERENCES incident_reports(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  mime_type text NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes integer NOT NULL CHECK (size_bytes BETWEEN 1 AND 5242880),
  content bytea NOT NULL,
  sha256 char(64) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS incident_attachments_incident_idx
  ON incident_attachments (incident_id, created_at, id);

COMMIT;
