# Future-lab ingestion checklist

This is the operating contract for adding an approved Cambridge lab to
Examplicity. Keep the change small: a lab is a self-contained static HTML
document, one manifest entry, and one card drawing. Do not use this checklist to
redesign existing labs or introduce a new runtime architecture.

## 1. Preflight and ownership

- [ ] Confirm that the source is a **lab**: it teaches one interactive concept and
  belongs in the catalogue. Record its syllabus coverage, topic, short card
  description, and the interaction the card should depict.
- [ ] Preserve the source as one document at
  `public/labs/<subject>/<slug>.html`. The subject directory is the manifest
  `subject` ID, such as `computer-science`; it is not an exam-code directory.
  Current labs such as `public/labs/computer-science/binary-numbers.html` and
  `public/labs/computer-science/memory-management.html` contain their own inline
  `<style>` and `<script>` blocks. Do not split a lab into React components, a
  route, or shared assets as part of ingestion.
- [ ] Inspect the actual HTML and run the lab before writing catalogue copy or
  an icon. The title and topic are not enough to infer its mechanics; identify
  the controls, state changes, feedback, and main visual model in the document.
- [ ] Do not normalize or refactor unrelated existing monoliths while adding a
  lab. The shared frame owns only the standard canvas and surrounding chrome;
  lab-specific teaching UI remains inside its document.

## 2. Static document and shell boundary

The host (`app/catalogue.tsx`) opens the manifest `href` in a full-viewport iframe.
The lab owns its teaching UI and behavior; the host owns the catalogue, loading
screen, query-string selection, iframe, and persistent header/footer overlay.
Keep those responsibilities separate.

- [ ] Keep a complete document beginning with `<!doctype html>`,
  `<html lang="en">`, charset, viewport, and a meaningful `<title>`.
- [ ] Keep lab-specific CSS and JavaScript inside that HTML. A static file in
  `public/labs` does not receive `app/globals.css` and must not depend on a
  React component or an undocumented host callback.
- [ ] Include either the marked `LAB_FRAME_STYLES` block or the temporary
  `/labs/lab-frame.css` link accepted by `npm run labs:sync`. The sync command
  embeds the standard background, canvas and responsive frame so the downloaded
  lab remains self-contained. Do not edit or duplicate the generated block.
- [ ] Keep the lab's own `<main>` as the document boundary. Do not add a second
  Examplicity header or footer inside the iframe; the host renders that chrome
  once above every lab.
- [ ] Set `layout: 'compact'` in the lab manifest only for an approved compact
  lab, and mark its constrained teaching surfaces with `data-lab-workspace`.
  The generator writes `data-lab-layout="compact"` on `<body>`; shared styles
  then keep the header on the standard rail while constraining those surfaces
  to the supported 820px workspace. Do not add a lab-specific body class for
  page sizing.
- [ ] Base wide multi-column layout transitions on the named `lab-canvas`
  container rather than the browser viewport, so they respond to the shared
  canvas cap as well as narrow screens.
- [ ] Treat `1200px` as the lab's native desktop composition, not a final wrapper
  imposed after authoring. At `1440×1000` and `1366×768`, the complete primary
  workspace must fit the shared rail without page-level horizontal overflow,
  clipped controls, or a hidden scrollbar behind host chrome. Keep the existing
  principal panels and actions above the fold; stacking them below it is not an
  acceptable ingestion fix. Mild lab-owned compaction, proportional geometry
  changes and container-query transitions are appropriate.
- [ ] Do not add host messaging, parent-frame state, or a second navigation
  system without explicit architecture approval. The current integration is
  only the manifest `href` plus the iframe in `app/catalogue.tsx`.

The host owns the brand, “Back to labs”, GitHub, and license links. Catalogue
cards link to the canonical `/labs/<subject>/<slug>.html` document, while an ordinary click
opens the same document in the existing iframe shell. The selected syllabus view
remains at `/computer-science/<exam>` with `?lab=<slug>` as transient UI state.
The host's Download action packages a copy of the source document with inline
standalone Examplicity header/footer chrome. That generated chrome belongs only
to the downloaded artifact; do not add it to the source document or its iframe.
Before adding that chrome, the packager reapplies the manifest transformer so
the downloaded title, subtitle, metadata and syllabus alignment cannot drift
from the live catalogue.

The legacy flat Computer Science URLs are permanent redirects generated from the
manifest in `next.config.ts`. New labs publish only at their subject-scoped path;
do not add a second flat copy of the HTML document.

## 3. Manifest registration

