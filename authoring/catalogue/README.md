# Subject catalogue data

Each subject is an independent publication boundary:

```text
data/<subject-slug>/exams.json
data/<subject-slug>/ideas.json
<subject-slug>.html
```

The subject slug is a lowercase, hyphenated syllabus subject name. It must match
the `subject.slug` value in `exams.json`; the shared builder uses it as the output
filename. For example, `data/computer-science/` builds
`computer-science.html`. Do not combine subjects in one idea dataset or add a
cross-subject filter.

`co-ordinated-sciences` is a narrow user-authorized publication family: 0654 is
its research spine and 0610, 0620 and 0625 can appear only as verified
objective-level alignment. It is not a global sciences catalogue. Mappings are
current only for the shared 2026-2027 window until rechecked.

## Register a subject or exam

1. Classify verified local sources under `resources/<exam-code>/books/` and
   `resources/<exam-code>/syllabus/`.
2. For a new subject, create its data directory with `exams.json` and an
   `ideas.json` containing an empty `ideas` array. For another exam in an existing
   subject, add it to that subject's `exams.json`.
3. Record `code`, official qualification `title`, `qualificationLevel`,
   `syllabusVersion`, `examYears` and the full repo-relative `syllabusSource`.
4. Run `npm run resources:check -- <exam-code>` for the deliberate local-source
   inventory. The normal build does not require ignored source PDFs.
5. Delegate one bounded syllabus section to a source scout using
   `prompts/research-ideas.md`; the agent returns foundations without proposing a
   lab or assigning a tier.
6. Use `prompts/review-ideas.md` to synthesize possible concepts and apply the
   six-factor assessment trace and eligibility conditions in
   `docs/research-standard.md`. Use a separate judgment agent only when useful.
7. Save selected book pages under `assets/book-excerpts/<exam-code>/` when
   available, register reviewed exam evidence when in scope, and add reviewed
   idea records to that subject's `ideas.json`.
8. Run `npm run build` and visually inspect the generated subject HTML.

The renderer provides completion-status, exam-code, qualification-level,
priority and section filters inside each subject page.

## Optional exam-evidence collections

A subject may add all six files below when reviewed question-level evidence is
needed. Existing `exams.json`, `ideas.json` and book records remain valid and do
not need migrating.

```text
data/<subject-slug>/evidence/syllabuses.json
data/<subject-slug>/evidence/objectives.json
data/<subject-slug>/evidence/concepts.json
data/<subject-slug>/evidence/papers.json
data/<subject-slug>/evidence/questions.json
data/<subject-slug>/evidence/lab-alignments.json
```

Each file has `schemaVersion: 1`. Their arrays are `syllabuses`; `objectives`;
`concepts`, `comparisons` and `demandSummaries`; `papers`; `questions`; and `labAlignments`,
respectively. IDs are explicit, unique lowercase strings; references use those
IDs rather than array positions.

- A syllabus requires `id`, `examCode`, `cycle` (`YYYY-YYYY`), `version`, an
  official `source`, `components` and `routes`. Optional `updates` is an array of
  additional official hashed sources. A source requires one of `path` or `url`
  plus a SHA-256 hash. Components require `id`, `code`, `title`,
  `qualification` and `calculator` (`allowed`, `not-allowed`, `varies` or
  `not-applicable`). Routes require `id`, `label`, `qualification`,
  `componentIds` and `scopeStatus` (`complete-qualification` or
  `partial-qualification`); a partial route also requires a `note`.
- An objective requires `id`, `syllabusId`, one or more `componentIds`,
  `section`, exact `text` and a `locator`. Locators use `pdfPage` and may add
  `printedPage`; the ambiguous key `page` is not supported.
- A concept requires `id`, `title`, `summary`, `objectiveIds`, `ideaIds`,
  `classificationStatus` (`mapped` or `pending`), `reviewStatus` and
  `uncertainties`. Objective and existing-idea links may be empty while a
  concept is pending. Do not create a placeholder concept, idea or lab merely
  to satisfy validation.
