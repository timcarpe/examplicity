export const exams = ['0478', '9618'] as const;
export type ExamCode = (typeof exams)[number];

export type Lab = {
  slug: string;
  title: string;
  shortLabel: string;
  description: string;
  topic: string;
  exams: ExamCode[];
  href: string;
  image: string;
};

export const labs: Lab[] = [
  {
    slug: 'data-transmission',
    title: 'Data Transmission Fundamentals',
    shortLabel: 'Signals in motion',
    description: 'See how direction, timing and transmission modes shape the way data moves between devices.',
    topic: 'Data transmission & networks',
    exams: ['0478', '9618'],
    href: '/labs/data-transmission.html',
    image: '/lab-previews/data-transmission.png',
  },
  {
    slug: 'network-topology',
    title: 'Network Topology Builder',
    shortLabel: 'Build a network',
    description: 'Construct bus, star and mesh networks and compare how each topology behaves.',
    topic: 'Data transmission & networks',
    exams: ['0478', '9618'],
    href: '/labs/network-topology.html',
    image: '/lab-previews/network-topology.png',
  },
  {
    slug: 'packet-switching',
    title: 'Packet Switching',
    shortLabel: 'Follow the packet',
    description: 'Split a message into packets, route each one, and watch the original data reassemble.',
    topic: 'Data transmission & networks',
    exams: ['0478', '9618'],
    href: '/labs/packet-switching.html',
    image: '/lab-previews/packet-switching.png',
  },
  {
    slug: 'software-stack',
    title: 'Software Stack & Boot Process',
    shortLabel: 'From power to ready',
    description: 'Layer a working software stack, then trace the sequence that brings a computer to life.',
    topic: 'Hardware, software & systems',
    exams: ['0478', '9618'],
    href: '/labs/software-stack.html',
    image: '/lab-previews/software-stack.png',
  },
  {
    slug: 'assembly-language',
    title: 'Two-Pass Assembly',
    shortLabel: 'Inside the assembler',
    description: 'Translate an assembly program in two passes and inspect the symbol table and machine code.',
    topic: 'Processor fundamentals',
    exams: ['9618'],
    href: '/labs/assembly-language.html',
    image: '/lab-previews/assembly-language.png',
  },
];
