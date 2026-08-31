# Full-catalogue rolling QA

Date: 31 August 2026

All 46 live lab routes were loaded from the local development server at
`1366×768`. The rendered audit checked the standard 1200px manifest-header
rail, page-level horizontal overflow, initial completion indicators, useful
body content and console errors. Every route passed those checks.

The audit also compared primary visual regions with their scroll dimensions.
Named secondary panes such as lesson navigation, code editors and long card
banks may scroll intentionally. A primary operated visual or manipulative must
fit its region unless an exceptional, reviewed reason is recorded.

## Repaired during the audit

- [Recurring Decimals and Fractions](http://localhost:3000/mathematics/0580?lab=recurring-decimals-fractions)
  no longer forces its 900px alignment board into an 858px pane. Its digit
  geometry now adapts at responsive widths, its drag step follows the rendered
  cell size, and the board has equal client and scroll widths from 1366px down
  to 360px. Human sign-off should confirm that the compressed 390px treatment
  remains comfortably readable.

## Human decisions still required

- [Automated Systems](http://localhost:3000/computer-science/0478?lab=automated-system-control-flowcharts)
  has 12px of vertical overflow in `.chart-shell` (`528px` client height,
  `540px` scroll height). Confirm whether this is an intentional bounded
  construction-canvas affordance or should be fitted exactly.
- [Process States and Scheduling](http://localhost:3000/computer-science/9618?lab=process-states-scheduling)
  has 21px of horizontal overflow in `.timeline-scroll` (`979px` client width,
  `1000px` scroll width). Confirm whether short horizontal panning is useful
  for the state-history timeline or is accidental.

## Interaction sign-off links

The code paths and regression checks pass; these pages still benefit from a
human feel/readability pass because their direct manipulation is visually
dense:

- [Data Transmission Methods](http://localhost:3000/computer-science/0478?lab=data-transmission-methods) — keyboard movement, port activation, wire selection and bend editing.
- [Network Topology](http://localhost:3000/computer-science/0478?lab=network-topology) — keyboard node movement and connect/delete activation.
- [Packet Switching](http://localhost:3000/computer-science/0478?lab=packet-switching) — keyboard router movement and topology tool activation.
- [Circle Theorem Constraint Network](http://localhost:3000/mathematics/0580?lab=circle-theorem-constraint-network) — focus visibility and arrow-key adjustment on overlapping SVG handles.
- [Three-Dimensional Line and Plane Trigonometry](http://localhost:3000/mathematics/0580?lab=three-dimensional-line-plane-trigonometry) — arrow-key perspective test and completion feedback.

Intentional bounded scroll panes found in Python lesson navigation, the
Software Stack card bank and Translator editors require no follow-up.
