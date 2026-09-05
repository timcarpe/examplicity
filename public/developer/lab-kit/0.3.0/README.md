# Lab Kit

`@examplicity/lab-kit` is a small, dependency-free browser runtime and CSS
primitive set for interactive labs. It supplies capabilities that recur across
subjects while leaving the visual model, content, state machine and learning
sequence in each lab.

The browser entry point is `src/lab-kit.js`. It assigns one namespaced API to
`globalThis.LabKit`; it does not create a module loader or make network calls.
The CSS entry point is `src/lab-kit.css`. Both files are intended to be inlined
by a lab build so the final HTML remains standalone.

## Runtime surface

```js
const { dom, numeric, rng, status, history, svg, animation, direct } = LabKit;
```

- `dom.get`, `dom.all`, `dom.byId`, `dom.require`, and `dom.on` provide small
  lookup and event helpers without imposing a component tree.
- `numeric.parse`, `clamp`, `lerp`, `inverseLerp`, `round`, and `format` cover
  common displayed-value and bounded-control work.
- `rng.create(seed)` returns deterministic `next`, `float`, `int`, `pick`, and
  non-mutating `shuffle` methods. Pass an explicit seed when a scenario must be
  reproducible.
- `status.set`/`announce` updates a supplied live region with `role=status`,
  `aria-live`, `aria-atomic`, and optional `aria-busy`; `status.ensure` creates
  a visually hidden region in a document-like root.
- `history.create({ limit, initial, clone })` provides bounded record, undo,
  redo, reset and inspection operations for learner evidence or revisions.
- `svg.point(svg, event)` converts pointer/touch client coordinates into local
  SVG coordinates, using the screen CTM when available and a viewBox fallback
  otherwise.
- `animation.create({ duration, onFrame, onComplete, reducedMotion })` provides
  start, pause, stop, reset, seek and completion state. Inject
  `requestFrame`/`cancelFrame` in tests or special runtimes.
- `direct.keyboardAdjustable(target, options)` gives a direct-manipulation
  handle arrow/Home/End/Page controls, bounds, step changes, value ARIA and a
  `destroy` method. Pair it with pointer dragging against the same state.
- `direct.movableCompletion(card, bounds, options)` keeps a short completion
  card inside its visible workspace. Its default handle is the living guide's
  `[data-dialog-drag]` / `.dialog-move`; it uses pointer dragging, arrow keys
  and Shift+arrow keys, and returns `move` and `destroy`.

## Publication declarations

Declare the two entrypoints in authoring source. Do not point a delivered lab
at this package at runtime:

```html
<link rel="stylesheet" href="./lab-kit.css" data-lab-resource="lab-kit.css">
<script src="./lab-kit.js" data-lab-resource="lab-kit.js"></script>
```

The live-site repository vendors a hash-pinned release and owns the compiler
that replaces these declarations with marked inline blocks. The creation kit
owns the shared source; the final monolithic HTML has no runtime package, sibling
checkout or network dependency.

Regenerate the release manifest after changing package files:

```text
npm run manifest
```

The manifest records bytes and SHA-256 hashes for the package sources. It omits
itself to avoid a circular hash. A lab package should copy the kit version and
the relevant file hashes into its own build provenance.

Agents start at `agent/README.md` and must consume the complete listed release
context before authoring. Those instructions are part of the release manifest.

## CSS capability contract

Classes are namespaced with `lab-kit-` and are intentionally primitives:
surface, operated canvas, stack, cluster, grid, field, control, status, scroll
and SVG sizing. They do not prescribe a lab’s page rail, panel order or diagram
geometry. Their defaults map to the living v3 guide tokens; do not introduce a
second palette in a lab. A lab may map the `--lab-kit-*` aliases to the current
shared tokens when the site supplies them.

