# Authoring visual-discovery pilots

This is a working guide for the review prototypes in this directory, not a new publication contract. It records how the sixth pilot was selected and built, and which decisions should be reused. Source review: 10 September 2026. The original four pilots and the straight-line pilot remain the implementation references; the histogram pilot tests whether the same approach transfers to a linked statistical representation.

## 1. Start from an operated relationship, not a page template

Read the existing lab's source and its `lab-contracts/` file. Separate the mathematical or scientific relationship from the interface currently used to teach it. Record what must remain true, which actions make it observable, and what is outside scope. Run the original with its actual shared resources. A source file that expects publication-time injection is not a standalone executable: missing `LabDesign` is a harness failure, not evidence that the source model works.

For this pilot the selected source is [`histogram-area-cumulative-distribution`](../../labs-src/mathematics/histogram-area-cumulative-distribution/lab.html) and its [contract](../../lab-contracts/mathematics/histogram-area-cumulative-distribution.lab.json). Its important connection is **one group's frequency = histogram area = increase in cumulative frequency**. Preserve that relationship and its non-decreasing-total invariant. Do not merely restyle the old sidebar.

The polished [straight-line pilot](src/straight-lines.js) supplies the goal, action, feedback, hint and state-restoration reference. Its equation comparison demonstrates a useful rule: an incorrect prediction should produce inspectable subject evidence, not just a red answer field. The histogram adapts that rule by drawing the learner's cumulative sketch separately from the report and extending a range bracket from the recorded lower quartile.

Selection is a design judgement. Histograms were chosen over the ratio/flow and sequence candidates because unequal class widths expose a precise visual misconception and the linked cumulative representation tests a different geometry from the existing rail pilot. A successful replica must preserve this connection without becoming a worksheet beside a decorative graph.

## 2. Keep evidence, assumptions and design decisions separate

Use the current request for scope, the source contract for the relationship, and the local kit and style guide for shared implementation. External examples inform a decision; they do not override a required operation.

The attached mathematics book available during this pass contained only its first 150 scanned pages. Its contents refer to later histogram and cumulative-frequency chapters, but those pages were not available. No quotation or page-level claim from those missing chapters has been invented. This pilot uses the existing source/contract plus the publicly accessible references below. It does not depend on that book being present when built.

The histogram's synthetic data are `[10, 20, 20, 10]` pupils in intervals with boundaries `[0, 10, 20, 40, 60]` minutes. They are a designed teaching case, not collected pupil data. There is no hidden random generator or claim that repeating produces a fresh sample.

## 3. Design the smallest useful sequence

The first two operations isolate area and width. The learner then constructs all four bars in any order, builds cumulative totals, and estimates the middle half. The independent experiment retains the same model and adds saved comparisons. The sequence is in [`histograms.js`](src/histograms.js); the gates and limitations are in [`histograms.pilot.json`](src/histograms.pilot.json).

| Decision | Consequential evidence | What is deliberately not supplied |
| --- | --- | --- |
| Resize a same-width bar | Countable area cells | The target height is not pre-filled. |
| Represent equal frequencies in unequal widths | Wider bar must be shorter | No automatic move to the correct height. |
| Build a complete report | Each area, not merely the total, must agree | No mandatory left-to-right control hunt. |
| Construct cumulative totals | Dashed sketch versus checked report line | Correct internal totals are hidden until checking. |
| Read quartiles and calculate a range | Linked ruler and endpoint bracket | No silent replacement of the learner's read-off. |
| Alter a group | All later totals and ranks respond | Saved comparisons never become completion evidence. |

