# Examplicity design update — lean plan

Target: `codex/llm-first-v0.1`. Scope: shared design language across the site and every lab in the current manifest (57 at review). Implementation is in progress. The second pilot pass has been accepted, with the Working, stage and copy refinements recorded below. The other labs remain queued for subsequent batches.

## Agreed rules

- Keep the catalogue and supporting-page layouts. Preserve lab models, geometry, meaningful colours and learning behaviour. Set Membership's possible model overhaul stays separate; its interface styling is included.
- Follow written feedback rules and correct conflicting examples: yellow for unfinished work, red with an x for a wrong attempt, green with a check for a correct attempt. Use complete feedback borders and surfaces.
- Use 14px working/explanations, 12px short labels and 11px secondary annotations as defaults, with reviewed diagram-specific exceptions. Apply v3 rounded rectangular actions; preserve meaningful model shapes.
- Allow taller labs within the viewer. Keep operated diagrams intact and retain useful editor/console panes. Keep measurements beside the model and persistent working in the right-hand column, flowing below on narrow screens. Use the same calculation layout across assistance levels.

## Three steps

1. **Establish the standard.** Update shared styling and the existing style guidance alongside Binary, Coordinate and Graph Search. Correct the supplied examples' feedback and responsive defects. Review these three labs with the user before continuing.
2. **Apply it throughout.** Update site controls and supporting pages, then every lab in small related batches. Include local styles: the labs' bespoke feedback needs individual attention. Simplify dense interface layouts where needed, while preserving their learning models. Continue under the agreed standard; raise substantive ambiguity as it arises.
3. **Verify and finish.** Confirm every manifest lab has been checked, resolve outstanding issues, run the existing full checks and review the combined Git diff. Update the changelog to describe the delivered changes.

## Git and scope control

Use Git diffs, logical batch commits and normal Git rollback. Maintain one per-lab completion checklist with any outstanding issues.

Preserve unrelated work. Edit maintainable sources and regenerate published lab HTML through the existing pipeline. Use existing shared styles and publication tools; keep vendored Kit releases intact. Ask before expanding into a learning-model redesign.

## Four checks for every lab

- **Consistent:** agreed typography, controls, fields, feedback and guidance; meaningful model-specific differences preserved.
- **Usable:** readable at 1200, 900 and 390px widths and inside the 1280×720 viewer; no page-level horizontal overflow, obscured controls or misplaced guidance.
- **Working:** main learning interaction, relevant feedback states, reset and completion work. Check keyboard equivalents and assistance modes where present.
- **Portable:** published and downloaded HTML retain presentation and behaviour, including offline use.

Check changed labs before each batch commit and record completion. Shared-style changes require checking their effects across all labs before the update is complete. Use existing sync/download checks and relevant tests per batch; run full tests, lint and build at completion. Add focused regression tests only where a behaviour change or defect warrants them.

## Known corrections

Graph Search's supplied patch has yellow wrong-answer feedback and a desktop grid rule that overrides its mobile layout. Coordinate's panel order will follow the agreed activity-specific approach. Replace older guidance that forces above-fold layouts or permits shared feedback side rails. Use the token CSS embedded in the supplied guide as the starting point.

## Implementation record

Baseline: `bcd9b44`, clean worktree; 64 tests and the complete sync/download/contract checks passed for all 57 labs before edits.

The pilot introduces a shared token source, imported by the app and embedded in lab HTML through existing publication tools. Legacy token values remain unchanged for unmigrated labs. Only Binary, Coordinate and Graph Search receive visible local interface updates in this batch. Vendored Kit files and lab contracts stay unchanged.

Git is the change history. Documentation records the decisions, intentional exceptions and verification results needed to understand those changes; the lean process does not require abbreviated evidence.

### Pilot review — 5 September 2026

The three pilot implementations are ready for review. Their checklist entries remain open until the agreed user review and remaining verification below are resolved. The other 54 labs await their local migrations.

