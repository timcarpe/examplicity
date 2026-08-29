export const exams = ['0478', '9618'] as const;
export type ExamCode = (typeof exams)[number];

export const subjects = [
  {
    id: 'computer-science',
    name: 'Computer Science',
    exams,
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
  exams: ExamCode[];
};

export const translator: Lab = {
  subject: 'computer-science',
  slug: 'translator',
  title: 'Pseudocode ↔ Python',
  description: 'Write, synchronize, run and trace Cambridge-style pseudocode alongside Python.',
  topic: 'Programming',
  format: 'Code translator',
  kind: 'tool',
  exams: ['0478', '9618'],
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
    exams: ['0478', '9618'],
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
    exams: ['0478', '9618'],
    href: '/labs/bitmap-compression.html',
  },
  {
    subject: 'computer-science',
    slug: 'sound-sampling',
    title: 'Digital Sound Sampling',
    description: 'Change sample rate and resolution, then compare the reconstructed signal visually and by listening.',
    topic: 'Data representation',
    format: 'Signal lab',
    kind: 'lab',
    exams: ['0478', '9618'],
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
    exams: ['9618'],
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
    exams: ['0478', '9618'],
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
    exams: ['9618'],
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
    exams: ['9618'],
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
    exams: ['0478', '9618'],
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
    exams: ['0478', '9618'],
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
    exams: ['9618'],
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
    exams: ['0478', '9618'],
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
    exams: ['9618'],
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
    exams: ['0478', '9618'],
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
    exams: ['0478', '9618'],
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
    exams: ['9618'],
    href: '/labs/process-states-scheduling.html',
  },
  translator,
];
