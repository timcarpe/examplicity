# Selective CSS packaging — pilot

Implemented 6 September 2026 using PurgeCSS 8.0.0. The pilot covers Binary Numbers, Recursive Call Stacks and Gas Compression. The other 54 labs retain full shared CSS.

## Packaging

`tools/lab-publication/design-css.ts` selects shared CSS during publication, after runtime resources are embedded. It scans markup and scripts, excluding style blocks and HTML comments. JavaScript `dataset` names are converted to their HTML attribute names. The reduced CSS replaces only the shared design block; local CSS, frame, kit and simulation scripts remain intact. Downloads and AI Remix consume the same self-contained published HTML. No browser dependency, network stylesheet or new download endpoint is introduced.

The canonical allowlist is `Lab Creation/packages/lab-kit/src/lab-design-purge.json`, distributed through the kit manifest and authoring bundle. It preserves common actions/settings, fields, working/evidence cards, formula surfaces, chips, context, checkpoints, hints, completion cards and grips. Component descendants and transient states remain available even when absent from a lab. Unrelated adapter prefixes still require source usage. Tokens and font definitions remain; unused keyframes are removed unless used by retained shared rules or local CSS/scripts.

PurgeCSS 8 needs explicit `:is`/`:where` preservation for compound pseudo-class rules such as field focus; unused inner selectors are still removed. Regression tests cover this and dynamically assigned attributes.

## Measured output

Uncompressed bytes, including standalone header/footer:

| Lab | Full download | Pilot download | Reduction | Shared CSS after pruning |
| --- | ---: | ---: | ---: | ---: |
| Binary Numbers | 428,995 | 184,102 | 57.1% | 50,127 |
| Recursive Call Stacks | 527,854 | 297,973 | 43.6% | 65,139 |
| Gas Compression | 440,988 | 204,475 | 53.6% | 58,507 |

The full shared stylesheet is 295,020 bytes. Recursive now fits the standard 512 KiB limit without a waiver.

## Evidence and extension

- Nine targeted packaging/publication/download tests pass. Run `node --test --experimental-strip-types tests/lab-design-css.test.ts tests/lab-publication.test.ts tests/lab-download.test.ts`.
- Offline Edge comparison: 29 matched computed-style snapshots across initial states, Binary help/range/exam/generated questions, Recursive frames/Some/All/exploration, Gas prediction/completion/working, 600px layouts and injected remix primitives. Opening screenshots inspected. No runtime errors or external runtime requests. Evidence: `D:/Cambridge Labs/purge-pilot/`; driver: `D:/Cambridge Labs/purge-compare.cjs`.
- Run `npm run labs:compile:check`, `npm run labs:downloads:check` and `npm run developer:check` after regeneration.

Add labs to `DESIGN_CSS_PILOT` only after comparing their representative dynamic states with full CSS. Names assembled from fragments may need explicit safelisting; static scanning cannot prove every possible state. Preserve additions through the canonical policy rather than lab-specific CSS copies. This pilot does not attempt to prune local lab styles or interpreters, and a substantial remix introducing a new layout may need repackaging with the full kit.