Add one `Lab` object to `labs` in `app/labs.ts`. `Lab` is an `Activity` plus
`topic`, `format`, and `syllabuses`, so a catalogue entry must contain all of these
fields:

```ts
{
  subject: 'computer-science',
  slug: 'example-lab',
  title: 'Example Lab',
  description: 'One short sentence describing the learner-visible experiment.',
  metaDescription: 'A search description naming the concept, interaction and applicable syllabus.',
  subtitle: 'Existing lead copy shown beneath the lab heading, or null when the design has no subtitle slot.',
  topic: 'Data representation',
  format: 'Visual experiment',
  kind: 'lab',
  syllabuses: [
    {
      code: '0478',
      qualification: 'IGCSE',
      sections: [
        { id: '1.2', page: 13, primary: true },
        { id: '1.3', page: 13 },
      ],
    },
  ],
  href: '/labs/computer-science/example-lab.html',
}
```

- [ ] `slug` is unique, lowercase ASCII, and kebab-case. It is the basename of
  the file and the value used for transient shell state. `subject` is the stable
  subject directory ID. These values must agree exactly across the manifest,
  `public/labs/<subject>/<slug>.html`, and `/labs/<subject>/<slug>.html`. Do not
  use spaces, uppercase, exam codes, or a second spelling in the subject folder
  or slug.
- [ ] Add or reuse the exam in `syllabusRegistry` in `app/labs.ts`. The registry
  owns the subject, official Cambridge qualification page, official syllabus
  document, validity and chip palette. It is deliberately not limited to
  Computer Science, 0478 or 9618.
- [ ] Give every lab one `syllabuses` entry for each applicable syllabus. The
  `code` controls catalogue visibility. `qualification` is the learner-facing
  stage (`IGCSE`, `AS`, `A` or a justified combined label), and `sections`
  contains the exact syllabus `topic.subtopic` references and PDF pages.
- [ ] Mark exactly one section per syllabus as `primary: true`. Add other
  section references only when the interaction directly teaches them. Do not
  turn contextual, extension or merely adjacent material into alignment.
- [ ] Derive section IDs and PDF page numbers from the current official syllabus
  and the lab's actual interaction, not its title. The generated qualification
  label links to Cambridge's syllabus page; the primary and additional section
  numbers each link to their corresponding official PDF page.
- [ ] Reuse the current topic labels and capitalization when the content fits:
  `Data representation`, `Networks & communication`,
  `Processors & memory`, `System software`, and `Programming`. These labels are
  defined by the typed `topics` manifest; do not create a second spelling.
- [ ] Keep `format` short and card-sized, following existing examples such as
  `Practice`, `Visual experiment`, `Signal lab`, `Protocol lab`,
  `CPU simulator`, or `OS simulation`.
- [ ] Make `title` match the document's purpose and `description` concrete
  about what the learner can change, observe, or compare. `metaDescription` is
  separate search/social copy. `subtitle` owns only the existing lead-text slot;
  use `null` when the approved design has no such slot rather than adding one.
- [ ] Do not hand-edit the generated `LAB_MANIFEST_HEAD`,
  `data-lab-manifest="title"`, `data-lab-manifest="subtitle"`, or
  `LAB_SYLLABUS_CHIPS` regions. Run `npm run labs:sync` after changing the
  manifest; catalogue cards and structured data read the same values directly.

### Subject views and topic briefings

Each `subjects[].views[exam]` entry in `app/labs.ts` owns its canonical path,
header label, page introduction, meta description and a typed briefing for each
topic. The catalogue renders this copy directly. The content check fails when a
topic visible for a syllabus has no briefing, when a lab uses an unknown topic,
or when a syllabus alignment is not enabled by its subject.

### Tools in the catalogue

The translator is registered as a `Lab` with `kind: 'tool'`, syllabus coverage,
topic and format metadata. Use `kind: 'tool'` for a substantial teaching tool
that belongs in the catalogue, while retaining the same path and card contract.

## 4. Catalogue card SVG

Add a new `case '<slug>'` to `IconDrawing` in `app/lab-icon.tsx`. Do not rely on
the default drawing for an approved lab.

- [ ] Inspect the actual lab first, then draw its real interaction mechanic:
  input to output, moving data, changing state, or the learner's main action.
  For example, the bitmap pilot's card shows a pixel grid, an arrow, and three
  encoding bars because the lab really paints a bitmap and switches between
  Normal, RLE, and Huffman modes. A generic “computer” symbol is not an
  acceptable substitute.
- [ ] Keep the existing SVG contract: `viewBox="0 0 640 360"`, primitives such
  as `<path>`, `<rect>`, `<circle>`, and `<g>`, and no external image or inline
  colour. The parent `.icon-drawing` in `app/globals.css` supplies
  `currentColor`, rounded caps/joins, and the base stroke.
