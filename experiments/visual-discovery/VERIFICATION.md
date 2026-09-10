# Verification record

## Goal, feedback and help polish — 10 September 2026

Verified against the generated offline review files, based on pull request 3 at `49f28e3bfb05ffe88be4120936066e85c8cae73a`.

- All 19 guided experiences and four open experiments passed their browser journeys.
- Opening, transfer and experiment layouts checked at 1200×800, 900×800 and 390×844. Additional retry, success and expanded-hint screenshots cover all three widths.
- The same action button retains identical document-space bounds between untested, wrong and correct predictions in the tested maths case at each width. Focus stays in edited inputs or on the same Test/Continue button.
- One visible primary action, one polite status region, hint disclosure state, previous/next/Escape, restart disclosure, no whole-card method tooltip, and double-click protection verified. Opening hints does not resize the apparatus or move the action in document flow.
- Existing pointer/keyboard interactions, stateful navigation, corrected predictions, optical reversal, comparisons, normal/reduced motion and offspring timing passed.
- All four model-invariant tests passed, including 135 population transitions and repeatable/new samples.
- All four v1 contracts validate and match their embedded copies; script syntax and offline resource checks pass. No browser errors or external requests observed.

`evidence/verification.json` records the delivered browser checks and hashes of the exact generated HTML. Run the commands in `README.md` to reproduce. Browser output and full-page screenshots are written to the ignored `outputs/visual-discovery/` directory.

This is not a full-site build, live-deployment test, screen-reader usability trial or learner trial. Automated layout assertions sample the stated states and widths; they are not a claim of universal accessibility or improved learning effectiveness.

## Earlier refinement run

The pre-polish implementation passed an independent [GitHub Actions run](https://github.com/timcarpe/examplicity/actions/runs/34427845104). Those screenshots describe the earlier interface, not this polish. The follow-up pull-request note links the new independent runner evidence when available.


## Fifth pilot: straight-line rails — 10 September 2026

The original four generated lab files remain byte-identical to the goal/feedback polish. Their existing browser suite passed again locally, as did all eight model tests (the four original tests and four new straight-line tests).

The new `verify-straight-lines.mjs` passed all six guided steps and the independent experiment, with 29 screenshots. It checks authentic mouse and mobile touch drags, keyboard manipulation, positive/negative fractional gradients, horizontal/vertical distinctions, rejection of one-point matches and invalid fractions, prediction revisions, post-test travel requirements, Back/Forward/Repeat, immutable references, hints, trace cancellation, normal/reduced motion and action-slot bounds at three widths. External requests were blocked; no requests or browser errors occurred.

The checked HTML digest and exact check descriptions are in `evidence/straight-lines-verification.json`. Rebuild with the existing build command. Run `node --test experiments/visual-discovery/tests/straight-lines.test.mjs` and `node --experimental-strip-types experiments/visual-discovery/verify-straight-lines.mjs` with a separately installed Playwright/Chromium environment. The tests do not require changes to the site's package manifests.

Scope: exact generated offline HTML, not a full-site deployment or human usability study. Touch is automated Chromium input, not physical-device testing.
