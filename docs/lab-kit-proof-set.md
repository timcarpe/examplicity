# Lab kit proof set

This record began with seven architectural publication-source snapshots and a
sixteen-lab backward-application wave (W1). A second wave has now migrated the
remaining 23 live labs, so all 46 current labs are source-owned under
`labs-src` and compiler-published to `public/labs`. Together they deliberately
span guided learning, phenomenon observation, scaffolded mission and hybrids.
Their layouts and learning models remain local; the common changes are the
shared-resource declarations, publication contract and safe helper adoptions
described below.

## The seven architectural proofs

| Snapshot | Structural reason for inclusion | Main interaction / learning loop | Kit surface consumed |
| --- | --- | --- | --- |
| `labs-src/mathematics/prime-factors-hcf-lcm/lab.html` | Compact guided-learning lab with a deterministic factor-row workflow. | Generate a pair, build factor rows, then check HCF/LCM reasoning and advance. | `LabKit.dom.byId` for `$`; `lab-kit.css` and `lab-kit.js`. |
| `labs-src/mathematics/coordinate-distance-midpoint-perpendicular/lab.html` | Geometry workbench combining an SVG construction, numeric working, and direct manipulation. | Drag or keyboard-move points, observe distance/midpoint/perpendicular consequences, and submit working. | `LabKit.dom.byId` for `$`; `LabKit.numeric.clamp` replaces the exact local numeric clamp; `lab-kit.css` and `lab-kit.js`. |
| `labs-src/mathematics/vector-routes-resultants/lab.html` | Guided-to-mission bridge: reusable vector commands, staged routes, animation, and working-level progression. | Move/scale vectors, assemble a route, predict its finish, run it, then explain components and magnitude. | `LabKit.dom.byId` for `$`; `LabKit.numeric.clamp` supplies the exact local clamp; `lab-kit.css` and `lab-kit.js`. |
| `labs-src/computer-science/binary-floating-point/lab.html` | Phenomenon-observation lab with linked SVG/data views and tabs rather than a single answer form. | Change binary/floating-point values, compare representations, and observe precision/rounding effects. | `LabKit.dom.byId` for `$`; `lab-kit.css` and `lab-kit.js`. |
| `labs-src/computer-science/dijkstra-a-star-graph-search/lab.html` | Phenomenon observation organized as an explicit graph-search state machine. | Select/predict the next graph step, run the search, and compare Dijkstra with A* state and path evidence. | `LabKit.dom.byId` for `$`; `lab-kit.css` and `lab-kit.js`. |
| `labs-src/computer-science/automated-system-control-flowcharts/lab.html` | Scaffolded mission with a palette, draggable flowchart nodes, staged tests, and animated execution. | Build a control flow, run the simulated system, inspect the failure/success state, and revise. | `LabKit.dom.byId` for `$`; `LabKit.numeric.clamp` supplies the exact local clamp; `lab-kit.css` and `lab-kit.js`. |
| `labs-src/computer-science/python-programming-practice/lab.html` | Largest offline-runtime case: editor, lesson data, progress state, and embedded Skulpt execution. | Edit Python, run tests against lesson-specific prompts, inspect feedback, and progress through lessons. | `lab-kit.css` and `lab-kit.js`; no local by-id/clamp helper was safely substituted because its DOM map and embedded runtime are lab-specific. |

The computer-science set has two useful subfamilies. Binary floating point
and graph search are observation-led: the learner manipulates or predicts a
visible phenomenon, then compares the model's changing state with evidence.
Automated control flow is a scaffolded mission: the learner constructs an
artifact under constraints, executes it, and iterates from diagnostic feedback.
Python programming is also mission-like, but its embedded interpreter and
lesson/test payload make it a separate runtime-heavy variant.

## W1 backward-application wave

W1 registers the following sixteen live labs for source ownership and
compiler-backed publication. It is a migration wave, not a claim that every
lab should use the same interaction model or helper surface.

