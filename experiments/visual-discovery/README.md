# Six visual lab prototypes

Open [the review index](review/index.html), or an individual standalone file. No network, account or package installation is needed to use a lab.

| Lab | Guided investigation | Independent experiment |
| --- | --- | --- |
| [Maths — scale](review/maths.html) | Length → tiled area → cube layers → reverse area → non-unit reference → similarity repair | Change scale and height, separate layers and compare outlines |
| [Physics](review/physics.html) | Refraction → threshold → diamond calculation → water prediction and boundary reversal | Vary media or hypothetical indices and compare frozen readings |
| [Gas](review/chemistry.html) | Compress and expand before formulas → invariant → unfamiliar pressure prediction → target volume | Change volume, temperature or gas amount and compare saved references |
| [Biology](review/biology.html) | Variation → inheritance → directional case → frequency → construct a two-source environment | Reshape food, vary population size, repeat samples and compare populations |
| [Maths — rails](review/straight-lines.html) | Tilt → slide → equation → falling rail → horizontal → vertical | Change coefficients, operate the carriage and compare saved lines |
| [Maths — histograms](review/histograms.html) | Area → unequal widths → whole report → cumulative totals → quartiles and range | Change grouped frequencies and compare saved reports |

There are **30 guided experiences and six open experiments**. These are review prototypes, not replacements for published labs. Start with [the histogram pilot notes](HISTOGRAMS-PILOT.md) and the [sourced authoring workflow](WORKFLOW-AND-DESIGN.md) for the newest addition. The [straight-line pilot notes](STRAIGHT-LINES-PILOT.md) retain the preceding replication rationale.

## Interaction and support

Operate the main visual model. Arrow keys, Home and End adjust focused handles. The histogram additionally supports tapping plot columns or a ruler position without dragging. Early experiences isolate useful variables; later experiences require less-supported decisions. Predictions are checked on Test or Check, not while typing. Editing a case or prediction invalidates its previous check.

**Hint** offers evidence, then a relationship, then a labelled example with different values. It never opens automatically. **Trace values** connects semantic source quantities to formula operands only when requested. Reduced motion uses static outlines instead of travelling values.

The goal stays above the model. Feedback, the primary action and Hint share one dock below working and before saved records. Test and Continue retain the same button. There is no competing success card in working. See [interface conventions](UI-POLISH.md).

## Restart without losing the wrong work

The shared **Restart options** disclosure has two ordered rows with scope descriptions:

- **Repeat this step** resets this case and retains other visited progress. In the open experiment it becomes **Reset experiment**, clearing that experiment's settings/readings while keeping guided progress.
- **Restart lab…** opens an inline confirmation. Only the second, explicit Restart lab action clears this lab's answers, readings and visited steps. Keep working, Escape, outside click and tab-away cancel without changing the model.

Back and Forward restore saved step state rather than re-running it. Reset actions are disabled during model transitions; navigation waits for the transition to finish. Session progress is not stored after the page closes. Restart does not affect other labs or the published site.

Saved experiment readings are immutable copies. Selecting a row preserves a dashed reference while current controls change. Conditions are labelled; biology explicitly normalises cross-population overlays. Histogram comparisons share one count scale and are not normalised. New sample in biology changes the seed, not the chosen food pressure.

## Build and verify

From the repository root, use Node 24:

```sh
node experiments/visual-discovery/build.mjs
node --test experiments/visual-discovery/tests/*.test.mjs
node experiments/visual-discovery/verify.mjs
node experiments/visual-discovery/verify-straight-lines.mjs
node experiments/visual-discovery/verify-histograms.mjs
node experiments/visual-discovery/verify-restart.mjs
```

Edit `src/` and `build.mjs`, then rebuild. Do not hand-edit generated `review/*.html` or `contracts/*.lab.json`. The builder validates each contract and embeds it in the standalone HTML. It reads the production contract, licence, local living guide and shared kit snapshots without modifying them.

Model tests use Node's built-in modules. Browser scripts need a separate Playwright/Chromium installation; they add no runtime dependency or package-manifest change. `PLAYWRIGHT_MODULE` can point to an isolated Playwright entry file. The older browser scripts also accept `CHROMIUM_EXECUTABLE`.

The browser loads the exact generated HTML, blocks external requests and operates actual controls. Evaluation reads state and geometry rather than injecting answers. Scripts cover full journeys, wrong/revised predictions, empty work, snapshots, reset scopes, hints, comparisons, reduced motion, emulated touch and 1200×800 / 900×800 / 390×844 layouts.

Reports and screenshots are written to `outputs/visual-discovery/`, `outputs/straight-lines-pilot/`, `outputs/histograms-pilot/` and `outputs/restart-review/`. [Verification notes](VERIFICATION.md) distinguish historical runs from the current delivery. Automated browser checks do not establish learning effectiveness or replace a visual, screen-reader or learner review.

## Sources and scope

The original comparison used production revision `a42aaaa78d437926ba59b766a6415ddd89ba46ed`; the initial refinements built on review revision `67ff19efc1042802bc266f7839363c9bdafaa92a`. Each added pilot pins its own source revision in its configuration. All six generated files change when their common restart menu changes; the earlier byte-identical claims apply only to the earlier rail-addition delivery.

Original production sources, curriculum mappings, public routes and public shared components remain untouched. These unpublished review changes have one reconciled internal changelog note.

See [workflow and design sources](WORKFLOW-AND-DESIGN.md), [research notes](RESEARCH.md), and the [learner-review protocol](LEARNER-REVIEW.md). The human learner review has not been conducted as part of implementation.
