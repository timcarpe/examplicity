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
- Do not surface stage numbers, phase names such as “calibrate”, progress
  counters/bars, or redundant “Working required” headings and explanatory
  subtext. Keep one clear learner task and one Working heading with its controls.
  Internal progression still governs the learning sequence. Algorithm traces,
  settled order and measured counts are evidence, not generic progress chrome.
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
layout or interaction. SVG geometry remains lab-owned; use a stable `viewBox`,
responsive sizing and equivalent pointer and keyboard paths. A primary visual
must fit its region without an internal scrollbar unless panning is the actual
learner operation and has been explicitly reviewed.

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
