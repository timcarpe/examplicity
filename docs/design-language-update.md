# Examplicity design update — lean plan

Target: `codex/llm-first-v0.1`. Shared rollout across 57 manifest labs. Batches 1–6 are accepted; Batch 7 contains five construction/representation labs for review. Historical notes below preserve earlier decisions and corrections.

## Current adaptation approach

This section records the user's rollout preferences. The canonical visual reference remains `Lab Creation/docs/design-language/examplicity-living-style-guide-v3.html`, with reusable implementation in `packages/lab-kit/src/lab-design.css` and `lab-design.js`. The style guide describes appearance and interaction patterns; it does not define task authority or workflow scope. Historical revision notes below include superseded approaches.

- Root implements directly in batches of five, records a concise change list, commits, and supplies review links. Each batch receives user review. Surface novel situations that cannot be resolved from the agreed intent; avoid routine handoff and approval overhead.
- Before changing a lab, read the HTML and trace learner action → model change → working/evidence → next decision, including later stages and Working levels. A style adoption is incomplete if it misses the interaction or removes its purpose. If a regression is suspected, inspect relevant Git history and user-authorized originals before concluding that a feature never existed.
- Map that current implementation first in the existing `lab-contracts/<subject>/<slug>.lab.json` sidecar: coherent surfaces, quantities versus input slots, given versus learner-produced values, mode differences, dependencies and completion. Refresh it after adaptation. This map documents observed behaviour; exam alignment is a separate review. The shape is documented at `/developer/lab-contract#implementation`, not in the visual style guide.
- Preserve the causal model: fit the existing visual to its canvas, keep horizontal relationships horizontal, and let the page handle vertical flow. Do not add a separate slider when the model itself should be manipulated. Ordinary SVG chart labels, controls and interactions are in scope; complex illustrations such as jars and routers do not need a cosmetic redraw.
- Reuse shared CSS and runtime for recurring features. Roughly 90% shared styling is a soft goal, not a quota. Keep geometry, mathematical constraints and learning state local; replace repeated one-off mechanics when the shared resource already covers them.
- Audit copy by purpose. Keep one goal, consequential state and explanations that help learners reason. Remove narration of what the model already shows. Working needs visible progression even at None; clean spacing must not become missing explanation. Introduce newly required operations, including later ones, with target-anchored tooltips; pulses alone are insufficient.
- Check the actual changed path, not just the opening screen: off-centre pickup, later-stage actions, working feedback and completion placement where affected. Use focused checks proportionate to the change, rather than a repeated broad suite. Record exactly what was checked and any limits. Preserve standalone embedding of shared CSS and JS.

Approved examples: Percentage for direct bar action and fitted horizontal composition; Motion/Histogram/Bounds for shared pickup-offset dragging; Bounds for meaningful learning transitions and empty-space popup placement; Straight Lines and Recurring for retained explanatory working. These are examples of intent, not templates to copy wholesale.

## Agreed rules

- Keep the catalogue and supporting-page layouts. Preserve lab models, geometry, meaningful colours and learning behaviour. Set Membership's possible model overhaul stays separate; its interface styling is included.
- Follow written feedback rules and correct conflicting examples: yellow for unfinished work, red with an x for a wrong attempt, green with a check for a correct attempt. Use complete feedback borders and surfaces.
- Use 14px working/explanations, 12px short labels and 11px secondary annotations as defaults, with reviewed diagram-specific exceptions. Apply v3 rounded rectangular actions; preserve meaningful model shapes.
- Allow taller labs within the viewer. Keep operated diagrams intact and retain useful editor/console panes. Keep measurements beside the model and persistent working in the right-hand column, flowing below on narrow screens. Use the same calculation layout across assistance levels.

## Three steps

1. **Establish the standard.** Update shared styling and the existing style guidance alongside Binary, Coordinate and Graph Search. Correct the supplied examples' feedback and responsive defects. Review these three labs with the user before continuing.
2. **Apply it throughout.** Update site controls and supporting pages, then every lab in small related batches. Include local styles: the labs' bespoke feedback needs individual attention. Simplify dense interface layouts where needed, while preserving their learning models. Continue under the agreed standard; raise substantive ambiguity as it arises.
3. **Review and finish.** Track accepted batches, resolve outstanding issues and review the combined Git diff. Use focused checks during rollout and appropriate release checks at completion. Update the changelog to describe delivered changes.

## Git and scope control

Use Git diffs, logical batch commits and normal Git rollback. Maintain one per-lab completion checklist with any outstanding issues.

Preserve unrelated work. Edit maintainable sources and regenerate published lab HTML through the existing pipeline. Use existing shared styles and publication tools; keep vendored Kit releases intact. Ask before expanding into a learning-model redesign.

## Four checks for every lab

- **Consistent:** agreed typography, controls, fields, feedback and guidance; meaningful model-specific differences preserved.
- **Usable:** readable at 1200, 900 and 390px widths and inside the 1280×720 viewer; no page-level horizontal overflow, obscured controls or misplaced guidance.
- **Working:** main learning interaction, relevant feedback states, reset and completion work. Check keyboard equivalents and assistance modes where present.
- **Portable:** published and downloaded HTML retain presentation and behaviour, including offline use.

Apply these checks proportionately to the changed behavior and representative consumers of a shared change. Record checks and limitations with the batch. Use the existing publication pipeline for packaging; reserve broader testing for a concrete unresolved risk or release work. Add a regression test only where it protects meaningful behavior.

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


### Sequence stage containers — 5 September 2026

Sequence only: previous-stage evidence regained a light bordered container. Both stage descriptor pairs now share a padded, stacked header (12px labels, 4px gap), replacing overlapping absolute positions. Loose-material instructions shortened; the return cue appears only while moving/selecting a placed square, with a blue target highlight over the return area. Model geometry and placement rules unchanged. Generated HTML updated; validation skipped as requested.


### Sequence introduction emphasis — 5 September 2026

Previous/next-stage containers, material area and introduction card now use 12px corners. Restored a light boundary around the operated stage. The current introduction target has a slow two-second blue halo pulse instead of bouncing individual squares; reduced-motion users receive a static halo. The highlight still clears when the introduction ends. Guide updated; validation skipped as requested.


### Sequence flat maths surfaces — 5 September 2026

Displayed term chips, calculated values and formulas now have a subtle #eef1f3 flat backing with 4px corners, no border/shadow and no added padding. Supplied “add 2” expressions share one backing. Input and correctness styling remains unchanged. Updated guide and published HTML; validation skipped as requested.


### Sequence maths tint and padding — 5 September 2026

