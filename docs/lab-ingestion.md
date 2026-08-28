# Future-lab ingestion checklist

This is the operating contract for adding an approved Cambridge Computer Science
lab to Examplicity. Keep the change small: a lab is a self-contained static HTML
document, one catalogue entry, and one card drawing. Do not use this checklist to
redesign existing labs or introduce a new runtime architecture.

## 1. Preflight and ownership

For a package from `Lab Creation/Staged Labs`, first run the website-owned,
read-only preflight from this repository:

```text
npm run labs:preflight -- "../Lab Creation/Staged Labs/<slug>"
```

It never copies or modifies the lab. It checks `manifest.json`,
`qa/report.json`, and `dist/<slug>.html`; passing QA; matching slugs/titles;
allowed subject and syllabus codes; complete monolithic HTML; and the current
catalogue, iframe/download, frame, and style-sync architecture signatures. It
is a focused sanity check, not a second QA system. Record the Lab Creation
commit and staged package path before copying. The website Git commit that adds
the ledger entry is the integration record. If a website signature fails, stop
and update this contract deliberately; do not weaken the preflight.

- [ ] Confirm that the source is a **lab**: it teaches one interactive concept and
  belongs in the catalogue. Record its syllabus coverage, topic, short card
  description, and the interaction the card should depict.
- [ ] Review the package at its recorded Lab Creation commit. Preserve its
  critical syllabus outcome, real learner action and visible consequence,
  primary reference relationship, deliberate non-goals/abstractions, distinct
  gap from existing labs, and concise title/copy direction. These are found in
  the manifest, QA report, and the staged research brief/evidence where
  supplied; the current rollout is summarized in Lab Creation's
  `docs/staged-lab-goals.md` at that commit. Website adaptation may change the
  shell, taxonomy, card copy, or card SVG, but must not alter those learning
  relationships. Stop for review if it would.
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

The host (`app/page.tsx`) opens the catalogue `href` in a full-viewport iframe.
The lab owns its teaching UI and behavior; the host owns the catalogue, loading
screen, query-string selection, iframe, and persistent header/footer overlay.
Keep those responsibilities separate.

- [ ] Keep a complete document beginning with `<!doctype html>`,
  `<html lang="en">`, charset, viewport, and a meaningful `<title>`.
- [ ] Keep lab-specific CSS and JavaScript inside that HTML. A static file in
  `public/labs` does not receive `app/globals.css` and must not depend on a
  React component or an undocumented host callback.
- [ ] A staged artifact has no website frame link or marker. After copying its
  approved `dist/<slug>.html`, add exactly one
  `<link rel="stylesheet" href="/labs/lab-frame.css">` after its local inline
  `<style>` block. This bounded website-derived edit lets
  `npm run labs:styles` replace the link with the canonical embedded frame.
  Do not change instructional CSS or JavaScript while doing so.
- [ ] The shared frame supplies the standard background, 1200px canvas cap, and
  safe space below the host overlay. Do not duplicate or override those frame
  rules in a lab.
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
  only the catalogue `href` plus the iframe in `app/page.tsx`.

The host owns the brand, “Back to labs”, GitHub, and license links. The host's
canonical lab URL is `/?lab=<slug>`; the lab should not duplicate those links or
rewrite that outer URL itself. The host's Download action packages a copy of the
final website document with inline standalone Examplicity header/footer chrome
and an absolute canonical lab link. That generated chrome belongs only to the
downloaded artifact; do not add it to the source document or its iframe rendering.

## 3. Catalogue registration

Add one `Lab` object to `labs` in `app/labs.ts`. `Lab` is an `Activity` plus
`subject`, `topic`, `format`, and `exams`, so a catalogue entry must contain all
of these fields:

```ts
{
  subject: 'computer-science',
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
  the file and the value used in the outer query string, so these three values
  must agree exactly: `example-lab`, `public/labs/example-lab.html`, and
  `/labs/example-lab.html`. Do not use spaces, uppercase, or a second spelling.
- [ ] Use `subject: 'computer-science'` and only the exam codes declared by
  `exams` in `app/labs.ts`: `'0478'` and/or `'9618'`. The subject/syllabus
  picker filters records by those fields, so `exams` is not decorative copy.
- [ ] Reuse the current topic labels and capitalization when the content fits:
  `Data representation`, `Networks & communication`,
  `Processors & memory`, and `System software`. `app/page.tsx` groups by the
  exact `topic` string, so a new topic label or spelling/case variant requires
  approval.
- [ ] Keep `format` short and card-sized, following existing examples such as
  `Practice`, `Visual experiment`, `Signal lab`, `Protocol lab`,
  `CPU simulator`, or `OS simulation`.
- [ ] Make `title` match the document's purpose and `description` concrete
  about what the learner can change, observe, or compare. The page renders
  these values directly in the card, loading screen, and iframe title.

### Translator is a special tool with a `Lab` record

`translator` in `app/labs.ts` is currently typed as a `Lab`, has
`kind: 'tool'`, and is included in `labs`. It has the same `subject`, `topic`,
`format`, and dual-syllabus fields as a catalogue record, while its `kind`
allows the shell to name it as a tool when loading. Do not reclassify it,
remove it from `labs`, or change its special-tool behavior while importing a
lab.

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
  surrounding card button in `app/page.tsx` supplies the accessible name
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
  `app/lab-icon.tsx` case. Confirm the HTML links `/labs/lab-frame.css` once
  before sync and contains no duplicate Examplicity shell markup.
- [ ] Run `npm run labs:styles` after the frame link is added. Its embedded
  output is a derived website artifact; do not calculate or record hashes for
  it. Each ledger record needs the upstream Lab Creation commit/package path,
  website path, import date, and rollout batch. The website Git commit that
  contains the ledger entry provides the integration provenance.
- [ ] Update `CHANGELOG.md` for the approved import batch only, naming the
  learner-facing labs and any approved topic addition. Do not describe planned
  labs as released.
- [ ] From `cambridge-labs`, run:

  ```text
  npm run lint
  npm run build
  git diff --check
  ```

- [ ] With `npm run dev`, confirm the selected subject and exam controls show
  the new card under the exact `topic`, with the intended `format` and SVG.
  Open it by clicking the card or directly at `/?lab=<slug>`; verify the
  loading screen resolves and the iframe loads the intended HTML.
- [ ] Browser-smoke the integrated document: carry out its primary learner
  action, observe its central consequence, and confirm one keyboard path and
  narrow layout. Check Download only when the imported document or download
  shell changes. This is not a combinatorial or cross-browser test programme.
- [ ] If the lab cannot remain monolithic, needs shared runtime code, changes
  the host/iframe contract, adds dependencies, or requires a new exam/topic
  convention, stop and request approval for that specific architecture change.

## 7. Approval gate and rollback

Submit the proposal/source for content and syllabus review before integration,
then submit the bounded integration diff for review with evidence of the
focused validation checklist above. Approval means the reviewer has confirmed:

1. the interaction teaches the stated Cambridge topic and exam coverage;
2. the HTML remains self-contained and the shell/lab boundary is respected;
3. the catalogue paths, subject/topic/format/exam values, accessibility
   behavior, and mechanics-based card SVG are correct; and
4. preflight, lint, build, route/iframe loading, style synchronization, and
   the primary browser smoke pass.

Do not merge or publish when any item is unresolved. Record the exact blocker
or requested architecture decision instead of silently changing the contract.
If a completed batch needs rollback, revert its public HTML, `Lab` entry, icon
case, import-ledger record, and changelog entry together. Never alter the
upstream staged package during rollback; use one Git revert for the bounded
website batch.
