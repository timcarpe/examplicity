# Lab style contract

Each file in `public/labs/<subject>` remains a complete, monolithic HTML lab.
Subject directories use the manifest subject ID; exam-code alignment remains
manifest metadata and does not determine the file path. A downloaded lab must
work and retain its presentation without the website or a network connection.

Every current live lab is registered in `labs-src/manifest.json`: `labs-src` is
the maintainable publication source and `public/labs` is generated output. The
site vendors a hash-pinned Lab Creation kit release under `vendor/lab-kit` and
owns the deterministic inlining compiler. This centralizes reusable source
without creating any runtime shared-resource dependency.

The versioned site constraints are recorded separately in
`tools/lab-publication-profile/profile.json`. That profile owns the target rail,
viewport, artifact and minimum-interaction requirements; it is neither a page
template nor part of the creation kit.

## Shared chrome

`public/labs/lab-tokens.css` is the shared token source imported by the website
and embedded before `public/labs/lab-frame.css` in each published lab. The frame
owns the shared lab canvas, manifest typography, focus, responsive layout and
reduced-motion defaults. Custom properties are namespaced with
`--lab-` so they cannot silently replace instructional variables.

Run `npm run labs:sync` after changing the contract. It copies both stylesheets
into every marked `LAB_FRAME_STYLES` block. The content generator writes each
`LAB_MANIFEST_HEAD`, visible manifest title, optional subtitle and
`LAB_SYLLABUS_CHIPS` block. `npm run labs:sync:check` verifies every generated
surface, and the production build runs that check automatically.

The frame and the creation kit are separate layers. The frame is site chrome
and publication layout. The kit supplies optional, layout-agnostic authoring
tokens and helpers. A source lab declares only the kit capabilities it uses;
the publication compiler embeds the pinned CSS and JavaScript before the frame
and manifest checks run.

Do not edit an embedded `LAB_FRAME_STYLES`, `LAB_MANIFEST_HEAD`,
`data-lab-manifest` or `LAB_SYLLABUS_CHIPS` region directly.

## Homogenization rules

- Homogenize the design language of shared elements—not the instructional
  experience. Headers, syllabus chips, working controls, ordinary buttons,
  status treatment and supporting panels should read as one site, while each
  lab keeps the visual model, layout and interaction pattern that best exposes
  its concept. Do not template away an authentic lab-specific experience.
- Use the generated lab page rail for the outer layout: it is capped at
  `1200px`, with `28px` minimum desktop gutters and `18px` mobile gutters, to
  align with the host header controls. Every standard lab must compose natively
  inside that rail. A clipped fixed-width canvas, hidden page-level horizontal
  scrollbar, or wrapper-level overflow workaround is a failed layout—not a
  supported compatibility technique.
- The generated manifest header always occupies that responsive `1200px` rail,
  even when a compact or otherwise narrow lab keeps a smaller teaching
  workspace beneath it. Lab-owned width rules must not narrow the shared title,
  subtitle and syllabus alignment surface.
- Test desktop composition at `1440×1000`, `1366×768` and inside the host at
  `1280×720`. Let the lab document extend vertically within the viewer when
  readable working or controls need room. Preserve useful editor, console and
  navigation panes; do not give primary operated diagrams vertical scrollers
  or shrink interface text merely to keep the activity above the fold.
- Base wide-layout transitions on the `lab-canvas` container. Viewport media
  queries do not detect when a capped 1200px rail is narrower than the viewport.
  Fixed instructional geometry may use an intentionally labelled internal
  scroller only when the full starting state and essential controls remain
  visible; page-level horizontal overflow is never acceptable.
- The manifest-controlled `compact` layout keeps the same outer rail and adds
  the standard `18px` desktop (`8px` mobile) top offset. Elements marked with
  `data-lab-workspace` use the supported `820px` compact workspace maximum.
  Its reduced post-heading spacing preserves the teaching workspace's existing
  above-fold position.
- The visible `h1` and document `<title>` must match the lab name in
  `app/labs.ts`; do not append redundant “Lab” or version labels.
