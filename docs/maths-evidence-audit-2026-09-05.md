# Maths evidence audit — 5 September 2026

## Decision

**Not cleared for curriculum characterisation or lab adaptation.** This is an audit of an in-progress draft, not the completed revised corpus. Evidence task `01a06f98-dc19-78d1-97c9-c7e5b86b4143` has been instructed to downgrade the inherited records, correct its generator, and re-review them before synthesis. The adaptation task is explicitly blocked from treating the current labels as approval.

## Audit scope and passing checks

Frozen local snapshot: `D:/Cambridge Labs/Lab Creation/tmp/evidence-audit-2026-09-05/`. It contains 65 question records, 88 objective records, 30 paper artifacts, two syllabuses and 24 lab alignments. All 65 question records and their mark-scheme records were labelled reviewed.

Reviewed the task history and generator, scanned record-level review/working fields and component links across all 65 records, and independently checked source material for 11 targeted question records, including their relevant question-paper and mark-scheme pages. Visually inspected the card/profit page, histogram/sample-space page and AS calculus/area page. Checked exact syllabus sections for the mapping findings below. This was a risk-targeted sample, not a random error-rate estimate or a claim that all 65 records were semantically verified.

All 30 paper-artifact hashes and both syllabus-document hashes match their recorded local files. The sample question and marking sources generally exist at the recorded paths. Source inventory/provenance work is useful; the principal failure is interpretation and overconfident review status. A matching hash does not validate a mathematical interpretation.

Source paths below are relative to `D:/Cambridge Labs/Lab Creation`; page references are one-based PDF pages. The source PDFs remain local research resources.

## Blocking findings

| Finding | Verified evidence | Consequence and correction |
| --- | --- | --- |
| Wrong task, output unit and concept: `0580-2025-on-42-q4` | `resources/exam papers/0580/0580_w25_qp_42.pdf` p3 asks how many cards are made in eight hours and percentage profit. MS p6 gives 216 and 317 or 316.6–316.7. Draft says time, efficiency and “216 minutes”. | Would teach the wrong rate problem and quantity. Split (a)/(b), record 216 cards, percentage profit and the corresponding percentage objective. |
| Wrong exact objective: `0580-2025-on-22-q17-b` | QP22 p11 asks the midpoint of two points; MS22 p9 awards one mark per correct coordinate. Syllabus p43 places length/midpoint in E3.4; draft maps only E3.7, perpendicular lines (p44). | Would classify midpoint evidence as a perpendicular-line demand. Correct the objective and inspect all sibling mappings. |
| Conditional probability inferred from a Venn diagram: `0580-2025-on-22-q12` | QP22 p8 and MS22 p8 ask unconditional single/set-event probabilities; the sample space remains all 100 members. Draft includes E8.4 conditional probability. | A representation is not a demand classification. Map exact single/combined/set objectives and separate the parts; do not infer conditioning from diagram type. |
| Explicit Core boundary contradicted: `0580-2025-on-21-q20-a` | QP21 p12 draws twice without replacement from a bag with one black ball; MS21 p9 awards one mark for zero. Linked C8.3 explicitly restricts combined events to replacement; E8.3 allows either. | Cannot use this as direct evidence for Core without-replacement demands. The impossibility observation does not require the draft's denominator-update method. |
| Dominant calculus demands omitted: `9709-2026-mj-21-q7` | QP21 p10 asks exact area bounded by a trigonometric curve and its maxima. MS21 p15 requires differentiation/stationary points and integration. Syllabus sections 2.4/2.5 are on pp24–25. Draft links only 2.3 trigonometry. | Would understate AS demand and promote a graph-only adaptation. Include all assessed operations and their exact objectives; distinguish intermediate work from the requested final output. |
| Sample-space restriction omitted: `0580-2025-on-42-q16-b` | QP42 p12 selects only from categories C and D. MS42 p9 uses 10/27 × 9/26 = 5/39. Draft says only “histogram-derived categories”. | Without the restriction a consumer could use all 48 coconuts. Preserve the selected population, shared histogram frequencies and dependent part context. |
| Part-specific precision and marking continuation lost: `9709-2026-mj-21-q4` | QP21 p5 requests exact R and alpha to two decimal places in (a), then equation solutions in (b). The record combines both parts but its MS locator p11 contains only 4(a); 4(b) continues on p12. | Split parts; preserve exact/decimal requirements, signed degree interval, all marking-page locators and any accepted precision alternatives. |

## Systemic issues

- All 65 records copy the same generic string into `taskObservation.expectedWorking` and `markSchemeEvidence.methods`. All 65 have empty uncertainty arrays; none has a populated tolerance field. This does not prove every method is wrong, but it is not a reliable record of actual marking requirements. For example, Core QP32 Q4 awards correctly drawn lines with follow-through; it does not require the draft's algebraic negative-gradient explanation. Separate a possible solution method from marks actually awarded and methods actually required.
- The generator unconditionally assigns reviewed status. Its output must not inherit semantic approval. Repair the generating source as well as JSON so regeneration cannot restore errors.
- There are 13 question/objective component mismatches. Some may legitimately represent prerequisite or compatible content; others are erroneous direct assessment claims. Preserve the observed paper component and explicitly justify any secondary relationship. Do not reject every cross-component link or automatically treat matching components as proof of correct mapping.
- The 65-record snapshot is lab-filtered and has records from only 14 of the 15 acquired question papers. It is not a complete-paper corpus. The owner has acknowledged this and is migrating to complete part inventories. That migration must not carry the old semantic labels forward unchanged.
- Parent questions and multi-part records conceal different demands and missing subsequent pages. In particular QP21 Q20(c), on the next page, is not represented by its existing (a)/(b) records. Source inventory must be checked against actual papers, not solely the extractor's internally consistent ID list.
- Lab categories and proposed changes remain research proposals. They cannot establish an exam-level profile, implementation effort or safe modification of the current lab by themselves. Existing engineering review and source revision checks still apply.

## Required remediation and re-audit

1. Downgrade the inherited 65 records and affected classifications to provisional, preserving provenance. Do not publish approved summaries or use the draft to author adaptations.
2. Maintain a compact repair ledger keyed by stable question-part ID: QP task/locator checked, MS answer/method/precision checked, exact objective checked, correction made and unresolved uncertainty. All inherited records require re-review because the status assignment was systematic.
3. Verify every question and subpart against each selected paper, including shared instructions, data and figures. Track extraction completeness separately from mapping completeness and synthesis review. Explicit unresolved records are preferable to invented mappings.
4. Preserve exact givens, requested unknowns, restrictions, operations, representations, precision and marking alternatives. Use precise notation or verified paraphrase; inspect diagrams and formulas visually when extraction is ambiguous.
5. Add focused semantic regression fixtures for the confirmed errors where suitable. Structural validation should check links, components and required provenance, but must not be presented as mathematical review.
6. Before restoring reviewed status, the orchestrator rechecks corrected examples and a fresh independent sample spanning Core/Extended, calculator/non-calculator and Pure 1/2/3, including multi-part, diagram and exact-answer cases. All confirmed defects must be closed with source evidence.
7. Demand summaries require separately reviewed supporting evidence, explicit sample coverage and uncertainties. No unsupported level-wide conclusions, inferred exclusion from missing examples, or automatic propagation of review status.

The audit report records findings and instructions, not completed repairs. The evidence owner retains data ownership during correction; the storage owner has been notified to distinguish direct assessment from justified cross-component links and keep review gaps visible.
