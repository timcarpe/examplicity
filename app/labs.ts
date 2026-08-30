type SyllabusDefinition = {
  subject: string;
  title: string;
  officialPage: string;
  documentUrl: string;
  validFor: string;
  palette: {
    background: string;
    border: string;
    text: string;
    hover: string;
  };
};

export const syllabusRegistry = {
  '0478': {
    subject: 'computer-science',
    title: 'Cambridge IGCSE Computer Science',
    officialPage: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse-computer-science-0478/',
    documentUrl: 'https://www.cambridgeinternational.org/Images/697167-2026-2028-syllabus.pdf',
    validFor: '2026–2028',
    palette: {
      background: '#edf4ff',
      border: '#9ab6e6',
      text: '#173d78',
      hover: '#dce9fc',
    },
  },
  '9618': {
    subject: 'computer-science',
    title: 'Cambridge International AS & A Level Computer Science',
    officialPage: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-international-as-and-a-level-computer-science-9618/',
    documentUrl: 'https://www.cambridgeinternational.org/Images/697372-2026-syllabus.pdf',
    validFor: '2026',
    palette: {
      background: '#f4effb',
      border: '#b9a2dc',
      text: '#4f2b77',
      hover: '#e8ddf6',
    },
  },
  '0580': {
    subject: 'mathematics',
    title: 'Cambridge IGCSE Mathematics',
    officialPage: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-igcse-mathematics-0580/',
    documentUrl: 'https://www.cambridgeinternational.org/Images/662466-2025-2027-syllabus.pdf',
    validFor: '2025–2027',
    palette: {
      background: '#edf8f3',
      border: '#91c4b0',
      text: '#235f4e',
      hover: '#dcf0e7',
    },
  },
} as const satisfies Record<string, SyllabusDefinition>;

export type ExamCode = keyof typeof syllabusRegistry;

export const qualificationLevels = ['IGCSE', 'AS', 'A'] as const;
export type QualificationLevel = (typeof qualificationLevels)[number];
export type SyllabusQualification = QualificationLevel | 'AS/A';

export const syllabusAlignmentIncludesLevel = (
  qualification: SyllabusQualification,
  level: QualificationLevel,
) => qualification === level || (qualification === 'AS/A' && (level === 'AS' || level === 'A'));

export const topics = [
  'Data representation',
  'Networks & communication',
  'Processors & memory',
  'System software',
  'Automated systems',
  'Logic circuits',
  'Artificial intelligence',
  'Databases',
  'Programming',
  'Numbers',
  'Algebra and graphs',
  'Coordinate geometry',
  'Geometry',
  'Mensuration',
  'Trigonometry',
] as const;
export type Topic = (typeof topics)[number];

export type SubjectDefinition = {
  id: string;
  name: string;
  exams: readonly ExamCode[];
  views: Partial<Record<ExamCode, {
    href: string;
    metaDescription: string;
  }>>;
  qualificationViews: Partial<Record<QualificationLevel, {
    exam: ExamCode;
    headerLabel: string;
    intro: string;
    topicBriefings: Partial<Record<Topic, string>>;
  }>>;
};

