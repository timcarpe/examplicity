# Lab style contract

Each file in `public/labs/<subject>` remains a complete, monolithic HTML lab.
Subject directories use the manifest subject ID; exam-code alignment remains
manifest metadata and does not determine the file path. A downloaded lab must
work and retain its presentation without the website or a network connection.

For the labs registered in `labs-src/manifest.json`, `labs-src` is the
maintainable publication source and `public/labs` is generated output. The site
vendors a hash-pinned Lab Creation kit release under `vendor/lab-kit` and owns
the deterministic inlining compiler. This centralizes reusable source without
creating any runtime shared-resource dependency. Labs not yet registered remain
legacy monolith sources until migrated deliberately.

## Shared chrome

`public/labs/lab-frame.css` is the maintenance source for the shared lab canvas,
homepage-aligned design tokens, typography, focus treatment, responsive frame,
and reduced-motion defaults. Its custom properties are namespaced with
`--lab-` so they cannot silently replace instructional variables.

Run `npm run labs:sync` after changing the contract. It copies the stylesheet
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
- Preserve the lab's intended single-screen desktop composition at both
  `1440×1000` and `1366×768`. Adapt lab-owned columns, fixed canvases, controls,
  spacing and typography to the 1200px rail. Do not satisfy the width contract
  by stacking a primary panel below the fold or leaving a conspicuous gap where
  content used to be.
- Application-style labs must also fit the host's content row at `1280×720`.
  The outer lab document must not scroll behind the persistent footer. Fold
  progress, backup and resource controls into the application chrome, use the
  remaining height for the teaching surface, and confine overflow to named
  internal panes such as navigation, editors, consoles or long task briefs.
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
- Use chips consistently: navigation chips identify destinations, status chips
  describe current state, access chips describe editability, and legend chips
  explain diagram or simulation meaning. Do not use a chip for decorative copy.
- The top-right syllabus chips are generated navigation. The whole chip opens
  the primary section in Cambridge's official syllabus document. When a chip
  lists multiple sections, each numbered section also opens its corresponding
  document page. Colour supports the visible qualification and exam-code label
  but never replaces it.
- Surrounding interactive chrome should generally be at least `10px`; diagram
  labels and other geometry-constrained instructional text are exempt.
- Keep lab-specific spacing and geometry local when it carries instructional
  meaning; do not force every internal layout into the shared frame grid.

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

Static goals, hints, explanations and supporting callouts belong to the shared
panel language: a neutral full border, shared surface and ordinary text colour.
Do not preserve generator boilerplate that uses a saturated coloured side rail
as decoration. A coloured rail is appropriate only inside an operated visual or
when its changing colour communicates a semantic state such as success, warning
or error.

Keep these local to each lab:

- diagram, canvas, waveform, packet, signal, bus, syntax, and command colors;
- geometry whose dimensions carry instructional meaning;
- simulation timing and interaction logic;
- monospace code/data typography;
- specialized dark, hardware, map, editor, and visualization surfaces.

Binary Register Practice keeps its `820px` maximum width. Other labs use the
shared `1200px` maximum and must retain their existing internal responsive or
scrolling behavior.

## Change checklist

1. Edit the canonical stylesheet or the smallest relevant local selector.
2. Run `npm run labs:sync`.
3. Run `npm run labs:sync:check`, lint, and the production build.
4. Check keyboard focus and reduced motion.
5. Check the standalone lab at `1440×1000` and `1366×768`. At each size, verify
   `document.documentElement.scrollWidth <= document.documentElement.clientWidth`,
   the intended primary panels and controls remain above the current fold, and
   no noticeable dead space was introduced.
6. Resize at 1200, 900, and 390 pixels; also check lab-specific breakpoints and
   Binary at 820, 640, and 390 pixels.
7. Smoke-test the lab interaction before committing.