| Lab | Changed | Browser evidence |
| --- | --- | --- |
| Binary Number Practice | Shared text roles, rectangular actions and complete feedback surfaces; a blank answer is unfinished rather than incorrect. | Blank, wrong and correct answers show distinct feedback; keyboard answer entry works. |
| Coordinate Geometry | Readable working/evidence, consistent controls and complete field/status borders with visible marks. Existing model and evidence order retained. | Wrong and correct length entries, assistance choices and reset exercised. All four stages completed through keyboard controls with working Off, including endpoint movement and repair. Final completion/assistance card checked at phone width. |
| Graph Search | Readable working, full feedback borders, red incorrect predictions, responsive graph and enlarged phone road labels. | Both algorithms completed with route S → B → D → F → G, cost 8. Wrong A* choice preserves the frontier. Minimum reveal and road-cost keyboard editing work; previous results persist after editing. |

All three were visually inspected at 390, 900 and 1200px widths and in the 1280×720 site viewer. No page-level horizontal overflow was found. Taller content scrolls within the existing viewer. The catalogue layout and browser console were also checked.

Intentional exceptions for this review:

- Binary's dense 16-bit annotations retain compact sizing to preserve the register layout.
- Coordinate's SVG axis/point annotations retain their geometry-dependent sizing; working and evidence outside the map use the new text roles.
- Graph's small in-node metrics remain supplementary; the frontier repeats the values at readable working-text size. Phone node names and road costs are enlarged without moving the graph.

Automated evidence: 65 tests pass, including the new wrong-prediction regression and shared-token download coverage. Compilation, styles, content, standalone resource checks and contract checks pass for all 57 labs. A comparison against the baseline confirms that all 54 non-pilot HTML files are identical outside the embedded shared frame and that every existing token value is unchanged.

Production build, lint and `git diff --check` also pass. Remaining verification: a separate offline browser run of downloaded files has not been exercised in this pass. The publication checks verify self-contained resources and preserved scripts; they do not substitute for an offline runtime check.

### Second pilot pass — review response

The first pass preserved too much inherited interface structure. Increasing
type sizes and recolouring boxes did not adequately apply the guide's intent.
The following decisions supersede the earlier permission to choose arbitrary
working/evidence order and now govern every subsequent lab migration:

- One clear task; no stage numbers, phase names, generic progress counters or
  bars, redundant Working required heading, or assistance summary subtext.
- One persistent Working column to the right, flowing below the model on
  narrow screens. Calculations keep their labels, formula placement and order
  across Off, Some and All; an input replaces the shown result in the same row.
- Padding and whitespace establish groups. Idle values and prose do not need
  individual boxes. Semantic fields, actual feedback and temporary phase/cue
  cards retain their meaningful full borders.
- Regular primary ink for working, secondary ink for explanation, and heavier
  type only for headings or selected results. Remove inherited grey bold
  microtitles and prose about the application's internal state.
- Distances, current line equations and other model evidence stay beside the
  operated visual. Guidance attaches to its actual handle with the guide's
  blue cue/halo treatment and dismisses after interaction; no drag chips.

The guide's literal examples remain references, not instructions overriding
this review. Internal phase progression and the authentic learning models are
preserved while the surrounding information architecture changes.

Colour audit: shared neutral, interaction and learner-state colour tokens
match the starter layer embedded in the supplied living HTML guide. The key
values are ink `#1d1d1f`, secondary ink `#424245`, accent `#5277b8`, needed
`#946200`, correct `#18794e` and incorrect `#b42318`, with the guide's associated
surface and border colours. Target cues and concept accents use the guide's
named tokens. Existing 35px controls in unmigrated labs remain a deliberate
compatibility exception; updated actions use 40–44px. Pixel text defaults are
equivalent to the guide's rem values at the default root size.

Second-pass verification:

- Coordinate completed all four configurations: All working in the first,
  Some in the second, then Off for the horizontal case and endpoint repair.
  Formulas update with the endpoints; new cases clear answers. Correct answers
  alone do not complete the geometric construction. Wrong, unfinished and
  correct field surfaces were inspected. The shown target equation is separate
  from the current drawn line, and hidden answers are not leaked by explanation.
- Pointer rotation updates the live line and distance evidence. Keyboard
  translation/rotation and endpoint movement also work. The target cue and its
  leader dismiss after interaction and stay attached after resizing.
- Graph Search completed both algorithms at cost 8, preserves the frontier
  after a wrong prediction, reveals the minimum, and retains previous routes
  after keyboard road-cost editing. Its working is an open column beside the
  graph, with visible borders reserved for decisions and actual feedback.