Refined the flat maths surfaces to approved concept violet #7563a7 at 20% over white, with 3px vertical / 7px horizontal padding. Compound expressions receive one outer padding layer. Borders and shadows remain absent; input feedback unchanged. Guide and generated copies updated; validation skipped as requested.


### Sequence lattice alignment — 5 September 2026

Grid previously used a -55% self-height transform while square positions subtracted 5% of their larger container. Both now share one model area below the descriptors, centered at 50% with identical cell coordinates. Grid boundary is an outline so it does not offset the first cell. Reference-square spacing now uses the same responsive --cell value as tile sizes. Published HTML regenerated; validation skipped as requested.


### Sequence working attention — 5 September 2026

Unattempted, available calculation cards pulse their yellow border softly until pointer/keyboard interaction with an input. The construction-progress card pulses until model interaction, including None mode. Interaction state survives rerenders and resets with the activity state. Reference, locked, correct and incorrect cards remain static; reduced motion disables the pulse. Documented the reusable rule; validation skipped as requested.


### Consolidated guide and reviewed-lab consistency — 5 September 2026

- Canonical HTML: replaced the oversized toggle paragraph with eight focused component/use rules and interactive working-state / mathematical-surface specimens. Refreshed embedded Binary/Coordinate/Graph references and generated developer/bundle copies.
- Binary: initial answer-card attention stops on input/button interaction and resets with a new question; no artificial working stages.
- Coordinate: available owned cards and construction progress receive the attention cue; supplied calculations receive violet backing. Existing correctness classes remain authoritative.
- Prime Factors: attention for available answer cards and factor construction; flat result backing, preserving meaningful factor colours and white number tokens.
- Graph Search: attention on the pending decision until map/frontier interaction; latest relaxation calculation gets flat violet backing, without grading automatic calculations.
- Histogram: current working cards remember interaction across rebuilt sidebar DOM; model interaction dismisses model-owned card attention. Displayed calculations get flat violet backing.
- Sequence retains the refined implementation. No changes to other unreviewed labs. Reduced-motion fallbacks apply throughout. Validation skipped at user request; user review pending.


### Field feedback without duplicate card marks — 5 September 2026

Sequence and Prime Factors: cards containing answer fields no longer show a top-right status symbol or reserve space for it. Histogram: hide the matching header status pill when a card contains an input. Field feedback, card colour/pulse and field-free progress remain. Other reviewed labs have no equivalent corner mark to remove. Guide updated; validation skipped as requested.


### Shared implementation consolidation — 5 September 2026

- Added canonical `Lab Creation/packages/lab-kit/src/lab-design.css`: reviewed working cards, controls, heading styles, mathematical surfaces, attention and field-feedback rules; public reusable classes for new labs.
- Removed repeated refinement style blocks from all six reviewed sources. They opt in with `<!-- LAB_DESIGN_COMPONENTS -->`; publication embeds the shared stylesheet after local styles. Model geometry, learning logic and lab-specific layout remain local.
- Kit manifest/bundle include the resource. The living guide loads the canonical resource; developer sync embeds it in the published guide and combined downloadable CSS. Existing runtime 0.2.1 pins remain.
- Download packaging uses the already compiled HTML and retains the inline design style. No extra CSS/network dependency is introduced.
- Historical base lab CSS remains for compatibility; shared refinement rules override it. Future reusable visual changes must edit the canonical component resource.

Packaging verification requested by user: all six reviewed labs’ compiled publication and standalone download contain the exact canonical CSS inline, with no unresolved component marker or external lab-design.css link. This is a focused packaging check; broader tests/browser validation were not run. Catalogue download fetches the compiled HTML and preserves its style block through createStandaloneLabHtml.


### Batch 2 — five mathematics labs (implementation change list)

| Lab | Adaptation |
| --- | --- |
| Repeated Percentage Change | Shared top panel/Working control; clean calculation cards and inputs. Preserve year-by-year calculations beside their causal model. |
| Motion Graphs | Shared mode/Working toggles and right working column; one Working control updates active-mode ownership without changing the other mode or graph geometry. |
| Rounded Measurements / Bounds | Shared top panel and proof styling; preserve existing proof reveal timing and interval/certificate model. |
| Straight Lines | Shared top panel, working cards and formula surfaces; preserve gantry traversal and algebra checks. |
| Recurring Decimals | Shared top panel, right calculation chain and interaction cues; preserve aligned-tail subtraction and remainder evidence. |

Shared additions: opt-in adoption styles for legacy panel/field classes, action hierarchy, readable text, feedback/pulsing, flat maths, responsive columns and movable completion cards. No exam levels are added without curriculum evidence. Review choices: percentage calculations stay beside their years; Bounds proof stays progressively revealed; ordinary chart typography is included, complex illustrated models stay intact. Implementation uses shared resources and small adoption hooks. Validation remains skipped by the user's standing instruction; compilation and standalone packaging remain part of delivery.

Batch 2 implementation notes:
- Most presentation changes live in the shared stylesheet, including the darker-border-only field focus rule (also reaches the six previous labs). The five source files only adopt components, clean redundant settings labels, and connect Motion’s existing per-mode calculation ownership.
- Motion Working selection changes active-mode ownership flags while preserving the current graph, answers, scenario counts and the other mode. Existing acceleration/area task type is retained rather than reinterpreting stored answers.
- Completion movement and working attention are shared in lab-design.js, embedded alongside CSS.
- No dropdowns found in these five labs. At the first dropdown, perform a focused design pass using the homepage dropdown as the reference.
- This is an interface adoption batch: existing complex illustration geometry and model-specific stage/certificate/remainder evidence are retained. Review the density of Bounds’ interval diagram and the percentage year-by-year chain before further structural changes.

The field-focus amendment is implemented in the canonical CSS, not copied into labs. Dropdown work is deferred because this batch contains none. Remaining review choice: model-specific dense SVG labels were not globally enlarged, to avoid obscuring existing geometry; flag any unreadable labels during this visual review for a targeted shared pattern.

Batch 2 packaging check: all five standalone downloads include the exact shared CSS and JavaScript, with no unresolved component marker. No browser or broad test run was performed. Ready for user review before batch 3.


### Batch 2 review revision — 5 September 2026

