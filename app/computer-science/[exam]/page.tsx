import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Catalogue from '../../catalogue';
import { labs, subjects, type ExamCode } from '../../labs';
import { siteDescription, siteTitle, siteUrl } from '../../site';

const subject = subjects[0];

const isExamCode = (value: string): value is ExamCode => (
  subject.exams.some((exam) => exam === value)
);

type PageProps = {
  params: Promise<{ exam: string }>;
};

export function generateStaticParams() {
  return subject.exams.map((exam) => ({ exam }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { exam } = await params;
  if (!isExamCode(exam)) return {};

  const view = subject.views[exam];
  return {
    description: view.metaDescription,
    alternates: { canonical: view.href },
    openGraph: {
      description: view.metaDescription,
      images: [{
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: siteTitle,
      }],
      locale: 'en_GB',
      siteName: 'Examplicity',
      title: siteTitle,
      type: 'website',
      url: `${siteUrl}${view.href}`,
    },
    twitter: {
      card: 'summary_large_image',
      description: view.metaDescription,
      images: ['/opengraph-image'],
      title: siteTitle,
    },
  };
}

export default async function ComputerScienceCatalogue({ params }: PageProps) {
  const { exam } = await params;
  if (!isExamCode(exam)) notFound();

  const view = subject.views[exam];
  const pageUrl = `${siteUrl}${view.href}`;
  const educationalLevel = exam === '0478'
    ? 'Cambridge IGCSE Computer Science 0478'
    : 'Cambridge International AS & A Level Computer Science 9618';
  const visibleLabs = labs.filter((lab) => (
    lab.subject === subject.id && lab.exams.includes(exam)
  ));
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Examplicity',
        description: siteDescription,
        inLanguage: 'en-GB',
      },
      {
        '@type': ['CollectionPage', 'LearningResource'],
        '@id': `${pageUrl}#learning-resource`,
        url: pageUrl,
        name: siteTitle,
        description: view.metaDescription,
        isPartOf: { '@id': `${siteUrl}/#website` },
        inLanguage: 'en-GB',
        isAccessibleForFree: true,
        interactivityType: 'active',
        learningResourceType: ['Interactive lab', 'Exam practice', 'Concept explanation'],
        about: { '@type': 'Thing', name: subject.name },
        educationalLevel,
        educationalAlignment: {
          '@type': 'AlignmentObject',
          alignmentType: 'educationalLevel',
          targetName: educationalLevel,
        },
        audience: { '@type': 'EducationalAudience', educationalRole: 'student' },
        hasPart: visibleLabs.map((lab) => ({
          '@type': 'LearningResource',
          name: lab.title,
          description: lab.description,
          url: `${siteUrl}${lab.href}`,
          inLanguage: 'en-GB',
          isAccessibleForFree: true,
          interactivityType: 'active',
          learningResourceType: lab.format,
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <Catalogue initialExam={exam} initialSubjectId={subject.id} key={exam} />
    </>
  );
}
