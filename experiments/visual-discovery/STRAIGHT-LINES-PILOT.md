# Straight-line rails: replication pilot

Open [the standalone lab](review/straight-lines.html). This fifth pilot reimagines the existing [straight-line coordinates and equations source](../../labs-src/mathematics/straight-line-coordinates-equations/lab.html), using the polished interface of pull request 3 at revision `53be3e934205817549dedb0fbbcf41b84cc40b59`.

## Why this lab

The candidate review considered straight-line rails, right-triangle ratio invariance, histogram/cumulative distribution, and circle constraints. Rails provide a different test from the scale pilot: two independent geometric properties, an algebraic description and a counterexample that passes through one point but fails elsewhere. The existing mounting/tilt/slide/carriage interaction remains useful rather than becoming decoration around a numerical quiz. Triangle ratios are closer to the existing scale sequence; histogram/cumulative distribution and circle networks introduce more simultaneous representations or theorem conditions.

The production source exposes a rail, a working-level selector, a calculation sidebar, diagnosis and a completion surface. The pilot instead isolates direction and position before requiring their combined use. It retains Cartesian coordinates, signed and fractional gradients, parallel direction, intercepts, horizontal lines, vertical x = k, and an across-the-line check. The production contract's relationship, invariants and non-goals are copied unchanged. No production route, catalogue, curriculum mapping, published lab or shared public component is edited.

## Guided sequence

| Step | Learner decision and evidence |
| --- | --- |
| Tilt | Change direction while the intercept stays fixed. Move the carriage across both stops and observe a constant gap when the rails are parallel. |
| Slide | Keep the gradient and move the rail through P(0, 2). The one worked card links rise, run and intercept to actual diagram quantities through optional Trace values. |
| Describe | Read the fixed rail's coordinates and commit m and c. A dashed equation is revealed only after Test; the carriage checks the committed equation against actual coordinates. |
| Falling rail | Independently reach A(−2, 3) and B(2, 1), then write and test the equation. The starting line intentionally passes through B only. Reaching one point or guessing a matching equation for the wrong geometry cannot complete it. |
| Level rail | Build the horizontal rail and distinguish zero gradient from a zero intercept. The result simplifies the checked equation to y = −2. |
| Vertical rail | Slide through P(2, 1), choose the constant coordinate, and test x = 2 along the rail. The incorrect choice y = 2 draws an actual horizontal comparison line rather than merely turning a box red. |

The final experiment is ungated. Learners vary gradient or intercept independently, switch to a vertical rail, move the carriage, and compare up to six immutable saved lines. Readings retain their orientation, coefficients and actual carriage coordinates. Different-orientation comparisons do not invent a scalar separation.

## Interface continuity

The pilot embeds the same shared local goal, single feedback/action dock, Hint disclosure, checkpoint transitions, status announcement, stateful Back/Forward and scoped restart controls. Those shared files are unchanged. The existing four generated HTML files remain byte-for-byte unchanged by the new build.

Model handles are keyboard sliders with 48-pixel hit areas. Touch gestures are reserved for the graph; scrolling remains available outside it. This explicit SVG touch policy prevents the browser from cancelling a drag after its scroll threshold. Prediction fields accept signed decimals and fractions without evaluating expressions. No correctness styling appears while typing. Edits to coefficients or predictions invalidate previous test/travel evidence; opening hints, moving focus and resizing do not.

The main action does not move between working and result cards. A correct equation first invites a carriage check; only the combined criterion produces the final outcome. Source measurements stay visible throughout, while operational hints are requested in the established location. Worked hints use a different example.

## Mathematical and implementation limits

For nonvertical rails, y = mx + c, with m in [−1.5, 1.5] in quarter steps and c in [−2, 2] in half steps. Vertical rails use x = k with k in [−3, 3] in half steps. The graph uses equal coordinate scales and clips rail drawing to its window without changing the underlying equation. Carriage travel is [−2, 2] along x, or along y for a vertical rail.

The difference of two same-orientation rails is affine. Its maximum absolute value on the tested interval occurs at an endpoint. Acceptance therefore checks the underlying relationship analytically as well as requiring current-geometry travel evidence; it does not infer whole-line agreement from one point or a loose screen-space tolerance. The carriage is a visual instrument, not a simulation of mechanical forces.

This pilot uses structured equation coefficients rather than the production source's general equation parser. It tests the connected geometric quantities, not equivalent algebraic rearrangements. Perpendicular-line theorems and nonlinear families are not introduced. Progress and references live only in the current page session. No human learner or screen-reader usability trial has been performed.

## Files and verification

`src/straight-lines.js` owns the sequence, state and decisions; `src/straight-lines-model.js` contains pure mathematical functions; `src/straight-lines-svg.js` draws the operated graph; `src/straight-lines.css` supplies only local graph styles; `src/straight-lines.pilot.json` declares source continuity and completion criteria. The existing builder embeds them in `review/straight-lines.html` and writes the matching contract.

Run `node --test experiments/visual-discovery/tests/straight-lines.test.mjs`, then `node --experimental-strip-types experiments/visual-discovery/verify-straight-lines.mjs` with Playwright installed separately. Run the existing `verify.mjs` for regression coverage of the original four pilots. The new browser suite covers all six steps and the experiment, true pointer/touch and keyboard operation, invalid/incorrect/revised equations, whole-interval checks, snapshots/repeat, frozen comparisons, normal/reduced motion, optional traces, hints and stable action placement at 1200, 900 and 390 pixels.

See `evidence/straight-lines-verification.json` for the checked HTML digest and results. Browser screenshots and the full report are written under ignored `outputs/straight-lines-pilot/`. These are implementation checks, not evidence of learning effectiveness.
