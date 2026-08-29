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
} as const satisfies Record<string, SyllabusDefinition>;

export type ExamCode = keyof typeof syllabusRegistry;

export const subjects = [
  {
    id: 'computer-science',
    name: 'Computer Science',
    exams: ['0478', '9618'],
    views: {
      '0478': {
        href: '/computer-science/0478',
        headerLabel: 'Cambridge IGCSE Computer Science · 0478',
        intro: 'Interactive Cambridge IGCSE Computer Science (0478) labs for exam practice and visual concept explanations you can see, change and understand.',
        metaDescription: 'Interactive Cambridge IGCSE Computer Science 0478 labs for exam practice, revision and visual concept explanations.',
      },
      '9618': {
        href: '/computer-science/9618',
        headerLabel: 'Cambridge AS & A Level Computer Science · 9618',
        intro: 'Interactive Cambridge International AS & A Level Computer Science (9618) labs for exam practice and visual concept explanations you can see, change and understand.',
        metaDescription: 'Interactive Cambridge International AS & A Level Computer Science 9618 labs for exam practice, revision and visual concept explanations.',
      },
    },
  },
] as const;
export type SubjectId = (typeof subjects)[number]['id'];

export type Activity = {
  slug: string;
  title: string;
  description: string;
  kind: 'lab' | 'tool';
  href: string;
};

