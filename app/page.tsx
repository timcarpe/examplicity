import type { Metadata } from 'next';
import Catalogue from './catalogue';
import HomeHero from './home-hero';
import { subjects } from './labs.ts';

export const metadata: Metadata = { alternates: { canonical: '/' } };

export default function Home() {
  return <Catalogue initialExam={subjects[0].exams[0]} initialSubjectId={subjects[0].id}
    homepageHero={<HomeHero />} />;
}