- Both layouts were inspected at 1200, 900 and 390px, with no page-level
  horizontal overflow. Coordinate's completion card and working controls were
  checked on a phone; the 1280×720 embedded viewer was also inspected.
- 66 tests pass, including the new Coordinate rendering/state regression;
  lint, production build and all 57 publication/download/contract checks pass.
  Offline browser verification remains separate from the automated packaging
  checks, as recorded above.

### Accepted pilot refinements — Working, stages and visual-first copy

The user accepted the second pass and clarified that the process should stay
lean while the documentation can remain detailed. These refinements are now
part of the living `docs/lab-style-contract.md`, superseding the second pass's
blanket removal of progress surfaces:

- **Working:** use the established grey segmented control, polished to one
  plain label and None / Some / All. The selected option is white with a neutral
  border; assistance settings do not use the blue primary-action treatment.
- **Actual learning stages:** keep minimal markers immediately to the right of
  Working, without a fraction counter or internal phase labels. Hover, keyboard
  focus and tap expose the task and relevant working. Upcoming stages disclose
  no answers. Current evidence updates; completed-stage evidence is retained.
  Stage details do not provide a bypass around required learner action.
- **Visual-first editorial review:** remove text that repeats a nearby visual,
  control, legend or calculation. Improve the visual where that better exposes
  the concept. Keep useful goals, interaction hints, working and non-obvious
  interpretation. Review the bottom of each lab as carefully as its model.
- **Graph Search:** reveal comparison results only when evidence exists;
  omit empty relaxation/settled sections and generic bottom instructions.
  Preserve priority decisions, the optimistic meaning of h, real result facts,
  previous-map evidence and the qualification about legal tie choices.

Implementation remains one Git batch: opt-in shared control styles, Coordinate
stage details, Graph Search's copy/evidence changes and this guidance. The
reference examples on the live site inform the new controls; their wider lab
migrations remain in the catalogue queue. No new progression framework is
introduced. The repository style contract and
`docs/examplicity-living-style-guide-v3.html` are maintained together for
subsequent feedback. The HTML guide's executable pilots and inspectable source
have been refreshed from the reviewed publication output, and its Downloads
copy has been updated too. The supplied Markdown documents remain original inputs.

Refinement verification:

- Coordinate's None, Some and All settings expose zero, three and four learner
  inputs respectively, and all start incomplete. The selected segment computes
  to white on the guide's `#f7f8fa` grey group. All working plus a keyboard-built
  bisector completes the first stage; its actual working remains available
  after advancing. Future-stage details contain no answers. Tab, tap and Escape
  open, switch and dismiss details without changing the learning stage.
- Graph Search completed A* and Dijkstra at cost 8, with five and eight settled
  towns respectively in the tested runs. The last relaxation calculation stays
  visible after completion. Road-cost editing clears current working and keeps
  the previous results for comparison; generic empty bottom content is absent.
- Both labs have no page overflow at 1440, 1366, 1200, 900 and 390px. Coordinate's
  header and details fit at phone width and in the 1280×720 embedded viewer.
  No browser console errors were recorded.
- All 67 tests, lint, production build and 57 publication/download/contract
  checks pass. The other 55 generated labs are unchanged outside their inlined
  shared styles; the new classes are opt-in. Offline browser testing remains
  the separate outstanding check recorded in the earlier pilot evidence.

### Rollout after pilot acceptance — 5 September 2026

The three pilots and their subsequent refinements have been accepted as the
basis for additional lab redesigns. Continue in small related batches under
the existing review agreement; raise substantive learning or interaction
ambiguity rather than requiring another visual approval for every lab.

The living guide is now also maintained in Lab Creation at
`docs/design-language/examplicity-living-style-guide-v3.html`, alongside its
written contract. Preserve these reviewed refinements in later batches:

- Enlarge primary visuals within their available area; avoid excessive internal
  margins or arbitrary maximum widths that leave an otherwise large canvas empty.
- Overlapping completion cards remain movable within the workspace, by pointer,
  click-to-switch-sides and keyboard, without a blocking backdrop. Moving a card
  preserves the result and its continuation actions.
- Modal actions have centred labels and rows, 10px vertical / 18px horizontal
  padding, 40px minimum height and the reviewed 11px / 600 label treatment.
