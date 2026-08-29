# Bug reporting

The catalogue and active-lab footers open an anonymous bug-report dialog. Reports
are accepted by `POST /api/bug-reports` and stored in Neon Postgres. The endpoint
accepts at most 100 KiB. Descriptions are capped at 8 KiB, diagnostics at 16 KiB,
and lab-state snapshots at 64 KiB.

Every report records its page, lab slug (when present), browser user agent, and
deployment commit. The optional diagnostics checkbox additionally controls
viewport, screen, locale, timezone, connectivity, and safe iframe context.

## Provisioning

1. Install Neon for the Vercel project from Marketplace so Vercel injects
   `DATABASE_URL` into deployments.
2. Run `database/bug-reports.sql` in the Neon SQL Editor.
3. For local development, copy `.env.example` to `.env.local` and provide a
   development database connection string.
4. In Vercel Firewall, add a rate-limit rule for `POST /api/bug-reports`. A
   starting limit of five submissions per minute per source IP is intentionally
   conservative and can be adjusted from observed traffic.

`VERCEL_GIT_COMMIT_SHA` is recorded automatically when Vercel system environment
variables are enabled. The database connection string is read only by the server
route and must never be exposed through a `NEXT_PUBLIC_` variable.

## Lab-state contract

The host sends this message to the active same-origin iframe:

```json
{ "type": "examplicity:diagnostics:request", "requestId": "uuid" }
```

A lab may reply within 400 ms:

```json
{
  "type": "examplicity:diagnostics:response",
  "requestId": "the same uuid",
  "state": { "schemaVersion": 1, "step": "current non-sensitive state" }
}
```

Only explicitly selected, non-sensitive state should be returned. Do not include
learner-entered text, saved code, passwords, tokens, or local-storage contents.
If a lab does not implement the contract, the host records only its title, scroll
position, focused element identifier, and visibility state.

## Triage

Use `status`, `severity`, `internal_notes`, `duplicate_of`, and
`github_issue_number` in `bug_reports` to track reports. Keep raw diagnostics in
Postgres; promote only reviewed and sanitized reports to GitHub Issues.