The [living design guide](https://www.examplicity.org/developer/design-language.html)
owns activity-bar, working-toggle, stage-marker, concept-surface and completion
card markup and CSS. Use its copyable stylesheet and markup exactly. The kit
does not provide alternate variants for those components.

The reviewed starter stylesheet is published at
`https://www.examplicity.org/developer/design-language.css`. When an authoring
or publication route embeds that stylesheet, load it after the kit CSS so the
guide takes precedence. Do not leave either URL as a delivered runtime
dependency: the publication compiler embeds approved resources into the final
standalone lab.

Use `.lab-kit-canvas` on a primary operated visual region when it needs the
shared light surface, line, radius and inset definition. Add
`data-grid="square"` only when a quiet construction grid helps the learner read
position. The primitive deliberately sets no width, height, aspect ratio,
layout or overflow; those remain consequences of the lab's model. Use
`.lab-kit-svg` only when an SVG should scale to its container.

SVG geometry stays local. Give every instructional SVG a stable `viewBox`, a
useful accessible name and description, and visible non-colour evidence for
important state. Interactive handles need pointer and keyboard paths that
mutate the same model state, visible focus, bounded coordinates and recovery.
Use `svg.point` for coordinate conversion rather than deriving scale from page
pixels. Do not make a primary visual scroll merely to preserve an arbitrary
authored width; fit or responsively recompose it unless panning is itself part
of the learning operation.

Surface primitives are opt-in, not wrappers to apply at every DOM level. Start
with one meaningful frame. Let self-describing objects such as nodes, servers
or protocol layers occupy that field directly, and add a nested border or
background only when it conveys containment, grouping, hardware, clipping or
another instructional relationship.

`.lab-kit-work` supplies a stable grid for a persistent working/evidence
region. Its idle items use spacing rather than a decorative rail. A checked
`.lab-kit-work-item` receives a full semantic surface without prescribing the
item's internal layout. Set `data-state="needed"`,
`data-state="mistake"` or `data-state="correct"` as the learner edits a
meaningfully checkable response. Include `.lab-kit-work-state` with a visible
text label and a `.lab-kit-work-mark` span; the shared CSS renders a red `×`
for mistakes and a green `✓` for correct work. Needed work uses the shared
yellow treatment. These states supplement rather than replace concise text and
accessible status announcements. Keep domain-specific validation local.

```html
<section class="lab-kit-work" aria-label="Working and evidence">
  <div class="lab-kit-work-item" data-state="needed">
    <!-- The lab-specific working, evidence or input stays here. -->
    <span class="lab-kit-work-state" role="status">
      <span class="lab-kit-work-mark" aria-hidden="true"></span>
      <span>Work needed</span>
    </span>
  </div>
</section>
```

Update both `data-state` and the visible state text from the lab's own input
handler. Do not put generic correctness rules in the kit: only the lab knows
when a response is complete enough to be a real mistake.

When the guide's short completion card is appropriate, use its labelled
`.dialog-move` button with `data-dialog-drag` and call
`LabKit.direct.movableCompletion(card, workspace)`. Keep learner work,
predictions and evidence outside the card.

## Boundary

Keep syllabus claims, model rules, generated scenarios, correctness predicates,
visual renderers, domain-specific working and authored progression in the lab.
Use this kit for repeated mechanics and accessibility affordances only. The
kit cannot decide what a learner should notice, what counts as evidence, or how
an authentic system should behave.


## Shared design components

`src/lab-design.css` is the canonical implementation for the reviewed design refinements. Include it **after** base kit/tokens and local layout styles. Inline it in exported HTML; never leave a network stylesheet dependency in a downloaded lab. The site compiler expands `<!-- LAB_DESIGN_COMPONENTS -->` at the end of the source head into this stylesheet. Existing kit 0.2.1 runtime pins do not change.

New labs use `.lab-toggle` with `data-kind="working|exam|mode"`, `.lab-action` with optional `data-priority="primary"`, `.lab-work-card` with `data-work-state="needed|good|bad|reference"` and `data-interacted="true"`, `.lab-math-surface`, `.lab-stage-surface`, `.lab-stage-heading` and `.lab-guide-target`. Use native button/input state and update the attributes from real learner state. Stop attention on pointer/keyboard interaction, reset for a new activity, and keep geometry/learning logic local. The stylesheet includes compatibility selectors for the six reviewed labs.

The living guide documents visual intent. Change the shared stylesheet for reusable visual changes; keep only layout/model-specific adapters in a lab.
