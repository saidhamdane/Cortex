-- ============================================================
-- Migration: 001_create_user_profiles
-- EIA — Exportable Identity Algorithm
-- ============================================================

-- Enable UUID generation (built-in on Supabase/PostgreSQL 13+)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS user_profiles (
  id                     UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  email                  TEXT          NOT NULL UNIQUE,

  -- Stores voice tone, values, and behaviour rules for the identity
  identity_dna           JSONB         NOT NULL DEFAULT '{}'::jsonb,

  -- Stores AES-256-GCM encrypted API keys per platform
  -- Each element: { platform, encryptedKey, iv, authTag }
  encrypted_credentials  JSONB         NOT NULL DEFAULT '[]'::jsonb,

  created_at             TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Automatically refresh updated_at on every row update
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles (email);

-- Row-Level Security (RLS) — enabled by default; policies added per use-case
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Example policy: service role bypasses RLS (used by the Node.js backend)
-- Individual user policies can be added here when using Supabase Auth
COMMENT ON TABLE user_profiles IS
  'Stores EIA identity DNA and AES-256-GCM encrypted platform credentials.';
