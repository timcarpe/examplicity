# Five visual lab prototypes

Open [the review index](review/index.html), or an individual standalone file. No network, account or package installation is needed to use a lab.

| Lab | Guided investigation | Independent experiment |
| --- | --- | --- |
| [Maths — scale](review/maths.html) | Length → tiled area → cube layers → reverse area → a non-unit reference cube → similarity repair | Change scale and height, separate layers, save and compare outlines |
| [Physics](review/physics.html) | Observe refraction → mark a threshold → calculate for diamond → predict water’s threshold and reverse the boundary | Choose either medium or hypothetical indices; compare frozen readings |
| [Chemistry](review/chemistry.html) | Compress and expand without formulas → collect an invariant → predict pressure at an unfamiliar volume → plan a target volume | Change volume, temperature or gas amount; compare saved piston and curve references |
| [Biology](review/biology.html) | Existing variation → parents and offspring → a directional worked case → middle-group frequency → construct a two-source environment | Reshape food, change population size, repeat with a new sample and compare distributions |

| [Maths — rails](review/straight-lines.html) | Tilt → slide → equation → falling-line transfer → horizontal line → vertical line | Change coefficients, move the carriage and compare saved lines |

There are 25 guided experiences and five open experiments. These are review prototypes, not replacements for published labs.

The newest [straight-line rails pilot](STRAIGHT-LINES-PILOT.md) demonstrates reuse of the polished shell with a different mathematical model. Its source is pinned to revision `53be3e9`; the original four generated labs are unchanged.

## Interaction and support

The apparatus remains the primary control. Arrow keys, Home and End operate focused model handles. The first experiences constrain irrelevant variables; later experiences require a fresh decision with less supplied working. Numerical predictions are checked on **Test**, not while typing. Changing a prediction invalidates its previous result.

**Hint** in the feedback area offers evidence first, then a relationship and a different worked example. It never opens automatically. **Trace values** explicitly connects labelled quantities to formula operands; source clicks, edits and stage changes do not start the trace. Reduced motion uses static paired outlines instead of moving values.

**Back** restores the earlier model, answers and readings. **Forward** revisits a previously visited experience without requiring its work again. **Repeat this step** resets only the current experience; **Restart lab** clears the session. No progress is stored after the page closes. Navigation cannot interrupt a piston test or offspring replacement, except Restart lab, which cancels the transition safely.

Record a reading in an experiment, then select its row to hold a dashed reference on the model. Changing current controls does not rewrite that reading. The comparison states which conditions differ. Biology labels cross-population overlays as rescaled proportions rather than pretending different population counts are directly comparable. **New sample** changes the seed, not the chosen food pressure; resetting the same sample remains reproducible.

## Goal and feedback polish

The goal stays above the model. Status, the main action and Hint share one dock below the working, before saved readings. The same button changes from Test prediction to Continue; input edits restore the test action without moving focus. There is no second success card in the working area.

Hints are an explicit disclosure with previous/next controls and Escape dismissal. Opening help reveals it below the action row without resizing the model. Restart options group Repeat this step and Restart lab in the header.

See [the interface review](UI-POLISH.md) for source references, scope and acceptance checks.

## Build

From the repository root, using Node 22.16 or later (Node 24 recommended):

```sh
node --experimental-strip-types experiments/visual-discovery/build.mjs
```

Edit `src/` and `build.mjs`, then rebuild. Do not edit generated `review/*.html` or `contracts/*.lab.json` manually. The build validates each v1 contract and embeds it in its standalone HTML. It reads, but does not edit, the production contract sidecars, licence, living guide and pinned shared design-kit snapshots.

The original production-source comparison is revision `a42aaaa78d437926ba59b766a6415ddd89ba46ed`. The refinements build on review revision `67ff19efc1042802bc266f7839363c9bdafaa92a`. Original production sources, curriculum mappings, public routes and shared components remain unchanged. The repository changelog records this work internally only.

## Verification

Model checks require only Node’s built-in modules:

```sh
node --test experiments/visual-discovery/tests/*.test.mjs
```

Browser acceptance uses Playwright as a development-only tool; it is not a lab dependency. With Playwright and Chromium installed in the test environment:

```sh
node --experimental-strip-types experiments/visual-discovery/verify.mjs
# The new pilot has its own complete journey and package checks:
node --experimental-strip-types experiments/visual-discovery/verify-straight-lines.mjs
# Or one original journey, while still checking its four packages:
node --experimental-strip-types experiments/visual-discovery/verify.mjs chemistry
```

Set `PLAYWRIGHT_MODULE` to an installed Playwright module entry file when it is not available through normal module resolution. Set `CHROMIUM_EXECUTABLE` to an existing Chromium executable when required. A separate test environment may install Playwright and its browser without changing this repository’s package manifests.

The runner loads the exact generated HTML into isolated browser pages, blocks all external requests, and uses real pointer, keyboard and form controls. Page evaluation reads state for assertions; it does not bypass learner completion rules. This also permits artifact testing in environments that prohibit `file://` or loopback navigation. It is not a deployed-site test.

Checks cover every guided journey and experiment, wrong/revised predictions, help, immutable references, state restoration, scientific invariants, 1200×800 / 900×800 / 390×844 layouts, optional tracing, reduced motion and inheritance timing. Results and screenshots are written to ignored `outputs/visual-discovery/` (original pilots) and `outputs/straight-lines-pilot/` (new pilot); `VERIFICATION.md` records the delivered run. The tests do not establish learning effectiveness or cover every experimental history.

## Contents

`src/` contains the shared local helpers and five models; `build.mjs` packages them; `serve.mjs` optionally serves this experiment directory; `verify.mjs` and `tests/` provide acceptance and model checks; `contracts/` and `review/` are generated deliverables. Every HTML includes its licence, teaching contract, implementation map, original provenance and model limits.

See [research and design decisions](RESEARCH.md) and the [learner review protocol](LEARNER-REVIEW.md). The learner review has not been conducted as part of this implementation.
