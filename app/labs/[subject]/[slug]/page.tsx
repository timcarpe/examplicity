import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Catalogue from '../../../catalogue';
import { getLabStructuredData } from '../../../lab-content';
import { labPageHref, labs, subjects } from '../../../labs.ts';
import { siteTitle, siteUrl } from '../../../site';

type PageProps = {
  params: Promise<{ subject: string; slug: string }>;
};

const findLab = (subject: string, slug: string) => (
  labs.find((lab) => lab.subject === subject && lab.slug === slug) ?? null
);

export function generateStaticParams() {
  return labs.map((lab) => ({ subject: lab.subject, slug: lab.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subject, slug } = await params;
  const lab = findLab(subject, slug);
  if (!lab) return {};

  const href = labPageHref(lab);
  return {
    title: lab.title,
    description: lab.metaDescription,
    alternates: { canonical: href },
    openGraph: {
      description: lab.metaDescription,
      images: [{
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: siteTitle,
      }],
      locale: 'en_GB',
      siteName: 'Examplicity',
      title: lab.title,
      type: 'website',
      url: `${siteUrl}${href}`,
    },
    twitter: {
      card: 'summary_large_image',
      description: lab.metaDescription,
      images: ['/opengraph-image'],
      title: lab.title,
    },
  };
}

export default async function LabPage({ params }: PageProps) {
  const { subject: subjectId, slug } = await params;
  const lab = findLab(subjectId, slug);
  if (!lab) notFound();

  const subject = subjects.find((item) => item.id === lab.subject);
  const exam = subject?.exams.find((code) => (
    lab.syllabuses.some((syllabus) => syllabus.code === code)
  ));
  if (!subject || !exam) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(getLabStructuredData(lab)).replace(/</g, '\\u003c'),
        }}
      />
      <Catalogue
        initialExam={exam}
        initialLabSlug={lab.slug}
        initialSubjectId={subject.id}
        key={`${lab.subject}-${lab.slug}`}
      />
    </>
  );
}
