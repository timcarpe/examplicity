# Future-lab ingestion checklist

This is the operating contract for adding an approved Cambridge Computer Science
lab to Examplicity. Keep the change small: a lab is a self-contained static HTML
document, one manifest entry, and one card drawing. Do not use this checklist to
redesign existing labs or introduce a new runtime architecture.

## 1. Preflight and ownership

- [ ] Confirm that the source is a **lab**: it teaches one interactive concept and
  belongs in the catalogue. Record its syllabus coverage, topic, short card
  description, and the interaction the card should depict.
- [ ] Preserve the source as one document at
  `public/labs/<slug>.html`. Current labs such as
  `public/labs/binary-numbers.html`, `public/labs/fetch-decode-execute.html`,
  and `public/labs/memory-management.html` contain their own inline `<style>`
  and `<script>` blocks. Do not split a lab into React components, a route, or
  shared assets as part of ingestion.
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
- [ ] Link `/labs/lab-frame.css` after the document's inline `<style>` block.
  It supplies the standard background, 1200px canvas cap, and safe space below
  the host overlay. Do not duplicate or override those frame rules in a lab.
- [ ] Keep the lab's own `<main>` as the document boundary. Do not add a second
  Examplicity header or footer inside the iframe; the host renders that chrome
  once above every lab.
- [ ] Use `class="binary-lab"` on `<body>` only for a similarly compact lab
  approved to use Binary's 820px canvas exception. New labs otherwise use the
  shared standard width.
- [ ] Base wide multi-column layout transitions on the named `lab-canvas`
  container rather than the browser viewport, so they respond to the shared
  canvas cap as well as narrow screens.
- [ ] Do not add host messaging, parent-frame state, or a second navigation
  system without explicit architecture approval. The current integration is
  only the manifest `href` plus the iframe in `app/catalogue.tsx`.

The host owns the brand, “Back to labs”, GitHub, and license links. Catalogue
cards link to the canonical `/labs/<slug>.html` document, while an ordinary click
opens the same document in the existing iframe shell. The selected syllabus view
remains at `/computer-science/<exam>` with `?lab=<slug>` as transient UI state.
The host's Download action packages a copy of the source document with inline
standalone Examplicity header/footer chrome. That generated chrome belongs only
to the downloaded artifact; do not add it to the source document or its iframe.

## 3. Manifest registration

Add one `Lab` object to `labs` in `app/labs.ts`. `Lab` is an `Activity` plus
`topic`, `format`, and `exams`, so a catalogue entry must contain all of these
fields:

```ts
{
  slug: 'example-lab',
  title: 'Example Lab',
  description: 'One short sentence describing the learner-visible experiment.',
  topic: 'Data representation',
  format: 'Visual experiment',
  kind: 'lab',
  exams: ['0478', '9618'],
  href: '/labs/example-lab.html',
}
```

- [ ] `slug` is unique, lowercase ASCII, and kebab-case. It is the basename of
  the file and the value used for transient shell state, so these three values
  must agree exactly: `example-lab`, `public/labs/example-lab.html`, and
  `/labs/example-lab.html`. Do not use spaces, uppercase, or a second spelling.
- [ ] Use only the exam codes declared by `exams` in `app/labs.ts`: `'0478'`
  and/or `'9618'`. The `exams` array controls whether the card appears when a
  learner selects that syllabus; it is not decorative copy.
- [ ] Reuse the current topic labels and capitalization when the content fits:
  `Data representation`, `Networks & communication`,
  `Processors & memory`, and `System software`. `app/catalogue.tsx` groups by the
  exact `topic` string, so do not create accidental spelling/case variants.
- [ ] Keep `format` short and card-sized, following existing examples such as
  `Practice`, `Visual experiment`, `Signal lab`, `Protocol lab`,
  `CPU simulator`, or `OS simulation`.
- [ ] Make `title` match the document's purpose and `description` concrete
  about what the learner can change, observe, or compare. The page renders
  these values directly in the card, loading screen, and iframe title.

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

- [ ] Confirm the three-way path contract and changed-file scope:
  `public/labs/<slug>.html`, its `app/labs.ts` entry, and its
  `app/lab-icon.tsx` case. Confirm the HTML links `/labs/lab-frame.css` once and
  contains no duplicate Examplicity shell markup.
- [ ] From `cambridge-labs`, run:

  ```text
  npm run lint
  npm run build
  git diff --check
  ```

- [ ] With `npm run dev`, test the selected exam tabs and confirm the new card
  appears only for its `exams`, under the exact `topic`, with the intended
  `format` and SVG. Confirm the card links directly to `/labs/<slug>.html`, then
  open it from `/computer-science/<exam>?lab=<slug>` and verify the loading
  screen resolves and the iframe loads the intended HTML.
- [ ] Exercise the lab's main controls, reset/empty/error paths, keyboard
  paths, mobile layout, and shell links. Check the browser console for errors.
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
