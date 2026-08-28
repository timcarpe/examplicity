# Staged-lab rollout plan

The twelve staged packages were integrated locally as one approved batch. This
document now records the completed grouping and the checks required before any
future publication; it does not authorize a push or deployment.

## Baseline

- Provider repository: `Lab Creation`
- Planning baseline commit: `d58c255`
- Integrated packages: 12
- Website import ledger: `2026-08-staged-labs`

The baseline identifies the package set used for planning; the actual Lab
Creation commit is recorded only when an approved package is integrated.

## Gate for each batch

1. Run the website preflight on the proposed package and review it at the
   chosen Lab Creation commit.
2. Confirm the website adaptation preserves its critical concept, syllabus
   outcome, real learner action, visible consequence, primary reference
   relationship, abstractions/non-goals, existing-lab gap and plain title/copy
   direction. Stop for review if it cannot.
3. Approve the exact topic, format, card copy and mechanics-based SVG; then
   import only the compiled HTML, catalogue entry and icon.
4. Embed the shared frame, record the source repository/commit/path and batch
   in the ledger, and update the changelog.
5. Run lint, build and diff sanity checks, plus a browser smoke of the primary
   interaction and catalogue filter. Check Download only if that boundary was
   changed.

Git commits supply provenance and rollback. We do not add artifact hashes,
byte counts or a separate verification trail.

## Completed grouping

| Phase | Labs | Website topic / format | Result |
| --- | --- | --- | --- |
| Canary | Web Page Retrieval | `Web & internet` / `DNS experiment` | Passed locally before the remaining imports. |
| Existing-topic fits | Symmetric and Asymmetric Encryption; Interrupt Service Routine | `Networks & communication` / `Key experiment`; `Processors & memory` / `Interrupt model` | Integrated. |
| Web | Session and Persistent Cookies | `Web & internet` / `Cookie experiment` | Integrated with the canary topic. |
| Data and databases | Database Normalisation; File Organisation and Access | `Databases & data modelling` / `Data model`; `Record access` | Integrated. |
| Artificial intelligence | Dijkstra and A* Graph Search; Expert System Rule Builder | `Artificial intelligence` / `Graph search`; `Rule builder` | Integrated. |
| Systems and logic | Logic Circuit Builder; Automation Chain Builder; Ticket Gate State-Transition Diagram | `Logic & automated systems` / `Logic builder`; `Control systems`; `State model` | Integrated. |
| Security and distributed systems | Blockchain Tamper Evidence | `Security & distributed systems` / `Ledger experiment` | Integrated. |

`Web & internet`, `Databases & data modelling`, `Artificial intelligence`,
`Logic & automated systems`, and `Security & distributed systems` are the
established labels for this batch. Their exact spelling prevents split groups.

## Canary stop conditions

Web Page Retrieval passed locally before the remaining imports: the shared
frame preserved its learning relationship, both DNS paths reached the intended
pages, and the 0478 filter placed it correctly. Future batches retain the same
stop conditions for their canary.