- A comparison requires `id`, `title`, one or more `conceptIds`, two or more
  typed `scopes`, `dimensions`, `reviewStatus` and `uncertainties`.
  Each scope is `{type,id}` where type is `syllabus`, `route`, `component` or
  `objective`; its ID must resolve in the same subject evidence graph.
  Each dimension requires `dimension` (`givens`, `unknowns`, `operations`,
  `representations`, `notation`, `angle-units`, `working`, `calculator`,
  `precision` or `mark-scheme-method`), `relationship` (`equivalent`,
  `different`, `uncertain` or `not-assessed`), an `observation`, `questionIds`
  and `uncertainties`. An uncertain comparison requires a stated uncertainty;
  absent or unassessed evidence must use `not-assessed`, never `equivalent`.
- A demand summary requires `id`, `conceptId`, `scope`, `provenance`,
  `syllabusRequirements`, `paperObservations`, `designRecommendations`,
  `coverageGaps`, `reviewStatus` and `uncertainties`. Scope contains one
  `syllabusId` and one or more of its `componentIds`. Provenance contains the
  sampled `paperIds`, `questionIds` and a note that states the bounded sample;
  it does not imply exam-wide frequency. Syllabus requirements are statements
  with objective IDs. Paper observations keep separate arrays for task
  families; givens (supplied information); withheld information; explicit and
  inferred variables; required outputs and output forms; representations;
  visual structure such as labels, dimensions and axes; notation; units; domain
  conventions; dependencies; intermediate quantities; prompted and implicit
  working; broader working and marking demands; supported variation;
  boundaries; and counterexamples. Design recommendations are explicitly
  inferred strings, never source observations. Coverage-gap status is
  `not-observed`, `out-of-scope`, `insufficient-evidence` or `conflicting`;
  `not-observed` must not be rewritten as `out-of-scope`. Optional frequency
  entries require `label`, integer `count`, positive `denominator` and `note`.
  A `reviewed` or `approved` summary must also provide `reviewEvidence` for
  every nonempty paper-observation field. Each entry declares a
  `question-paper` or `mark-scheme` basis and supporting provenance question
  IDs; mark-scheme support requires reviewed mark-scheme evidence on the cited
  questions. Provenance questions also need substantive task content in
  `taskObservation`; calculator conditions alone do not establish that.
  Inferred or assessed working and marking claims should therefore declare a
  `mark-scheme` basis; the loader checks that declaration and its cited status.
  This is a structural readiness declaration: a reviewer remains responsible
  for deciding whether the declared basis genuinely supports the prose claim.
  Provisional and deferred summaries remain valid without this declaration
  while review is outstanding.
- A paper requires `id`, `syllabusId`, `year`, `session` (`feb-mar`,
  `may-jun`, `oct-nov` or `specimen`), `componentId`, `variant`,
  `documentType` (`question-paper` or `mark-scheme`) and a hashed `source`.
  Every question paper also requires `analysis` with `status` (`not-started`,
  `partial` or `complete`), `sourceCrossCheck` (`not-reviewed` or `reviewed`),
  `sourceInventory` and `sharedStimuli`. Each inventory entry identifies a
  `questionPartId`, its source locator and any `sharedStimulusIds`. Shared
  stimuli preserve common instructions, diagrams, tables or data once and are
  referenced by dependent question parts. A complete analysis requires a
  reviewed source cross-check. For every partial or complete analysis, the
  inventory and stored question parts must agree exactly for the analysed
  scope. This records the human source check; matching IDs alone is not evidence
  that the entire source was covered. Paper inventory completeness is separate
  from each question's extraction and mapping status: a complete inventory may
  intentionally contain unresolved, unmapped parts.
- A question is one question part when parts support different relationships.
  It requires `id`, a question-paper `paperId`, a locator with `pdfPage`,
  `question` and optional `part`, `objectiveIds`, `conceptIds`, `ideaIds`,
  `extractionStatus` (`reviewed` or `unresolved`), `mappingStatus` (`mapped`,
  `partial` or `unmapped`), `scopeStatus` (`in-scope` or
  `out-of-current-focus`), `reviewStatus` and `uncertainties`, with optional
  `sharedStimulusIds`, `objectiveRelationships`, `taskObservation` and
  `markSchemeEvidence`. Objective,
  concept and idea arrays may be empty; existing-idea links must resolve when
  present, and no lab alignment is required. Unresolved extraction or partial/
  unmapped classification requires a stated uncertainty.
  An objective whose `componentIds` include the paper component is treated as
  directly assessed. Every cross-component objective link must have one
  `objectiveRelationships` entry containing its `objectiveId`, relationship
  (`prerequisite` or `compatible-curriculum`) and a non-empty note. This keeps
  curriculum relevance distinct from what the sampled question directly tests.
  `taskObservation` may record only relevant givens, unknowns, angle units,
  operations, representations, notation, graph/diagram conventions, visual
  structure, explicit or inferred variables, dependencies, intermediate
  quantities, prompted or implicit working, expected working, answer form,
  precision and calculator conditions.
  `markSchemeEvidence.status` is
  `not-reviewed`, `reviewed` or `unavailable`; reviewed evidence requires a
  mark-scheme `paperId` and locator and may separately record `methods`,
  `tolerances` and `acceptedAnswers`.
