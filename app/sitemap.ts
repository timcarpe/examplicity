import type { MetadataRoute } from 'next';
import { labs, subjects } from './labs';
import { siteUrl } from './site';

export default function sitemap(): MetadataRoute.Sitemap {
  const syllabusViews = subjects.flatMap((subject) => (
    Object.values(subject.views).map((view) => ({ url: `${siteUrl}${view.href}` }))
  ));
  const labPages = labs.map((lab) => ({ url: `${siteUrl}${lab.href}` }));

  return [{ url: `${siteUrl}/changelog` }, ...syllabusViews, ...labPages];
}
