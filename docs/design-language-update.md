# Design rollout record

## References

Presentation rules and component lookup: `docs/design-language/lab-style-contract.md` in Lab Creation. Visual examples: `examplicity-living-style-guide-v3.html`, published under `/developer`. Shared CSS/runtime in `packages/lab-kit/src/` are canonical; site and download copies are generated.

This record describes implementation and review. It does not add styling rules or override the user's task scope. Superseded experiments and detailed batch history remain in Git.

## Working approach

- Read the existing HTML and later states before adapting. Preserve deliberate layouts, causal relationships, meaningful device artwork and learning choices.
- Keep reusable styling shared; keep geometry, state and scientific constraints local. Remove repeated instructions while retaining goals, evidence and explanations needed to reason.
- Record current surfaces, quantities, input slots, support modes and completion dependencies in each existing contract sidecar. These maps describe behaviour, not exam coverage.
- Check affected interactions and representative geometry, preserve standalone downloads, commit a scoped batch, then provide review links. User review determines acceptance.

## Current batch: final five science labs — awaiting user review

| Lab source slug | What changed |
| --- | --- |
| converging-lens-imaging | Current prediction/action beside bench; observation record beneath it; shared checkpoints and hints; regular chart text; object/screen pickup offsets. Retained ray construction, projection evidence and generated practice. |
| critical-angle-and-total-internal-reflection | Shared Working control, model reset, four progression cards/checkpoints and contextual hints; readable ray labels; rotation retains pickup angle. Preserved prediction, both-side observation, marking and calculation. |
| diffraction-through-a-gap | Tank remains beside working; Run/Reset near tank; working control in header only during comparison; readable evidence and unclipped layout. Retained wave field, direct grips and alternative range controls. |
| gas-compression-at-constant-temperature | Causal chain beneath apparatus, calculations beside it, shared completion card and hints, model reset, regular labels and padded values. Piston retains pickup offset. Preserved earned working levels and pV model. |
| selection-pressure-and-trait-frequency | Current decision and mechanism beside linked plots; comparison evidence below; shared checkpoints with existing revisit gates; readable labels and natural page height. Preserved selection/inheritance stages and free experiment. |

Shared adaptation lives in `.lab-science` and the five scoped science adapters in `lab-design.css`. Source edits connect existing state to those components. All published lab files change because each standalone file embeds the shared stylesheet; other labs receive no science adapter.

Documentation: condensed the written reference, shortened repetitive HTML-guide explanations while preserving interactive examples, and replaced this historical rule stack with a current record. The HTML guide remains an illustrated companion rather than an additional policy document.

## Checks and limits

- Lens: completed beyond 2F, F–2F, focal-limit and virtual-image cases.
- Critical Angle: observation/marking/calculation at None, Some and All.
- Diffraction: both discovery stages and a wider-gap counterexample at all working levels.
- Gas: four investigations plus All calculation/marker; pointer pickup and release.
- Selection: all three selection patterns through completion; guided/free return preserves progress.
- Desktop/tablet: opening layouts at 1422px and 768px without page-width overflow or internal canvas scrolling; no browser errors on checked paths.
- Publication: all 57 compiled sources, contract selectors and embedded download resources verified. Existing Sound, Python and Translator size allowances increased by 25–35 KB for the added shared stylesheet; offline payloads unchanged.

These are targeted checks, not an exhaustive scientific-model audit. Current behaviour maps distinguish simplified models from physical claims. Lens and Selection retain guided investigations without invented Working toggles; Gas retains its earned support; Diffraction exposes working only when numerical comparison starts.

## Earlier accepted work

The previous 52 labs were adapted in reviewed batches across mathematics and computer science. Their sidecars and commits retain the individual changes. Important layout exceptions include packet/TCP three-column flows, paired DNS servers, code/stack/output, and direct manipulation of percentage bars, chart handles and bounds instruments. Shared changes should continue to respect these structures.
