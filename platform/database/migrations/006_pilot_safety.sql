BEGIN;

ALTER TABLE workflow_outbox
  ADD COLUMN IF NOT EXISTS last_error text,
  ADD COLUMN IF NOT EXISTS dead_lettered_at timestamptz;

CREATE INDEX IF NOT EXISTS workflow_outbox_retry_idx
  ON workflow_outbox (available_at, id)
  WHERE processed_at IS NULL AND dead_lettered_at IS NULL;

-- A durable in-app delivery target for workflow_outbox. This does not claim
-- delivery to 112/113, SMS or push; it only feeds the authenticated officer UI.
CREATE TABLE IF NOT EXISTS workflow_notifications (
  id bigserial PRIMARY KEY,
  outbox_id bigint NOT NULL UNIQUE REFERENCES workflow_outbox(id) ON DELETE CASCADE,
  locality_id uuid NOT NULL REFERENCES localities(id) ON DELETE CASCADE,
  aggregate_type text NOT NULL CHECK (aggregate_type IN ('incident', 'sos')),
  aggregate_id uuid NOT NULL,
  event_type text NOT NULL,
  message text NOT NULL,
  payload jsonb NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workflow_notifications_locality_idx
  ON workflow_notifications (locality_id, created_at DESC);

COMMIT;
