export const exams = ['0478', '9618'] as const;
export type ExamCode = (typeof exams)[number];

export type Activity = {
  slug: string;
  title: string;
  description: string;
  kind: 'lab' | 'tool';
  href: string;
};

export type Lab = Activity & {
  topic: string;
  format: string;
  kind: 'lab';
  exams: ExamCode[];
  image: string;
};

export const translator: Activity = {
  slug: 'translator',
  title: 'Pseudocode ↔ Python',
  description: 'Write, synchronize, run and trace Cambridge-style pseudocode alongside Python.',
  kind: 'tool',
  href: '/labs/translator.html',
};

export const labs: Lab[] = [
  {
    slug: 'binary-numbers',
    title: 'Binary Number Practice',
    description: 'Build fluency with binary and hexadecimal registers through generated GCSE and AS questions.',
    topic: 'Data representation',
    format: 'Practice',
    kind: 'lab',
    exams: ['0478', '9618'],
    href: '/labs/binary-numbers.html',
    image: '/lab-previews/binary-numbers.png',
  },
  {
    slug: 'bitmap-compression',
    title: 'Bitmap Compression',
    description: 'Paint a bitmap, change its colour depth, and compare normal, RLE and Huffman encoding.',
    topic: 'Data representation',
    format: 'Visual experiment',
    kind: 'lab',
    exams: ['0478', '9618'],
    href: '/labs/bitmap-compression.html',
    image: '/lab-previews/bitmap-compression.png',
  },
  {
    slug: 'sound-sampling',
    title: 'Digital Sound Sampling',
    description: 'Change sample rate and resolution, then compare the reconstructed signal visually and by listening.',
    topic: 'Data representation',
    format: 'Signal lab',
    kind: 'lab',
    exams: ['0478', '9618'],
    href: '/labs/sound-sampling.html',
    image: '/lab-previews/sound-sampling.png',
  },
  {
    slug: 'huffman-rover',
    title: 'Huffman Rover',
    description: 'Design variable-length codes, decode a binary transmission and guide a rover across Mars.',
    topic: 'Data representation',
    format: 'Coding challenge',
    kind: 'lab',
    exams: ['9618'],
    href: '/labs/huffman-rover.html',
    image: '/lab-previews/huffman-rover.png',
  },
  {
    slug: 'parity-arq',
    title: 'Parity & ARQ Transmission',
    description: 'Corrupt frames in flight and watch parity detection and automatic repeat requests respond.',
    topic: 'Networks & communication',
    format: 'Protocol lab',
    kind: 'lab',
    exams: ['0478', '9618'],
    href: '/labs/parity-arq.html',
    image: '/lab-previews/parity-arq.png',
  },
  {
    slug: 'network-topology',
    title: 'Network Topology Builder',
    description: 'Build bus, star, mesh and hybrid networks, then send packets through your design.',
    topic: 'Networks & communication',
    format: 'Network builder',
    kind: 'lab',
    exams: ['9618'],
    href: '/labs/network-topology.html',
    image: '/lab-previews/network-topology.png',
  },
  {
    slug: 'csma-cd',
    title: 'Ethernet CSMA/CD',
    description: 'Control three stations on a shared cable and observe collision detection and backoff.',
    topic: 'Networks & communication',
    format: 'Network simulation',
    kind: 'lab',
    exams: ['9618'],
    href: '/labs/csma-cd.html',
    image: '/lab-previews/csma-cd.png',
  },
  {
    slug: 'fetch-decode-execute',
    title: 'Fetch–Decode–Execute',
    description: 'Advance one clock tick at a time and follow data across CPU pathways and system buses.',
    topic: 'Processors & memory',
    format: 'CPU simulator',
    kind: 'lab',
    exams: ['0478', '9618'],
    href: '/labs/fetch-decode-execute.html',
    image: '/lab-previews/fetch-decode-execute.png',
  },
  {
    slug: 'assembly',
    title: 'Cambridge Assembly',
    description: 'Trace a Cambridge-style assembly program and follow every transfer through the processor.',
    topic: 'Processors & memory',
    format: 'Code tracer',
    kind: 'lab',
    exams: ['9618'],
    href: '/labs/assembly.html',
    image: '/lab-previews/assembly.png',
  },
  {
    slug: 'software-stack',
    title: 'Software Stack & Boot Process',
    description: 'Build the software layers, power on the system and test whether an application can run.',
    topic: 'System software',
    format: 'Systems model',
    kind: 'lab',
    exams: ['0478', '9618'],
    href: '/labs/software-stack.html',
    image: '/lab-previews/software-stack.png',
  },
  {
    slug: 'memory-management',
    title: 'OS Memory Management',
    description: 'Create realistic workloads and watch pages move between storage, RAM, page file and cache.',
    topic: 'System software',
    format: 'OS simulation',
    kind: 'lab',
    exams: ['0478', '9618'],
    href: '/labs/memory-management.html',
    image: '/lab-previews/memory-management.png',
  },
];
