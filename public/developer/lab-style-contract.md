# Lab styling reference

Purpose: consistent presentation without changing the learning model. This is a design reference, not a workflow or task-scope policy.

## Sources and ownership

| Resource | Purpose |
| --- | --- |
| `packages/lab-kit/src/lab-design.css` | Canonical shared components and legacy adapters |
| `packages/lab-kit/src/lab-design.js` | Shared attention, hints, dragging and settings layout |
| `examplicity-living-style-guide-v3.html` | Interactive visual examples; loads the shared stylesheet |
| Site `labs-src/<subject>/<slug>/lab.html` | Lab geometry, state, interactions and explanatory content |
| Site `lab-contracts/<subject>/<slug>.lab.json` | Observed learner loop and implementation map; separate from exam alignment |

Prefer shared components for recurring features. Keep scientific calculations, constraints, geometry and meaningful layout differences local. Do not copy generated styles into a second source. Publication embeds declared resources into the standalone HTML; downloaded labs must retain their styling and operation offline.

## Layout and hierarchy

- Preserve intentional relationships: paired diagrams, sender/network/receiver, code/stack/output, apparatus/evidence. A right sidebar is useful, not compulsory.
- Use one goal bar above the workspace. Task at left; additional settings, Working, Exam and checkpoints at right, in that order. Omit controls the lab does not support.
- Put model-specific tools near the model, below the goal: playback, scenario selection, construction tools, reset. A lone reset needs no full-width boxed toolbar. Use an existing model heading or reserved corner clear of the visual.
- A visible tool container has rounded corners and padding; it must not overlap its parent panel edges. `data-lab-reset-target` identifies a stable destination for an existing reset button; its handlers are retained.
- Keep calculations and evidence beside the model when practical, then below on narrow screens. Preserve their order across assistance levels. Trade unused space for readability, not extra containers.
- Fit operated canvases without internal scrolling or clipped content. Let the page grow vertically. Editors, consoles, logs and data tables may retain useful scrolling.
- Account for the actual container width, not just the browser width. The site supplies its outer rail and manifest header; do not rewrite generated chrome locally.

## Type and spacing

| Role | Default |
| --- | --- |
| Goal | 16px regular, 1.5 line height, approved blue ink `#315b91` |
| Card/section heading | 15px regular, 1.4 line height |
| Working, explanations, values | 14px regular, about 1.45 line height |
| Short labels and controls | 12px regular |
| Secondary annotations | 11px regular |
| Code and console | 14px monospace; editor layers share 24px line height |

Use the shared font tokens. Avoid bold grey microtitles, all-caps labels and decorative tracking. Diagram labels must be readable at their rendered size; changing a viewBox must not silently shrink them. Reserve space or shorten wording before reducing type. Keep meaningful mathematical notation.

Typical working cards use 12px padding, 8–12px corners and 10px gaps. A heading needs a small gap before its content. Inside a card, separate explanations with spacing rather than another border. Avoid fixed heights that clip text or controls.

## Colour and material

Use the shared `--lab-*` palette, including matching surface, line and ink tokens. Colour has a purpose:

| Meaning | Treatment |
| --- | --- |
| Unfinished learner work | Needed yellow surface and complete border |
| Wrong attempt | Mistake red surface/border and x |
| Correct attempt | Success green surface/border and check |
| Action or current execution | Site blue |
| Supplied/reference information | Neutral or concept material; not success green |
| Object/process identity | Consistent concept colour plus a label or shape |

Keep identity distinct from correctness. For example, use blue/violet/amber for constructions whose successful alignment becomes green. Preserve data colours such as painted pixels and existing meaningful device artwork.

Concept backgrounds are direct tints of approved bases. For example, violet `#7563a7` at 30% is `#7563a74d` over white. Use the opaque `*-fill` equivalent inside tinted parents to avoid double tinting. Small formula surfaces typically use 20% violet. White number tiles inside tinted model regions preserve contrast. Use flat UI fills; do not add decorative gradients. Meaningful instrument shading is different from panel decoration.

## Settings and actions

### Working and Exam

- Compact rounded rectangles: 10px track corners, 7px segment corners, 3px inset, 1px neutral border and `0 1px 3px rgba(29,29,31,.08)` shadow.
- Regular 12px options, at least 32px segment height. Selected segment: charcoal `#1d1d1f`, white text. Light neutral track.
- Center only **Working** or **Exam** above the track: regular 11px, about 8px separation. No colon, explanatory line or label box.
- Working is **None / Some / All**. None reveals calculations; meaningful interaction is still required. Preserve existing availability and mode-specific state. Do not invent assistance levels or an exam toggle.
- Expose selection through `aria-pressed` or the appropriate radio semantics. New markup follows visual order; compatibility adapters preserve existing event owners.
- Offers say **Try some working** or **Try all working**. Qualification-specific working is only enabled where its content is implemented and verified.

