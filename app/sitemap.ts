import type { MetadataRoute } from 'next';
import { labs, subjects } from './labs';
import { siteUrl } from './site';

export default function sitemap(): MetadataRoute.Sitemap {
  const syllabusViews = subjects.flatMap((subject) => (
    subject.exams.map((exam) => ({ url: `${siteUrl}${subject.views[exam].href}` }))
  ));
  const labPages = labs.map((lab) => ({ url: `${siteUrl}${lab.href}` }));

  return [{ url: `${siteUrl}/changelog` }, ...syllabusViews, ...labPages];
}