- A lab alignment requires `id`, `ideaId` (`<subject>/<idea-slug>`), a
  `liveLab` source reference, `objectiveIds`, `questionEvidence`,
  `classification`, `proposedChanges`, `reviewStatus` and `uncertainties`.
  Each question link has `questionId`, `relationship` (`supports`, `conflicts`
  or `context`) and an optional non-empty `note`. `liveLab` requires `subject`,
  `slug`, `sourcePath` and the reviewed `sourceRevision`; it records research
  linkage without asserting deployment completion. Classification category is
  `A`, `B`, `C` or `null`, evidence strength is `none`, `single`, `multiple` or
  `conflicting`, and effort is `small`, `medium`, `large` or `unassessed`.
  Classification also requires a non-empty `rationale`; a `null` category
  requires a non-empty `evidenceGap`.
  Optional `profileReferences` require `status` (`planned` or `reviewed`),
  `contractPath`, `profileId` and `featureIds`; even reviewed references do not
  assert public runtime availability.

Record review status is one of `unreviewed`, `provisional`, `reviewed`,
`approved` or `deferred`. Source observations and mark-scheme methods or
tolerances stay in question records; adaptation inference stays in
`classification` and `proposedChanges`.

An idea may retain `book` and also have exam evidence. When no suitable book is
available, it may instead add `grounding: {"type":"exam-evidence",
"alignmentId":"...","reason":"..."}`. The loader accepts that fallback only
when the linked alignment belongs to the same idea, has reviewed or approved
status, and links at least one reviewed question. Do not create placeholder
book objects or use exam questions as a claim about explanatory teaching depth.

Use the validated JSON query rather than reading a whole generated page when a
bounded record is sufficient:

```text
npm run catalogue:query -- list <plural-entity> [filters]
npm run catalogue:query -- get <plural-entity> <id> [--detail] [--evidence]
```

Plural entities are `exams`, `ideas`, `syllabuses`, `objectives`, `concepts`,
`comparisons`, `demand-summaries`, `papers`, `questions` and `lab-alignments`. Results default to 50 records, accept
`--offset` and `--limit` up to 200, and report `total`, `count`, `truncated` and
`nextOffset`. Evidence expansion is independently bounded by
`--evidence-offset` and `--evidence-limit` and reports the same pagination
fields; it never silently omits later evidence.

Filters are `--subject`, `--idea`, `--lab`, `--cycle`, `--objective`,
`--concept`, `--paper`, `--component`, `--scope-status`, `--extraction-status`,
`--mapping-status`,
`--adaptation-category`, `--review-status` and `--missing-evidence`. Compact
output is the default; `--detail` returns the complete selected records and
`--evidence` adds their linked evidence page. Question, concept, comparison and
paper retrieval never depends on a live-lab link. `--missing-evidence` finds
records whose own review status is `unreviewed`, `provisional` or `deferred`,
as well as unresolved extraction, partial or unmapped questions, missing
question observations, uncertainties, not-observed or conflicting linked
evidence. It also applies the demand-summary readiness conditions above to
linked provenance questions. `--review-status` matches only the selected
entity's own status; a related alignment status does not change the result.
For demand summaries, `--component` matches only `scope.componentIds`, while
objective requirements remain supporting evidence. An absent lab link alone
is not treated as an evidence failure.

## Living research record

Treat `data/<subject>/ideas.json` and its generated subject HTML as the durable
record of idea research. After any research scout, packet freeze or authoring
attempt, reconcile material findings back into the originating record: exact
source locators, inspected or unavailable interactions, rejected alternatives,
scope narrowing, `revisedDirection`, assessment evidence, tier and rank. Keep
weak outcomes visible and explain why they were not promoted.

