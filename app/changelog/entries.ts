export type ChangelogEntry = {
  date: string;
  displayDate: string;
  publicChanges: readonly string[];
  internalChanges: readonly string[];
};

export const changelogEntries: readonly ChangelogEntry[] = [
  {
    date: '2026-08-29',
    displayDate: '29 August 2026',
    publicChanges: [
      'Added the first Mathematics lab, Prime Factors: HCF and LCM, with a new Cambridge IGCSE Mathematics 0580 catalogue view.',
      'Added Data Transmission Methods, Packet Switching, IPv4 Subnetting, Python Programming Practice, Combinational Logic Circuit Design, and Dijkstra and A* Graph Search.',
      'Added persistent subject and qualification controls, with course-specific topic guidance and syllabus labels.',
      'Made labs downloadable as standalone HTML files and added a guided AI remix workflow.',
      'Added feedback reporting from both the catalogue and open labs, with clearer categories and privacy safeguards.',
      'Refined the Python workspace, clearer catalogue illustrations, the shared lab frame, and mobile viewing guidance across screen sizes.',
      'Added this changelog so visitors can review meaningful learner-facing improvements in one place.',
    ],
    internalChanges: [
      'Moved lab artifacts into subject folders and extended manifest-controlled subject routes, qualification views, exam mapping and exact syllabus section references to Mathematics.',
      'Added deployment checks for native lab packaging and subject routes.',
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
