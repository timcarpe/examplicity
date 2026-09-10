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
