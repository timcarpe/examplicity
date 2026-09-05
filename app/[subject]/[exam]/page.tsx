import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Catalogue from '../../catalogue';
import {
  labAppearsInSubject,
  labPageHref,
  labs,
  subjects,
  syllabusAlignmentIncludesLevel,
  type ExamCode,
  type QualificationLevel,
  type SubjectDefinition,
  type SubjectId,
} from '../../labs.ts';
import { siteDescription, siteTitle, siteUrl } from '../../site';

type PageProps = {
  params: Promise<{ subject: string; exam: string }>;
};

const findSubjectView = (subjectId: string, examCode: string) => {
  const subject = subjects.find((item) => item.id === subjectId);
  if (!subject || !subject.exams.some((exam) => exam === examCode)) return null;
  const exam = examCode as ExamCode;
  const typedSubject: SubjectDefinition = subject;
  const view = typedSubject.views[exam];
  return view ? { subject: typedSubject, exam, view } : null;
};

export function generateStaticParams() {
  return subjects.flatMap((subject) => (
    subject.exams.map((exam) => ({ subject: subject.id, exam }))
  ));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { subject: subjectId, exam: examCode } = await params;
  const match = findSubjectView(subjectId, examCode);
  if (!match) return {};

  const { view } = match;
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

export default async function SubjectCatalogue({ params }: PageProps) {
  const { subject: subjectId, exam: examCode } = await params;
  const match = findSubjectView(subjectId, examCode);
  if (!match) notFound();

  const { subject, exam, view } = match;
  const pageUrl = `${siteUrl}${view.href}`;
  const level = (Object.entries(subject.qualificationViews).find(([, qualificationView]) => (
    qualificationView && (qualificationView.alignedExams ?? [qualificationView.exam]).includes(exam)
  ))?.[0] ?? 'IGCSE') as QualificationLevel;
  const qualificationView = subject.qualificationViews[level]!;
  const alignedExams = qualificationView.alignedExams ?? [qualificationView.exam];
  const educationalLevel = qualificationView.headerLabel;
  const visibleLabs = labs.filter((lab) => (
    labAppearsInSubject(lab, subject.id as SubjectId) && lab.syllabuses.some((syllabus) => (
      alignedExams.includes(syllabus.code) && syllabusAlignmentIncludesLevel(syllabus.qualification, level)
    ))
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
          description: lab.metaDescription,
          url: `${siteUrl}${labPageHref(lab)}`,
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
      <Catalogue initialExam={exam} initialSubjectId={subject.id as SubjectId} key={`${subject.id}-${exam}`} />
    </>
  );
}
