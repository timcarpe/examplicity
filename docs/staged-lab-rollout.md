# Staged-lab rollout plan

This is a plan, not an import authorization. No rollout batch is approved yet.
The twelve packages remain in `Lab Creation/Staged Labs` until their individual
topic/format choices and each batch are approved. No registry, icon, public lab,
or deployment changes belong to this document.

## Current intake baseline

- Provider repository: `Lab Creation`
- Verified staged commit: `e941b35`
- Eligible packages: 12 of 12 passed the website preflight
- Website import ledger: empty

The commit identifies the present planning baseline. Each future batch must
preflight its packages again and record the actual upstream commit used; this
baseline is not permission to import or deploy them.

## Gate used for every batch

Run website preflight against the exact staged package; record its upstream
commit and approved source hash; obtain content/taxonomy approval; then import
only the compiled HTML, `Lab` entry, and icon. Synchronize the shared frame and
calculate the derived integrated hash (it is expected to differ from the
upstream approved hash), complete the import ledger, update the batch changelog,
and run lint, build, diff, browser, Download, exam-filter, frame/style and
responsive checks. Roll back as one revert if a site integration fails.

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
taxonomy labels, not established site values. Existing-topic fit is intentionally
limited to the two clear mappings above; forcing the rest into the four current
topics would make catalogue grouping less honest.

## Canary success and stop conditions

Web Page Retrieval is the canary because it is one bounded 0478 lab with a
clear interactive loop and a proposed topic that can later receive Cookies. It
is ready to import only after the site-level checks in the batch gate pass.

Stop the rollout and request a decision if the canary exposes a shared-frame
layout issue, download packaging issue, incorrect syllabus filtering, an
artifact hash/provenance discrepancy, or a taxonomy disagreement. Do not work
around those results by changing staged content during website integration.
