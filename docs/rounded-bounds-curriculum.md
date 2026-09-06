# Rounded Measurements and Bounds curriculum pilot

Input site revision: `f41e835aaa61cb67c5039a4a38a4bf3a8abc17d8`.
Catalogue revision: `df5297690fc335d7b62d2b456cb785fe14d1a0d4` in Lab Creation.
The separate sidecar is the runtime profile authority; this note records the
bounded evidence review and design decisions. Builds need neither the research
checkout nor source PDFs.

## Grounding

Retrieved through `node scripts/catalogue-query.mjs get <entity> <id> --detail`:

- `demand-summaries 0580-bounds-demand`: provisional six-part synthesis, used
  as a guide rather than blanket approval.
- `objectives 0580-c1-10` and `0580-e1-10`: the 0580 2025–2027 syllabus,
  PDF pages 14 and 34, distinguishes rounded-data bounds from calculated-result
  bounds. This distinction does not come from absence in the paper sample.
- `questions 0580-2025-on-13-q20`: QP page 11; paired
  `0580-2025-on-ms-13`, page 8. A rounded height and its accuracy are supplied;
  two endpoint blanks surround supplied inequality signs. The half-unit and
  endpoints are inferred. The scheme awards each correct endpoint in position,
  with a special case for reversal; it does not mandate separate written steps.
- `questions 0580-2025-on-42-q20`: QP page 15; paired
  `0580-2025-on-ms-42`, page 10. Rounded mass and density and a density formula
  are supplied. Lower volume requires lower numerator divided by upper
  denominator; the scheme recognizes controlling-bound method evidence.
  This supports the quotient-bound structure, not the lab's particular speed
  certificate or an assertion that all Extended formulas are withheld.

The question records and linked marking evidence were inspected for these
specific claims. Their reviewed flags do not imply a full evidence audit.

## Profile deltas

**Extended is the default.** Its four-stage model, readings, speed claim,
working, certificate decisions and finer-precision comparison remain intact.
The existing direct-manipulation investigation is a teaching representation,
not a reproduced examination question.

**Core** retains both draggable rounding rulers and finishes with measurement
intervals. Givens are distance 100 m to the nearest metre and time 12.4 s to the
nearest 0.1 s. Distance and time are two quantities; their four endpoints are
four response slots, not four independent unknown measurements. The signs
`lower ≤ variable < upper` are supplied. Core shows no speed claim, quotient
working or calculated-result stage.

Core None supplies the endpoints; Some supplies lower endpoints and asks for
the two upper endpoints; All asks for all four endpoints. All modes require
crossing both boundaries of both readings and checking the intervals. This
assistance sequence is a design choice, not an exam requirement. Numeric
endpoint annotations owned by the learner show `?` until a successful check;
the scale, true-value readout and discovered boundary positions remain visible
so the model still supplies useful evidence. No information is removed globally.

Switching curriculum clears progress and answers and returns to the first
stage, retaining the Working setting. Sidecar `enabledFeatures` determines the
available stage set. The implementation map records the new control and response
selectors, visibility, dependencies and completion rules. Existing public 0580
syllabus mappings already include both sections; no registry expansion or 9709
alignment is needed.

## Focused verification

`tests/rounded-bounds.test.ts` exercises real model logic: profile stage limits,
discovery and answer gating at all assistance settings, incorrect endpoint
rejection, switch reset and existing coarse/finer speed proofs. Publication
validation checks the embedded contract and self-contained download resources.
The browser pass verified the real toggle, pointer and keyboard model controls,
incorrect and correct endpoint checks, Core completion, return to Extended and
the preserved desktop layout, with no console errors. The agent-browser CLI was
unavailable, so the connected browser was used. The published monolithic HTML
was served locally; a separate file-URL download opening was not tested.