| Touched | Change |
| --- | --- |
| Shared lab-design.css / .js | Fit canvas surfaces without internal scrollbars; transparent/white canvas backing; sentence-case regular Working labels; consistent chart/working typography; reusable prediction choices and four-way modal move icon. |
| Repeated Percentage | Replaced None-mode Apply button with a keyboard-accessible range slider. The bar previews the applied change continuously; reaching the end commits it. Complete before/action/after rows replace the horizontal scroller. Some/All retain calculation entry. |
| Motion Graphs | Tightened chart bounds and adjusted pointer-coordinate origins; removed oversized minimum width; enlarged chart labels and removed duplicate in-chart calculation overlays (working remains on the right). |
| Bounds | Right-side proof, readable interval chart with included/excluded endpoint markers, prediction choices and separate check feedback. Editing clears stale success. Git comparison with the pre-batch source and older published version found the same static model, not a lost drag mechanism. |
| Straight Lines | Removed redundant rail-drag mission hint; shared rules remove grey canvas framing. Existing handles and model retained. |
| Recurring Decimals | One goal header; live alignment explanation in working; clearer divide/simplify steps and field cards. Remainder trace wraps, with matching rings replacing a horizontal bracket. Shared icon and regular maths text. |

Canonical HTML guide and style contract document these patterns; developer copies, kit bundle and inline publication resources regenerated. The previous six labs inherit shared canvas-flow fixes through compilation. Review choice: Bounds remains a static evidence model with a learner prediction, rather than inventing an additional drag task. Percentage sliders replace the guided Apply action only; calculation modes retain their existing input interaction. Compilation completed; browser and test validation skipped under the standing instruction.


### Restored interactions and cue review — 5 September 2026

- Bounds: inspected the user-specified original `Lab Creation/archive/drop-in/59d22ce/rounded-measurement-bounds-lab-v6.html`. This corrects the previous history conclusion: the original DID contain boundary scrubbing, car/time dragging to discover speed extremes, worst-case proof and a finer-precision comparison. Restored that four-stage sequence and SVG car/stopwatch functions; adapted geometry to the right-sidebar layout. Kept Working None/Some/All, current prediction styling and minimal checkpoint controls. Replaces the later random certificate-question sequence. The semantic contract now explicitly preserves these interactions.
- Percentage: removed the separate range control added in the previous pass. The existing result bar now owns pointer/keyboard manipulation, with a top-edge grip and a target line. Changing the bar previews the percentage transformation; completing it commits the guided step. The available archived percentage v5 file was calculation-driven; it did not supply this drag implementation.
- Motion: removed redundant visual header/instruction, primary chart titles and moving annotation labels that duplicated working. Separated tick/axis label bands and track readings; enlarged camera readout containers to fit text. Derived distance chart retains its identifying title.
- Recurring: regular sentence-case model labels; approved concept colours and direct tint variants. Removed drag-left/pull-across chips and repeated row instructions; retained accessible labels, keyboard actions and working explanations. Highlight the operated row/minus handle, stopping attention on interaction.
- Shared CSS owns cue, label, colour, checkpoint and direct-bar appearance. Lab source changes own restored mechanics, label placement and semantic adoption. Straight Lines remains unchanged. Guide, developer publication and inline download resources regenerated; compilation only, no browser/test validation.


### Shared card-title hierarchy — 5 September 2026

Canonical CSS adds lab-card-title and compatible existing card-heading selectors: 15px regular, sentence case, primary ink, 6px content separation. Includes Blue reference, working-step, prediction and concept titles; excludes equations and field labels. Guide specimen and contract updated; inline publication resources regenerated. No lab-local styles added. Compilation only; no browser/test validation.


### Batch 2 adaptation correction — 5 September 2026

- Shared CSS/JS: target-anchored, one-at-a-time introductions with stable operation keys, pointer/keyboard dismissal, viewport placement and reduced-motion cues. Later unlocked actions get introductions too. Shared SVG dragging now retains pickup offsets and owns capture/release; model rules stay local.
- Bounds: stopwatch beside the time ruler; completion names the actual learning transition, after release. Introductions cover boundary discovery, speed exploration, owned interval/speed fields and prediction. Retains the restored four-stage model.
- Percentage: restores one horizontal sequence of bars and gates sized to the canvas. Removes stacked duplicate state rows; the existing bar remains the slider. Introductions cover bar manipulation, percentage entry, multipliers and inversion.
- Motion: adopts the same shared drag implementation as Histogram, with unchanged constraints/snapping. Groups visible handles and hit targets for one cue; introduces each mode, calculation entry and testing the journey. Separates camera-zone labels from speed signs.
- Histogram: replaces its local pickup-offset/capture helper with the shared implementation. No learning-model redesign.
- Straight Lines / Recurring: only introductory hooks for their model operations and owned answers; their approved layouts are preserved.
- Canonical HTML guide, style contract and kit README document these patterns. Developer publication and standalone inline resources regenerated. Earlier notes about stacked Percentage rows are superseded by this correction.
- Focused browser review of the three affected compositions and direct interaction; no broad test suite. Review links: `/labs/mathematics/repeated-percentage-change.html`, `/labs/mathematics/rounded-measurements-bounds.html`, `/labs/mathematics/motion-graph-rate-area.html`.


### Popup placement and Bounds pickup — 5 September 2026

- Shared lab-design.js: introduction/completion placement scores visible workspace for overlap with text, controls and diagram objects; prefers empty space and retains manual completion positioning. Shared CSS supplies Bounds' grab cursor.
- Bounds source: replaces the archive's pointer-to-centre jump with shared pickup-offset dragging for the car and time handle. Retains ruler click-to-select, allowed intervals, keyboard adjustment and speed-discovery rules. Percentage and Motion model logic unchanged.
- Focused browser check: off-centre click preserves 100 m; first-stage intervals and both second-stage speed extremes complete through pointer dragging; completion appears in clear space beside the model. Guide, contract, kit README and inline publication resources updated.


## Batch 3 — geometry and trigonometry, ready for user review

Five source labs adopted the shared design resource: Circle Theorems,
Right-Triangle Ratios, Non-Right Triangle Solutions, 3D Trigonometry and
Trigonometric Graphs. The existing generators and curriculum remain intact.

- Shared CSS: activity controls, regular-weight card hierarchy, compact maths
  surfaces, yellow/green/red working states at every Working level, readable
  inner labels, flat approved concept tints, and popup/tooltip treatment.
- Shared runtime: introduction targets can change after SVG redraws; opted-in
  chart type stays at its displayed size as the viewBox changes. Existing
  pointer capture and pickup offsets now serve aircraft resizing, survey-peg
  movement and angular tracing. Complex illustrations were preserved.
- Circle: top Working/checkpoint controls, hover/focus task details, structural
  and invariant introductions, shared card states and movable completion.
- Right Triangle: reference/side-role/ratio/result introductions; retained
  aircraft and runway; shared resize pickup; clearer live ratios and result.
- Non-Right Triangle: retained zero/one/two-candidate construction; shared peg
  capture; separate second-position introduction; readable diagram, candidate
  working and meaningful completion; removed repeated search narration.