- Working offers say “Try some working” or “Try all working”. Qualification-aware
  working is future work, contingent on the selected IGCSE / AS / A Level and
  verification of its appropriate working; this rollout does not introduce it.

The next pair has been implemented: Prime Factors: HCF and LCM, and Sequence
Patterns and Differences. Both retain their learning models. Sequence's existing
progressive working availability was preserved under the stated default;
higher levels are offered after successful patterns, with earned levels then
available in the shared control.

### First additional batch — implementation and evidence

- Prime Factors now places its responsive pairing board beside one open Working
  column. Coloured factor chips form the multiplication rows without duplicate
  numeric narration. Copy counts remain visible mathematical evidence. The
  pairing target says “Pair 2s”, avoiding an apparent false addition equation.
- Sequence keeps one term table, a readable calculation chain, and minimal
  stage details with retained shown/submitted working. Generic assistance copy,
  duplicated term lists and nested decorative framing have been removed.
  Completed None stages retain the shown calculations; unanswered required
  results and future-stage answers remain hidden.
- Both use the accepted grey Working control, semantic field states and movable
  completion cards with the approved action labels and spacing.
- Prime Factors completed the same 200/24 case at None, Some and All, yielding
  HCF 8 and LCM 600. Factor construction and explicit pairing confirmation
  remain required. Wrong answers show red ×; correct answers show green ✓.
  Reset clears completion and restores required factor construction.
- Sequence completed linear construction, then quadratic Some working
  (constant second difference 2, n², T10 = 100), cubic All working
  (differences 3/6/10, 3/4, 1; n(n+1)(n+2)/6; T8 = 120), and distinct connected
  futures 8 and 9. Working inputs have accessible labels and explicit feedback
  marks; stage details preserve history and never advance the sequence.
- Both primary models fit at 1440, 1366, 1200, 900 and 390px with no page-level
  overflow or clipped model bounds. Sequence also fits at 360px. Its mobile
  Working column stacks below the model and stage details stay within the
  viewport. Prime's completion card remains bounded with a 40px move handle.
- Automated verification: 74 tests, lint, production build, and all 57
  compilation/style/content/download/contract checks pass. A focused Sequence
  evidence regression checks readable labels, retained shown working and hidden
  unanswered results. The separate offline browser audit remains outstanding
  for the rollout; automated packaging checks confirm self-contained resources.

### Review refinement — shared activity top bar and flat palette

Coordinate, Prime Factors and Sequence now use one activity bar above the model
and calculation columns: current task and Reset on the left; Working and any
real learning-stage markers together on the right. On narrow screens, controls
wrap beneath the task while remaining above the visualization. Calculations
alone move below the model. Binary and Graph Search have no equivalent working
levels or learning checkpoints; their existing top-level controls remain and
no artificial progression has been added.

Prime Factors now uses the living-guide concept blue, violet and teal families
for A, B and shared factors, with matching ink, line and flat soft fills. Large concept backgrounds use the approved base colour at 30% alpha over white; number tiles and shared-factor circles stay white for contrast, while working tokens use the matching opaque base-colour tint. Both guides include the surface derivation and visible background/object specimens. Neutral
framing, blue actions and the separate answer-feedback palette replace custom
near-match colours and decorative gradients. Both written contracts and living
HTML guides document this rule; the control specimen and embedded Coordinate
reference demonstrate the top-bar arrangement. The guide's decorative gradient
specimens have also been replaced with flat fills and discrete palette swatches.

Verification: top-bar positioning and overflow checked on desktop and at 390px
and 360px; checkpoint details stay inside the viewport and future stages reveal
no answers. Coordinate working controls and Prime pairing/completion still
operate. All 74 existing tests pass; publication checks verify generated output.

### Developer publication and kit simplification

The guide is available from this worktree's `/developer` page for the next
release, with the complete HTML, extracted starter CSS, written style contract
and hash-verified Lab Kit 0.3.0 downloads. `developer:sync -- --source` imports
the canonical Lab Creation snapshot; `developer:check` verifies public copies,
the extracted CSS and every kit release file before the site build.

The guide takes precedence over kit styling. The kit retains useful compatible
primitives and a reusable movable-completion helper that uses the guide's
existing handle markup. Duplicate kit activity, toggle, stage, completion and
concept-surface implementations were removed. Working: None / Some / All and
all existing lab-specific meanings remain intact. The authoring bundle includes
the guide and contract. Existing published labs stay pinned to 0.2.1 until
separately migrated; this publication does not restyle the remaining catalogue.