const subjectDefinitions = [
  {
    id: 'computer-science',
    name: 'Computer Science',
    exams: ['0478', '9618'],
    views: {
      '0478': {
        href: '/computer-science/0478',
        metaDescription: 'Interactive Cambridge IGCSE Computer Science 0478 labs for exam practice, revision and visual concept explanations.',
      },
      '9618': {
        href: '/computer-science/9618',
        metaDescription: 'Interactive Cambridge International AS & A Level Computer Science 9618 labs for exam practice, revision and visual concept explanations.',
      },
    },
    qualificationViews: {
      IGCSE: {
        exam: '0478',
        headerLabel: 'Cambridge IGCSE Computer Science · 0478',
        intro: 'Interactive Cambridge IGCSE Computer Science (0478) labs for exam practice and visual concept explanations you can see, change and understand.',
        topicBriefings: {
          'Data representation': 'Practise binary and hexadecimal conversion, bitmap compression and digital sound representation for Cambridge IGCSE Computer Science 0478.',
          'Networks & communication': 'Explore data transmission methods, packet switching, parity, ARQ, encryption, DNS and web page retrieval for Cambridge IGCSE Computer Science 0478.',
          'Processors & memory': 'Follow the fetch–decode–execute cycle through CPU registers and system buses for Cambridge IGCSE Computer Science 0478.',
          'System software': 'Investigate operating systems, the boot process, paging, virtual memory and cache for Cambridge IGCSE Computer Science 0478.',
          'Automated systems': 'Build and test sensor, microprocessor and actuator control loops for Cambridge IGCSE Computer Science 0478.',
          'Logic circuits': 'Build combinational logic circuits and connect gate functions, Boolean expressions and truth tables for Cambridge IGCSE Computer Science 0478.',
          'Artificial intelligence': 'Explore how computer systems use data and rules to model intelligent behaviour for Cambridge IGCSE Computer Science 0478.',
          Programming: 'Work through guided Python lessons, then write, run and trace Cambridge-style pseudocode alongside Python for Cambridge IGCSE Computer Science 0478 exam practice.',
        } satisfies Partial<Record<Topic, string>>,
      },
      AS: {
        exam: '9618',
        headerLabel: 'Cambridge International AS Level Computer Science · 9618',
        intro: 'Interactive Cambridge International AS Level Computer Science (9618) labs for exam practice and visual concept explanations you can see, change and understand.',
        topicBriefings: {
          'Data representation': 'Practise binary and hexadecimal, image and sound representation, RLE and Huffman coding for Cambridge International AS Level Computer Science 9618.',
          'Networks & communication': 'Explore IPv4 subnetting, parity, DNS, network topologies and Ethernet CSMA/CD for Cambridge International AS Level Computer Science 9618.',
          'Processors & memory': 'Trace the fetch–decode–execute cycle and Cambridge assembly across CPU registers and buses for Cambridge International AS Level Computer Science 9618.',
          'System software': 'Examine software layers, booting and memory management for Cambridge International AS Level Computer Science 9618.',
          'Automated systems': 'Explore monitoring and control systems through sensors, processors, decisions, feedback and actuators for Cambridge International AS Level Computer Science 9618.',
          'Logic circuits': 'Build combinational logic circuits and connect gate functions, Boolean expressions and truth tables for Cambridge International AS Level Computer Science 9618.',
          'Artificial intelligence': 'Review the graph and algorithm foundations used by Artificial Intelligence for Cambridge International AS Level Computer Science 9618.',
          Databases: 'Transform database tables through normalisation and inspect how keys, dependencies and joins preserve data for Cambridge International AS Level Computer Science 9618.',
          Programming: 'Work through guided Python lessons, then write, translate, run and trace Cambridge-style pseudocode alongside Python for Cambridge International AS Level Computer Science 9618 exam practice.',
        } satisfies Partial<Record<Topic, string>>,
      },
      A: {
        exam: '9618',
        headerLabel: 'Cambridge International A Level Computer Science · 9618',
        intro: 'Interactive Cambridge International A Level Computer Science (9618) labs for exam practice and visual concept explanations you can see, change and understand.',
        topicBriefings: {
          'Data representation': 'Explore binary floating-point representation and shared 9618 data-representation foundations for Cambridge International A Level Computer Science 9618.',
          'Networks & communication': 'Explore packet switching, encryption, DNS and the TCP/IP protocol stack for Cambridge International A Level Computer Science 9618.',
          'Processors & memory': 'Trace Cambridge assembly and shared processor foundations across CPU registers and buses for Cambridge International A Level Computer Science 9618.',
          'System software': 'Examine memory management, process states and CPU scheduling for Cambridge International A Level Computer Science 9618.',
          'Automated systems': 'Review shared monitoring and control system foundations for Cambridge International A Level Computer Science 9618.',
          'Logic circuits': 'Review logic-circuit foundations used in advanced digital circuit design for Cambridge International A Level Computer Science 9618.',
          'Artificial intelligence': 'Compare Dijkstra and A* searches on weighted graphs for Cambridge International A Level Computer Science 9618.',
          Programming: 'Write, translate, run and trace Cambridge-style pseudocode alongside Python for Cambridge International A Level Computer Science 9618 exam practice.',
        } satisfies Partial<Record<Topic, string>>,
      },
    },
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    exams: ['0580'],
    views: {
      '0580': {
        href: '/mathematics/0580',
        metaDescription: 'Interactive Cambridge IGCSE Mathematics 0580 labs for exam practice, revision and visual concept explanations.',
      },
    },
    qualificationViews: {
      IGCSE: {
        exam: '0580',
        headerLabel: 'Cambridge IGCSE Mathematics · 0580',
        intro: 'Interactive Cambridge IGCSE Mathematics (0580) labs for exam practice and visual concept explanations you can see, change and understand.',
        topicBriefings: {
          Numbers: 'Manipulate factors, sets, recurring cycles, rounding intervals, ratios, rates and repeated percentage change in interactive Cambridge IGCSE Mathematics 0580 labs.',
          'Algebra and graphs': 'Build sequence rules and connect motion graphs to rate of change and accumulated distance in Cambridge IGCSE Mathematics 0580.',
          'Coordinate geometry': 'Manipulate points and straight lines to connect coordinates, gradient, equations, distance, midpoint, parallel and perpendicular relationships for Cambridge IGCSE Mathematics 0580.',
          Geometry: 'Move geometric constructions and test the angle, tangent and chord relationships that remain invariant for Cambridge IGCSE Mathematics 0580.',
          Mensuration: 'Change solid dimensions and connect surface area, volume, material and capacity for Cambridge IGCSE Mathematics 0580.',
          Trigonometry: 'Operate right and non-right triangles and trace trigonometric functions to connect ratios, solutions and graph structure for Cambridge IGCSE Mathematics 0580.',
        } satisfies Partial<Record<Topic, string>>,
      },
    },
  },
] as const satisfies readonly SubjectDefinition[];
export const subjects = subjectDefinitions;
export type SubjectId = (typeof subjectDefinitions)[number]['id'];

export type Activity = {
  slug: string;
  title: string;
  description: string;
  kind: 'lab' | 'tool';
  href: string;
};

export type Lab = Activity & {
  subject: SubjectId;
  topic: Topic;
  format: string;
  layout?: 'compact';
  metaDescription: string;
  subtitle: string | null;
  syllabuses: {
    code: ExamCode;
    qualification: SyllabusQualification;
    sections: {
      id: string;
      page: number;
      primary?: boolean;
    }[];
  }[];
};

export const translator: Lab = {
  subject: 'computer-science',
  slug: 'translator',
  title: 'Pseudocode ↔ Python',
  description: 'Write, synchronize, run and trace Cambridge-style pseudocode alongside Python.',
  metaDescription: 'Write, translate, run and trace Cambridge-style pseudocode alongside Python for Computer Science 0478 and 9618.',
  subtitle: 'For Cambridge IGCSE and AS & A Level Computer Science (0478 and 9618), write pseudocode or Python, then run or trace either version.',
  topic: 'Programming',
  format: 'Code translator',
  kind: 'tool',
  syllabuses: [
    { code: '0478', qualification: 'IGCSE', sections: [{ id: '4.2', page: 20, primary: true }] },
    { code: '9618', qualification: 'AS', sections: [{ id: '5.2', page: 23, primary: true }] },
  ],
  href: '/labs/computer-science/translator.html',
};

