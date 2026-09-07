BEGIN;

CREATE TABLE IF NOT EXISTS citizen_accounts (
  id text PRIMARY KEY,
  username text NOT NULL,
  username_normalized text NOT NULL UNIQUE,
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 100),
  password_hash text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (username_normalized = lower(username_normalized)),
  CHECK (char_length(username_normalized) BETWEEN 3 AND 100)
);

CREATE TABLE IF NOT EXISTS officer_accounts (
  actor_id text PRIMARY KEY REFERENCES workflow_actors(id) ON DELETE RESTRICT,
  username text NOT NULL,
  username_normalized text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (username_normalized = lower(username_normalized)),
  CHECK (char_length(username_normalized) BETWEEN 3 AND 100)
);

COMMIT;
