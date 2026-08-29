import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createStandaloneLabHtml } from '../app/lab-download.ts';
import { labs } from '../app/labs.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const count = (source, value) => source.split(value).length - 1;

for (const lab of labs) {
  const source = await readFile(
    path.join(root, 'public', 'labs', lab.subject, `${lab.slug}.html`),
    'utf8',
  );
  const packaged = createStandaloneLabHtml({
    source,
    lab,
    siteHomeUrl: 'https://www.examplicity.org/computer-science/0478',
    liveLabUrl: `https://www.examplicity.org/computer-science/0478?lab=${lab.slug}`,
  });

  const expectedSubtitleCount = lab.subtitle === null ? 0 : 1;
  const expectedLayout = lab.layout ?? 'standard';
  const structuredDataMatches = [...packaged.matchAll(
    /<script\b[^>]*data-lab-manifest="structured-data"[^>]*>([\s\S]*?)<\/script>/g,
  )];
  const structuredData = structuredDataMatches.length === 1
    ? JSON.parse(structuredDataMatches[0][1])
    : null;
  const bodyLayoutCount = [...packaged.matchAll(
    new RegExp(`<body\\b[^>]*data-lab-layout="${expectedLayout}"[^>]*>`, 'g'),
  )].length;
  if (
    count(packaged, '<!-- LAB_MANIFEST_HEAD_START -->') !== 1
    || count(packaged, '<!-- LAB_MANIFEST_HEADER_START -->') !== 1
    || count(packaged, 'data-lab-manifest="title"') !== 1
    || count(packaged, 'data-lab-manifest="subtitle"') !== expectedSubtitleCount
    || bodyLayoutCount !== 1
    || count(packaged, '<!-- LAB_SYLLABUS_CHIPS_START -->') !== 1
    || structuredDataMatches.length !== 1
    || structuredData?.['@type'] !== 'LearningResource'
    || structuredData?.url !== `https://www.examplicity.org${lab.href}`
    || structuredData?.name !== lab.title
    || structuredData?.description !== lab.metaDescription
    || structuredData?.educationalAlignment?.length !== lab.syllabuses.length
    || count(packaged, '<style data-examplicity-download-chrome>') !== 1
    || count(packaged, '<header class="examplicity-download-header"') !== 1
    || count(packaged, '<footer class="examplicity-download-footer"') !== 1
  ) {
    throw new Error(`${lab.slug} produced invalid packaged HTML`);
  }
}

console.log(`Manifest content and standalone chrome verified in ${labs.length} packaged labs.`);
