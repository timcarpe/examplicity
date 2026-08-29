CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS bug_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'new'
    CONSTRAINT bug_reports_status_check
    CHECK (status IN ('new', 'triaged', 'confirmed', 'resolved', 'duplicate', 'rejected', 'spam')),
  description text NOT NULL
    CHECK (length(btrim(description)) > 0 AND octet_length(description) <= 8192),
  contact_email text CHECK (contact_email IS NULL OR octet_length(contact_email) <= 254),
  lab_slug text CHECK (lab_slug IS NULL OR octet_length(lab_slug) <= 160),
  page_url text CHECK (page_url IS NULL OR octet_length(page_url) <= 2048),
  deployment_sha text CHECK (deployment_sha IS NULL OR octet_length(deployment_sha) <= 128),
  user_agent text CHECK (user_agent IS NULL OR octet_length(user_agent) <= 1024),
  -- JSON caps are enforced on the original compact serialization by the API.
  -- jsonb normalizes whitespace, so an equivalent database byte check is not exact.
  diagnostics jsonb,
  lab_state jsonb,
  severity text,
  internal_notes text,
  github_issue_number integer,
  duplicate_of uuid REFERENCES bug_reports (id)
);

CREATE INDEX IF NOT EXISTS bug_reports_status_created_at_idx
  ON bug_reports (status, created_at DESC);

CREATE INDEX IF NOT EXISTS bug_reports_created_at_idx
  ON bug_reports (created_at DESC);

ALTER TABLE bug_reports DROP CONSTRAINT IF EXISTS bug_reports_status_check;
ALTER TABLE bug_reports ADD CONSTRAINT bug_reports_status_check
  CHECK (status IN ('new', 'triaged', 'confirmed', 'resolved', 'duplicate', 'rejected', 'spam'));

CREATE TABLE IF NOT EXISTS bug_report_rate_limits (
  ip_hash text PRIMARY KEY CHECK (length(ip_hash) = 64),
  last_submitted_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS bug_report_rate_limits_last_submitted_at_idx
  ON bug_report_rate_limits (last_submitted_at);

ALTER TABLE bug_reports DROP CONSTRAINT IF EXISTS bug_reports_duplicate_of_fkey;
ALTER TABLE bug_reports ADD CONSTRAINT bug_reports_duplicate_of_fkey
  FOREIGN KEY (duplicate_of) REFERENCES bug_reports (id) ON DELETE SET NULL;
