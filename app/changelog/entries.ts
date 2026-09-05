export type ChangelogEntry = {
  date: string;
  displayDate: string;
  publicChanges: readonly string[];
  internalChanges: readonly string[];
};

export const changelogEntries: readonly ChangelogEntry[] = [
  {
    date: '2026-09-05',
    displayDate: '5 September 2026',
    publicChanges: [
      'Clarified AI remix guidance to preserve each lab’s learning relationships and curriculum, and made downloaded labs link consistently to their live versions with the correct MIT licence notice.',
    ],
    internalChanges: [
      'Rolled out separate contract sidecars and semantic hooks across all 57 labs, expanded developer guidance and CLI inspection, and validated contract preservation in generated and standalone HTML.',
      'Connected Binary Numbers’ existing IGCSE and AS question pools to curriculum profiles, corrected contract invariants, and added focused curriculum and download regression checks. The AI adaptation comparison remains unevaluated.',
    ],
  },
  {
    date: '2026-09-05',
    displayDate: '5 September 2026',
    publicChanges: [
      'Added flip-flop feedback, recursive call-stack and artificial-neuron investigations for Cambridge International A Level Computer Science 9618.',
      'Added Cambridge IGCSE Mathematics 0580 investigations for similarity, relative frequency, expected frequency, replacement and conditional sample spaces.',
      'Added Biology, Chemistry and Physics investigations for natural selection, converging lenses, total internal reflection, diffraction, and constant-temperature gas compression.',
      'Improved prime-factor progression and expanded replacement and similarity practice while preserving each lab’s direct manipulation and evidence trail.',
      'Relicensed Examplicity under the MIT License.',
      'Made direct and search-result lab links open inside the full Examplicity navigation and footer frame.',
    ],
    internalChanges: [
      'Updated the shared Lab Kit publication resource and compiled the six approved final artifacts into manifest-owned subject routes with syllabus metadata and standalone downloads.',
      'Added Biology, Chemistry and Physics qualification views, including Co-ordinated Sciences 0654 alignment and verified AS/A routing for 9700, 9701 and 9702.',
      'Aligned repository, package and generated-download license declarations with the MIT License.',
    ],
  },
  {
    date: '2026-08-31',
    displayDate: '31 August 2026',
    publicChanges: [
      'Improved standalone lab downloads, changing-state announcements, catalogue routing safeguards, and keyboard access to bitmap painting, scheduler arrivals, and sound navigation.',
      'Standardized lab title headers across narrow and wide activities, expanded the pseudocode translator workspace, and kept assisted repeated-percentage challenges interactive.',
      'Added keyboard control to circle constructions, network builders, transmission routing, and the 3D perspective check.',
      'Kept the recurring-decimals manipulative fully visible without an internal scrollbar.',
    ],
    internalChanges: [
      'Hardened the standalone lab contract, added hash-pinned shared authoring resources, a versioned publication profile and deterministic publication compilation, and migrated all 46 live labs to source-backed publication with executable-script and interaction-parity regression checks.',
    ],
  },
  {
    date: '2026-08-30',
    displayDate: '30 August 2026',
    publicChanges: [
      'Added five Cambridge IGCSE Mathematics 0580 labs covering time-zone scheduling, sequence patterns, motion graphs, straight-line equations, and perpendicular-bisector construction.',
      'Added five Cambridge IGCSE Mathematics 0580 labs for circle theorems, surface area and volume, right-triangle trigonometry, trigonometric graphs, and non-right triangle solutions.',
      'Added five Cambridge IGCSE Mathematics 0580 labs for three-dimensional trigonometry, transformations, vectors, scatter diagrams, histograms and cumulative frequency.',
    ],
    internalChanges: [
      'Extended Mathematics topic views and manifest-controlled syllabus alignment to Algebra and graphs and Coordinate geometry.',
      'Extended the Mathematics catalogue to Geometry, Mensuration and Trigonometry while preserving each lab’s distinct interaction model and shared control language.',
      'Extended the Mathematics catalogue to Transformations and vectors and Statistics with manifest-owned syllabus alignment and standalone lab packaging.',
    ],
  },
  {
    date: '2026-08-29',
    displayDate: '29 August 2026',
    publicChanges: [
      'Added six Cambridge IGCSE Mathematics 0580 labs covering prime factors, set operations, recurring decimals, rounded bounds, ratio and flow rate, and repeated percentage change.',
      'Added a database normalisation experiment for Cambridge International AS Level Computer Science 9618.',
      'Added Data Transmission Methods, Packet Switching, IPv4 Subnetting, Python Programming Practice, Combinational Logic Circuit Design, and Dijkstra and A* Graph Search.',
      'Added persistent subject and qualification controls, with course-specific topic guidance and syllabus labels.',
      'Made labs downloadable as standalone HTML files and added a guided AI remix workflow with the full starter prompt visible while editing.',
      'Added feedback reporting from both the catalogue and open labs, with clearer categories and privacy safeguards.',
      'Refined the Python workspace, clearer catalogue illustrations, the shared lab frame, and mobile viewing guidance across screen sizes.',
      'Added this changelog so visitors can review meaningful learner-facing improvements in one place.',
    ],
    internalChanges: [
      'Moved lab artifacts into subject folders and extended manifest-controlled subject routes, qualification views, exam mapping and exact syllabus section references to Mathematics.',
      'Added deployment checks for native lab packaging, subject routes, concept-focused card artwork, precise card copy, and shared panel styling.',
      'Added rate limiting, scheduled cleanup, and environment safeguards for feedback reports.',
    ],
  },
  {
    date: '2026-08-28',
    displayDate: '28 August 2026',
    publicChanges: [
      'Integrated the first staged set of Cambridge Computer Science labs into the live catalogue.',
    ],
    internalChanges: [
      'Connected lab content, syllabus alignment, downloads, and page metadata to one shared manifest.',
      'Added site analytics and performance monitoring.',
      'Established the staged lab ingestion workflow.',
    ],
  },
  {
    date: '2026-08-27',
    displayDate: '27 August 2026',
    publicChanges: [
      'Added a consistent header and navigation frame around every lab.',
      'Improved lab layouts for narrower screens and aligned interactive canvases to the homepage width.',
    ],
    internalChanges: [
      'Standardized self-contained lab styles and standalone packaging.',
    ],
  },
];