- Shared buttons, tabs and mode controls use rounded rectangles. Reserve shared
  pills for syllabus chips; circular icon-only controls and meaningful model
  shapes remain appropriate. Do not use a chip for decorative copy.
- The top-right syllabus chips are generated navigation. The whole chip opens
  the primary section in Cambridge's official syllabus document. When a chip
  lists multiple sections, each numbered section also opens its corresponding
  document page. Colour supports the visible qualification and exam-code label
  but never replaces it.
- Use `--lab-type-body` (14px) for working and explanations, `--lab-type-label`
  (12px) for short labels and `--lab-type-annotation` (11px) for secondary
  annotations. Review smaller geometry-constrained labels individually.
  Ordinary actions should be 40–44px high. The legacy 35px control token remains
  for unmigrated labs; updated controls use `--lab-action-height` or 44px.
- Keep measurements on or beside their model. Use a persistent right-hand
  Working column on wide screens and the same column below the model on narrow
  screens. Begin with calculations or decisions, then interpretation. Keep the
  same labels, formula rows and order when assistance changes: replace shown
  results with learner inputs in place. Working stays outside transient cues
  and completion cards.
- Keep one clear learner task and a quiet `Working:` control where assistance
  levels exist. Real learning stages may appear as minimal markers immediately
  to its right, with working available on hover, focus and tap. Do not surface
  fraction counters such as “1 / 4”, internal phase names such as “calibrate”,
  or redundant “Working required” headings and explanatory subtext. Do not
  invent a sequence for a lab that does not have one. Algorithm traces, settled
  order and measured counts remain evidence beside their model.
- When one lab has multiple operated modes, keep one top-bar Working control
  reflecting the active mode. Preserve each mode's working state, progress and
  earned availability independently; do not merge their pedagogical
  progression. The living HTML guide owns the visual treatment and specimen.
- Use padding and spacing within one parent surface. Idle calculations and
  explanatory paragraphs do not each need a box. Reserve full state borders
  for learner fields, actual feedback and bounded interaction/phase cards.
  Use regular ink-coloured text for calculations and secondary ink for prose;
  reserve heavier type for headings or a result that needs emphasis. Do not
  use grey bold microtitles throughout the working area.
- Interaction guidance must identify a real operated target and a purpose.
  Use the guide's blue cue and target halo, positioned against the rendered
  handle after resizing. Dismiss introductory guidance after the action.
  Do not add floating “drag to slide” chips or repeat general lesson copy.
- Unfinished learner work is yellow, a wrong attempt is red with a visible x,
  and a correct attempt is green with a visible check. Use complete borders and
  surfaces, including the input itself. Blue communicates actions, process and
  future support. Model identity colours are separate from answer correctness.
- Keep lab-specific spacing and geometry local when it carries instructional
  meaning; do not force every internal layout into the shared frame grid.
- Assistance and “working required” controls change which calculations the
  learner must supply; they never remove the need to operate, answer, predict,
  choose or otherwise act on the model. A freshly loaded problem must be
  incomplete at every assistance level. When working is shown, completion must
  still follow a meaningful learner-triggered state transition.

## Boundary between chrome and content

Shared tokens may style the page canvas, headings, descriptive copy, ordinary
panels, generic buttons and fields, focus indicators, and semantic status
surfaces.

Ordinary buttons and selected-tool states must use the shared control and accent
tokens (`--lab-control`, `--lab-accent`, and `--lab-accent-soft`). Do not introduce
a saturated local button colour during ingestion. A local colour is justified
only when it carries instructional meaning inside the operated model, such as a
packet route, signal, bus, warning or diagram legend; that colour must not leak
into surrounding interface chrome.

The Working segmented control is deliberately neutral: its selected segment is
white inside a light grey group. It is an assistance setting, not a primary
action or a correctness state. See the control specification below.

Static goals, hints and explanations normally use padding and ordinary text
on the parent surface. A separate neutral border needs a grouping purpose.
Do not preserve generator boilerplate that uses a saturated coloured side rail
as decoration. Shared feedback must not use a unilateral coloured rail or inset
stripe. Meaningful model identities, graph edges and CSS arrow geometry remain
lab-owned. The site frame corrects Kit status surfaces without editing the
immutable vendored release; callers still supply explicit check/x text and
accessible state descriptions.