Packets are disposable consumers of this record. A packet-only catalogue copy,
prompt or README must not become a parallel research authority. Rebuild the
subject HTML after reconciliation so later authoring starts from the current
evidence and ordering.

Keep the record lean and stage-specific: scout findings belong in `references`
and the directional gate; inferred concepts belong in `interaction` and
`revisedDirection`; curator decisions belong in `assessment`, `tier` and `rank`.
Update those fields as each stage completes. `build-now` records eligibility;
rank records which eligible idea should be packeted first.

Every deployable lab-authoring packet must also be recorded on its idea as
`authoringPackets`. Add the entry when the packet is prepared, even when the
Markdown handoff or staging directory is intentionally untracked or later moved. Use a stable
artifact reference rather than treating its current filesystem location as
authority:

```json
"authoringPackets": [
  {
    "artifact": "concept-slug-lab-packet.md",
    "preparedOn": "2026-09-06",
    "expectedOutput": "concept-slug.html",
    "workflow": "chatgpt-upload"
  }
]
```

The generated catalogue labels these records and can filter for packets whose
deployment is not yet verified. Shared-guidance patch bundles are not lab
authoring packets: they have no expected lab HTML and do not belong on an idea.

## Co-ordinated Sciences curriculum map

The standalone [objective map](co-ordinated-sciences-syllabus-map.html) is a
planning reference generated from the reviewed 0654 ledger and its Biology,
Chemistry and Physics mappings. Regenerate it after a reviewed mapping update:

```text
node scripts/build-science-syllabus-map.mjs
```

For a cross-code record, an optional `syllabusObjectives[].relationship` may be
`primary`, `equivalent` or `compatible-extension`. The renderer labels it and
the generated prompt lists each registered official syllabus source. Do not
publish `thematic-only` relationships; keep them in the research ledger. An
exam-specific interaction mode is deferred until a reviewed compatible extension
demonstrates a real change in the operated system.

## Idea record

Each record must include:

- `slug`, a concise syllabus-led noun-phrase `title`, `curricula`, `sections` and
  `tier`;
- `learningGap`;
- exact `syllabusObjectives` plus a registered repo-relative `syllabusSource`;
- a valid local `book` record whose `source` is the full
  `resources/<exam-code>/books/<exact-filename>` path, or the reviewed
  exam-evidence grounding fallback documented above;
- tagged `references`, reserving `source-foundation` for inspected visual or
  authentic foundations;
- `overlapCheck` and `distinctGap`; and
- honest `revisedDirection`, `interaction` and `assessment.summary` context; and
- `authoringPackets` whenever a deployable packet has been prepared.

For newly reviewed records, `assessment.summary` concisely explains the dominant
evidence and tier judgment. The six factors guide the judgment but are not
repeated as boilerplate. Once a record is
selected from generated HTML, the separate Codex authoring orchestrator follows
`docs/codex-authoring-workflow.md` and reviews the produced artifact.

For review-standard-v3 datasets, `rank` is optional and means genuine
subject-wide packet priority. Never convert section order into a global rank.
When ranks are present, keep them unique and rebuild the HTML so displayed order
and labels remain current.

The build rejects mismatched subject slugs, incomplete exam metadata, unknown
exam codes, duplicate idea/evidence IDs or packet artifact references,
question/exclamation-style title punctuation, malformed packet dates or output
filenames, unregistered syllabus sources, dangling evidence references,
incomplete book source paths and missing tracked excerpt PDFs.

After deployment has published the lab and its canonical production URL has
been verified live, retain the idea's research tier and add:

```json
"implementation": {
  "status": "completed",
  "subjectSlug": "published-subject-slug",
  "labSlug": "published-lab-slug",
  "title": "Published Lab Title",
  "href": "/labs/subject-slug/published-lab-slug.html"
}
```

Omit `subjectSlug` when it matches the research catalogue folder. Include it
when a cross-disciplinary catalogue deploys the lab under a canonical subject
such as Biology, Chemistry or Physics.

This object is a deployment record. Do not add it for an authoring packet, a
human-approved artifact, an integration commit or a push awaiting deployment.
Rebuild the catalogue only after live verification so the completed record
links to the deployed lab and no longer offers a generation prompt. See
`docs/integration-workflow.md` for the exact completion boundary.
