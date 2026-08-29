import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { labs, subjects, type Lab, type SubjectDefinition } from '../labs';
import RemixGuide from './remix-guide';

type RemixPageProps = {
  searchParams: Promise<{ lab?: string; from?: string }>;
};

const findLab = (slug?: string) => labs.find((lab) => lab.slug === slug);

const getReturnHref = (from: string | undefined, lab: Lab) => {
  const allowedHrefs = new Set<string>(
    subjects.flatMap((subject) => Object.values(subject.views).map((view) => view.href)),
  );
  const subject: SubjectDefinition | undefined = subjects.find((item) => item.id === lab.subject);
  const fallbackHref = subject?.views[lab.syllabuses[0].code]?.href ?? '/';
  return from && allowedHrefs.has(from) ? from : fallbackHref;
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

  return (
    <RemixGuide
      lab={lab}
      returnHref={getReturnHref(from, lab)}
    />
  );
}