The latest colour decision supersedes the earlier whitening experiment:
backgrounds use the base concept hex with `4d` alpha (approximately 30%), painted over white.
For violet this is `#7563a74d`. Prime Factors was checked against the rendered
RGBA values. The user selected worktree publication for the next release;
no live deployment is part of this change.

Validation: 74 site tests and 14 kit tests pass; lint, production build, guide
publication and kit hash checks pass. All eight developer page/resource URLs
respond with HTTP 200. Developer navigation was checked on mobile.

### Standing rollout execution policy

Implement each batch directly: review the lab HTML, record an explicit change
list, make the changes, validate them, and provide review links. The user reviews
each completed batch before the next begins. Surface substantive novel design
situations; routine changes follow the agreed visual language. Delegation is
not the default rollout process.

The living HTML guide in Lab Creation is the shared visual and interaction
reference, containing design rules, tokens and examples. It is not a prompt
supplement or a source of rollout scope, delegation or verification instructions;
those belong in this plan and task briefs. Published guide copies and agent
bundles are generated snapshots, refreshed through the existing scripts.

Ordinary SVG charts and diagrams, including their labels and presentation
typography, are in scope for a migration. Preserve mathematical/data mapping,
meaningful model colours and interaction semantics; adjust diagram text and
its surrounding viewport when readability requires it. Complex illustrated
assets such as routers and jars are outside this rollout unless separately
commissioned. Surrounding HTML controls, layout, working and feedback remain
in scope. Preserve unrelated work, keep the existing kit pin, and stop when a
change would require a learning-model decision or a redraw of a complex
illustrated asset.

### Histogram correction batch — change list

- Raise diagram text to readable rendered sizes, including at the minimum chart
  width; consolidate repeated typography overrides and centre vertical labels.
- Shorten plot captions while retaining their mathematical meaning.
- Keep the draggable completion card in a sibling overlay outside graph scroll
  content; opening, focusing and moving it must not displace the graph.
- Keep ordinary chart presentation in scope and preserve the learning sequence.
- Keep reusable typography/overlay guidance in the Style Guide; keep this
  rollout's scope and process here.
- Validate desktop and narrow layouts, completion/movement, working controls,
  and focused compilation/tests. Then submit this batch for user review.

Completed for user review: typography overrides consolidated, vertical axis
labels centred, captions shortened, and the completion-card move control placed
at its top right. Completion and restored input focus use `preventScroll`.
At 390px, rendered diagram annotations measure 11.52px, labels 12.24px and values
14.4px; there is no page-level horizontal overflow. Desktop and narrow keyboard
completion/movement leave graph `scrollTop` at zero and its scroll height equal
to its visible height. None/Some/All switching was checked. All 75 tests,
compilation, developer publication and authoring-bundle checks pass. This is a
focused correction check, not a repeat of every quartile/experiment path.

### Catalogue checklist

Histogram drag refinement: keep vertical bar/point and horizontal ruler
constraints; use grab/grabbing handles, preserve the pointer's initial offset,
and capture the active pointer until release/cancellation. Retain target snapping
and keyboard controls. Check off-centre pickup, movement, limits and cancellation.

Implemented for review. Regression checks exercise off-centre pickup, movement,
target snapping, unrelated pointers and cancellation for all three handle types.
Browser checks confirm grab cursors, neutral locked handles and unchanged arrow-key
adjustment. All 79 tests, compilation and guide/bundle checks pass. Manual pointer
feel remains part of user review; no other labs were changed in this batch.

Histogram sidebar refinement (next review batch): retain the same visible step
sequence in None/Some/All; use lightly bordered cards with yellow active work,
green/check completed actions, red/x incorrect answers, and neutral upcoming or
provided reference work. Remove duplicate turn/drag prompts while retaining
essential mathematical dependencies. Distinguish showing a calculation from
completing the learner action. Record the visual pattern in the HTML guide.