export const labs: Lab[] = [
  {
    subject: 'computer-science',
    slug: 'binary-numbers',
    title: 'Binary Number Practice',
    description: 'Build fluency with binary and hexadecimal registers through generated IGCSE and AS questions.',
    metaDescription: 'Practise binary, denary and hexadecimal conversions for Cambridge Computer Science 0478 and 9618.',
    subtitle: 'Practise binary arithmetic and convert between binary, denary and hexadecimal for Cambridge IGCSE Computer Science 0478 and AS Level Computer Science 9618.',
    topic: 'Data representation',
    format: 'Practice',
    layout: 'compact',
    kind: 'lab',
    syllabuses: [
      { code: '0478', qualification: 'IGCSE', sections: [{ id: '1.1', page: 11, primary: true }] },
      { code: '9618', qualification: 'AS/A', sections: [{ id: '1.1', page: 14, primary: true }, { id: '4.3', page: 22 }] },
    ],
    href: '/labs/computer-science/binary-numbers.html',
  },
  {
    subject: 'computer-science',
    slug: 'bitmap-compression',
    title: 'Bitmap Compression',
    description: 'Paint a bitmap, change its colour depth, and compare normal, RLE and Huffman encoding.',
    metaDescription: 'Explore bitmap colour depth, uncompressed data, run-length encoding and Huffman coding for Cambridge 0478 and 9618.',
    subtitle: 'For Cambridge IGCSE and AS & A Level Computer Science (0478 and 9618), paint a bitmap, choose its colour depth, then compare uncompressed, RLE and Huffman encodings.',
    topic: 'Data representation',
    format: 'Visual experiment',
    kind: 'lab',
    syllabuses: [
      { code: '0478', qualification: 'IGCSE', sections: [{ id: '1.3', page: 13, primary: true }, { id: '1.2', page: 13 }] },
      { code: '9618', qualification: 'AS', sections: [{ id: '1.3', page: 15, primary: true }, { id: '1.2', page: 15 }] },
    ],
    href: '/labs/computer-science/bitmap-compression.html',
  },
  {
    subject: 'computer-science',
    slug: 'binary-floating-point',
    title: 'Binary Floating-Point Precision and Range',
    description: 'Allocate bits between the mantissa and exponent, test authentic datasets, and observe precision, range, rounding, overflow and underflow.',
    metaDescription: 'Explore binary floating-point mantissa and exponent allocation, precision, range, rounding, overflow and underflow for Cambridge A Level Computer Science 9618.',
    subtitle: 'For Cambridge A Level Computer Science 9618, allocate bits between the mantissa and exponent, then compare precision, range, rounding, overflow and underflow.',
    topic: 'Data representation',
    format: 'Representation experiment',
    kind: 'lab',
    syllabuses: [
      { code: '9618', qualification: 'A', sections: [{ id: '13.3', page: 33, primary: true }] },
    ],
    href: '/labs/computer-science/binary-floating-point.html',
  },
  {
    subject: 'computer-science',
    slug: 'sound-sampling',
    title: 'Digital Sound Sampling',
    description: 'Change sample rate and resolution, then compare the reconstructed signal visually and by listening.',
    metaDescription: 'Explore sample rate, bit depth and digital sound reconstruction for Cambridge Computer Science 0478 and 9618.',
    subtitle: 'For Cambridge IGCSE and AS & A Level Computer Science (0478 and 9618), change sample rate and bit depth, then compare the reconstructed sound.',
    topic: 'Data representation',
    format: 'Signal lab',
    kind: 'lab',
    syllabuses: [
      { code: '0478', qualification: 'IGCSE', sections: [{ id: '1.2', page: 12, primary: true }] },
      { code: '9618', qualification: 'AS', sections: [{ id: '1.2', page: 15, primary: true }] },
    ],
    href: '/labs/computer-science/sound-sampling.html',
  },
  {
    subject: 'computer-science',
    slug: 'huffman-rover',
    title: 'Huffman Rover',
    description: 'Design variable-length codes, decode a binary transmission and guide a rover across Mars.',
    metaDescription: 'Practise Huffman coding, variable-length codes and binary decoding for Cambridge A Level Computer Science 9618.',
    subtitle: 'Practise Huffman coding for Cambridge AS & A Level Computer Science 9618 as the rover decodes one movement command at a time.',
    topic: 'Data representation',
    format: 'Coding challenge',
    kind: 'lab',
    syllabuses: [
      { code: '9618', qualification: 'AS', sections: [{ id: '1.3', page: 15, primary: true }] },
    ],
    href: '/labs/computer-science/huffman-rover.html',
  },
  {
    subject: 'computer-science',
    slug: 'parity-arq',
    title: 'Parity & ARQ Transmission',
    description: 'Corrupt frames in flight and watch parity detection and automatic repeat requests respond.',
    metaDescription: 'Explore parity checks, transmission errors and automatic repeat requests for Cambridge Computer Science 0478 and 9618.',
    subtitle: 'For Cambridge IGCSE and AS & A Level Computer Science (0478 and 9618), change bits in transit, then watch parity and ARQ respond.',
    topic: 'Networks & communication',
    format: 'Protocol lab',
    kind: 'lab',
    syllabuses: [
      { code: '0478', qualification: 'IGCSE', sections: [{ id: '2.2', page: 15, primary: true }] },
      { code: '9618', qualification: 'AS', sections: [{ id: '6.2', page: 24, primary: true }] },
    ],
    href: '/labs/computer-science/parity-arq.html',
  },
  {
    subject: 'computer-science',
    slug: 'data-transmission-methods',
    title: 'Data Transmission Methods',
    description: 'Build serial and parallel links, change their direction and routing, and observe attenuation, skew, interference and error checking.',
    metaDescription: 'Explore serial, parallel, simplex and duplex data transmission, physical interference and error checking for Cambridge IGCSE Computer Science 0478.',
    subtitle: 'For Cambridge IGCSE Computer Science 0478, build physical data links and observe how transmission method, direction, distance and interference change the received data.',
    topic: 'Networks & communication',
    format: 'Transmission experiment',
    kind: 'lab',
    syllabuses: [
      { code: '0478', qualification: 'IGCSE', sections: [{ id: '2.1', page: 14, primary: true }, { id: '2.2', page: 15 }] },
    ],
    href: '/labs/computer-science/data-transmission-methods.html',
  },
  {
    subject: 'computer-science',
    slug: 'network-topology',
    title: 'Network Topology Builder',
    description: 'Build bus, star, mesh and hybrid networks, then send packets through your design.',
    metaDescription: 'Build bus, star, mesh and hybrid network topologies for Cambridge A Level Computer Science 9618.',
    subtitle: 'For Cambridge AS & A Level Computer Science 9618, build bus, star, mesh and hybrid networks, then send packets through the result.',
    topic: 'Networks & communication',
    format: 'Network builder',
    kind: 'lab',
    syllabuses: [
      { code: '9618', qualification: 'AS', sections: [{ id: '2.1', page: 16, primary: true }] },
    ],
    href: '/labs/computer-science/network-topology.html',
  },
  {
    subject: 'computer-science',
    slug: 'packet-switching',
    title: 'Packet Switching',
    description: 'Split a message into packets, edit the router topology, and observe independent routes, queues, reordering and reconstruction.',
    metaDescription: 'Explore packet switching, router paths, packet order and message reconstruction for Cambridge Computer Science 0478 and 9618.',
    subtitle: 'For Cambridge IGCSE 0478 and A Level 9618, split a message into packets, route them independently, then watch the receiver reorder and reconstruct the data.',
    topic: 'Networks & communication',
    format: 'Network simulation',
    kind: 'lab',
    syllabuses: [
      { code: '0478', qualification: 'IGCSE', sections: [{ id: '2.1', page: 14, primary: true }] },
      { code: '9618', qualification: 'A', sections: [{ id: '14.2', page: 33, primary: true }] },
    ],
    href: '/labs/computer-science/packet-switching.html',
  },
  {
    subject: 'computer-science',
    slug: 'ipv4-subnetting',
    title: 'IPv4 Subnetting',
    description: 'Divide a campus network into subnets, limit broadcasts, and trace how an IPv4 mask chooses a local host or default gateway.',
    metaDescription: 'Explore IPv4 subnetting, network masks, broadcast boundaries and local-or-remote routing for Cambridge International AS Level Computer Science 9618.',
    subtitle: 'For Cambridge International AS Level Computer Science 9618, divide a campus network into subnets, then trace how a device uses its mask to choose a local host or default gateway.',
    topic: 'Networks & communication',
    format: 'Network design experiment',
    kind: 'lab',
    syllabuses: [
      { code: '9618', qualification: 'AS', sections: [{ id: '2.1', page: 17, primary: true }] },
    ],
    href: '/labs/computer-science/ipv4-subnetting.html',
  },
  {
    subject: 'computer-science',
    slug: 'csma-cd',
    title: 'Ethernet CSMA/CD',
    description: 'Control three stations on a shared cable and observe collision detection and backoff.',
    metaDescription: 'Explore carrier sensing, Ethernet collisions and binary exponential backoff for Cambridge A Level Computer Science 9618.',
    subtitle: 'Explore CSMA/CD for Cambridge AS & A Level Computer Science 9618 as three stations share one cable and respond when two begin at once.',
    topic: 'Networks & communication',
    format: 'Network simulation',
    kind: 'lab',
    syllabuses: [
      { code: '9618', qualification: 'AS', sections: [{ id: '2.1', page: 16, primary: true }] },
    ],
    href: '/labs/computer-science/csma-cd.html',
  },
  {
    subject: 'computer-science',
    slug: 'encryption-in-data-transmission',
    title: 'Encryption in Data Transmission',
    description: 'Send plaintext across a shared channel, place symmetric or asymmetric keys, and compare what the receiver and interceptor can read.',
    metaDescription: 'Explore plaintext, ciphertext and symmetric and asymmetric keys in an interactive transmission lab for Cambridge Computer Science 0478 and 9618.',
    subtitle: 'Type a message. Watch plain text become cipher text on the shared line. Keys decide who can turn it back into plain text.',
    topic: 'Networks & communication',
    format: 'Security experiment',
    kind: 'lab',
    syllabuses: [
      { code: '0478', qualification: 'IGCSE', sections: [{ id: '2.3', page: 15, primary: true }] },
      { code: '9618', qualification: 'A', sections: [{ id: '17.1', page: 36, primary: true }] },
    ],
    href: '/labs/computer-science/encryption-in-data-transmission.html',
  },
  {
    subject: 'computer-science',
    slug: 'dns-web-page-retrieval',
    title: 'DNS and Web Page Retrieval',
    description: 'Enter a URL, trace DNS and web-server requests, and watch returned HTML become a rendered page.',
    metaDescription: 'Trace how a browser uses a URL, DNS, an IP address, a web server and HTML to retrieve and display a page for Cambridge Computer Science 0478 and 9618.',
    subtitle: 'Use the browser, then follow each transfer as DNS turns a domain into an IP address and the browser retrieves the requested HTML page.',
    topic: 'Networks & communication',
    format: 'Browser simulation',
    kind: 'lab',
    syllabuses: [
      { code: '0478', qualification: 'IGCSE', sections: [{ id: '5.1', page: 22, primary: true }] },
      { code: '9618', qualification: 'AS/A', sections: [{ id: '2.1', page: 17, primary: true }, { id: '14.1', page: 33 }] },
    ],
    href: '/labs/computer-science/dns-web-page-retrieval.html',
  },
  {
    subject: 'computer-science',
    slug: 'tcp-ip-encapsulation',
    title: 'TCP/IP Protocol Stack',
    description: 'Wrap an application message in transport, internet and link-layer headers, then unpack it at the receiver.',
    metaDescription: 'Build and unpack the four-layer TCP/IP protocol stack to see how ports, IP addresses and MAC addresses support communication for Cambridge 9618.',
    subtitle: 'Build one transmitted object. Each lower layer adds its own header around everything the layer above already produced.',
    topic: 'Networks & communication',
    format: 'Protocol lab',
    kind: 'lab',
    syllabuses: [
      { code: '9618', qualification: 'A', sections: [{ id: '14.1', page: 33, primary: true }] },
    ],
    href: '/labs/computer-science/tcp-ip-encapsulation.html',
  },
  {
    subject: 'computer-science',
    slug: 'fetch-decode-execute',
    title: 'Fetch–Decode–Execute',
    description: 'Advance one clock tick at a time and follow data across CPU pathways and system buses.',
    metaDescription: 'Follow the fetch–decode–execute cycle, CPU registers and system buses for Cambridge Computer Science 0478 and 9618.',
    subtitle: 'For Cambridge IGCSE and AS & A Level Computer Science (0478 and 9618), follow each micro-operation through the fetch–decode–execute cycle.',
    topic: 'Processors & memory',
    format: 'CPU simulator',
    kind: 'lab',
    syllabuses: [
      { code: '0478', qualification: 'IGCSE', sections: [{ id: '3.1', page: 16, primary: true }] },
      { code: '9618', qualification: 'AS', sections: [{ id: '4.1', page: 19, primary: true }] },
    ],
    href: '/labs/computer-science/fetch-decode-execute.html',
  },
  {
    subject: 'computer-science',
    slug: 'assembly',
    title: 'Cambridge Assembly',
    description: 'Trace a Cambridge-style assembly program and follow every transfer through the processor.',
    metaDescription: 'Trace Cambridge 9618 assembly instructions and follow register transfers through a stored-program computer.',
    subtitle: 'Practise assembly for Cambridge AS & A Level Computer Science 9618 and follow each register transfer within a stored-program computer.',
    topic: 'Processors & memory',
    format: 'Code tracer',
    kind: 'lab',
    syllabuses: [
      { code: '9618', qualification: 'AS/A', sections: [{ id: '4.2', page: 20, primary: true }, { id: '4.3', page: 22 }] },
    ],
    href: '/labs/computer-science/assembly.html',
  },
  {
    subject: 'computer-science',
    slug: 'software-stack',
    title: 'Software Stack & Boot Process',
    description: 'Build the software layers, power on the system and test whether an application can run.',
    metaDescription: 'Explore the operating-system software stack and computer boot process for Cambridge Computer Science 0478 and 9618.',
    subtitle: 'For Cambridge IGCSE and AS & A Level Computer Science (0478 and 9618), arrange the software layers, boot the system and test an application.',
    topic: 'System software',
    format: 'Systems model',
    kind: 'lab',
    syllabuses: [
      { code: '0478', qualification: 'IGCSE', sections: [{ id: '4.1', page: 20, primary: true }] },
      { code: '9618', qualification: 'AS', sections: [{ id: '5.1', page: 23, primary: true }] },
    ],
    href: '/labs/computer-science/software-stack.html',
  },
  {
    subject: 'computer-science',
    slug: 'memory-management',
    title: 'OS Memory Management',
    description: 'Create realistic workloads and watch pages move between storage, RAM, page file and cache.',
    metaDescription: 'Explore operating-system paging, RAM, virtual memory and CPU cache for Cambridge Computer Science 0478 and 9618.',
    subtitle: 'For Cambridge IGCSE and AS & A Level Computer Science (0478 and 9618), create workloads and watch pages move between storage, RAM, the page file and CPU cache.',
    topic: 'System software',
    format: 'OS simulation',
    kind: 'lab',
    syllabuses: [
      { code: '0478', qualification: 'IGCSE', sections: [{ id: '3.3', page: 18, primary: true }, { id: '3.1', page: 16 }] },
      { code: '9618', qualification: 'A', sections: [{ id: '16.1', page: 35, primary: true }] },
    ],
    href: '/labs/computer-science/memory-management.html',
  },
  {
    subject: 'computer-science',
    slug: 'process-states-scheduling',
    title: 'Process States and Scheduling',
    description: 'Build CPU scheduling rules, move processes through ready, running and blocked states, and compare waiting and response times.',
    metaDescription: 'Compare process states and CPU scheduling routines including FCFS, SJF, SRTF and round robin for Cambridge A Level Computer Science 9618.',
    subtitle: 'Build the scheduler rather than selecting its name. Watch each rule change who waits in Ready, who runs, and when blocked work becomes eligible again.',
    topic: 'System software',
    format: 'OS simulation',
    kind: 'lab',
    syllabuses: [
      { code: '9618', qualification: 'A', sections: [{ id: '16.1', page: 35, primary: true }] },
    ],
    href: '/labs/computer-science/process-states-scheduling.html',
  },
  {
    subject: 'computer-science',
    slug: 'automated-system-control-flowcharts',
    title: 'Automated Systems',
    description: 'Build a sensor-to-actuator control flowchart, then run an automated bottle line to trace analogue-to-digital conversion, decisions and feedback.',
    metaDescription: 'Build and test automated systems with sensors, analogue-to-digital conversion, microprocessors, decisions, feedback and actuators for Cambridge Computer Science 0478 and 9618.',
    subtitle: 'For Cambridge IGCSE 0478 and AS Level 9618, build a sensor-to-actuator control flowchart and test it on an automated bottle-inspection line.',
    topic: 'Automated systems',
    format: 'Flowchart builder',
    kind: 'lab',
    syllabuses: [
      { code: '0478', qualification: 'IGCSE', sections: [{ id: '6.1', page: 23, primary: true }, { id: '3.2', page: 17 }] },
      { code: '9618', qualification: 'AS', sections: [{ id: '3.1', page: 17, primary: true }, { id: '9.2', page: 27 }] },
    ],
    href: '/labs/computer-science/automated-system-control-flowcharts.html',
  },
  {
    subject: 'computer-science',
    slug: 'combinational-logic-circuit-design',
    title: 'Combinational Logic Circuit Design',
    description: 'Build two- and three-input logic circuits, trace live signals, and compare their expressions and outputs with every truth-table row.',
    metaDescription: 'Build and test combinational logic circuits, trace live signals and truth tables, and connect gate behaviour to Boolean expressions for Cambridge Computer Science 0478 and 9618.',
    subtitle: 'For Cambridge IGCSE 0478 and AS Level 9618, build two- and three-input logic circuits, then trace gates, expressions and every truth-table row.',
    topic: 'Logic circuits',
    format: 'Circuit builder',
    kind: 'lab',
    syllabuses: [
      { code: '0478', qualification: 'IGCSE', sections: [{ id: '10', page: 31, primary: true }] },
      { code: '9618', qualification: 'AS', sections: [{ id: '3.2', page: 18, primary: true }] },
    ],
    href: '/labs/computer-science/combinational-logic-circuit-design.html',
  },
  {
    subject: 'computer-science',
    slug: 'dijkstra-a-star-graph-search',
    title: 'Dijkstra and A* Graph Search',
    description: 'Compare Dijkstra and A* as they settle frontier nodes, find a shortest route, and respond when you change a road cost.',
    metaDescription: 'Explore graph structure, Dijkstra and A* search by predicting frontier choices, comparing route costs and editing a weighted graph for Cambridge A Level Computer Science 9618.',
    subtitle: 'For Cambridge A Level 9618, predict each algorithm’s next frontier choice, follow its route costs, and change a road to test how the search responds.',
    topic: 'Artificial intelligence',
    format: 'Graph search experiment',
    kind: 'lab',
    syllabuses: [
      { code: '9618', qualification: 'A', sections: [{ id: '18.1', page: 36, primary: true }] },
    ],
    href: '/labs/computer-science/dijkstra-a-star-graph-search.html',
  },
  {
    subject: 'computer-science',
    slug: 'database-normalisation',
    title: 'Database Normalisation to Third Normal Form',
    description: 'Merge repeated facts, separate dependencies, and verify that reconstructed joins preserve the original records through 1NF, 2NF and 3NF.',
    metaDescription: 'Explore database normalisation to 3NF by merging duplicate facts, separating dependencies and reconstructing relations for Cambridge International AS Level Computer Science 9618.',
    subtitle: 'For Cambridge International AS Level 9618, remove repeated facts and dependency anomalies while preserving the registrar’s reconstructed view.',
    topic: 'Databases',
    format: 'Database experiment',
    kind: 'lab',
    syllabuses: [
      { code: '9618', qualification: 'AS', sections: [{ id: '8.1', page: 25, primary: true }] },
    ],
    href: '/labs/computer-science/database-normalisation.html',
  },
  {
    subject: 'mathematics',
    slug: 'prime-factors-hcf-lcm',
    title: 'Prime Factors: HCF and LCM',
    description: 'Build prime-factor rows, pair shared copies, and compare the HCF core with the full factor set that rebuilds both numbers.',
    metaDescription: 'Explore prime factorisation, common factors, HCF and LCM by building factor rows and comparing prime copy counts for Cambridge IGCSE Mathematics 0580.',
    subtitle: 'Build two prime-factor rows, pair equal copies, and compare the minimum counts for the HCF with the maximum counts for the LCM.',
    topic: 'Numbers',
    format: 'Prime-factor builder',
    kind: 'lab',
    layout: 'compact',
    syllabuses: [
      {
        code: '0580',
        qualification: 'IGCSE',
        sections: [
          { id: 'C1.1', page: 12, primary: true },
          { id: 'E1.1', page: 32 },
        ],
      },
    ],
    href: '/labs/mathematics/prime-factors-hcf-lcm.html',
  },
  {
    subject: 'mathematics',
    slug: 'ratio-concentration-flow-rate',
    title: 'Ratio, Concentration and Flow Rate',
    description: 'Adjust two pump rates, preserve a recipe while changing line speed, and compare mixture composition with total throughput.',
    metaDescription: 'Explore ratio, concentration and flow rate by controlling a two-ingredient bottling line for Cambridge IGCSE Mathematics 0580 Core and Extended.',
    subtitle: 'Tune two pump rates to hold a recipe, change the line speed, and see composition and throughput move independently.',
    topic: 'Numbers',
    format: 'Mixture-flow controller',
    kind: 'lab',
    syllabuses: [
      {
        code: '0580',
        qualification: 'IGCSE',
        sections: [
          { id: 'C1.11', page: 15, primary: true },
          { id: 'E1.11', page: 34 },
          { id: 'C1.12', page: 15 },
          { id: 'E1.12', page: 35 },
        ],
      },
    ],
    href: '/labs/mathematics/ratio-concentration-flow-rate.html',
  },
  {
    subject: 'mathematics',
    slug: 'recurring-decimals-fractions',
    title: 'Recurring Decimals and Fractions',
    description: 'Slide recurring decimal rows into phase, subtract the shared tail, and trace the remainder cycle to an exact fraction.',
    metaDescription: 'Convert recurring decimals to fractions by aligning repeating tails and tracing remainder cycles for Cambridge IGCSE Mathematics 0580 Extended.',
    subtitle: 'Slide the rows until the recurring tail cancels, then follow the matching remainder cycle to the exact fraction.',
    topic: 'Numbers',
    format: 'Recurring-fraction proof',
    kind: 'lab',
    syllabuses: [
      { code: '0580', qualification: 'IGCSE', sections: [{ id: 'E1.4', page: 33, primary: true }] },
    ],
    href: '/labs/mathematics/recurring-decimals-fractions.html',
  },
  {
    subject: 'mathematics',
    slug: 'rounded-measurements-bounds',
    title: 'Rounded Measurements and Bounds',
    description: 'Drag the true values hidden by rounding, calculate the fastest and slowest speeds, and test whether the claim is guaranteed.',
    metaDescription: 'Explore rounded measurements, upper and lower bounds, and bounds of calculated results for Cambridge IGCSE Mathematics 0580 Core and Extended.',
    subtitle: 'Drag the true values hidden by rounding, then combine the extreme values to test whether the speed claim is guaranteed.',
    topic: 'Numbers',
    format: 'Bounds proof',
    kind: 'lab',
    syllabuses: [
      {
        code: '0580',
        qualification: 'IGCSE',
        sections: [
          { id: 'C1.10', page: 14, primary: true },
          { id: 'E1.10', page: 34 },
          { id: 'C1.9', page: 14 },
          { id: 'E1.9', page: 34 },
        ],
      },
    ],
    href: '/labs/mathematics/rounded-measurements-bounds.html',
  },
  {
    subject: 'mathematics',
    slug: 'repeated-percentage-change',
    title: 'Repeated Percentage Change',
    description: 'Apply each percentage to the changing base, derive the reusable multiplier, and reverse the final value with its inverse.',
    metaDescription: 'Explore repeated and reverse percentage change, compound growth and decay, and percentage multipliers for Cambridge IGCSE Mathematics 0580.',
    subtitle: 'Apply each change to the new base, derive one reusable multiplier, and use it forwards and backwards.',
    topic: 'Numbers',
    format: 'Multiplier model',
    kind: 'lab',
    syllabuses: [
      {
        code: '0580',
        qualification: 'IGCSE',
        sections: [
          { id: 'E1.13', page: 35, primary: true },
          { id: 'C1.13', page: 15 },
          { id: 'E1.17', page: 36 },
        ],
      },
    ],
    href: '/labs/mathematics/repeated-percentage-change.html',
  },
  {
    subject: 'mathematics',
    slug: 'set-membership-operations',
    title: 'Set Membership and Operations',
    description: 'Place students by membership, choose union, intersection or complement, and send each message to exactly the right recipients.',
    metaDescription: 'Explore set notation, membership, union, intersection, complement and Venn diagrams for Cambridge IGCSE Mathematics 0580 Core and Extended.',
    subtitle: 'Move students into their Venn regions, build union, intersection or complement rules, and test the exact recipients.',
    topic: 'Numbers',
    format: 'Venn query builder',
    kind: 'lab',
    syllabuses: [
      {
        code: '0580',
        qualification: 'IGCSE',
        sections: [
          { id: 'C1.2', page: 13, primary: true },
          { id: 'E1.2', page: 32 },
        ],
      },
    ],
    href: '/labs/mathematics/set-membership-operations.html',
  },
  {
    subject: 'mathematics',
    slug: 'time-zone-timetable-constraints',
    title: 'Time Zones and Timetable Constraints',
    description: 'Schedule one event across several local calendars, convert its time and date, and test whether every participant can attend.',
    metaDescription: 'Explore time zones, local times, dates and timetable constraints with an interactive scheduling system for Cambridge IGCSE Mathematics 0580.',
    subtitle: 'Choose one local meeting time, send the proposal, then determine whether that same event fits every participant’s local calendar.',
    topic: 'Numbers',
    format: 'Multi-zone scheduler',
    kind: 'lab',
    syllabuses: [
      {
        code: '0580',
        qualification: 'IGCSE',
        sections: [
          { id: 'C1.15', page: 16, primary: true },
          { id: 'E1.15', page: 36 },
        ],
      },
    ],
    href: '/labs/mathematics/time-zone-timetable-constraints.html',
  },
  {
    subject: 'mathematics',
    slug: 'sequence-patterns-differences',
    title: 'Sequence Patterns and Differences',
    description: 'Grow visual patterns, compare successive differences, and test whether an nth-term rule continues to predict every constructed stage.',
    metaDescription: 'Explore sequence patterns, successive differences and nth-term rules with an interactive pattern builder for Cambridge IGCSE Mathematics 0580.',
    subtitle: 'Build each stage, inspect how its terms and differences change, then use that structure to justify or reject an nth-term rule.',
    topic: 'Algebra and graphs',
    format: 'Pattern and difference builder',
    kind: 'lab',
    syllabuses: [
      {
        code: '0580',
        qualification: 'IGCSE',
        sections: [
          { id: 'C2.7', page: 18, primary: true },
          { id: 'E2.7', page: 39 },
        ],
      },
    ],
    href: '/labs/mathematics/sequence-patterns-differences.html',
  },
  {
    subject: 'mathematics',
    slug: 'motion-graph-rate-area',
    title: 'Motion Graphs: Rate and Area',
    description: 'Configure a journey, compare distance–time and speed–time graphs, and connect gradient to rate and area to distance travelled.',
    metaDescription: 'Explore motion graphs, rate of change and area under speed-time graphs through interactive journeys for Cambridge IGCSE Mathematics 0580.',
    subtitle: 'Shape a journey, trace it across distance–time and speed–time graphs, then use gradient and area to recover its motion.',
    topic: 'Algebra and graphs',
    format: 'Journey graph simulator',
    kind: 'lab',
    syllabuses: [
      {
        code: '0580',
        qualification: 'IGCSE',
        sections: [
          { id: 'E2.9', page: 40, primary: true },
          { id: 'C2.9', page: 18 },
        ],
      },
    ],
    href: '/labs/mathematics/motion-graph-rate-area.html',
  },
  {
    subject: 'mathematics',
    slug: 'straight-line-coordinates-equations',
    title: 'Straight-Line Coordinates and Equations',
    description: 'Align a guide rail through coordinate constraints, then connect its points, gradient, intercept, equation and parallel displacement.',
    metaDescription: 'Explore straight-line coordinates, gradients, equations and parallel lines with an interactive rail alignment system for Cambridge IGCSE Mathematics 0580.',
    subtitle: 'Align each guide rail, test its full travel, and connect coordinates, gradient, intercept and equation as one straight line.',
    topic: 'Coordinate geometry',
    format: 'Straight-line constraint builder',
    kind: 'lab',
    syllabuses: [
      {
        code: '0580',
        qualification: 'IGCSE',
        sections: [
          { id: 'C3.5', page: 20, primary: true },
          { id: 'C3.1', page: 20 },
          { id: 'C3.2', page: 20 },
          { id: 'C3.3', page: 20 },
          { id: 'C3.6', page: 20 },
          { id: 'E3.1', page: 43 },
          { id: 'E3.2', page: 43 },
          { id: 'E3.3', page: 43 },
          { id: 'E3.5', page: 43 },
          { id: 'E3.6', page: 44 },
        ],
      },
    ],
    href: '/labs/mathematics/straight-line-coordinates-equations.html',
  },
  {
    subject: 'mathematics',
    slug: 'coordinate-distance-midpoint-perpendicular',
    title: 'Coordinate Distance, Midpoint and Perpendicular Lines',
    description: 'Move two endpoints, construct their equal-distance boundary, and connect distance, midpoint and gradient to its perpendicular equation.',
    metaDescription: 'Explore coordinate distance, midpoint, gradient and perpendicular bisectors through an equal-distance construction for Cambridge IGCSE Mathematics 0580 Extended.',
    subtitle: 'Move the endpoints and test points, then use distance, midpoint and gradient evidence to construct the perpendicular bisector.',
    topic: 'Coordinate geometry',
    format: 'Perpendicular-bisector construction',
    kind: 'lab',
    syllabuses: [
      {
        code: '0580',
        qualification: 'IGCSE',
        sections: [
          { id: 'E3.7', page: 44, primary: true },
          { id: 'E3.1', page: 43 },
          { id: 'E3.3', page: 43 },
          { id: 'E3.4', page: 43 },
        ],
      },
    ],
    href: '/labs/mathematics/coordinate-distance-midpoint-perpendicular.html',
  },
  {
    subject: 'mathematics',
    slug: 'circle-theorem-constraint-network',
    title: 'Circle Theorems and Geometric Relationships',
    description: 'Move points, chords and tangents, test which relationships remain invariant, and use the required circle theorem to complete each calculation.',
    metaDescription: 'Explore circle theorems, tangent and chord properties, and angle relationships through dynamic geometry for Cambridge IGCSE Mathematics 0580.',
    subtitle: 'Move the construction, test the invariant relationships, then use the circle theorem that the problem actually needs.',
    topic: 'Geometry',
    format: 'Dynamic circle geometry',
    kind: 'lab',
    syllabuses: [
      {
        code: '0580',
        qualification: 'IGCSE',
        sections: [
          { id: 'C4.7', page: 24, primary: true },
          { id: 'E4.7', page: 48 },
          { id: 'E4.8', page: 48 },
        ],
      },
    ],
    href: '/labs/mathematics/circle-theorem-constraint-network.html',
  },
  {
    subject: 'mathematics',
    slug: 'solid-surface-volume-tradeoffs',
    title: 'Surface Area and Volume of Solids',
    description: 'Change a solid’s dimensions, compare material with capacity, and connect each visible face or cross-section to the surface-area and volume calculations.',
    metaDescription: 'Explore surface area and volume of solids by changing dimensions and comparing material and capacity for Cambridge IGCSE Mathematics 0580.',
    subtitle: 'Change the solid, inspect the material and capacity consequences, then account for every surface and volume term.',
    topic: 'Mensuration',
    format: 'Solid dimension workbench',
    kind: 'lab',
    syllabuses: [
      {
        code: '0580',
        qualification: 'IGCSE',
        sections: [
          { id: 'C5.4', page: 25, primary: true },
          { id: 'E5.4', page: 49 },
        ],
      },
    ],
    href: '/labs/mathematics/solid-surface-volume-tradeoffs.html',
  },
  {
    subject: 'mathematics',
    slug: 'right-triangle-ratio-invariance',
    title: 'Right-Triangle Trigonometry',
    description: 'Choose a reference angle, resize a right triangle, identify opposite, adjacent and hypotenuse, and use the invariant ratio to find a missing side.',
    metaDescription: 'Explore right-triangle trigonometry, side roles and sine, cosine and tangent ratios for Cambridge IGCSE Mathematics 0580.',
    subtitle: 'Resize the triangle around one angle, identify the side roles, and use the ratio that remains unchanged to solve the problem.',
    topic: 'Trigonometry',
    format: 'Right-triangle ratio model',
    kind: 'lab',
    syllabuses: [
      {
        code: '0580',
        qualification: 'IGCSE',
        sections: [
          { id: 'C6.2', page: 27, primary: true },
          { id: 'E6.2', page: 51 },
        ],
      },
    ],
    href: '/labs/mathematics/right-triangle-ratio-invariance.html',
  },
  {
    subject: 'mathematics',
    slug: 'trigonometric-function-periodicity-solutions',
    title: 'Trigonometric Graphs and Solutions',
    description: 'Rotate through a complete turn, trace sine, cosine and tangent graphs, and use periodicity and symmetry to find every solution in the interval.',
    metaDescription: 'Explore sine, cosine and tangent graphs, periodicity and interval solutions for Cambridge IGCSE Mathematics 0580 Extended.',
    subtitle: 'Rotate one angle through 0°–360°, watch the function draw its graph, and use every target crossing to complete the solution set.',
    topic: 'Trigonometry',
    format: 'Trigonometric graph tracer',
    kind: 'lab',
    syllabuses: [
      { code: '0580', qualification: 'IGCSE', sections: [{ id: 'E6.4', page: 51, primary: true }] },
    ],
    href: '/labs/mathematics/trigonometric-function-periodicity-solutions.html',
  },
  {
    subject: 'mathematics',
    slug: 'non-right-triangle-solution-constraints',
    title: 'Non-Right Triangle Solutions',
    description: 'Change sides and angles, apply the sine rule, and test why an SSA problem can produce zero, one or two valid triangles.',
    metaDescription: 'Explore the sine rule and ambiguous SSA case by testing zero, one and two non-right triangle solutions for Cambridge IGCSE Mathematics 0580 Extended.',
    subtitle: 'Construct the triangle candidates, follow the sine-rule calculation, and test which angles produce a valid completed triangle.',
    topic: 'Trigonometry',
    format: 'Ambiguous-case triangle solver',
    kind: 'lab',
    syllabuses: [
      { code: '0580', qualification: 'IGCSE', sections: [{ id: 'E6.5', page: 52, primary: true }] },
    ],
    href: '/labs/mathematics/non-right-triangle-solution-constraints.html',
  },
  {
    subject: 'computer-science',
    slug: 'python-programming-practice',
    title: 'Python Programming Practice',
    description: 'Build and test Python programs through guided examples and challenges covering input, selection, iteration, lists and functions.',
    metaDescription: 'Practise core Python programming constructs through guided examples, editable challenges and an offline interpreter for Cambridge Computer Science 0478 and 9618.',
    subtitle: 'For Cambridge IGCSE 0478 and AS Level 9618, practise core programming constructs in Python through examples, editable challenges and an offline interpreter.',
    topic: 'Programming',
    format: 'Guided coding',
    kind: 'tool',
    syllabuses: [
      { code: '0478', qualification: 'IGCSE', sections: [{ id: '8.1', page: 27, primary: true }, { id: '8.2', page: 29 }] },
      { code: '9618', qualification: 'AS', sections: [{ id: '11.1', page: 29, primary: true }, { id: '11.2', page: 29 }, { id: '11.3', page: 30 }, { id: '10.2', page: 28 }] },
    ],
    href: '/labs/computer-science/python-programming-practice.html',
  },
  translator,
];
