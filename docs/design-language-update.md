# Examplicity design update — lean plan

Target: `codex/llm-first-v0.1`. Scope: shared design language across the site and every lab in the current manifest (57 at review). Implementation is in progress. The three pilot labs require user review before further visible lab migrations.

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

### Catalogue checklist

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
- [ ] `mathematics/prime-factors-hcf-lcm`
- [ ] `mathematics/ratio-concentration-flow-rate`
- [ ] `mathematics/recurring-decimals-fractions`
- [ ] `mathematics/relative-frequency-bias-expected-frequency`
- [ ] `mathematics/repeated-percentage-change`
- [ ] `mathematics/replacement-conditional-sample-spaces`
- [ ] `mathematics/right-triangle-ratio-invariance`
- [ ] `mathematics/rounded-measurements-bounds`
- [ ] `mathematics/scatter-correlation-prediction`
- [ ] `mathematics/sequence-patterns-differences`
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
