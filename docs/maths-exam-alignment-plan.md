# Maths exam alignment and queryable catalogue

Status: approved; three tasks launched, with bounded first-turn review before implementation.
Date: 5 September 2026.

## Outcome and scope

Use exam evidence to align existing maths lab working areas and presentation with curriculum requirements, while preserving useful investigations. Make the supporting catalogue queryable without asking an LLM to read a complete HTML page or subject dataset.

- Cover Cambridge IGCSE Mathematics 0580, 2025–2027, including Core/Extended and calculator/non-calculator distinctions.
- Add Cambridge 9709 Pure Mathematics for the 2026–2027 examination cycle. Source the official syllabus and published updates. Distinguish Pure 1, Pure 2 and Pure 3 and their AS/A routes; do not imply that Pure alone covers the complete A Level qualification.
- Classify all 24 currently published maths labs. The research catalogue contains 43 ideas; preserve the other ideas and existing research.
- Implement a representative batch of approximately three labs, selected after evidence review, then return for user inspection. Batch size is a planning target, not permission to include weak candidates.
- Prepare internal curriculum profiles and aligned surfaces. Add no new learner-visible curriculum switches. Preserve existing defaults; verify deferred profiles through focused tests without making them public choices.
- Do not build new labs, substantially rewrite distinctive visual investigations, add a shared runtime facade, or expand into Mechanics/Statistics.

Official sources:
- https://www.cambridgeinternational.org/Images/662466-2025-2027-syllabus.pdf
- https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-international-as-and-a-level-mathematics-9709/
- https://www.cambridgeinternational.org/Images/697427-2026-2027-syllabus.pdf

## Starting evidence and implementation

The research repository is `D:/Cambridge Labs/Lab Creation`. Its subject-level `exams.json` and `ideas.json` already generate the catalogue HTML. Some research statements are stale; live-lab slugs and research-idea slugs are not necessarily identical. Reconcile explicit mappings, not counts or title similarity alone.

The reviewed site worktree is `D:/Cambridge Labs/worktrees/llm-first-v0.1`. Source HTML lives under `labs-src/<subject>/<slug>/lab.html`; sidecars under `lab-contracts/<subject>/<slug>.lab.json`; `public/labs` is generated. Binary Numbers demonstrates feature-based profiles, embedded contracts and runtime consumption. Read `docs/binary-curriculum.md`, its source, sidecar and focused tests.

The supplied maths set contains 12 November 2025 question papers in `Lab Creation/resources/exam papers/0580`, without matching mark schemes or 9709 resources found during review. Verify this inventory at kickoff. The trigonometric lab's circle drives tracing and completion: hiding it needs a replacement interaction, not merely a CSS change. Paper absence does not establish that a teaching visual is inappropriate for a curriculum.

Inspect current branches, commits and uncommitted changes at kickoff. Design work has continued since the original review; use current committed lab sources, preserve unrelated edits, and coordinate any overlapping files before modification.

## Data and retrieval approach

Keep versioned JSON as the editable authority. Retain existing idea records where practical; add linked collections rather than append full paper analyses to every idea. Both review HTML and queries consume one validated loader.

The storage owner proposes the smallest schema covering:

| Record | Required distinction |
| --- | --- |
| Syllabus and objective | Exam code, cycle/version, qualification/component, exact objective and locator |
| Paper | Session/year/component/variant, question paper or mark scheme, source path/URL and hash |
| Question evidence | Stable ID, paper/page/question-part locator, objective references, observed task and visual conventions, mark-scheme evidence and uncertainty |
| Lab alignment | Explicit idea ID and live-lab slug, profile/feature references, supporting question IDs, adaptation category, proposed changes and review status |

Question notes capture givens/unknowns, angle units, notation, graph/diagram conventions, expected working, answer form/precision and calculator conditions where relevant. Do not require meaningless fields for every question. Keep observations distinct from inferred recommendations and preserve conflicting evidence.

Provide a filtered JSON CLI with list/get operations, compact default results, explicit detail/evidence expansion, deterministic ordering and bounded output. Support filters for subject, lab/idea, syllabus cycle, objective, component, adaptation category and review status. Return IDs and locators for follow-up retrieval. Examples of required queries: one lab with its evidence; questions for an objective; straightforward adaptations; missing or unreviewed evidence.

Defer SQLite: it adds another generated format without a demonstrated need at this scale. Reconsider only if the storage owner demonstrates a concrete query or performance limitation; report the tradeoff before adding it. No API, embeddings, hosted database or MCP in this phase.

