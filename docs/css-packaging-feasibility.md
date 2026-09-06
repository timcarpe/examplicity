# Selective CSS packaging

Rolled out to all 57 published labs on 6 September 2026 after the three-lab pilot.

## Implementation

`tools/lab-publication/design-css.ts` runs PurgeCSS 8.0.0 during publication, after embedding runtime resources. It scans markup and scripts, excluding style blocks and HTML comments, and converts JavaScript `dataset` names to HTML attributes. Only the shared design block is reduced. Local styles, frame, kit and simulation scripts remain intact. Downloads and AI Remix consume the same self-contained published HTML.

The canonical allowlist is `Lab Creation/packages/lab-kit/src/lab-design-purge.json`, shipped in the kit, authoring bundle and developer resources. It retains common controls, fields, working/evidence cards, formulas, chips, context, checkpoints, hints, completion cards and grips for remixing. Unrelated adapter prefixes require source usage. Tokens and font definitions remain; unused keyframes are removed unless referenced by retained shared CSS or local CSS/scripts.

Preserve pseudo-class conditions with the standard `^:` pattern. PurgeCSS otherwise drops some nested negation and hover/focus conditions; actual classes, attributes and tags still require matching content or a listed primitive. Tests cover these conditions and runtime attributes.

## Results and review

- Shared CSS: **49,261–65,633 bytes per lab**, down from 295,020 bytes.
- Total published HTML: **26,477,725 → 13,565,100 bytes** for this rollout (the starting total already included three reduced pilots). Another **12.9 MB** removed.
- Recursive and Translator now fit the normal 512 KiB standalone limit. Python and Sound retain their offline-runtime allowances.
- Five randomly sampled labs: Selection Pressure, Non-right Triangles, Scatter, TCP/IP Encapsulation and Translator. Inspected opening screenshots; 16 full/reduced computed-style comparisons matched across opening, changed controls/working, wrapper creation, reset, editor stepping, dark theme and console clearing. No browser errors or external runtime requests. This is a spot check, not every state of every lab.
- The sample exposed a dropped nested-negation rule affecting Scatter buttons. Fixed centrally before rollout completion. Translator execution timing differences disappeared when comparing the same paused step.
- Local evidence: `D:/Cambridge Labs/purge-rollout/`; driver: `D:/Cambridge Labs/purge-rollout-compare.cjs`. The prior three-lab pilot has 29 state comparisons in `D:/Cambridge Labs/purge-pilot/`.

## Maintenance

Run the focused `tests/lab-design-css.test.ts` with publication/download tests, then `labs:compile:check`, `labs:downloads:check` and `developer:check`. Regenerate the kit manifest and authoring bundle, sync developer resources and compile labs after changing the canonical allowlist.

Keep generated class names literal or explicitly safelisted: static scanning cannot prove every possible state. A substantial remix introducing an absent layout may need repackaging with the full kit. Local lab CSS and interpreters are not pruned.