| Subject | W1 labs | Migration focus |
| --- | --- | --- |
| Computer science | `binary-numbers`, `bitmap-compression`, `csma-cd`, `database-normalisation`, `dns-web-page-retrieval`, `encryption-in-data-transmission`, `parity-arq`, `process-states-scheduling`, `software-stack`, `sound-sampling`, `tcp-ip-encapsulation` | Observation and scaffolded network/data-system activities; retain canvas/audio and drag-specific behavior locally. |
| Mathematics | `histogram-area-cumulative-distribution`, `ratio-concentration-flow-rate`, `repeated-percentage-change`, `right-triangle-ratio-invariance`, `rounded-measurements-bounds` | Guided learning and quantitative modelling; adopt only helpers with exact semantic equivalence. |

Helper adoption stays selective. A repeated `$` lookup, numeric clamp, SVG
coordinate conversion, seeded RNG, or animation scheduler may move to the kit
only when its contract is demonstrably identical across the adopting labs.
Canvas/audio, editor state, lesson data, SVG geometry, validation rules, and
mission-specific animation remain lab-owned. This keeps W1 useful for
backward application without turning the compiler into a layout or behavior
framework.

## W2 full-catalogue migration

W2 registers the remaining 23 live labs without turning their existing page
compositions or domain logic into kit API.

| Subject | W2 labs | Migration focus |
| --- | --- | --- |
| Computer science | `assembly`, `combinational-logic-circuit-design`, `data-transmission-methods`, `fetch-decode-execute`, `huffman-rover`, `ipv4-subnetting`, `memory-management`, `network-topology`, `packet-switching`, `translator` | Preserve application-like tools, construction missions and simulations while making network placement and physical-routing surfaces keyboard operable. |
| Mathematics | `circle-theorem-constraint-network`, `motion-graph-rate-area`, `non-right-triangle-solution-constraints`, `recurring-decimals-fractions`, `scatter-correlation-prediction`, `sequence-patterns-differences`, `set-membership-operations`, `solid-surface-volume-tradeoffs`, `straight-line-coordinates-equations`, `three-dimensional-line-plane-trigonometry`, `time-zone-timetable-constraints`, `transformation-order-invariants`, `trigonometric-function-periodicity-solutions` | Preserve varied guided, observational and mission structures while adding keyboard parity to circle construction and the 3D perspective check. |

The migration also validates every executable source script and retains
keyboard paths for direct visual controls. These checks protect the full
catalogue contract; they do not imply that every lab should adopt the same
helpers or interaction design.

## Shared declarations and compilation contract

Every snapshot declares the same two local resources immediately before the
lab code that consumes them:

```html
<link rel="stylesheet" href="./lab-kit.css" data-lab-resource="lab-kit.css">
<script src="./lab-kit.js" data-lab-resource="lab-kit.js"></script>
```

The declarations are intentionally source-level and relative. The publication
compiler resolves them from the vendored, hash-pinned lab-kit release and
inlines the CSS and JavaScript into the final downloadable HTML, leaving no runtime dependency on
the source tree. `labs-src` is therefore the maintainable input; generated
`public/labs` files remain compiler outputs and should not be hand-edited.

Reusable boilerplate should own the resource manifest/inlining contract,
tokens and shared frame styles, resilient buttons/forms/focus states, small
DOM helpers such as `LabKit.dom.byId`, numeric helpers such as `LabKit.numeric.clamp`, and
common reduced-motion/viewport utilities. Lab-specific code should retain the
lesson copy, data payloads, SVG scene geometry, state machines, validation
rules, animation choreography, and embedded runtimes shown by these examples.
The complete live catalogue now tests that boundary across deliberately varied
implementations.

## Eighth science proof

Lab Creation contains the separate `weather-satellite-antenna` source package.
It consumes the same kit plus immutable vendored releases of this repository's
publication profile and compiler to produce an exact self-standing preview. That older lab is a
configured phenomenon: continuous physical tuning followed by a bounded
satellite-pass experiment. It needed no science page template. Backward
application reused DOM, numeric, SVG, animation and keyboard-adjustment
capabilities while leaving its visual composition and antenna/reception model
local.

The canonical kit remains owned by Lab Creation. This repository owns the
compiler, vendors the exact kit release it supports and generates live
monoliths. Neither normal build imports the other repository's working tree.