- 3D: kept projection, unfold and perspective exploration. Respaced the true
  section inset and removed repeated captions. The unfolding slider remains
  in a movable blue support card because it demonstrates the transformation.
  Beam pickup retains the grabbed offset. Working stays on the right.
- Trig Graphs: top Working control, side-by-side rotor/graph with responsive
  flow, shared angular capture, inverse/field introductions, regular chart
  labels and retained range/symmetry/endpoint calculations.

Focused browser review exercised the first circle structural repair, the
right-triangle reference and resize completion, both non-right triangle pegs
and resulting calculations, 3D projection and unfolding into the working
stage, and a complete trigonometric trace through keyboard controls. Follow-up
review covers revised type and later introductions. Source scripts are parsed
and all 57 publication sources compiled; shared resources are embedded in the
16 adopted standalone outputs. These checks do not claim exhaustive coverage
of every generated question, Working level, touch device or narrow viewport.

Review choice: retained the meaningful 3D unfolding control as a blue support
card. The new readable-chart hook applies only to opted-in ordinary diagrams.
The canonical HTML guide, style contract and kit README document these shared
patterns; generated /developer copies and the guide's embedded reference labs
are refreshed from those sources.


## Retrospective implementation maps — 5 September 2026

Mapped the 16 redesigned labs at `7a15bda` in their existing subject-specific
contract sidecars. `implementation` is optional in schema version 1; old contracts
remain valid. The schema/type/validator live in `tools/lab-contract/index.ts`;
the field reference is `/developer/lab-contract#implementation`. These sidecars
are the single source for the map; source HTML receives only passive role hooks.

| Subject | Mapped lab |
| --- | --- |
| computer-science | `binary-numbers` |
| computer-science | `dijkstra-a-star-graph-search` |
| mathematics | `circle-theorem-constraint-network` |
| mathematics | `coordinate-distance-midpoint-perpendicular` |
| mathematics | `histogram-area-cumulative-distribution` |
| mathematics | `motion-graph-rate-area` |
| mathematics | `non-right-triangle-solution-constraints` |
| mathematics | `prime-factors-hcf-lcm` |
| mathematics | `recurring-decimals-fractions` |
| mathematics | `repeated-percentage-change` |
| mathematics | `right-triangle-ratio-invariance` |
| mathematics | `rounded-measurements-bounds` |
| mathematics | `sequence-patterns-differences` |
| mathematics | `straight-line-coordinates-equations` |
| mathematics | `three-dimensional-line-plane-trigonometry` |
| mathematics | `trigonometric-function-periodicity-solutions` |

Each map identifies coherent surfaces and conditional locators; separates
given, manipulated and calculated quantities from their physical answer slots;
records support-level differences, interaction-dependent evidence, dependencies
and actual completion conditions. Existing curriculum metadata is preserved.

Important handoff distinctions: Binary and Graph Search do not use None/Some/All.
Motion retains separate support states per graph mode. Midpoint pairs, recurring
fraction numerator/denominator slots, binary bits and trigonometric solution sets
must not be counted as unrelated mathematical unknowns. Non-Right Triangle's
no-solution exploration uses its existing span heuristic, and Trig uses a sampled
sweep threshold; neither should be described as a new formal proof requirement.
These and other lab-specific limitations are recorded in the respective map.

For later alignment work, inspect the mapped source and existing curriculum
separately before deciding syllabus demand. This pass adds no exam alignment,
profile toggle, hiding rule or behavioral change. Update maps in the same batch
when adaptation changes fields, evidence or progression; do not create a second
map in the style guide.

Focused checks: six contract tests passed, including optional-map round-trip and
invalid-shape rejection. All 57 publication sources compiled and contract
preservation passed for published and standalone HTML. For the 16 maps, source
diffs contain only passive role annotations; all previous contract fields are
unchanged and referenced ID anchors exist in source. Conditional generated
controls are documented; this is not a claim that every selector matches the
initial screen or that every generated state was replayed.


### Batch 3 review refinements — 5 September 2026

- Shared CSS removes legacy inset side rails from calculation surfaces and
  compact candidate-table values in every state; complete input feedback
  borders remain. Non-Right Triangle section 4 now uses flat material fields.
- The 3D concept palette now uses approved blue for the floor beam/projection,
  amber for height and violet for cable. The green alignment line remains
  green and is distinct from those concept colours. No extra success badge
  or learning/interaction change was introduced.
- Both changes reside in the canonical shared stylesheet. The HTML style
  guide and style contract record their uses; developer and standalone
  resources are regenerated. Browser review reached successful 3D alignment
  and both SSA candidates, including section 4's displayed values.
- The user requested a direct mapping-specification review from Lab Internals
  (Orchestrator), task `01a06f2a-1766-7a52-bf78-3609692c5ab1`; commit `9e65dcb`
  was sent for read-only evaluation.


### Mapping specification review

Lab Internals (Orchestrator) reviewed `9e65dcb` and confirmed the lightweight
architecture and 16-lab retrospective coverage meet expectations. Corrected its
bounded findings: Binary feedback visibility, Bounds quantity/input/check
ownership, Coordinate candidate/probe wording and sample tolerance, Histogram
task/feedback locators and acceptance paths, and Trig sweep/endpoint gating.
The forward checklist above already requires mapping first; explicitly create
or review the map early in EVERY future redesign, then refresh it after changes.
Exam interpretation remains with Alignment Implementer. No alignment changes
were requested or made here. `reviewedRevision` remains the inspected source
baseline unless the lab behaviour itself changes.


### Bounds instrument and proof repair — 5 September 2026

- Shared CSS/JS adds inline seven-segment readings, compact labels, flat
  instrument surfaces and included/excluded endpoint markers. Distance/time
  retain their precise displayed decimal places and trailing zeros.
- Bounds source places readouts to the left of shorter rulers and the stopwatch
  in the empty top-right space. A persistent statement defines the claim and
  what would disprove its guarantee. No extra slider or canvas scrolling.
- Compared stages 3/4 with the user-specified archived v6: restored the lost
  distance/time proof-entry markers and finer-interval explanation. Stage 4
  previews both proposed limits and groups fields with the half-unit maths.
  Speed proof waits until the finer intervals are fixed.
- Fixed ruler ticks using a different inset coordinate scale from bound markers.
  Half-open endpoints are explicit; true times near an excluded upper bound
  are labelled as approaching it. Smaller static proof markers keep the bounds
  visible. After finer limits are accepted or supplied, the model now shows
  lower distance/upper-time approach rather than contradictory midpoint values.
- Browser replay completed all four stages on the final implementation, with
  Working All for both proofs. Two focused source-rule tests cover rejected
  verdict/intervals, completion, edited-answer invalidation, and supplied
  None/Some finer evidence. Broad device/profile coverage was not repeated.
  The style guide, kit README, implementation sidecar and inline downloads
  record/preserve the updated behaviour.