### Buttons and dropdowns

Primary actions, including New question, use blue with white text. Secondary actions, including Reset, use white with blue text. Grey is occasional differentiation, not the default. Use 8px corners, a thin border, subtle shadow, regular 12px labels and comfortable padding. Typical actions are 40px high; compact model resets may be 34px.

Disabled buttons use `#eef1f3` background, `#6e6e73` text, `#d2d2d7` border, no shadow and native disabled semantics. White/blue is an enabled secondary state. Field focus darkens its existing border; no extra black ring. Keep visible keyboard focus for buttons.

Discrete choices use the shared native select: regular text, chevron, border and shadow. Where `appearance: base-select` is supported, the revealed menu has a white surface, 18px corners, 7px inset and rounded option rows; selection uses pale blue and a check. Other browsers keep native menus. Multi-select listboxes remain lists.

## Working, context and progression

Keep the reasoning: goal, required evidence, live calculations, error cause and why a result follows. Remove text that merely retells the diagram, repeats an interaction hint or announces empty placeholders. One main goal is enough; a separate context strip is useful only when a claim or criterion must remain visible.

`lab-context` presents a persistent claim/test above the canvas: 15px heading, 14px explanation, 12px × 16px padding, light blue tint and no border. Optional hooks: `claimContextTitle`, `claimContextStatement`, `claimContextCriterion`. State what would prove or disprove the claim without giving away the answer.

Use lightweight step cards to distinguish current, completed and upcoming work, including at None. Swap supplied values for fields in place when assistance changes. Do not remove progress because calculations are shown. Cards with fields keep checks/x marks at the fields; do not repeat them in the card corner. Field-free progress cards may use one status mark.

Available unattempted cards pulse their needed border until interaction with their input or associated model. Remember dismissal through redraws; restart it for a fresh activity. Locked, reference, wrong and completed cards stay static. Reduced motion uses a static border.

Prediction choices count as working at None: pulse the yellow card while a choice is required. When visible context explains the task, use `LabDesign.attention(scope, targets)` without a guidance popup. Recompute targets after state changes: prediction → control or calculation → next action. Clear with `[]` in free exploration. Pulse the actual grip, not the whole diagram; completed cards stay static while their next-action button may pulse. Unlike a one-shot introduction, this cue persists until the required step changes.

Checkpoints represent real stages. Place them farthest right, with current/complete/upcoming states and useful hover, focus and tap details. Show completed evidence and the current task; do not reveal future answers or create skip-ahead navigation. Omit “1/4”, internal phase names and redundant progress headings. Lab state owns completion; shared styling renders it.

## Interaction and transitions

- Introduce each newly required operation near its enabled target with one concise tooltip: what to operate and why. Prefer empty space. Stop the cue after the relevant action; retain keyboard access and reduced-motion treatment.
- Use a restrained blue border/halo pulse on the target. Avoid floating “drag here” chips or permanently repeating commands below the canvas.
- Manipulate the model itself where it expresses the action: pull the percentage bar, move a graph point, rotate the ray. Avoid adding a second slider for the same operation.
- Preserve pickup offset, pointer capture and release/cancel behaviour. A draggable part should match its preview and placed SVG silhouette. Use a grab cue and a generous hit area.
- Only put grips on existing geometry. Offscreen/degenerate lines need stable parameter controls; freeze them during a proof if the lab requires it.
- Completion cards describe a real achievement or transition, not “evidence ready”. Prefer unused model space and no blocking backdrop. Keep them movable using the shared four-way handle, pointer and keyboard support.
- Modal actions use regular 12px text, content-sized centered buttons and 10px × 18px padding. Primary actions remain blue. Suppress old positioning animations when the shared helper owns placement.
- Some explanations work better inline. `lab-working-context` can keep a short current requirement above a simulation. Keep genuine editing popups, such as a flowchart statement chooser.

## Shared component lookup

