import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { labs, subjects } from '../labs';
import RemixGuide from './remix-guide';

type RemixPageProps = {
  searchParams: Promise<{ lab?: string; from?: string }>;
};

const findLab = (slug?: string) => labs.find((lab) => lab.slug === slug);

const getReturnHref = (from: string | undefined, exam: string) => {
  const allowedHrefs = new Set<string>(
    subjects.flatMap((subject) => subject.exams.map((code) => subject.views[code].href)),
  );
  return from && allowedHrefs.has(from) ? from : `/computer-science/${exam}`;
};

export async function generateMetadata({ searchParams }: RemixPageProps): Promise<Metadata> {
  const { lab: slug } = await searchParams;
  const lab = findLab(slug);

  return {
    title: 'AI Lab Remix | Examplicity',
    description: lab
      ? `Download ${lab.title}, shape an editable remix prompt, and continue in ChatGPT.`
      : 'Download an Examplicity lab and use a guided prompt to remix it in ChatGPT.',
  };
}

export default async function RemixPage({ searchParams }: RemixPageProps) {
  const { lab: slug, from } = await searchParams;
  const lab = findLab(slug);

  if (!lab) notFound();

  const exam = lab.syllabuses[0].code;

  return (
    <RemixGuide
      lab={lab}
      returnHref={getReturnHref(from, exam)}
    />
  );
}