This is an adaptation of implicit scaffolding: constrain irrelevant degrees of freedom while leaving a mathematical choice. Podolefsky, Moore and Perkins describe affordances, constraints, cues and feedback as a framework for productive exploration; the paper's abstract describes an example from Energy Skate Park, not a validation of these Examplicity pilots. [Source: authors' paper](https://arxiv.org/abs/1306.6544).

Brilliant's own teaching description advocates decisions with visual models before formal methods and contextual feedback, followed by less-supported practice. We borrow the ordering and the retained opportunity to revise, not a tutor, reward system or an assertion that one completed lab establishes mastery. This is a platform self-description, not an independent outcome study or an authenticated layout audit. [Source: Brilliant](https://brilliant.org/resources/choosing-brilliant/how-brilliant-teaches-math/).

## 4. One model supplies every number

[`histograms-model.js`](src/histograms-model.js) validates strictly increasing finite boundaries and non-negative frequencies. For interval width `w` and frequency `f`, height is `f / w`, so its area is `w × (f / w) = f`. Cumulative totals add the same `f` values. This algebra is the implementation's derivation, not a separate measurement.

NIST distinguishes ordinary counts from normalised histogram density and describes cumulative counts as including preceding groups. Its probability-density normalisation divides by both total observations and class width; this pilot uses **frequency density**, omitting the division by total, so total area is the pupil count rather than one. [Source: NIST histogram reference](https://www.itl.nist.gov/div898/handbook/eda/section3/histogra.htm).

Between class boundaries, the pilot integrates constant density. The resulting cumulative line has straight segments. This is a deliberate change from the original smooth interpolation: it keeps partial bar area and cumulative growth equal everywhere. It is explicitly labelled as an estimate within a group, not a claim about individual times. Q1, median and Q3 use ranks `N/4`, `N/2` and `3N/4`. An empty distribution has no quartiles; a plateau uses the first coordinate reaching the rank.

Do not store redundant 'correct' graph values in multiple views. Store learner proposals separately when the task genuinely needs a prediction. All accepted readings, saved comparisons and checks must derive from the same case and retain their units.

## 5. Reuse the shared learner interface

Author only the subject model, drawing, case sequence and attached cues. [`shared.js`](src/shared.js), [`connections.js`](src/connections.js), [`shared.css`](src/shared.css) and [`build.mjs`](build.mjs) own the common interface. The builder reuses the local v3 style tokens and kit resources; generated review files have no network dependencies.

The goal stays above the model. The evidence/action dock stays below working and before optional records. Test, Check and Continue use one persistent button. A result sentence states what agrees or which representation differs; it does not compete with another success panel. Numerical inputs stay pending when empty. Editing invalidates checked correctness but does not advance a step.

Khan Academy documents Check and Skip next to each other at the bottom right. The adopted feature is predictable action placement. These pilots do not copy skipping, its incorrect-answer penalty or course scoring. [Source: Khan Academy's interface announcement](https://support.khanacademy.org/hc/en-us/articles/26236154715789-Update-Navigate-Questions-at-Your-Own-Pace-with-the-Skip-Button).

Hints have one entry, with evidence first, then the relationship, then a labelled example using different values. Quantity links identify sources by semantic keys, not matching digits. Opening help preserves the case; an optional trace explains a connection without becoming a required animation.

## 6. Make reset scope visible and predictable

The previous menu inherited grid positions intended for top-level header buttons. Its visual order put Restart before Repeat despite the opposite DOM order. The fix scopes placement to the disclosure, removes those inherited positions, and uses two readable rows with descriptions.

**Repeat this step** resets the current case while keeping other visited progress. In the open experiment it becomes **Reset experiment** and explains that its readings are cleared. **Restart lab…** opens an inline confirmation naming the lost answers, readings and visited steps. Keep working is focused first. Only confirmation clears the session. Other labs and the published site are unaffected.

Native `details` and `summary` provide a disclosure rather than pretending to be an application menu. Escape, outside click and tab-away dismiss it without changing the model. The focus handler responds to the actual next focused element: checking `document.activeElement` during an intermediate focus-out event can close the panel before a button click arrives. [Source: W3C disclosure interaction guidance](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).

Reset actions and primary actions target at least 44 CSS pixels in height. That is an intentional usability target aligned with the enhanced target-size criterion, not a claim that passing a dimension assertion establishes accessibility conformance. [Source: W3C target-size explanation](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced).

## 7. Verify operations, boundaries and the actual generated artifact

Build from source and run pure-model tests before browser tests. Browser journeys use real pointer, keyboard, form and emulated touch events; evaluation reads state and geometry rather than injecting correct answers. The new histogram also permits clicking or tapping a bar/cross column or a ruler position without dragging. A keyboard path alone does not satisfy the separate single-pointer alternative described by W3C. [Source: dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html).

Run the complete journey, a meaningful mistake, correction, stale-feedback invalidation, hints, Back/Forward, repeat and restart. Compare opening, active, retry, success and experiment states at 1200×800, 900×800 and 390×844. Test the zero-total distribution, zero-denominator input, wrong-but-correct-total bars and cumulative monotonicity. When a shared menu changes, rerun every existing pilot, not just the new one.

```sh
node experiments/visual-discovery/build.mjs
node --test experiments/visual-discovery/tests/*.test.mjs
node experiments/visual-discovery/verify.mjs
node experiments/visual-discovery/verify-straight-lines.mjs
node experiments/visual-discovery/verify-histograms.mjs
node experiments/visual-discovery/verify-restart.mjs
```

Use Node 24 for the repository's TypeScript contract loader. Browser verification needs Playwright and Chromium installed separately; it is not a lab runtime dependency. The verification scripts also accept `PLAYWRIGHT_MODULE` pointing to an isolated installation.

Retain the actual test reports, artifact hashes, screenshots and failed-check fixes. Rebuild before hashing. Review the combined diff, reconcile the existing internal changelog note and exclude temporary runner/transfer files before updating the pull request. Do not publish review prototypes or alter production routes as an incidental consequence.

Automated assertions, screenshots, manual visual inspection and a learner trial are separate forms of evidence. Report each honestly. This pass used a fresh GitHub Actions browser because the local execution/image tools timed out. Screenshots were captured for reviewer inspection; do not describe them as manually inspected in this pass. No live deployment, physical-device trial, screen-reader usability trial or learning-effectiveness study is implied by a passing browser suite. Use [the learner-review protocol](LEARNER-REVIEW.md) for the next kind of evidence.
