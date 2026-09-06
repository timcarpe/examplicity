# Main push preparation — 6 September 2026

Scope: the committed `codex/llm-first-v0.1` branch, including the 57-lab design rollout, developer/authoring resources, separate lab contracts and selective offline CSS packaging. Existing uncommitted site/header/homepage work is excluded.

Integrated `origin/main` at `b473482` (copyright name) and `origin/codex/llm-first-v0.1` at `aea87de` (trademark owner). Used merges to preserve commit references in reviewed lab maps. Main can advance without a force push.

Release preparation fixes:

- Aligned the standalone licence notice with the corrected root licence.
- Scoped the developer reduced-motion CSS selector to its module; fixed the production CSS build.
- Moved unchanged bug-report request-identity helpers out of the Next.js route module; retained their tests and behavior.
- Updated stale Coordinate/Graph DOM stubs, Histogram tests to exercise shared drag handling, and assertions for the reviewed bar interaction and inline factory working.
- Consolidated unreleased changelog entries on 6 September; preserved already-published entries from main.

Validation used a clean checkout, excluding unrelated working changes: 94 tests passed; the nine API tests passed again after the helper move; production build passed with `npm run build -- --webpack`, including developer, publication, styles, content, downloads and contract checks for all 57 labs. The recent five-lab CSS spot check is recorded in `docs/css-packaging-feasibility.md`.

Preparation is not deployment. Recheck the remote main tip immediately before the eventual push. Local logs: `D:/Cambridge Labs/main-prep-tests.log` and `D:/Cambridge Labs/main-prep-build.log`.
