# Bounded lab authoring workspace

This persistent branch is the ChatGPT-through-GitHub workspace for developing existing labs and authoring explicitly selected new labs. Stay on this branch unless the user requests another destination. Do not merge the historical visual-discovery/refinement branch. Never merge this authoring workspace branch into main. Publication and deployment are separate, explicitly requested work, using the selective promotion procedure below.

## Start each lab

1. Read the current lab source, sidecar and catalogue registration. For a new lab, choose one idea from the catalogue HTML and structured data under `authoring/catalogue/`, check the current registry for overlap, and verify the relevant bounded syllabus/source evidence. Catalogue status is a dated reference, not proof of publication.
2. State the single learning relationship, learner action, visible consequence, evidence and next decision. Name the existing polished visual/model components to reuse and the exact file allowlist. Clarify a material scope gap before expanding the task.
3. Read `docs/lab-style-contract.md`, `docs/examplicity-living-style-guide-v3.html`, and `public/developer/lab-kit/0.3.0/agent/authoring-contract.md`. Follow the existing design language. Do not use design skills, boilerplate themes or a copied prototype shell.
4. Use the six production references below for the guided-to-experiment pattern, choosing the closest causal model rather than copying every control. Preserve or improve SVG quality; simplify layout and reveal only the current learner decision.

References under `labs-src/`: mathematics/similarity-scale-effects, mathematics/straight-line-coordinates-equations, mathematics/histogram-area-cumulative-distribution, physics/critical-angle-and-total-internal-reflection, physics/gas-compression-at-constant-temperature, biology/selection-pressure-and-trait-frequency. Each directory contains `lab.html`; its structured pedagogy lives in the matching `lab-contracts/<subject>/<slug>.lab.json` and any concise embedded rationale.

## Learning and interaction requirements

- The SVG/model is the teaching surface. Begin with small, connected experiences; introduce working before learners take responsibility for it. Predictions must affect meaningful inspection or revision, not merely reveal a prepared answer.
- Keep source quantities and calculations connected through consistent labels, quantity keys and minimal hover/focus/tap explanations. Value traces are off by default and run only on an explicit Trace values action.
- Keep mission copy clear, informative and warm. Make tasks and success easy to identify through existing typography and restrained checkmark feedback. Preserve unchanged apparatus during checkpoint fades and honour reduced motion.
- Use the existing `LabDesign.discovery.mount(root, createModel)` component where appropriate. Keep subject state, SVG geometry, scientific/mathematical rules, completion conditions and lesson sequence local to the lab. Do not create a parallel builder or generic lab framework.
- The final experiment must support consequential changes, fresh cases or comparison of retained readings with minimal controls. Preserve calculation ownership and curriculum outcomes. State approximations honestly; edits must invalidate obsolete success/test evidence.
- The contract must describe the implemented learner loop, real selectors, quantities, constraints, progression, completion and limitations. Tie `implementation.reviewedRevision` to the reviewed source Git blob or revision, not an old prototype identifier. Do not claim mastery or coverage solely because an equation is displayed.

## File and commit boundary

The catalogue, its structured data and authoring references are intentionally tracked under `authoring/` on this workspace branch only. Read `authoring/README.md` for catalogue provenance and source locations. Keep them available in GitHub-based chats; do not move them to a temporary upload pack or delete them during a lab delivery.

Source PDFs and book excerpts remain local-only under the ignored `authoring/resources/` and `authoring/catalogue/assets/book-excerpts/` paths, preserving the catalogue's relative links. This computer has the available source snapshot; a fresh GitHub checkout does not include those PDFs. Supply only the relevant local source files when an authoring task needs them, and verify their evidence before claiming coverage. Never publish PDFs or force-add ignored source assets.

Use ignored `work/` for research, prompts, plans, local helper scripts, screenshots, browser evidence and reports. These scratch materials remain in the chat's local workspace and must never be force-added or committed.

Deliver only the named authored lab, its sidecar, generated publication HTML, necessary edits to existing shared/style/registration files, concise existing changelog entries and meaningful tests. For a new lab, add only its required source/sidecar and registration through the existing manifest. Outside the existing workspace-only catalogue/reference boundary, avoid adding dependencies, root utilities, prototype review folders, test infrastructure or process documents. Preserve unrelated work and stage exact paths; never use blanket staging.

Source ownership remains `labs-src/<subject>/<slug>/lab.html` plus `lab-contracts/<subject>/<slug>.lab.json` → existing compiler → `public/labs/<subject>/<slug>.html`. Do not edit generated lab HTML directly or copy an offline download into authored source. Preserve manifest-owned frame/head regions and resource declarations.

The existing shared source snapshot is available locally at `public/developer/lab-kit/0.3.0/src/`; no sibling repository is required in this workspace. Make reusable component changes there, then run its existing manifest generator and developer synchronisation. Guide changes start in `docs/`, not generated public guide copies. Publication's pinned LabKit 0.2.1 and Lab Design 0.3.0 are an intentional supported arrangement; do not silently upgrade releases.

## Local execution only

**GitHub workflows/Actions are prohibited.** Do not create, edit, trigger or rely on them. Do not use hosted CI, remote test jobs or deployments to implement or verify a lab. Run everything in the chat's local environment. If a tool or browser cannot run locally, report the exact blocker and the checks completed; do not bypass this rule or claim unrun checks passed.

Use Node.js 22.13 or newer and install the existing locked dependencies with `npm ci` when needed. For one lab, run:

~~~sh
npm run lab -- build <slug>
npm run lab -- inspect <slug>
npm run lab -- validate <slug>
~~~

After shared-source changes, use the existing local commands:

~~~sh
node public/developer/lab-kit/0.3.0/tools/build-manifest.mjs
npm run developer:sync
npm run developer:check
npm run labs:sync
npm run labs:sync:check
~~~

Run tests from the repository root; the nested kit package test script belongs to its original source repository and is not available in this snapshot. Run only relevant existing tests for a local lab edit; update obsolete assertions when behaviour intentionally changes. Shared/compiler changes need the affected publication/design/contract tests and a local production build. Do not add tests that simply mirror markup or a full testing scaffold.

Review compiled and standalone HTML in a local browser at 1200×800, 900×800 and 390×844. Exercise the changed learner journey: manipulation, incorrect prediction, correction, revision, completion, final experiment, saved comparison and reset where applicable. Check keyboard/touch paths, clipping/overlap, tooltips, opt-in traces and reduced motion. Automated package checks do not prove visual quality. Keep evidence under `work/` and report actual results with limitations.

Before committing, inspect `git diff --check`, the exact file list and combined change. Apply the changelog contract below. Stop after a concrete reviewable delivery and report changed labs, checks, commit/branch and any blocker. Do not mark catalogue items complete until their deployed URLs have actually been verified. When delegation is explicitly requested, give bounded file ownership and ask tasks to report completion or blockers back; do not poll or monitor them.

## Selective promotion to main

Never merge this workspace branch into main or another release branch. Do not use a blanket cherry-pick of workspace commits. When the user explicitly requests publication, start an isolated branch from the current remote main and transfer only the reviewed production allowlist: target source/sidecar/output, necessary shared or registration changes, relevant tests and lab-related changelog lines. Reconcile those edits with current main and validate locally.

Exclude the entire `authoring/` tree, these workspace instructions, the workspace-only PDF ignore rules and authoring-setup changelog notes. Research and temporary files are excluded too. Inspect the combined outgoing diff to confirm that no catalogue, PDF, workflow or workspace-setup material is present. Report that concrete release diff before any separately required publishing approval.

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