Implemented for review in Histogram: None's model actions advance the same
numbered cards as Some/All; incorrect entered values show red/x and corrected
values green/check. Provided width/rank calculations and free exploration stay
neutral. Duplicate sidebar turn/drag prompts were removed. Fixed Enter committing
rebuilt input fields, which otherwise could leave correct work without Continue.
Verified None progression, All incorrect/correct answers and Continue, Some on
the next interval, and 390px cards without page overflow. The entry commit has
a regression test; all 76 tests and publication checks pass. Earlier pilot labs
remain unchanged pending review of this pattern.

Check an entry only after its local design update and relevant interaction/responsive/download checks are complete. Shared token distribution alone does not complete a lab.

- [ ] `biology/selection-pressure-and-trait-frequency`
- [ ] `computer-science/assembly`
- [ ] `computer-science/automated-system-control-flowcharts`
- [ ] `computer-science/binary-floating-point`
- [ ] `computer-science/binary-numbers`
- [ ] `computer-science/bitmap-compression`
- [ ] `computer-science/combinational-logic-circuit-design`
- [ ] `computer-science/csma-cd`
- [ ] `computer-science/data-transmission-methods`
- [ ] `computer-science/database-normalisation`
- [ ] `computer-science/dijkstra-a-star-graph-search`
- [ ] `computer-science/dns-web-page-retrieval`
- [ ] `computer-science/encryption-in-data-transmission`
- [ ] `computer-science/fetch-decode-execute`
- [ ] `computer-science/huffman-rover`
- [ ] `computer-science/ipv4-subnetting`
- [ ] `computer-science/logic-circuit-flip-flop`
- [ ] `computer-science/memory-management`
- [ ] `computer-science/network-topology`
- [ ] `computer-science/packet-switching`
- [ ] `computer-science/parity-arq`
- [ ] `computer-science/process-states-scheduling`
- [ ] `computer-science/python-programming-practice`
- [ ] `computer-science/recursive-call-stack`
- [ ] `computer-science/single-neuron-threshold`
- [ ] `computer-science/software-stack`
- [ ] `computer-science/sound-sampling`
- [ ] `computer-science/tcp-ip-encapsulation`
- [ ] `computer-science/translator`
- [ ] `mathematics/circle-theorem-constraint-network`
- [ ] `mathematics/coordinate-distance-midpoint-perpendicular`
- [ ] `mathematics/histogram-area-cumulative-distribution`
- [ ] `mathematics/motion-graph-rate-area`
- [ ] `mathematics/non-right-triangle-solution-constraints`
- [x] `mathematics/prime-factors-hcf-lcm`
- [ ] `mathematics/ratio-concentration-flow-rate`
- [ ] `mathematics/recurring-decimals-fractions`
- [ ] `mathematics/relative-frequency-bias-expected-frequency`
- [ ] `mathematics/repeated-percentage-change`
- [ ] `mathematics/replacement-conditional-sample-spaces`
- [ ] `mathematics/right-triangle-ratio-invariance`
- [ ] `mathematics/rounded-measurements-bounds`
- [ ] `mathematics/scatter-correlation-prediction`
- [x] `mathematics/sequence-patterns-differences`
- [ ] `mathematics/set-membership-operations`
- [ ] `mathematics/similarity-scale-effects`
- [ ] `mathematics/solid-surface-volume-tradeoffs`
- [ ] `mathematics/straight-line-coordinates-equations`
- [ ] `mathematics/three-dimensional-line-plane-trigonometry`
- [ ] `mathematics/time-zone-timetable-constraints`
- [ ] `mathematics/transformation-order-invariants`
- [ ] `mathematics/trigonometric-function-periodicity-solutions`
- [ ] `mathematics/vector-routes-resultants`
- [ ] `physics/converging-lens-imaging`
- [ ] `physics/critical-angle-and-total-internal-reflection`
- [ ] `physics/diffraction-through-a-gap`
- [ ] `physics/gas-compression-at-constant-temperature`


### Working-area follow-up — 5 September 2026

Change list for this batch (source paths below; matching `public/labs` HTML is regenerated):