## Batch 4 — ten mathematics labs, change list before implementation

- Ratio/flow: move the flow calculation beside the plant, preserve tanks/pumps,
  and introduce the actual pump or answer operation. Keep bottle evidence.
- Relative frequency: put predictions and forecast decisions in the persistent
  right sidebar, retain trial evidence and the fair-versus-biased comparison.
- Replacement: retain counter dragging and changing sample spaces; group the
  live probability work on the right with compact top-bar stage checkpoints.
- Scatter: readable fitted chart, shared drag/cue treatment, concise working
  decisions and persistent limits on what correlation can establish.
- Sets: interface-only refinement, preserving the current message/membership
  model; the learning-model overhaul remains a separate follow-up.
- Similarity: retain predictions, unit-cube layers and unlocked support; clarify
  progressive work and distinguish concept factors from correctness.
- Solids: keep solid and skin together on the left, calculation chain on the
  right; preserve input-controlled extrusion and equal-volume reshaping.
- Time Zones: user chose None/Some/All. None retains calendar placement and
  revealed method; Some uses the existing paired calculations; All uses the
  full chain. Sending a valid proposal remains necessary. Restyle date selects
  with the homepage's rounded form, regular type and subtle elevation.
- Transformations: consistent top bar, blue Core/Extended toggle, grey Working,
  readable coordinate evidence and shared movable completion card.
- Vectors: preserve robot, head-to-tail commands and collision consequences;
  use targeted introductions and progressive component/magnitude working.

All ten receive source-backed implementation maps in their existing sidecars.
Shared changes live in Lab Creation's CSS/JS; source adapters retain the model
and local state. Verify changed paths and packaging, then submit this batch for
user review. No new curriculum alignment is part of this batch.

### Batch 4 review notes — 6 September 2026

- Shared `lab-design.css` owns the new shell, rounded controls, sidebar cards,
  reference/formula surfaces, field focus, dates and responsive compositions.
  `lab-design.js` adds accessible checkpoint details and extends card attention
  to these adapters. Lab source changes connect existing state and move regions.
- Time Zones uses None for calendar placement, Some for the existing paired
  calculations and All for the full chain. None shows compact method steps
  until successful send reveals the calculations. Calendars use full-width
  lanes so their clock labels remain readable. Dates retain native selection.
- Relative Frequency uses a persistent prediction/decision card, including red
  feedback for a wrong forecast. Replacement retains changing denominators and
  Sets retains membership/rule tasks. These three keep their task-driven support;
  no new None/Some/All learning modes were invented.
- Solids uses the shared SVG drag helper, preserving pickup position through
  rerenders. Scatter preserves pickup offset for tilt and prediction handles.
  Similarity keeps retained observations below the model and progression actions
  in the working sidebar. Supplied values are reference material, not earned
  success. Complex plant, bag, student and robot illustrations remain intact.
- Browser checks cover all ten initial layouts, 768px and 390px widths, with no script
  errors or scrollable canvases. Time Zones was completed through actual fields,
  native date selects and Send at all levels, including wrong answers. Frequency
  was replayed through short/long samples, rejected claims and the final forecast.
  Solids pickup was checked by mouse; seeded source hooks exercised both models
  and every support level. Source hooks also checked Similarity, Transformations,
  Vectors and Replacement completion/dependencies; these are not a claim of
  exhaustive pointer replay across every generated problem.
- The living HTML guide and concise contract document the reusable patterns.
  Generated site resources and downloads are synchronized from Lab Creation.


### Batch 4 review refinements — 6 September 2026

- Shared mission titles now use regular 16px approved blue ink. Added a flat
  `lab-context` strip for a persistent claim and its test criterion above the
  canvas. Relative Frequency moves the sidebar claim here and changes it to
  audit findings/forecast context as the task changes, without leaking bias.
- Shared auto/fixed value padding, flat nested relationship explanations and
  centred operation indices. Removed the seam above the Solids workspace.
- Solids' initial drag copy is supplied by its tooltip; evolving mathematical
  evidence remains. Removed duplicate Sets/Replacement commands and the
  redundant Scatter release instruction.
- Time Zones labels the organiser as the learner's calendar in its heading;
  initial waiting/choose-start footers disappear. Actual proposal readiness,
  acceptance/conflict and incorrect-working feedback remain available.
- Vectors fits the existing floor more tightly in its SVG viewBox, preserving
  coordinates and pointer conversion; the relationship card has no inner box.
- These patterns are documented in the canonical HTML guide and style contract.

- Focused browser validation passed for changing claim/forecast context (including
  live sample-size changes), preserved proposal feedback, vector completion,
  centred indices, auto-value padding and the closed panel seam. Checked updated
  pages at desktop and 390px widths; shared headings also checked on Sequences.


### Retrospective context pass — 6 September 2026

Change list: remove Surface Area’s solid/unwrapped-surface narration; reuse
the shared context strip for Bounds, Similarity and 3D certification. Preserve
models, learning gates and Working levels. Refresh their observational maps.

- Bounds: move the existing guarantee into the model column with separate
  claim/criterion; identify finer evidence in stage 4 without supplying a verdict.
- Similarity: keep the scale question visible during predictions, resizing and
  working; switch to common length ratios for the one-dimension rule test.
- 3D: move scenario givens and the angle definition into context; shorten the
  immediate task and switch context for the perspective test.
- Surface Area: remove both requested captions and the matching skin narration;
  retain the control-ownership note and accessible SVG descriptions.
- Reviewed the 26 adopted labs for this pattern. Relative Frequency already
  uses it. Existing concrete goals suffice for Binary, Graph Search, Coordinate,
  Prime Factors, Sequence, Histogram, Percentage, Motion, Straight Lines,
  Recurring, Circle, Right/Non-right Triangle, Trig Functions, Ratio/Flow,
  Replacement, Scatter, Sets, Solids, Time Zones, Transformations and Vectors.
  Their calculation/prediction cards and explicit constraints remain; no
  additional repeated goal strip was added to those labs.
- Shared `.lab-context` supplies all presentation. Removed unused Bounds-only
  `.lab-task-context` rules; canonical HTML guide and style contract document
  content hooks and these uses. Published resources/downloads regenerate.

- Focused Edge/Playwright checks passed: desktop context sits above each model,
  heading is shared 15px regular with no border, four changed labs have no
  document overflow at 390px, and Bounds finer precision/Similarity rule test/
  3D perspective update the context. Phase checks used existing source hooks;
  this was not a replay of every learning interaction. No page script errors.
  Publication, standalone packaging and sidecar checks passed for all 57 labs.