- [ ] Use the established semantic drawing classes when helpful: `is-solid`
  for filled emphasis, `secondary-line` for quiet supporting lines, and
  `thin-lines` for dense grids. Keep the drawing legible in the 16:9 card
  preview and meaningful in both light and hover colours.
- [ ] Keep the icon decorative. `LabIcon` renders `aria-hidden="true"`; the
  surrounding card link in `app/catalogue.tsx` supplies the accessible name
  (`Open <title>`). Do not put essential instructions only in the SVG.

## 5. Interaction and accessibility review

- [ ] Use semantic headings and sections, real `<button type="button">` and
  form controls, labels, and visible focus styles. Do not make a clickable
  `<div>` the only control.
- [ ] Keep ordinary interface controls on the shared palette. Generic buttons,
  active-tool states and fields must resolve through `--lab-control`,
  `--lab-accent` and `--lab-accent-soft`; do not retain a source lab's brighter
  one-off button colour. Preserve local colours only where they encode meaning
  in the instructional visualization, and keep those colours out of the chrome.
- [ ] Give interactive visualizations an accessible name or role. Existing
  examples include the bitmap's `aria-label="Paintable bitmap"`, the CPU SVGs'
  `role="img"` plus `aria-label`, and the translator's labelled editors and
  keyboard-operable `role="separator"` splitters.
- [ ] Announce changing feedback with a suitable live region (`role="status"`
  and `aria-live="polite"` for ordinary updates; reserve alerts for urgent
  errors). Ensure dynamically created controls receive labels too.
- [ ] Every essential action works by keyboard as well as pointer/touch. Do not
  make hover the only way to discover state. Check narrow screens and
  `prefers-reduced-motion`; the host already reduces catalogue motion in
  `app/globals.css`.
- [ ] Check that lab links and controls do not trap focus in the iframe and
  that keyboard focus can still reach the host's overlay navigation.

## 6. Validation before approval

- [ ] Run `npm run labs:sync` to embed the shared frame and generate the
  manifest-owned head metadata, visible title, optional subtitle and syllabus
  chips. Never hand-edit a generated marker or controlled attribute.
- [ ] Confirm the three-way path contract and changed-file scope:
  `public/labs/<subject>/<slug>.html`, its `app/labs.ts` entry, and its
  `app/lab-icon.tsx` case. Confirm the HTML contains one generated frame block,
  one generated manifest head, title, optional subtitle, syllabus-chip block
  and no duplicate Examplicity shell markup.
- [ ] From `cambridge-labs`, run:

  ```text
  npm run labs:sync:check
  npm run lint
  npm run build
  git diff --check
  ```

  The aggregate check also packages every lab in memory and verifies that its
  manifest-controlled head, title, optional subtitle, syllabus chips and
  standalone download chrome each occur exactly once.

- [ ] With `npm run dev`, test the selected exam tabs and confirm the new card
  appears only for its manifest `syllabuses`, under the exact `topic`, with the
  intended `format` and SVG. Confirm the card links directly to
  `/labs/<subject>/<slug>.html`, then
  open it from `/computer-science/<exam>?lab=<slug>` and verify the loading
  screen resolves and the iframe loads the intended HTML.
- [ ] Exercise the lab's main controls, reset/empty/error paths, keyboard
  paths, mobile layout, and shell links. Check the browser console for errors.
- [ ] At both `1440×1000` and `1366×768`, record a standalone browser check that
  `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.
  Visually confirm all intended primary panels and controls remain above the
  current fold, fixed visualizations start in a useful fully readable position,
  and compaction has not created conspicuous whitespace. Repeat at 1200, 900 and
  390 pixels for responsive behavior.
- [ ] If the lab cannot remain monolithic, needs shared runtime code, changes
  the host/iframe contract, adds dependencies, or requires a new exam/topic
  convention, stop and request approval for that specific architecture change.

## 7. Approval gate

Submit the proposal/source for content and syllabus review before integration,
then submit the bounded integration diff for review with evidence of the
validation checklist above. Approval means the reviewer has confirmed:

1. the interaction teaches the stated Cambridge topic and exam coverage;
2. the HTML remains self-contained and the shell/lab boundary is respected;
3. the manifest paths, exact topic/exam values, accessibility behavior, and
   mechanics-based card SVG are correct; and
4. lint, build, direct iframe/query loading, and manual interaction checks pass.

Do not merge or publish when any item is unresolved. Record the exact blocker
or requested architecture decision instead of silently changing the contract.