Validate IDs, references, syllabus cycles and review states. Preserve existing coverage, rejected ideas, research and deployment records during any migration. Update authoring instructions that currently require HTML-only selection so validated CLI retrieval is an equivalent entry point. Do not require source PDFs for portable catalogue builds.

## Three task owners and lean briefs

### 1. Catalogue data storage — gpt-5.6-sol, medium

Own catalogue loading, schema/validation, migration where necessary, query CLI, HTML consumption and directly affected workflow documentation in Lab Creation. Do not own paper interpretation or lab implementation. Preserve other subjects without forcing a wholesale rewrite.

First turn: inspect consumers, propose a minimal schema and query contract with two small illustrative records, identify compatibility risks, then stop for orchestrator review before broad migration. After agreement, implement the loader/CLI and review display. Reserve evidence-data files for task 2; coordinate any unavoidable shared-file edits explicitly.

Done when existing catalogue content is preserved, targeted queries return only requested records, invalid/dangling references fail clearly, and human HTML and CLI agree on the same records. Supply commands, representative outputs, migration checks and commit IDs.

### 2. Exam evidence — gpt-5.6-sol, medium

Own source inventory, paper/mark-scheme acquisition, structured evidence, objective mappings and the 24-lab classification in Lab Creation. Do not edit schema/query code or live lab files. Populate the record paths agreed with task 1; coordinate registration changes to `exams.json` and idea records.

First turn: inventory supplied papers, verify official syllabus versions and 9709 Pure components, propose a bounded sampling matrix, and produce two or three sample question notes. Inventory and source verification may proceed while the schema is reviewed; do not bulk-populate a competing format.

Use supplied papers first, then PapaCambridge for authentic papers and matching mark schemes within the exact agreed cycles. Verify document contents, not filenames alone. Use official specimen material as explicitly labelled supplementary evidence. Surface unavailable same-cycle papers; do not silently substitute older cycles. Keep complete papers/crops under local research resources and commit concise notes and provenance according to repository conventions.

Analyse all supplied maths papers for relevant questions; supplement by missing objective, component or presentation pattern rather than indiscriminate downloading. Recommend at least two independent question examples for each proposed adaptation where available, preferably across sessions; label single-example findings provisional. Mark schemes inform accepted working, precision and alternatives. Visually inspect graphs/diagrams because text extraction can lose their meaning. Prefer notes; crop only where necessary for review.

Classify each lab as: (A) small working/visual adaptation; (B) addition compatible with the existing approach; (C) substantial rework or possible supplementary practice lab for later review. Record evidence strength and effort separately. Explicitly allow no supported 9709 alignment, particularly for statistics/probability labs outside this Pure-only scope.

Done when all 24 labs have a justified category or explicit evidence gap, references resolve, curriculum claims are traceable, and a representative batch is recommended. Do not claim complete exam coverage from a limited sample or mark deployment complete.

### 3. Lab adaptations — gpt-6-astra, medium

Own only approved site lab source/sidecar changes, necessary publication mappings, generated outputs and focused verification. Task 2 owns research records; propose corrections back to that owner. Reuse Binary's profile approach and current design conventions.

First turn: inspect Binary and likely maths candidates read-only; identify profile/working-surface feasibility and interaction dependencies. Report candidates and risks, then wait for the reviewed evidence and user-approved batch. Do not choose curricular behaviour from syllabus headings alone or begin a speculative framework.

Implement each approved change with its evidence IDs recorded in a concise adaptation note. Keep detailed research out of embedded contracts. Define and test the runtime meaning of profile parameters such as angle units, allowed task families or unknown quantities; metadata alone is insufficient. Preserve curriculum versus difficulty versus assistance distinctions and the learner action/evidence loop. Unsupported visual changes go back for review.

Done when the selected labs match reviewed decisions, original defaults remain coherent, no new switches are exposed, profile behaviour and answer correctness pass focused tests, browser checks pass for changed surfaces, and generated/downloaded contracts, metadata, MIT notices and standalone resources remain consistent. Report any browser-policy limitation explicitly. Commit verified changes and return the batch for user inspection; no push/deploy.

## Orchestration and checkpoints