| Lab / source | What changes and how |
| --- | --- |
| `labs-src/computer-science/binary-numbers/lab.html` | Group the single answer in a lightweight current/correct/mistake card. No invented stages or Working levels. |
| `labs-src/mathematics/coordinate-distance-midpoint-perpendicular/lab.html` | Add model-action progress in every Working mode; separate calculation cards, with supplied values neutral and owned answers using existing checks. |
| `labs-src/computer-science/dijkstra-a-star-graph-search/lab.html` | Group decision, frontier, relaxation and settled history; keep settled progress visible from the start. Automatic relaxation remains neutral. |
| `labs-src/mathematics/prime-factors-hcf-lcm/lab.html` | Show factor-row/pairing progress in every mode; separate parallel HCF and LCM cards without inventing sequential gates. |
| `labs-src/mathematics/sequence-patterns-differences/lab.html` | Show construction progress in every mode; group calculation steps and propagate actual incorrect answers to card state. Supplied calculations remain neutral. |

Uses the existing guide's working-progression pattern: 12px padding, 8px corners, 10px separation, neutral reference/upcoming, yellow unfinished work, green/check completion, red/x mistake. Complex illustrated assets and learning rules are unchanged. Validation is deliberately skipped for this batch at the user's request. Review is pending.


### Rounded settings correction — 5 September 2026

Binary exam/range controls and Coordinate, Prime Factors, Sequence and Histogram Working controls now share fully rounded grey tracks and white selected pills, 12px regular text, 3px inset and roomier horizontal padding. No options, curriculum profiles or learning state changed. Updated the canonical HTML guide, written companion and generated developer copies. Validation remains skipped as requested.


### Toggle contrast correction — 5 September 2026

Working now uses dark grey `#424245` selected pills; Binary’s exam toggle uses blue `#4569aa`. Both have white selected text, a grey track, rounded shape and regular labels. Binary’s question-range setting stays grey. Colour identity differs by purpose; green remains correctness feedback. Updated canonical guide and generated examples; validation skipped as requested.


### Toggle container shadow — 5 September 2026

Added `0 1px 3px rgba(29,29,31,.08)` to the five reviewed labs’ rounded toggle containers (including Binary exam/range). Segments remain shadow-free. Updated the canonical guide, starter CSS and written companion; regenerated published labs and guide copies. Validation skipped as requested.


### Activity top panels — 5 September 2026

Six reviewed sources and generated HTML: strengthened toggle-container borders to 1px #d2d2d7; top-panel buttons now have rounded borders, subtle shadows and consistent padding, including Sequence Reset this pattern. Binary settings and New question now sit inside its card top panel (Check answer remains with the answer). Graph Search’s existing mission/actions form the top of its workspace panel. Updated canonical guide and companion; learning logic and available settings unchanged. Validation skipped as requested.


### Top-panel button correction — 5 September 2026

Restored standard control corners for the six reviewed labs’ top-panel action buttons. Primary search actions are blue; secondary/reset/new-question actions are medium grey with white text. Retained thin darker borders and subtle shadows. Toggle styling and panel layout remain unchanged. Updated guide and generated copies. Validation skipped as requested.


### Action priority and algorithm toggle — 5 September 2026

Six reviewed labs: New question/New problem blue; Reset and other secondary top-panel actions white with blue text. Disabled actions have muted grey treatment and no shadow. Working stays grey, exam stays blue. Graph Search algorithm buttons now form one blue segmented toggle with pressed state and priority tooltips; clicks still start the selected search and busy state still disables switching. Guide and published copies updated. Validation skipped as requested.


### Disabled action correction — 5 September 2026

Six reviewed labs: disabled-action rules now override primary ID selectors and hover styling. Disabled New question/New problem and busy Graph Search modes use pale grey with muted grey text, neutral border and no shadow; native disabled behaviour is retained. White/blue remains an enabled secondary action only. Guide and generated copies updated; validation skipped as requested.


### Toggle ordering — 5 September 2026

Binary’s range toggle now aligns immediately left of its exam toggle, with New question left. Recorded the toggle priority in both guides: additional toggles, Working, exam from left to right; exam farthest right. No behaviour change. Validation skipped as requested.

Graph Search now initializes Dijkstra through its existing startSearch function, so the selected toggle matches a ready search. Reset returns to that same default. No automatic search steps are performed.


### Top-panel task typography — 5 September 2026

Graph Search, Coordinate, Prime Factors, Sequence and Histogram task headings now use primary ink, 14px medium weight, 1.45 line-height and balanced wrapping. Binary remains controls-only; no redundant heading added. Guide and generated references updated. Validation skipped as requested.