Primary operated diagrams, models and manipulatives should use the optional
`.lab-kit-canvas` surface when their background is generic framing rather than
instructional content. The primitive supplies the shared light paper, line,
radius and optional construction grid without choosing a size, aspect ratio,
layout or interaction. Ordinary SVG charts and diagrams are part of the design
update, including their labels and presentation typography. Use the shared
14px body, 12px label and 11px annotation roles at the rendered size; when a
responsive `viewBox` scales text, set its SVG units to reach those roles.
Preserve mathematical/data mapping, meaningful model colours and interaction
semantics. The current rollout scope and any asset exceptions are recorded in
the site rollout plan; this contract does not set a permanent asset boundary.
A primary visual must fit its region without an internal scrollbar unless
panning is the actual learner operation and has been explicitly reviewed.

Use one visual frame by default. Do not wrap self-describing nodes, servers,
protocol layers or similar objects in successive bordered panel, canvas and
card surfaces. A nested boundary is justified only when it communicates real
containment, grouping, hardware, clipping or an operated region; otherwise let
the objects populate the parent field directly.

Darkness is not a generic Computer Science canvas style. Retain a dark surface
only when it communicates the thing being represented—for example a code
editor, terminal, powered-off monitor, hardware display or mission prop. Keep
packet, signal, protocol, state and geometry colours local where they carry
meaning, but place them on the shared light operated surface when the surrounding
canvas itself is neutral.

Keep these local to each lab:

- diagram, canvas, waveform, packet, signal, bus, syntax, and command colors;
- geometry whose dimensions carry instructional meaning;
- simulation timing and interaction logic;
- monospace code/data typography;
- specialized hardware displays, maps, editors and consoles whose dark treatment
  is part of the represented object or state.

Binary Register Practice keeps its `820px` maximum width. Other labs use the
shared `1200px` maximum. Preserve useful responsive layouts while allowing
vertical document flow under the rules above.

## Working and stage controls

The [living HTML guide](design-language.html) contains an
interactive control specimen and self-contained snapshots of the three reviewed
pilot labs. Keep its written rules, executable examples and inspectable source
in step with this contract when design feedback changes the standard.