1. User reviews this plan before launch. The orchestrator resolves requested changes and records approval.
2. The orchestrator creates exactly three new tasks with the models/efforts above. Inspect saved projects and current Git state first. Ensure the adaptations task starts from a committed revision containing Binary profiles, separate sidecars, MIT fixes and current agreed design work; do not silently start from an older default branch. Use isolated worktrees where appropriate and explicit ownership for shared resources.
3. Monitor each task's first completed turn using task-status tools; read its findings and steer drift, duplicated work, unsupported assumptions or excess infrastructure before continuation. First-turn tasks are deliberately bounded so this review occurs before substantial implementation.
4. Agree the shared schema/query contract and sample evidence with tasks 1 and 2. They then work alongside each other within their ownership boundaries. Task 3 waits after its feasibility review.
5. The orchestrator reviews the completed classification and recommends a small batch to the user. User review selects the batch before task 3 edits labs.
6. Review task 3's evidence-linked diff and verification, then present the committed batch for inspection. Decide broader rollout only after that review.

Every handoff includes: objective, owned paths, exact input references/revisions, accepted decisions, verification, stop conditions and a concise evidence-backed result. All owners are working alongside others and must preserve unrelated work. Keep progress reports brief; no new sub-tasks, broad refactors or infrastructure unless a concrete blocker warrants discussion. Commit completed verified work, including applicable changelog notes; do not push, deploy or change catalogue deployment status without authorization and evidence.

## Approval requested

Approve this scope and three-task sequence, or identify changes. The filtered JSON CLI is the default. The exact representative lab batch remains an evidence-led decision at checkpoint 5.

## Launch and workflow follow-up

The user approved launch. Task IDs:

- Catalogue storage (Sol medium): `01a06f98-c7d1-7691-9f8b-3c0de8b3d7ae`.
- Exam evidence (Sol medium): `01a06f98-dc19-78d1-97c9-c7e5b86b4143`.
- Lab adaptations (Astra medium): `01a06f98-efeb-7483-ac48-e2d29a57b4d7`.

The design owner `01a06f2d-53e6-7233-9b9f-bd7504ac0855` has been notified of the plan and asked to identify overlapping files and its completion revision. Coordinate-distance has active design edits; defer adaptation until coordinated. The adaptations first-turn review is accepted and implementation remains paused pending evidence and batch approval.

Review of Lab Creation workflows identified the following follow-up changes. These are recorded requirements for the owners, not changes already made to those workflows.

| Existing source | Needed change | Owner/checkpoint |
| --- | --- | --- |
| `AGENTS.md`, `docs/codex-authoring-workflow.md` section 1, `catalogue/README.md` | Permit selection from a validated record query as well as generated HTML. Freeze record IDs, source revision/hash and bounded evidence, rather than making the whole HTML hash the sole selection identity. Keep HTML for human review. | Storage, with CLI implementation |
| `docs/research-standard.md`, `prompts/research-ideas.md`, `docs/workflow.md` | Add exam questions and mark schemes as evidence for assessed task/presentation conventions; retain syllabus authority for scope and books for explanation. Do not require a missing book to fabricate or block otherwise supported exam evidence. Preserve the distinction between observation and recommendation. | Evidence proposes wording; storage coordinates shared documentation edits |
| `scripts/build-catalogue.mjs` validation | Current idea validation requires `book`. Define how new exam-backed evidence is represented without fake book objects, while preserving all existing book records and source validation. Do not relax required evidence generally. | Storage schema review |
| `resources/README.md`, `scripts/check-resources.mjs` | Inventory papers and mark schemes with provenance and hashes, handle the supplied staging folder, and register 9709. Current inventory scans books/syllabuses and treats every resources directory as an exam code. Keep local-resource readiness separate from portable build checks. | Storage owns checker; evidence owns inventory and classified sources |
| `docs/codex-authoring-workflow.md` brief, packet preparation and `authoringPackets` conventions | Future briefs need small frozen evidence selections, approved profile constraints and review state. Add a bounded existing-lab adaptation route: do not reject a completed lab as a new-build candidate or force it through a new-lab creation cycle. | Storage documents retrieval; adaptations proposes route after pilot validation |
| `docs/integration-workflow.md` | Incorporate approved exam evidence and sidecar preservation into readiness checks. Distinguish internal reviewed 9709 alignment from public catalogue registration so deferred curriculum choices do not appear accidentally. Keep deployment-owned completion unchanged. | Adaptations, before implementation/integration |
| `automated/chatgpt-authoring/PROMPT.md`, `scripts/build-agent-distribution.mjs` and generated bundle | When shared authoring guidance changes, reconcile the concise external prompt and regenerate the distribution once. Preserve its 8,000-character limit; do not edit generated bundles as independent authority. | Storage after source guidance settles |

The adaptations review found that publication validation currently requires profile alignment in registered live metadata. Resolve that internal/public boundary explicitly before adding 9709 profiles. It also confirmed that the trigonometric circle and degree conventions are deeply connected to completion; neither removal nor radian conversion is assumed to be a small first-batch change.