### Relative Frequency spinner identity — 6 September 2026

- Change list: distinguish reference/booth geometry; remove redundant mechanism
  captions; replace rotating text with outcome symbols and a stationary key.
- Local SVG now uses a circular blue reference and octagonal violet booth with
  a stand and rim studs. Approved shared concept tokens supply the colour;
  one amber prize sector and three other sectors stay equal in size on both.
- Star/circle symbols rotate with outcomes. Prize/Other key, device name and
  sector description stay fixed below the wheel with separated text baselines.
- Removed the mechanism box and duplicate context badge. Hidden-probability
  explanations and the 0.40 reveal remain in the actual audit context/actions.
  Updated the transition copy so it no longer claims identical appearances.
- Canonical guide documents identity versus evidence and stationary keys;
  implementation map records the changed model surface. Trial generation,
  sector landing angles, judgment gates and forecast arithmetic are unchanged.

- Browser checks passed through fair trials, booth trials and the bias reveal,
  with no script errors. Fixed labels remain separated at 900px and 390px;
  narrow layouts reserve additional space above the graph. Standalone downloads,
  published sidecars and canonical developer resources passed their checks.


## Batch 5 — ten communication and representation labs

Batch 4 accepted by the user at `53e0d23`; canonical guide at `6d292a0`.
Change list: shared rounded settings/actions, task bar, readable explanatory
cards, fitted non-scrolling model regions, targeted introductions and current
implementation maps. Preserve underlying simulation rules and device imagery.

- CSMA/CD: step/checkpoint control above cable; decision evidence to the right.
- Transmission Methods: existing continuous TX/RX model; controls above and
  mode/conductor evidence at right, retaining wire selection and repair tools.
- DNS: one navigation goal; checkpoint path and explanation beside architecture.
- Encryption: rounded method control, key rack and live confidentiality evidence
  together at right; preserve keys, device monitors and capture replay.
- IPv4: consistent view/story toggles, checkpoints and right-side story/planner;
  preserve gated planning and optional address/IP walkthrough details.
- Topology: rounded goal/tool choices, retained construction and packet tests;
  place construction feedback beside canvas without changing routing rules.
- Packet Switching: model owns central/left space, sender and receiver evidence
  stack in a right column; keep header/checksum options and reassembly details.
- Parity/ARQ: editable matrices retain sender/channel/receiver relationship;
  actions and received evidence at right; retain NAK, timeout and resend paths.
- TCP/IP: shell palette above packing model, receiver to right; retain nested
  headers, rejected orders, process comparison and peel/send controls.
- Sound: rounded audio/select controls, live size/rate/precision working at right;
  retain audio, sample inspection and keyboard timeline navigation.

These labs have task-driven simulation controls, not None/Some/All arithmetic
ownership. No new Working or exam choices are invented. Maps describe current
behaviour only. New imagery redesign proposals require user approval.


Batch 5 implementation notes:
- Styling is in canonical `packages/lab-kit/src/lab-design.css`; the ten lab
  sources adopt shared classes, move existing surfaces and attach introductions.
  `lab-design.js` adds an opt-in class-to-aria-pressed adapter for older toggles.
- Existing device artwork, packet identities and simulation rules retained.
  Ordinary labels, controls and register readability are included in the pass.
  Encryption/IPv4 fit their logical boards at every width; Transmission Methods
  uses responsive device/register sizing without changing drag coordinate space.
- DNS preserves browser-to-infrastructure layout with evidence under its browser.
  Parity keeps three matrices aligned and receiver evidence at right; main
  transmit/resend actions are in the task bar. TCP/IP shows remaining headers
  inline below receiver gates. These are deliberate comparison-layout variations.
- Sidecars under `lab-contracts/computer-science/` map current surfaces, quantities,
  modes, gates and limitations for all ten. No new curriculum or Working modes.
- Focused Edge checks: CSMA final/restart, transmission settings/add/reset,
  DNS missing-mapping repair through render, encryption key placement, IPv4
  baseline unlock and five-department design acceptance, valid bus construction,
  checksum rejection/retry/reassembly, parity NAK/ARQ recovery, bare rejection and
  correct TCP/IP delivery, sound rate/depth calculation and timeline/play controls.
- Initial layouts checked at 1422, 900 and 390px: no runtime errors, horizontal
  page overflow or scrolling model regions. This is not exhaustive network-case
  coverage; dense fixed-geometry device annotations remain a phone limitation.
  Audio controls were exercised programmatically, not assessed by listening.
- Source audio payloads are byte-identical. The existing Sound Sampling standalone
  size allowance increases from 1.40 to 1.45 MB to include the shared resources
  and map; all audio/CSS/JS still package into one offline HTML file.
- Guide, style contract, generated authoring bundle, /developer copies and compiled
  lab HTML are refreshed together. Previous batches also recompile to receive the
  shared resource; the new adapters are scoped to this simulation adoption class.

Batch 5 implementation: `49f3853`; canonical shared resource/guide: `b1b85e7`.
Ten implementation maps are pinned to that source revision.


## Batch 5 correction — preserve the model's spatial intent

Review supersedes the initial Batch 5 layout choices above. Change list:
- Restore Packet Switching's sender / network / receiver columns and TCP/IP's
  protocol rack / packing / link / unpacking arrangement.
- Keep generic controls in the goal bar; move construction, playback, wire and
  inspection tools into a shared secondary tool row. Tools are not mode toggles.
- CSMA: scenario dropdown, packet-style propagation and collision cues, lighter station imagery.
- Transmission: flatter device illustration and stable, offset-preserving drag
  handling with release/cancel cleanup.
- DNS: resolver and directory side by side, connected transfer paths, flat devices.
- Encryption: confidentiality context above model, draggable key cues, readable
  plaintext/key states, room for Eve and capture evidence without clipping.
- IPv4: IP walkthrough below model; compact causal evidence and planner at right.
- Topology: draggable parts above model, separate tool buttons and clearer devices.
- Parity: aligned comparison matrices and horizontal transmission evidence.
- Sound: playback below goal bar, clearer settings and taller stored-sample area.

SVG/device changes listed here were expressly requested. Teaching behavior,
addressing rules, packet/error identity and embedded audio remain intact. Record
actual outcomes and checks below; implementation maps remain observational.


CSMA animation review: replaced solid signal bands with compact, station-coloured
packet markers and faint reached-signal trails. Opposing frames stop at the clash,
turn into damaged frames with a red impact marker, then yield to distinct amber
Jam markers. Red outward cues show corruption spreading before sender detection;
random backoff and sequential retries remain. Playback holds collision/detection
longer, and reduced motion shows the same evidence immediately. Busy now reaches
all listening stations; jam extents reach B, matching the existing narration.

