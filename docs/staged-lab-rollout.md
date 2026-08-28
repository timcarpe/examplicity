# Staged-lab rollout plan

This is a plan, not an import authorization. The twelve packages remain in
`Lab Creation/Staged Labs` until their individual taxonomy and batch are
approved. No registry, icon, public lab, or deployment changes are made by
this document.

## Baseline

- Provider repository: `Lab Creation`
- Planning baseline commit: `d58c255`
- Eligible packages: 12 staged packages
- Website import ledger: empty

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

## Phased order

| Phase | Labs | Proposed website topic / format | Approval decision |
| --- | --- | --- | --- |
| Canary | Web Page Retrieval | `Web & internet` / `DNS experiment` | Add this topic and run one-lab canary only. |
| Existing-topic fits | Symmetric and Asymmetric Encryption; Interrupt Service Routine | `Networks & communication` / `Key experiment`; `Processors & memory` / `Interrupt model` | Existing topic placement and order still require approval. |
| New taxonomy: web | Session and Persistent Cookies | `Web & internet` / `Cookie experiment` | Approve whether this joins the canary topic. |
| New taxonomy: data and databases | Database Normalisation; File Organisation and Access | `Databases & data modelling` / `Data model`; `Record access` | Approve the topic name and whether these ship together. |
| New taxonomy: artificial intelligence | Dijkstra and A* Graph Search; Expert System Rule Builder | `Artificial intelligence` / `Graph search`; `Rule builder` | Approve the topic name and order. |
| New taxonomy: systems and logic | Logic Circuit Builder; Automation Chain Builder; Ticket Gate State-Transition Diagram | `Logic & automated systems` / `Logic builder`; `Control systems`; `State model` | Approve whether one topic is coherent or should be split. |
| New taxonomy: security and distributed systems | Blockchain Tamper Evidence | `Security & distributed systems` / `Ledger experiment` | Approve the topic name and placement. |

`Web & internet`, `Databases & data modelling`, `Artificial intelligence`,
`Logic & automated systems`, and `Security & distributed systems` are proposed
taxonomy labels, not established site values. Existing-topic fit is limited to
the two clear mappings above; forcing the rest into current topics would make
catalogue grouping less honest.

## Canary stop conditions

Web Page Retrieval is the canary because it is a bounded 0478 experiment with
a clear learner-controlled loop and a proposed topic that can later receive
Cookies. Stop and request a decision if the canary changes its learning
relationship in the shared frame, exposes a host/frame layout issue, fails its
subject filtering, or reveals a taxonomy disagreement. Do not work around that
by changing the staged content during website integration.
