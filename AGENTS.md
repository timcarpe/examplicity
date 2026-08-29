# Changelog contract

The changelog is an editorial record of meaningful changes, not a copy of Git history. Its source is `app/changelog/entries.ts`, where every delivery has two tracks:

- `publicChanges` records changes a learner, teacher, or visitor can directly experience. Only this track is rendered on the website.
- `internalChanges` records backend, repository, deployment, tooling, data-pipeline, and maintenance work. It remains in the source record and must never be rendered on the public changelog page.

## When committing

- Add or revise a note in the current delivery's appropriate track.
- Put new labs, visible features, interaction or design improvements, content changes, and user-facing fixes in `publicChanges`.
- Put API, database, repository, deployment, manifest, automation, test, tooling, refactor, and maintenance changes in `internalChanges` unless they produce a distinct result a visitor can directly experience.
- Describe outcomes in plain language. Do not include commit hashes, ticket IDs, or branch names. Keep implementation detail out of `publicChanges`; use only as much technical precision as needed in `internalChanges`.
- Keep related work under one note. A follow-up commit should improve the existing note instead of creating a second note about the same outcome.
- A change can have an internal note without having a public note. Do not promote internal work to the public track simply to make it visible.

## Before pushing

1. Review every commit and the combined diff since the branch's push remote (`@{push}..HEAD`; use the corresponding `origin/<branch>` ref if no push remote is configured).
2. Reconcile both tracks in the current changelog entry against the final state of that whole range.
3. Combine incremental commits into a small number of user-facing outcomes. Abstract low-level work into the benefit it produced.
4. Remove notes for work that was reverted, superseded, hidden, or made stale by a later commit in the same range.
5. Confirm the public track contains only directly observable user-experience changes and that neither track reads like a commit-by-commit activity feed, then include that final reconciliation in the push.

Keep the newest entry first. Use a real date for a pushed delivery; never invent version numbers.
An internal-only delivery may have an empty `publicChanges` array; the website must omit that delivery entirely.