Correction outcomes: restored the intentional Packet Switching and TCP/IP layouts;
kept the DNS pair side by side; moved lab-specific tools and transmission evidence
to secondary rows; retained IPv4's planner with its walkthrough below the model.
Shared CSS owns the reusable toolbar, menus, evidence strips, device treatment and
layout adapters. Local edits connect controls to existing state and repair dragging,
endpoint geometry, encryption capture space and CSMA animation. Sound's audio and
the simulations' assessment rules remain unchanged. The canonical guide and authoring
bundle are synchronized into `/developer` and embedded lab downloads.

Checks: ten interaction smoke tests passed. All ten initial views were checked at
1422, 900 and 390 px with no page overflow, internal canvas scrolling or script
errors. Targeted checks covered drag release/cancel outside the canvas, four full
encryption captures, parity matrix alignment, IPv4 subnet assignment, and CSMA
collision/jam/backoff, rapid stepping and narrow/reduced-motion presentation.
Compiler, embedded style/content, download and contract checks passed for all 57
labs; developer resources and authoring bundle checks passed. Implementation maps
describe the revised controls and layouts without changing exam alignment.

Correction implementation: `cf84a1e`; canonical kit and guide: `a1e4b1a`.
The ten implementation maps are pinned to the corrected source revision.

## Batch 5 restoration after review

- Removed shared overrides that flattened Topology and Packet Switching devices or replaced TCP/IP’s original receiver sequence. Retained shared controls and interaction hints.
- Topology: distinct left parts menu, bounded fitted canvas, original device artwork reused in menu and drag preview; editing and validation controls above canvas, evidence below.
- Packet Switching: narrower device columns, original monitors/routers, matching router palette, processing options above the model and compact packet cards.
- TCP/IP: original packing mat and nested packet moving upward through receiver gates; readable fields and status below model.
- DNS: narrower infrastructure column, restored server detail, all web-server branches visibly connected to the browser.
- CSMA: scenario/playback below goal; shares Packet Switching’s round pulsing packet marker, retaining collision damage, jam and backoff.
- Encryption: restored monitor bezels and device depth; same key-shaped SVG in tray/preview/bay; Eve and its branch move down when endpoints grow.
- Transmission: flipped RX bits regain red contrast, a change symbol and an original-to-received hover explanation. Approved device treatment retained; Sound remains unchanged.

Most presentation changes live in canonical lab-design.css. Lab edits move existing elements, reuse artwork, and keep connection/drag geometry aligned. The guide describes these styles and examples; it does not prescribe workflow scope.

Checks: seven affected-lab interaction smoke tests passed, including DNS repair,
collision progression, topology validation, checksum rejection/retry and TCP/IP
unpacking. The six layout changes fit at 1422/900/390px without page overflow,
canvas scrolling or script errors. Pointer checks confirmed matching artwork
through Topology and key dragging/placement. Four full encryption captures fit
with 27px clearance above Eve and no clipped screen/key content. All 57 compiled,
style, content, standalone-download and contract checks passed; developer and
authoring bundle resources are current.

Restoration implementation: `dd106a0`; canonical shared guide/kit: `749893e`.
Seven affected implementation maps are pinned to this source revision.


## Batch 6 — five computing workspaces

Batch 5 restoration accepted by the user (implementation `dd106a0`, map pin `3131fbb`). This batch returns to five labs per review.

Change list before implementation:
- Assembly: retain source editor, two-pass view and CPU/bus/RAM arrangement; add a concise goal, shared program/speed menus and execution buttons, readable interface labels and a first-step hint.
- Fetch–Decode–Execute: retain physical CPU/RAM and clock trace; put program/model/speed actions below the goal, show each micro-operation explanation once, preserve immediate/direct operand models.
- Memory Management: retain desktop beside memory hierarchy, current/next queue and decision log; shared configuration/actions and readable surrounding labels; hint clock startup and subsequent workloads.
- Process States and Scheduling: retain draggable rule construction, three state lanes and comparative timeline; shared challenge controls, clearer target evidence and card typography; matching rule drag preview and installed icon.
- Software Stack: retain monitor/tower, software bank and nested stack; shared target/reset controls, readable part labels and contextual hints; preserve shared artwork across bank and placed items.

No invented Working/exam modes, new grading rules or hardware redraws. Useful code/table/log and parts-menu scrolling remains; operated diagrams fit their containers. Shared presentation lives in the canonical lab-design stylesheet; local changes are semantic hooks, minimal control moves and state-aware hints. Current-behaviour maps accompany the five source files.

Batch 6 refinement after user direction: rebalance underused and crowded areas, not only reskin controls. Assembly gives more width to the CPU and less to the editor; FDE narrows its bus corridor and pairs clock evidence; Software Stack has a smaller computer scene and wider parts bank. Scheduler trims repeated state explanations while preserving task criteria and causal feedback. Memory keeps current/next action cards side by side, enlarges tiny labels, and removes duplicate route text already in the log. All presentation is in canonical shared CSS. Local source hooks retain each existing learning model; five sidecars map observed current behaviour.

Review note: Software Stack retains its existing deterministic utility-failure teaching cases (for example, missing antivirus triggers a malware diagnostic). This batch changes presentation, not those pedagogical rules.

Batch 6 validation: six Assembly examples halt with expected values/output; both FDE models complete all three programs; Memory boots and processes work/stress events; all three Scheduler targets pass with the expected rule pairs, rule drag and arrival keyboard controls work; valid Software Stack boots and opens Image Editor. Reviewed desktop and 900/390px layouts; no horizontal page overflow or operated-canvas scroll remains. Source-editor scrolling is retained. All 57 published/downloaded labs, contract sidecars, developer resources and the canonical authoring bundle pass their focused checks. Sound Sampling's unchanged embedded audio plus the shared CSS is 1,466,264 bytes; its existing scoped download allowance increases from 1,450,000 to 1,475,000 bytes. No audio assets changed.

Batch 6 implementation: `dd9d94ed84014c88004b994586577a523df8e342`; canonical kit and guide: `76e2c9f`. Maps are pinned to that implementation. Assembly's two-pass table spans beneath the editor/CPU workspace to give resolved instructions room without shrinking their type.


## Batch 6 review refinements

