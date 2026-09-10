# Verification record

Run: 2026-09-10T01:50:30.035Z

The [machine report](evidence/verification.json) records the checked artifacts and their SHA-256 digests.

| Check | Result |
| --- | --- |
| Offline build and v1 contract validation | Passed for all four labs |
| Embedded and sidecar contract parity; executable script syntax | Passed |
| Guided browser journeys | Passed: 19 experiences across four labs |
| Independent experiments | Passed for all four labs |
| Pointer, keyboard and form interaction | Passed |
| Wrong, corrected and subsequently edited predictions | Passed |
| Back/Forward state; separate Repeat | Passed |
| Frozen readings, custom indices and population/sample changes | Passed |
| Normal and reduced motion, opt-in tracing and offspring timing | Passed |
| Layout checks | Opening, transfer and experiment at 1200×800, 900×800 and 390×844; no horizontal document overflow |
| Scientific model tests | Four passed; optics combinations, gas invariants, 135 inherited population transitions and sample reproducibility |
| External requests and browser errors | None observed |
| Diff whitespace check | Passed |

Environment: v22.16.0; Chromium 144.0.7559.96 built on Debian GNU/Linux 13 (trixie). Browser automation uses the exact generated HTML in isolated pages, with network requests blocked, rather than navigating a live deployment. Page evaluation only reads state; learner actions use actual DOM controls.

Visual inspection included the maths, physics and biology transfer screens and the gas experiment on a 390-pixel viewport, as well as opening desktop apparatus. Local screenshots are written to the ignored outputs directory listed in the machine report. The report is preserved in the repository; screenshot paths describe test output, not checked-in files.

Reproduce with the commands in [README.md](README.md). No full-site build or human learner trial was conducted. These checks do not prove learning effectiveness or cover every free-experiment history.
