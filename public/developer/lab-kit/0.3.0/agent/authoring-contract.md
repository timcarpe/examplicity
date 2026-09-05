# Layout-agnostic lab authoring contract

The kit is a capability shelf, not a design to fill in. Do not infer a header,
panel sequence, number of work boxes, mission strip, stepper or card grid from
this package or from a proof example.

## Start with the learning relationship

State one testable loop before choosing interface structure:

```text
learner action → visible model change → consequential evidence → next decision
```

Use guided learning, phenomenon observation and scaffolded mission as lenses,
not mutually exclusive templates. A science lab may be a configured phenomenon
with continuous tuning and a bounded experimental run. Hybrids are valid when
the interaction requires them.

Assistance may remove a written calculation or reveal working, but it must not
remove the learner's operation, answer, prediction, choice or other meaningful
action. Every fresh problem starts incomplete at every assistance level and can
complete only after a learner-triggered state transition.

The core interaction must operate the represented relationship, not merely
authorize a predetermined transition. A scripted multiple-choice stepper whose
answer reveals the next authored state is not a lab when the underlying model is
only a readout. Apply the replacement test: if a worked animation plus ordinary
questions would preserve the experience, reject the interaction. Include at
least one concept-appropriate perturbation, counterfactual or construction
path so choices can produce differing evidence and support revision. Discrete
systems may use finite cases rather than continuous controls.

Prediction is selective. Ask for a prediction at a consequential branch,
counterfactual or boundary; do not turn every transition into a quiz.

## Select, do not adopt wholesale

Use only capabilities the lab actually needs. The kit may supply DOM/numeric
mechanics, deterministic variation, live status, bounded history, SVG
coordinates, animation lifecycle, keyboard-equivalent adjustment and
namespaced CSS primitives. It does not supply subject rules, correctness,
scoring, generated cases, authored guidance, diagram geometry or progression.

Proof examples demonstrate compatibility with varied structures. Never copy
their DOM hierarchy or restyle a new subject to resemble them merely to show
kit use.

## Frame only meaningful boundaries

Use one visual frame by default. Do not place a bordered or tinted container
around elements that already define themselves through shape, spacing or
semantic colour. Add another frame only when its boundary communicates a real
relationship such as grouping, containment, hardware, clipping or an operated
region. A sequence of self-describing nodes should normally occupy the parent
field directly rather than sit inside a decorative panel, canvas and card at
the same time.

The publication frame owns the manifest header, title and subtitle. Standalone
source may provide replaceable title/subtitle slots, but must not build them
into a hero grid, decorative aside or authored body chrome. Approve against a
live-site staged compilation; an isolated resource-inline preview proves only
offline mechanics. At 1366 x 768, keep the dominant model and first meaningful
operation visible together where physically feasible, removing chrome before
shrinking the model or instructions. Reject generic stage rails, steppers,
progress counts, pills and separate answer docks when they only narrate
progress or validation; retain them only for a real domain boundary.

Core instructional and operable labels use the living guide's 14 px body, 12 px
short-label and 11 px secondary-annotation defaults. Microtype is for
nonessential metadata only.

The [living design guide](https://www.examplicity.org/developer/design-language.html)
is the visual authority. Copy its activity bar, working toggle, stage markers,
concept surfaces and completion-card markup and stylesheet exactly; the kit
does not offer alternate variants. Do not create competing palette values or
decorative feedback rails. Use an idle working area with spacing, then a
complete yellow/red/green surface only when a working item has meaningful
state. Concept backgrounds may use only a direct alpha version of the
approved concept colour, such as `#7563a74d` for violet, when they identify a
meaningful model grouping.

The reviewed starter stylesheet is
`https://www.examplicity.org/developer/design-language.css`. When the
authoring or publication route embeds it, load it after the kit CSS so the
guide takes precedence. The delivered lab remains standalone: do not leave it
as a runtime network dependency.

When `None`/`Some`/`All` working is meaningful, place the compact neutral
toggle in the top activity region. If learning has real stages, small progress
markers may sit immediately beside it and reveal current or completed work on
hover, focus or tap. Do not show a numeric stage count, future answers or a
generic progression rail. The lab owns the support and stage semantics.

A short completion card may be movable within the visible workspace so the
learner can inspect the completed model. Use the guide's `.dialog-move` handle
with `data-dialog-drag`, then bind it with `LabKit.direct.movableCompletion`.
Never put learner work, predictions or retained evidence in that card.

## Operated surfaces and SVG

`.lab-kit-canvas` is an opt-in light surface for a primary diagram, model or
manipulative. It is not a prescribed canvas size or layout. Keep domain
geometry, semantic colours, aspect ratio and responsive composition local; use
`data-grid="square"` only when a construction grid carries useful positional
information. A primary operated surface should fit its region without an
internal scrollbar unless panning is itself an intentional learner operation.

For SVG models, provide a stable `viewBox`, accessible title/description and
visible state that is not colour-only. Pointer and keyboard input must update
the same model coordinates. Keep handles focusable with an obvious focus state,
bound movement to the valid model and preserve inspectable evidence under
reduced motion. `.lab-kit-svg` supplies responsive sizing and `LabKit.svg.point`
supplies coordinate conversion; neither decides diagram geometry or meaning.

## Source and package boundary

A source package should contain its editable source, tests, curriculum/research
record and QA evidence. Its HTML declares the exact shared release resources:

```html
<link rel="stylesheet" href="./lab-kit.css" data-lab-resource="lab-kit.css">
<script src="./lab-kit.js" data-lab-resource="lab-kit.js"></script>
```

Place the runtime declaration before the first script that uses `LabKit`.
Relative URLs are development declarations, not delivered dependencies. Record
kit name, version and hashes in the package provenance. Do not paste a mutable
copy of the kit into authored source or point at a CDN.

The live-site compiler resolves a supported vendored release, applies
site-owned metadata/frame transforms and emits the final monolithic HTML. The
creation package does not own that publication compiler.

## Minimum evidence

Test the actual learning state, not only DOM presence:

- the primary action changes the visible model and its consequence;
- every assistance level starts incomplete and still requires a meaningful
  learner action before completion;
- reset/recovery and invalid/empty paths remain coherent;
- pointer-only surfaces have an equivalent keyboard path;
- consequential changes are available to assistive technology;
- seeded scenarios can be replayed when variation affects QA;
- reduced motion preserves inspectable state;
- the source has no hidden network, telemetry or persistence behavior;
- the final compiled preview has no runtime CSS/script dependency.

If an agent needs a new shared capability, keep it local for the first lab.
Propose kit promotion only after the same mechanic recurs in a genuinely
different learning experience.

## Handoff

Codex pilots follow `docs/codex-authoring-workflow.md`. ChatGPT Labs receives
the shared kit and one idea packet and returns only the requested lab HTML. A
mechanically valid artifact is not approved. Human review is required before
integration, which returns conceptual or interaction defects to the creator
instead of redesigning them during ingestion.