- FDE and Assembly: passive, automatically fitted SVG value surfaces use a shared helper and violet material tint. FDE clock wave begins after its HIGH/LOW labels; the operation readout occupies the space beneath RAM.
- Memory Management: separated cycle bars from the colliding working-card class, restored their visible fill and reduced queue height. Log moved beneath the desktop with compact route/timing rows. Padded drive/page-file regions and cells; simplified and extended connection tracks to their device edges.
- Scheduling: matching amber/violet rule grips and dashed pulsing drop targets, differentiated state-lane surfaces, next-dispatch summary and fewer repeated process/state descriptions. Existing identities, algorithms, targets and history are preserved.
- Software Stack accepted; no local source change. Presentation patterns documented in both canonical guides. Removed exact duplicate shared working-card/action declarations while retaining their final cascade position.

Validation: both FDE models still complete all three supplied programs; memory boots, progresses workloads and shows a nonzero 6px bar; all three Scheduler targets, rule drag and arrival keyboard control pass. SVG backgrounds refit around changing values; readout/log placement checked in the browser. No horizontal page overflow or canvas scrolling at 900/390px in those flows.

Review-refinement implementation: `ab1bced0b32d86b998a2d004935a38044bf7fde4`; canonical styling/runtime/guides: `78a80b0`. All 57 download/contract checks, developer sync and authoring bundle checks pass. Exact duplicate shared declarations were removed, so the download-size allowance remains unchanged.

### Batch 6 review refinements — 6 September 2026

- Shared CSS: homepage-style revealed native select menus (progressive browser
  support), stronger installed rule cards, neutral causal feedback, desktop icon
  colour/spacing and queue-card shadow; serif I in FDE/Assembly identifiers.
- Scheduling HTML: shortened routine, scenario and failed-target explanations;
  removed duplicate installed-rule narration. Scheduling calculations unchanged.
- Memory HTML: one first-application interaction flag and shared icon tooltip.
  Desktop redraws retain dismissal; storage and memory logic unchanged.
- Canonical visual guide and style contract document the treatments. CSS remains
  bundled into downloadable HTML. Unsupported browsers retain native menus.
- Packaging: Sound Sampling remains an offline audio artifact; its existing scoped cap rises by 10 KB to 1.485 MB for shared CSS. The general download limit is unchanged.
- Follow-up: CPU register, ALU and CU values now share an 18-unit SVG text size and 7/3-unit material padding via shared CSS/runtime. Only long values shrink to their component width. No lab-local changes were needed.

### OS Memory paths and cache evidence — 6 September 2026

- Shared CSS supplies thin arrow-free paths, active transfer dashes, core page
  material and a compact model disclosure. Local geometry anchors Storage/RAM,
  Page file/RAM and RAM/CPU paths to device edges on resize. Narrow layouts keep
  storage and page file as parallel inputs to RAM. Cache/core links close their gaps.
- CPU readout pairs the matching page tile with fetching/reading source, page-fault
  wait or OS-management state. Cache replacement is unchanged. Fixed fallback accesses overwriting the learner-selected foreground application.
- Reviewed limitation: foreground accesses replace cache entries; OS memory
  management does not itself issue OS instruction accesses. RAM-pinned OS pages
  are not cache-pinned. Cache cells are page proxies, not physical cache lines.
- Evidence: putCache/promoteToCache, bestAccessOwner/prepareNextAction,
  handleAccess/handleLoad/evictPage, renderCpu. Read-only debug state now includes
  cache entries and the actor/current page. Canonical guides document presentation.
- Verification: real action handlers over 180 actions displaced OS entries from L1/L2 while all six OS pages remained in RAM. Browser checks covered live reads/management, edge connections at 1422/900/390 widths and standalone packaging.

### OS Memory concurrent execution — 6 September 2026

- Supersedes the previous single-action engine and its omitted-OS-fetch limitation.
  CPU references and storage now advance on the same elapsed clock. Cache/RAM
  misses stall a thread; storage-backed faults block it and permit other work.
- Added round-robin application/periodic OS work, sampled fault/completion handlers,
  exact-reference retry after page-in, FIFO demand loads ahead of launch loads,
  and cleanup on close/reset. Removed the unused serialized access/maintenance engine.
- Core shows its actual reference; current/next cards show storage transfers.
  Shared running/ready/waiting material groups expose concurrency. Cache updates
  follow completed CPU references, not the duration of the storage operation.
- Model assumptions live in the lab disclosure and observational contract map.
  Both canonical style guides document the presentation; shared CSS is compiled
  into offline HTML and the authoring bundle.
- Focused engine tests cover overlap, retry/wakeup, cache miss vs fault, 12,000
  heavy-load cycles with page/cache ownership, idle overlap, close and reset.
- Browser: boot/run/pause/10-cycle step and independent core/transfer readouts
  pass at 1422, 900 and 390px without horizontal overflow. All 57 lab publication,
  standalone download and contract checks pass, as do developer/bundle checks.

### Batch 7 — five construction and representation labs

Batch 6, including the concurrent OS Memory revision, is accepted.

- Bitmap: shared goal/mode bar, readable comparison and flat header material;
  bounded bitstream code pane. Fixed captured-pointer drag painting and replaced
  depth-conversion alert with inline status. Pixel/encoding calculations retained.
- Huffman Rover: retained map, decoder, program and codebook relationships and
  artwork. Shared execution controls, regular labels, flat code fields and hints;
  removed editable badges, coloured side rails and score gradient.
- Database: retained relation/registrar comparison and normal-form explanation.
  Readable wrapping relation panels, stage-specific hints and full feedback surfaces;
  removed fraction/guidance counters and duplicate relation footer descriptions.
- Logic: retained rack/circuit/truth-table composition. Shared challenge toggle,
  editing bar, placement/wiring cues and readable values; operated board fits width.
- Automated Systems: retained growing flowchart beside factory. Shared challenge
  controls, statement dropdown, context surface and cues; fewer repeated commands,
  readable diagram labels and full feedback surfaces. Factory art/arrows retained.
- Shared presentation lives in canonical lab-design.css under the opt-in lab-builder
  adapter. Five sources add component markers/hooks; five sidecars map observed
  behaviour without adding exam interpretation or artificial Working levels.
- Review choices: database tables and encoding code panes retain useful scrolling;
  operated canvases fit. Dense flowchart geometry is preserved, not replaced with
  a generic working sidebar. Huffman's fixed 19-bit mission optimum is unchanged.
- Sound Sampling's scoped download allowance is 1.5 MB for the larger shared CSS;
  its offline audio and the general 512 KB allowance are unchanged.
- Validation: bitmap drag/keyboard painting and encoding modes; rover valid/invalid
  codes and execution; complete database extraction/edit with Undo; keyboard-wired
  AND gate and truth-table checking; all four factory challenge simulations pass.
  Desktop 1422px, tablet 900px and phone 390px have no page or canvas overflow.
  No browser page errors. Publication, standalone packaging and observational
  contract checks pass for all 57 labs; developer mirrors and authoring bundle match.