This is living guidance. The September 2026 user review refines the supplied v3
references; these rules supersede earlier instructions to remove all progress
surfaces. The reference is the grey control in [Prime Factors](https://www.examplicity.org/mathematics/0580?lab=prime-factors-hcf-lcm)
and the compact stage placement in [Sequence Patterns](https://www.examplicity.org/mathematics/0580?lab=sequence-patterns-differences),
with redundant labels, helper paragraphs and numeric counters removed.

- Use one full-width activity top bar above the model and working columns.
  Place the current learner task on the left, with Reset beside it where needed;
  place **Working:** and its toggle on the right, immediately followed by any
  real stage/checkpoint markers. Keep the label, toggle and markers together.
  They belong to the activity, not to the calculation column. Do not duplicate
  them inside the working area or add a “Checkpoint” heading.
- Label the control simply **Working:** followed by **None / Some / All**.
  None means the learner supplies no written calculations; the working remains
  visible and operating the model is still required. Preserve each lab's
  existing meaning of Some and All. Do not add artificial levels to a lab.
- Use the opt-in `.lab-working-toggle` from `public/labs/lab-frame.css`: a
  `#f7f8fa` group, `#e7e8eb` boundary, dark grey `#424245` selected segment with white text and no visible
  border, regular 12px labels and an overall 42px control height. Use regular-weight labels without a bold microtitle or explanatory line.
  Buttons expose `aria-pressed` and retain a visible keyboard focus outline.
- Place optional `.lab-stage-progress` before the right-aligned toggle group in
  the right side of the activity top bar. Small empty circles denote upcoming stages,
  a blue inset dot marks the current stage, and a green check marks completion.
  The visible marker is 12px within a 24×40px target. Text in its accessible
  name distinguishes current, complete and upcoming independently of colour.
- Stages represent the existing learning sequence. They report progress and
  open details; they do not silently become skip-ahead navigation. A completed
  marker requires the actual model and required working to be complete.
- Give each stage a rich detail surface on hover, keyboard focus and tap.
  Show a learner-facing task name and state, then relevant calculations,
  submitted work or results. Current evidence updates as the model changes;
  completed stages retain the evidence from that stage. Future stages describe
  their task without revealing answers. Never expose a required answer through
  a tooltip before the learner has supplied it.
- Keep details readable: white surface, full neutral border, 16px padding,
  regular 14px ink text and a restrained shadow. Anchor them to the right of
  the top-bar control group, within the activity bounds and without clipping. The pointer can enter the detail without
  dismissing it; Escape dismisses it, and moving keyboard focus away closes it.
  Tap opens the same content. Do not rely on a native `title` attribute alone.
- At narrow widths, the top bar wraps its controls below the task while staying
  above the model. Only the calculation column moves below the model. Keep all
  controls reachable and stage details inside the viewport.

The executable reference is
`labs-src/mathematics/coordinate-distance-midpoint-perpendicular/lab.html`.
Shared CSS supplies appearance; stage names, completion and recorded working
belong to the individual lab. This avoids a second progression framework.

## Flat surfaces and concept colours

The living design guide takes precedence over kit styling. Adapt or omit a kit
primitive when it conflicts; do not add a second styling system to preserve it.
Keep Working: None / Some / All and each lab’s established meanings.

Use exact living-guide palette tokens, not visually similar custom colours.
Ordinary framing uses neutral surfaces and lines; actions use the accent family.
Use the `--lab-concept-*` families for meaningful object identity and carry the
same identity through the model, legend and working. For Prime Factors, Number A
uses concept blue, Number B violet and shared factors teal. Shared membership
is not a correctness state. Reserve the green feedback family for verified work.
Pair colour with labels, positions or meaningful shapes.

Concept backgrounds are direct translucent versions of the approved base
colour. Use `--lab-concept-*-surface` at approximately 30% alpha (`#4d`):
`#7563a7` becomes `#7563a74d`. Carry the same tint from the model into its
working tokens and count cells; do not leave a separate washed-out palette in
working or dim factor strips while an answer is pending. Semantic answer
feedback retains its yellow, red and green roles.

Keep number tiles and shared-factor circles white inside the tinted main
visual, with matching concept borders and ink for contrast. Working tokens
retain their concept tint. For working tokens nested in coloured surfaces, use `--lab-concept-*-fill`: the opaque equivalent, formed
from 30% of the base colour and 70% white. This avoids double tinting or mixing
the concept colour with the answer-feedback background. Do not further whiten
the old `*-soft` tint or reduce opacity on an entire container.

Use flat fills for panels, trays, tokens and feedback. Do not introduce decorative
gradients, including faded tray backgrounds or attention washes. Construction
lines and grids may remain when they support the model; they are not decorative
colour blends. Use the matching palette line, soft fill and ink tokens together.

## Working offer labels

Use “Try some working” and “Try all working” for working offers. Future qualification support will make these actions enable suitable working for the selected IGCSE / AS / A Level, once the qualification toggle is enabled and the corresponding working has been verified. This qualification-aware behaviour is planned, not implemented by the current examples.

## Movable completion cards

Completion and phase cards that overlap a model must remain movable and must
not block examination of the completed visualization with a backdrop. Provide
a quiet move handle: pointer dragging works with mouse and touch, clicking
switches sides without dragging, and arrow keys move the focused handle (Shift
for larger steps). Capture the pointer while dragging and end movement on
release or cancellation. Keep the whole card within its workspace and recheck
bounds after resizing or content changes. Preserve its position during result
inspection; moving a card never changes the model or advances a stage.

Keep the message and continuation actions available. Working stays in its
persistent column. Use the living guide's Coordinate reference and copyable
movable-card behaviour when updating an overlapping completion surface. With Lab Kit 0.3.0,
use `LabKit.direct.movableCompletion(card, workspace)` and the guide’s
`data-dialog-drag` handle instead of copying a second movement helper.
Initialise only one helper per card; the guide still owns its styling.
Canvas areas fit their available width and do not create internal scrollbars.
The page owns vertical flow. Wrap repeated constructions as complete steps,
and arrange chart geometry for readable labels rather than retaining oversized
minimum widths. Place completion cards relative to the workspace, so opening
or moving a card cannot create canvas scroll extents. Use the shared four-way
SVG move icon; do not substitute a text arrow or font-dependent glyph.

## Modal actions

Modal actions use centred rows and centred labels, with 16px above the actions
and 10px between buttons. Give buttons 10px vertical and 18px horizontal padding
and a minimum height of 40px. The reviewed modal-label exception is 11px at
weight 600; working and explanatory copy retain the standard 14px size. Allow
long labels to wrap without losing their padding. Centre a standalone working
offer button within its card too.

## Text must earn its place

Review copy as part of every lab's design update, rather than transferring
every old paragraph into a cleaner-looking box. Useful text establishes a goal,
enables an interaction, shows working, identifies a non-obvious state or
explains a relationship the visual alone cannot communicate.

For each heading, paragraph and caption:

1. Name what the learner gains from it. If the nearby visual, legend, control
   or calculation already conveys that information, remove the repetition.
2. Consider improving the visual first: label the operated object, show its
   changing value, connect a cue to its handle, or compare results in aligned
   rows. Do not narrate every visible change underneath the model.
3. Keep working and meaningful interpretation. Brevity must not remove the
   reason a choice is valid, the meaning of a heuristic, or qualifications such
   as settled counts depending on legal tie choices.
4. Show results when they exist. Avoid bottom panels of placeholder text,
   generic summaries, repeated task instructions and “results appear here”
   copy. A comparison should expose actual differences rather than repeat its
   metrics in a paragraph.

Apply this review to the whole lab, including the bottom area, every working
level, intermediate feedback and completion states. Accessibility announcements
may repeat essential visual changes when that serves a screen reader user;
they do not require another visible paragraph.

## Change checklist

1. Edit the canonical stylesheet or the smallest relevant local selector.
2. Run `npm run labs:sync`.
3. Run `npm run labs:sync:check`, lint, and the production build.
4. Check keyboard focus and reduced motion.
5. Check the standalone lab at `1440×1000` and `1366×768`. At each size, verify
   `document.documentElement.scrollWidth <= document.documentElement.clientWidth`,
   each primary operated visual has matching client/scroll dimensions, the
   primary panels remain readable and all controls are reachable through normal
   document flow. Record any intentional internal
   scroller for human review rather than hiding overflow.
6. Resize at 1200, 900, and 390 pixels; also check lab-specific breakpoints and
   Binary at 820, 640, and 390 pixels.
7. Smoke-test the lab interaction before committing.
8. For every assistance or working level, start a fresh problem and confirm it
   is incomplete before interaction, cannot advance immediately, and completes
   only after the level-appropriate learner action.

Working and exam settings share the living guide’s smooth pill toggle: fully rounded track and selected segment, neutral grey background, white selected text and no visible segment border; Working uses dark grey `#424245`, while exam uses blue `#4569aa`, 42px height with 3px inset, and 12px regular-weight text. Preserve existing options and earned availability.

Toggle containers use a subtle outer shadow: `0 1px 3px rgba(29,29,31,.08)`. Apply it to the shared rounded track, not to individual segments. Working remains grey and exam blue.

Activity top panels sit above the model and working area. Put task/actions at left and settings together at right. Order toggles left to right: additional toggles, Working, exam. Exam is always farthest right; omit unavailable controls. Genuine stage markers sit before the toggle group so they do not displace this priority. Do not invent settings or stages. Toggle tracks have a 1px `#d2d2d7` border. Top-panel action buttons keep standard 8px control corners, a thin darker border and the subtle container shadow. Prefer blue #4569aa with white text for primary actions (including New question); use white with blue #315b91 text for secondary actions such as Reset. Grey actions are rare differentiation only. Disabled actions use #eef1f3 background, #6e6e73 text, #d2d2d7 border and no shadow. Disabled rules override primary and hover styling; white/blue is an enabled secondary action only. Preserve native disabled semantics and readable labels instead of relying on opacity. Labels stay regular 12px. Algorithm modes can use the rounded blue segmented toggle with the same track border and shadow; preserve existing action semantics. Keep minimum 40px height and 8px 14px padding. Retain active, disabled and keyboard-focus states.

An algorithm mode toggle starts with a real selected mode and matching model state (Graph Search defaults to Dijkstra on load/reset), not an unselected pair or a merely cosmetic selection.

Activity task headings: primary ink #1d1d1f, 14px, weight 500, line-height 1.45, normal letter spacing, sentence case and balanced wrapping. Settings labels remain regular weight. No badge/background or extra title in a controls-only panel.

For adjacent previous/current stage views, use matched padded descriptor headers (12px text, 4px label/value gap) and a lightweight neutral container for reference evidence. Return-area cues appear when a placed item can be returned; use an interaction-blue target highlight during hover rather than permanent verbose drop instructions.

Introduction targets use rounded containers and a restrained two-second interaction-blue halo pulse. Match the halo to the container corners (12px for Sequence stage/material surfaces). Pulse only the current target while guidance is active; retain a static halo for prefers-reduced-motion. Avoid moving individual model objects solely for attention.

Displayed terms and formulas may use approved concept violet #7563a7 at 20% over white, 4px corners and compact 3px vertical / 7px horizontal padding, without borders or shadows. Group a short expression such as “add 2” as one surface with only one padding layer. This identifies mathematical content, not correctness, and does not replace input feedback states.

Available, unattempted working cards use a restrained two-second yellow border pulse until pointer or keyboard interaction with their input or associated model. Remember that interaction through rerenders; reset it with a fresh activity. Reference, locked, completed and incorrect cards stay static. Use static borders with reduced motion.

The living HTML guide’s **Refined components and their uses** section groups the latest rules with interactive working-state and maths-surface specimens. Use it for purpose and appearance; the deployment copies are generated from this repository. Lab rollout scope remains in the site change record, not in this visual reference.

Cards containing answer fields do not repeat check/x/status symbols in the top-right corner. Keep feedback at the fields, while retaining card state colour and attention behaviour. Field-free progress cards may retain their status marks.

Shared implementation lives in `packages/lab-kit/src/lab-design.css`. New labs consume its component API; reviewed labs use compatibility selectors. Reusable refinements belong there, while geometry and learner-state logic remain lab-owned. Lab export embeds the resource in HTML, with no separate stylesheet or network requirement.

Form-field focus darkens the existing border within its colour family, with no extra black outline/ring/shadow. Button keyboard focus remains visible. `lab-adopt-v3` supplies a shared compatibility surface; `lab-design.js` supplies remembered card attention and pointer/keyboard-movable completion cards for adopted labs. Embed both resources in standalone downloads.


## Model space, predictions and explanatory working

Shared appearance must support the model's causal relationships. Fit the existing visual into its canvas before changing its composition or adding controls. Use the operated object itself when it naturally expresses the action. Ordinary SVG chart text and handles follow the shared typography and interaction language; complex illustrations retain their meaningful design. Keep explanations that connect actions, calculations and evidence, while removing text that merely narrates an already visible result. Working remains informative and shows progression at None as well as Some and All. The accepted examples demonstrate these principles, not a universal lab layout.

- Canvas surfaces are white or transparent, without a grey enclosing box.
  A model should fill its allotted area with modest padding; chart text uses
  the approved sans family and regular weight, sized for the rendered chart.
- Working: is a sentence-case, 12px regular label beside the grey toggle.
  Keep one main goal in the top bar; put local method explanations in working.
- A prediction belongs in a lightweight card: yellow before assessment, green
  when correct, red after an incorrect attempt. Choices use selection blue,
  retain explanatory labels, and have a separate Check action.
- Assistance may reveal calculations, but an applied transformation can still
  be performed directly on its existing bar. A visible edge grip and target
  line make the action discoverable; reaching the target commits the step.
  Arrow keys and End provide the same operation.
- Preserve causal explanations: why aligned infinite tails cancel, why both
  sides are divided, and why matching remainders reproduce digits. Avoid
  replacing useful algebra with an unexplained answer or a sparse sidebar.
- Wrap a long calculation trace into readable rows instead of scrolling or
  shrinking text. Matching endpoint rings can identify a repeating cycle across
  rows where a single horizontal bracket would be misleading.


Direct interaction cues use a quiet blue boundary or halo on the operated
object. Retain keyboard controls and accessible instructions; remove floating
“drag left” or “pull across” chips when the target and working explanation
make the action clear. Attention stops after interaction, with a static
reduced-motion alternative.

Chart labels need reserved space as well as readable type. Separate axis
ticks, axis titles and object readings; resize annotation containers to their
text. Avoid labels that follow moving points when they collide with other
readings or duplicate the persistent working. A second derived graph may need
a title; a mode toggle and labelled axes already identify the primary graph.


### Card titles

Use `.lab-card-title` for a modest header treatment: 15px, regular weight 400,
1.4 line-height, primary ink and 6px below. Use sentence case, without uppercase
tracking or bold. This applies to reference, concept, prediction and working
card titles (for example, Blue reference). Body working remains 14px; short
field labels remain 12px. Formulas and values are content, not card titles.


### Introduce required actions and preserve the model composition

Introduce each newly required operation with a short tooltip anchored to its
actual target, including operations unlocked in later stages and calculation
modes. Pair it with the existing quiet blue target emphasis; a pulse alone
does not explain an unfamiliar action. Explain what to do and why, including
the keyboard equivalent for a drag. Show one introduction at a time, when its
target is visible and enabled. Dismiss on that operation or Escape; do not
repeat it on rerender or interrupt an active drag. Keep passive introductions
out of the pointer path and pause them while a completion card is visible.

For adopted labs, annotate an input, control or SVG handle group with
`data-lab-intro` (stable operation key), `data-lab-intro-title` and
`data-lab-intro-copy`. The shared runtime handles placement, dismissal and
attention. An SVG group should include both the visible handle and its larger
hit target. Field introductions retain the existing border-only focus style.

Completion cards describe the achieved relationship and the next learning
transition. Generic status such as “Evidence ready” belongs to neither a
learning transition nor an explanation. Keep the detailed evidence in working,
show the card after release, and retain the shared move handle.

Vertical page flow does not mean rearranging a horizontal model into stacked
copies. Percentage bars and gates remain a single causal sequence: resize
their widths and spacing to fit the available canvas without scrolling.
Wrapping a long symbolic remainder trace is a separate presentation choice.


Popup placement prefers visible empty workspace, avoiding text, fields, controls
and diagram objects. If no clear position fits, choose the least overlap and
keep completion movable. Automatic placement is an opening default; preserve
the learner's manual position while the card remains open. Introduction cues
prefer the nearest clear position to their target.

Bounds' car and time marker use the same pickup-offset drag resource as Motion
and Histogram: grabbing an object must not change its value until it moves.
Clicking a ruler lane may deliberately select a value; interval constraints
and speed discovery remain lab-specific.


### Geometry adoption: displayed type and representation controls

The living HTML guide's “Geometry and representation changes” section records
these patterns. Opt ordinary charts into `data-lab-readable-chart="14"` (or
`12` for short labels). Shared runtime converts display pixels to SVG units
when its size or viewBox changes. Reserve label space locally; this does not
redraw complex illustrations or alter the mathematical geometry.

Construction, choice and calculation cards share current/needed, correct and
mistake surfaces, including at Working None. Keep waiting instructions outside
maths surfaces. A movable blue support card can house a genuine representation
control, such as the 3D unfolding slider; its purpose differs from green
completion. Suppress inherited positioning animations when shared placement
owns the popup. Checkpoints may show the current task and its work phase in a
hover/focus detail surface, without adding a numeric progress counter.


Geometry review refinement: calculation and candidate-table surfaces are flat material, without inset side rails in any state; fields retain complete feedback borders. Choose concept colours that separate clearly from success green. The 3D palette uses approved blue for the beam/projection, amber for height and violet for cable; verified alignment keeps its green feedback.
