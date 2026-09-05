import type { MetadataRoute } from 'next';
import { labPageHref, labs, subjects } from './labs.ts';
import { siteUrl } from './site.ts';

export default function sitemap(): MetadataRoute.Sitemap {
  const syllabusViews = subjects.flatMap((subject) => (
    Object.values(subject.views).map((view) => ({ url: `${siteUrl}${view.href}` }))
  ));
  const labPages = labs.map((lab) => ({ url: `${siteUrl}${labPageHref(lab)}` }));

  return [{ url: `${siteUrl}/changelog` }, ...syllabusViews, ...labPages];
}
