# Lab style contract

Each file in `public/labs` remains a complete, monolithic HTML lab. A downloaded
lab must work and retain its presentation without the website or a network
connection.

## Shared chrome

`public/labs/lab-frame.css` is the maintenance source for the shared lab canvas,
homepage-aligned design tokens, typography, focus treatment, responsive frame,
and reduced-motion defaults. Its custom properties are namespaced with
`--lab-` so they cannot silently replace instructional variables.

Run `npm run labs:styles` after changing the contract. The command copies the
stylesheet into the marked `LAB_FRAME_STYLES` block in every lab HTML file.
`npm run labs:styles:check` verifies that all embedded copies are current, and
the production build runs that check automatically.

Do not edit an embedded `LAB_FRAME_STYLES` block directly.

## Homogenization rules

- The visible `h1` and document `<title>` must match the lab name in
  `app/labs.ts`; do not append redundant “Lab” or version labels.
- Use chips consistently: navigation chips identify destinations, status chips
  describe current state, access chips describe editability, and legend chips
  explain diagram or simulation meaning. Do not use a chip for decorative copy.
- Surrounding interactive chrome should generally be at least `10px`; diagram
  labels and other geometry-constrained instructional text are exempt.
- Keep lab-specific spacing and geometry local when it carries instructional
  meaning; do not force every internal layout into the shared frame grid.

## Boundary between chrome and content

Shared tokens may style the page canvas, headings, descriptive copy, ordinary
panels, generic buttons and fields, focus indicators, and semantic status
surfaces.

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
2. Run `npm run labs:styles`.
3. Run `npm run labs:styles:check`, lint, and the production build.
4. Check keyboard focus and reduced motion.
5. Resize at 1600, 1200, 900, and 390 pixels; also check lab-specific
   breakpoints and Binary at 820, 640, and 390 pixels.
6. Smoke-test the lab interaction before committing.
