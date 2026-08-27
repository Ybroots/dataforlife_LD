BEGIN;

-- The committed workflow history is the durable inbox source. No asynchronous
-- delivery job can lose a citizen update, and old cases are included as well.
CREATE OR REPLACE VIEW citizen_notification_events AS
SELECT 'incident:' || h.id AS id, r.citizen_external_id AS citizen_id,
       'incident'::text AS kind, r.receipt_code, r.summary AS case_title,
       h.to_status AS status, 'status'::text AS event_type,
       CASE WHEN h.public_message THEN h.note ELSE NULL END AS message,
       h.created_at
FROM incident_status_history h JOIN incident_reports r ON r.id = h.incident_id
WHERE h.actor_role IN ('officer', 'supervisor')
  AND (h.from_status IS DISTINCT FROM h.to_status OR h.public_message)
UNION ALL
SELECT 'sos:' || h.id, s.citizen_external_id, 'sos', s.receipt_code,
       'Yêu cầu SOS', h.to_status, 'status',
       CASE WHEN h.public_message THEN h.note ELSE NULL END, h.created_at
FROM sos_status_history h JOIN sos_events s ON s.id = h.sos_event_id
WHERE h.actor_role IN ('officer', 'supervisor')
  AND (h.from_status IS DISTINCT FROM h.to_status OR h.public_message)
UNION ALL
SELECT 'message:' || m.id, r.citizen_external_id, 'incident', r.receipt_code,
       r.summary, NULL, CASE WHEN m.request_media THEN 'request_media' ELSE 'message' END,
       m.message, m.created_at
FROM incident_messages m JOIN incident_reports r ON r.id = m.incident_id
WHERE m.author_role IN ('officer', 'supervisor');

CREATE TABLE IF NOT EXISTS citizen_notification_reads (
  citizen_id text NOT NULL,
  notification_id text NOT NULL,
  read_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (citizen_id, notification_id)
);

COMMIT;