| Need | Component / API | Lab supplies |
| --- | --- | --- |
| Existing-lab adoption | `lab-adopt-v3` | Appropriate layout adapter and semantic classes |
| Settings | `lab-toggle`, `lab-working-toggle`, `data-kind` | Options, selection, availability |
| Action | `lab-action`, `data-priority="primary"`; `data-lab-actions` for regenerated buttons | Handler and enabled state |
| Model tools | `lab-model-tools`, `lab-computing-tools`, `sim-tool-row` | Placement and action grouping |
| Working/evidence | `lab-work-card`, `lab-evidence-card`, `lab-sidebar` | Contents and state |
| Formula/value | `lab-math-surface` | Short expression; 3px × 7px padding, 4px corners, no border |
| Informational chip | `lab-chip`, `lab-chip-row` | Neutral/violet/amber purpose; chips are not buttons |
| Sequenced action pulse | `LabDesign.attention` | Current card, grip or button; update after rendering, no popup |
| Explanatory introduction | `data-lab-intro`, `LabDesign.introduce` | Use when visible context is insufficient; target, stable key, title and short purpose |
| Attention | `data-lab-attention` | Actionable state and dismissal |
| Stage markers | `LabDesign.checkpoints` | Stage names, current/completed state and evidence |
| SVG dragging | `LabDesign.bindSvgDrag`, `LabDesign.svgPoint` | Model coordinates and constraints |
| Readable chart text | `data-lab-readable-chart` | Rendered size and enough label space |
| Component value material | `data-lab-value` | SVG value text; fitter supplies regular 18-unit type and 7/3 padding |
| Digital instrument | `LabDesign.digitalReadout` | Value string, precision and position |
| Inline simulation step | `lab-working-context`, `lab-working-readout` | Current requirement and ready/working/correct/mistake state |
| Cycle progress | `lab-cycle-progress` | Actual progress and accessible value; not a working card |
| Stable parameter grip | `lab-value-grip`, `lab-boundary-grip` | Parameter maths, limits and keyboard changes |

Shared adapters support investigations, geometry, simulations, computing, builders and programming. Choose one for a matching structure; do not add a grid adapter merely to obtain button styling.

## Examples and intentional differences

| Situation | Preserve / adapt |
| --- | --- |
| Sequence, Set Membership | Separate reference and current construction; shared attention on actionable pieces; white items against concept-tinted regions |
| Recurring Decimals | Aligned remainder-in / ×10 / digit / remainder-out rows; matching remainders share violet; replay pairs each row with its digit; factor explanation is optional |
| Bounds | Compact seven-segment readings with trailing zeros; one scale for ticks/bounds/markers; included/excluded endpoints; visible claim and test criterion |
| Time Zones | Full-width calendar lanes beside working; preserve date crossings, fixed offsets and complete-duration checks |
| Relative Frequency | Reference and tested devices differ by shape and identity colour without revealing unknown probabilities |
| Packet Switching, TCP/IP, DNS | Preserve established multi-region comparisons and device artwork; connect actual ports; keep parallel DNS servers together |
| CSMA | Packet markers stop and visibly corrupt at collision; separate collision, detection, jam, wait and retry; reduced motion retains states |
| CPU / Memory | Flat values inside devices; preserve queues and progress bars; distinguish processor work from page transfers and waiting; serif I for index identifiers |
| Scheduling | Installed rules have stronger identity than tray items; distinguish Ready/Running/Blocked by labels and restrained tones; failure colour stays local |
| Programming | Aligned editor layers and padded themed consoles; Run pulses until first run instead of modal guidance; Clear remains distinct |
| Recursive Calls | Preserve successive Observe Total(4), Some Total(5), All Total(6) exercises; compact F-number labels; execution blue differs from assessment |
| Floating Point | Distinguish allocation from mantissa shifting; show starting/current stored values and lost information; success requires the intended learner action |
| Circuits | Wires meet ports; junction dots join branches; gaps mark crossings; output paths and current bit labels remain clear |
| Science investigations | Preserve apparatus, waves and linked population plots. Put the current prediction/decision beside the visual; place historical or comparison evidence in available space below it. Keep existing earned working levels and observational stages. Selection changes inherited trait frequencies across generations, not adult traits. |

## Publication and review

In Lab Creation, rebuild the kit manifest and generated authoring bundle after shared edits. In the site checkout, run `developer:sync -- --source "<Lab Creation path>"`, compile labs and check the synchronized resources. Do not edit generated copies or embedded manifest/frame blocks by hand.

Check the changed interaction, relevant working and completion states, keyboard/pointer release, and representative desktop/narrow layouts. Verify standalone packaging after shared changes. Record touched files and meaningful exceptions in the site review notes; Git carries the chronological history. This reference does not require unrelated redesigns or a new approval process.