export type Lab = Activity & {
  subject: SubjectId;
  topic: string;
  format: string;
  syllabuses: {
    code: ExamCode;
    qualification: string;
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
  topic: 'Programming',
  format: 'Code translator',
  kind: 'tool',
  syllabuses: [
    { code: '0478', qualification: 'GCSE', sections: [{ id: '4.2', page: 20, primary: true }] },
    { code: '9618', qualification: 'AS', sections: [{ id: '5.2', page: 23, primary: true }] },
  ],
  href: '/labs/translator.html',
};

export const labs: Lab[] = [
  {
    subject: 'computer-science',
    slug: 'binary-numbers',
    title: 'Binary Number Practice',
    description: 'Build fluency with binary and hexadecimal registers through generated GCSE and AS questions.',
    topic: 'Data representation',
    format: 'Practice',
    kind: 'lab',
    syllabuses: [
      { code: '0478', qualification: 'GCSE', sections: [{ id: '1.1', page: 11, primary: true }] },
      { code: '9618', qualification: 'AS/A', sections: [{ id: '1.1', page: 14, primary: true }, { id: '4.3', page: 22 }] },
    ],
    href: '/labs/binary-numbers.html',
  },
  {
    subject: 'computer-science',
    slug: 'bitmap-compression',
    title: 'Bitmap Compression',
    description: 'Paint a bitmap, change its colour depth, and compare normal, RLE and Huffman encoding.',
    topic: 'Data representation',
    format: 'Visual experiment',
    kind: 'lab',
    syllabuses: [
      { code: '0478', qualification: 'GCSE', sections: [{ id: '1.3', page: 13, primary: true }, { id: '1.2', page: 13 }] },
      { code: '9618', qualification: 'AS', sections: [{ id: '1.3', page: 15, primary: true }, { id: '1.2', page: 15 }] },
    ],
    href: '/labs/bitmap-compression.html',
  },
  {
    subject: 'computer-science',
    slug: 'binary-floating-point',
    title: 'Binary Floating-Point Precision and Range',
    description: 'Allocate bits between the mantissa and exponent, test authentic datasets, and observe precision, range, rounding, overflow and underflow.',
    topic: 'Data representation',
    format: 'Representation experiment',
    kind: 'lab',
    syllabuses: [
      { code: '9618', qualification: 'A', sections: [{ id: '13.3', page: 33, primary: true }] },
    ],
    href: '/labs/binary-floating-point.html',
  },
  {
    subject: 'computer-science',
    slug: 'sound-sampling',
    title: 'Digital Sound Sampling',
    description: 'Change sample rate and resolution, then compare the reconstructed signal visually and by listening.',
    topic: 'Data representation',
    format: 'Signal lab',
    kind: 'lab',
    syllabuses: [
      { code: '0478', qualification: 'GCSE', sections: [{ id: '1.2', page: 12, primary: true }] },
      { code: '9618', qualification: 'AS', sections: [{ id: '1.2', page: 15, primary: true }] },
    ],
    href: '/labs/sound-sampling.html',
  },
  {
    subject: 'computer-science',
    slug: 'huffman-rover',
    title: 'Huffman Rover',
    description: 'Design variable-length codes, decode a binary transmission and guide a rover across Mars.',
    topic: 'Data representation',
    format: 'Coding challenge',
    kind: 'lab',
    syllabuses: [
      { code: '9618', qualification: 'AS', sections: [{ id: '1.3', page: 15, primary: true }] },
    ],
    href: '/labs/huffman-rover.html',
  },
  {
    subject: 'computer-science',
    slug: 'parity-arq',
    title: 'Parity & ARQ Transmission',
    description: 'Corrupt frames in flight and watch parity detection and automatic repeat requests respond.',
    topic: 'Networks & communication',
    format: 'Protocol lab',
    kind: 'lab',
    syllabuses: [
      { code: '0478', qualification: 'GCSE', sections: [{ id: '2.2', page: 15, primary: true }] },
      { code: '9618', qualification: 'AS', sections: [{ id: '6.2', page: 24, primary: true }] },
    ],
    href: '/labs/parity-arq.html',
  },
  {
    subject: 'computer-science',
    slug: 'network-topology',
    title: 'Network Topology Builder',
    description: 'Build bus, star, mesh and hybrid networks, then send packets through your design.',
    topic: 'Networks & communication',
    format: 'Network builder',
    kind: 'lab',
    syllabuses: [
      { code: '9618', qualification: 'AS', sections: [{ id: '2.1', page: 16, primary: true }] },
    ],
    href: '/labs/network-topology.html',
  },
  {
    subject: 'computer-science',
    slug: 'csma-cd',
    title: 'Ethernet CSMA/CD',
    description: 'Control three stations on a shared cable and observe collision detection and backoff.',
    topic: 'Networks & communication',
    format: 'Network simulation',
    kind: 'lab',
    syllabuses: [
      { code: '9618', qualification: 'AS', sections: [{ id: '2.1', page: 16, primary: true }] },
    ],
    href: '/labs/csma-cd.html',
  },
  {
    subject: 'computer-science',
    slug: 'encryption-in-data-transmission',
    title: 'Encryption in Data Transmission',
    description: 'Send plaintext across a shared channel, place symmetric or asymmetric keys, and compare what the receiver and interceptor can read.',
    topic: 'Networks & communication',
    format: 'Security experiment',
    kind: 'lab',
    syllabuses: [
      { code: '0478', qualification: 'GCSE', sections: [{ id: '2.3', page: 15, primary: true }] },
      { code: '9618', qualification: 'A', sections: [{ id: '17.1', page: 36, primary: true }] },
    ],
    href: '/labs/encryption-in-data-transmission.html',
  },
  {
    subject: 'computer-science',
    slug: 'dns-web-page-retrieval',
    title: 'DNS and Web Page Retrieval',
    description: 'Enter a URL, trace DNS and web-server requests, and watch returned HTML become a rendered page.',
    topic: 'Networks & communication',
    format: 'Browser simulation',
    kind: 'lab',
    syllabuses: [
      { code: '0478', qualification: 'GCSE', sections: [{ id: '5.1', page: 22, primary: true }] },
      { code: '9618', qualification: 'AS/A', sections: [{ id: '2.1', page: 17, primary: true }, { id: '14.1', page: 33 }] },
    ],
    href: '/labs/dns-web-page-retrieval.html',
  },
  {
    subject: 'computer-science',
    slug: 'tcp-ip-encapsulation',
    title: 'TCP/IP Protocol Stack',
    description: 'Wrap an application message in transport, internet and link-layer headers, then unpack it at the receiver.',
    topic: 'Networks & communication',
    format: 'Protocol lab',
    kind: 'lab',
    syllabuses: [
      { code: '9618', qualification: 'A', sections: [{ id: '14.1', page: 33, primary: true }] },
    ],
    href: '/labs/tcp-ip-encapsulation.html',
  },
  {
    subject: 'computer-science',
    slug: 'fetch-decode-execute',
    title: 'Fetch–Decode–Execute',
    description: 'Advance one clock tick at a time and follow data across CPU pathways and system buses.',
    topic: 'Processors & memory',
    format: 'CPU simulator',
    kind: 'lab',
    syllabuses: [
      { code: '0478', qualification: 'GCSE', sections: [{ id: '3.1', page: 16, primary: true }] },
      { code: '9618', qualification: 'AS', sections: [{ id: '4.1', page: 19, primary: true }] },
    ],
    href: '/labs/fetch-decode-execute.html',
  },
  {
    subject: 'computer-science',
    slug: 'assembly',
    title: 'Cambridge Assembly',
    description: 'Trace a Cambridge-style assembly program and follow every transfer through the processor.',
    topic: 'Processors & memory',
    format: 'Code tracer',
    kind: 'lab',
    syllabuses: [
      { code: '9618', qualification: 'AS/A', sections: [{ id: '4.2', page: 20, primary: true }, { id: '4.3', page: 22 }] },
    ],
    href: '/labs/assembly.html',
  },
  {
    subject: 'computer-science',
    slug: 'software-stack',
    title: 'Software Stack & Boot Process',
    description: 'Build the software layers, power on the system and test whether an application can run.',
    topic: 'System software',
    format: 'Systems model',
    kind: 'lab',
    syllabuses: [
      { code: '0478', qualification: 'GCSE', sections: [{ id: '4.1', page: 20, primary: true }] },
      { code: '9618', qualification: 'AS', sections: [{ id: '5.1', page: 23, primary: true }] },
    ],
    href: '/labs/software-stack.html',
  },
  {
    subject: 'computer-science',
    slug: 'memory-management',
    title: 'OS Memory Management',
    description: 'Create realistic workloads and watch pages move between storage, RAM, page file and cache.',
    topic: 'System software',
    format: 'OS simulation',
    kind: 'lab',
    syllabuses: [
      { code: '0478', qualification: 'GCSE', sections: [{ id: '3.3', page: 18, primary: true }, { id: '3.1', page: 16 }] },
      { code: '9618', qualification: 'A', sections: [{ id: '16.1', page: 35, primary: true }] },
    ],
    href: '/labs/memory-management.html',
  },
  {
    subject: 'computer-science',
    slug: 'process-states-scheduling',
    title: 'Process States and Scheduling',
    description: 'Build CPU scheduling rules, move processes through ready, running and blocked states, and compare waiting and response times.',
    topic: 'System software',
    format: 'OS simulation',
    kind: 'lab',
    syllabuses: [
      { code: '9618', qualification: 'A', sections: [{ id: '16.1', page: 35, primary: true }] },
    ],
    href: '/labs/process-states-scheduling.html',
  },
  translator,
];
