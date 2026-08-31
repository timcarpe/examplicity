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
- [Automated Systems](http://localhost:3000/computer-science/0478?lab=automated-system-control-flowcharts)
  no longer lets its hidden run popup add vertical scroll height. A shown popup
  is clamped inside the visible chart area, including after horizontal panning.
  The chart has equal client and scroll heights at 1366, 900, 620 and 360px;
  its narrow horizontal construction panning is retained.
- [Process States and Scheduling](http://localhost:3000/computer-science/9618?lab=process-states-scheduling)
  now resizes its 24 state-history cells fractionally instead of retaining a
  1000px timeline. The history and page have equal client and scroll widths at
  1366, 900, 620 and 360px, and the CPU area now uses a light operated-surface
  treatment while retaining process-state colours.
- The generic operated canvases in Data Transmission, Combinational Logic,
  CSMA/CD, Network Topology, Packet Switching, IPv4 Subnetting, Encryption and
  TCP/IP Encapsulation now opt into the Lab Creation kit's light canvas
  primitive. Dark terminals, monitor screens and small hardware displays were
  retained only where darkness represents the object or state.
- TCP/IP's receiver layers now occupy their station directly; the decorative
  bordered canvas between the station and the already bounded protocol gates
  was removed.
- DNS and Web Page Retrieval's web-server cards now populate the ordinary lab
  field directly; the dark bordered rack wrapper was removed while the server
  hardware faces and semantic active states retain their contrast.
- Circle Theorem's current method/calculation cards and working-ownership note
  now use neutral toolkit surfaces. Blue inset rails no longer decorate
  "structure" steps; semantic success, warning and error treatments remain.
- The shared lab frame no longer draws a divider line between the generated
  manifest header and the teaching workspace.

## Interaction sign-off links

The code paths, fit measurements and regression checks pass. These pages still
benefit from human inspection because the remaining judgement is visual density,
contrast or interaction feel rather than a known mechanical defect:

- [Automated Systems](http://localhost:3000/computer-science/0478?lab=automated-system-control-flowcharts) — popup placement after horizontally panning the narrow flowchart.
- [Process States and Scheduling](http://localhost:3000/computer-science/9618?lab=process-states-scheduling) — readability of the fully fitted 24-cell history at 620px and 360px, including arrival-diamond dragging.
- [Data Transmission Methods](http://localhost:3000/computer-science/0478?lab=data-transmission-methods) — keyboard movement, port activation, wire selection, bend editing and intentional narrow-width horizontal panning.
- [Combinational Logic Circuit Design](http://localhost:3000/computer-science/0478?lab=combinational-logic-circuit-design) — gate/port contrast and board legibility after the light-surface migration.
- [CSMA/CD](http://localhost:3000/computer-science/9618?lab=csma-cd) — signal, collision and jam contrast plus intentional narrow-width horizontal panning on the light fixed-width canvas.
- [Network Topology](http://localhost:3000/computer-science/0478?lab=network-topology) — keyboard node movement and connect/delete activation.
- [Packet Switching](http://localhost:3000/computer-science/0478?lab=packet-switching) — keyboard router movement and topology tool activation.
- [IPv4 Subnetting](http://localhost:3000/computer-science/9618?lab=ipv4-subnetting) — zone/IP label legibility on the fitted light network.
- [Encryption in Data Transmission](http://localhost:3000/computer-science/0478?lab=encryption-in-data-transmission) — balance between the light board and intentionally dark device monitors.
- [DNS and Web Page Retrieval](http://localhost:3000/computer-science/0478?lab=dns-web-page-retrieval) — server hierarchy and use of the newly unboxed space.
- [TCP/IP Encapsulation](http://localhost:3000/computer-science/9618?lab=tcp-ip-encapsulation) — receiver-layer hierarchy after removing the redundant nested canvas frame.
- [Circle Theorem Constraint Network](http://localhost:3000/mathematics/0580?lab=circle-theorem-constraint-network) — focus visibility and arrow-key adjustment on overlapping SVG handles.

Three-Dimensional Line and Plane Trigonometry was reviewed as acceptable and
was intentionally left unchanged.

Intentional bounded scroll panes found in Python lesson navigation, the
Software Stack card bank and Translator editors require no follow-up.
