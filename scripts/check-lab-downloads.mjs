import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createStandaloneLabHtml } from '../app/lab-download.ts';
import { labs } from '../app/labs.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const count = (source, value) => source.split(value).length - 1;
const artifactLimitBytes = 512 * 1024;
const artifactSizeWaivers = new Map([
  ['python-programming-practice', {
    maxBytes: 1_300_000,
    reason: 'Reviewed offline Skulpt runtime and standard-library payload.',
  }],
  ['sound-sampling', {
    maxBytes: 1_400_000,
    reason: 'Reviewed offline audio sample payload.',
  }],
]);

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
  const packagedBytes = Buffer.byteLength(packaged, 'utf8');
  const sizeWaiver = artifactSizeWaivers.get(lab.slug);
  if (packagedBytes > artifactLimitBytes && (!sizeWaiver || packagedBytes > sizeWaiver.maxBytes)) {
    throw new Error(`${lab.slug} produced a ${packagedBytes}-byte artifact without an adequate size waiver`);
  }
  const hasRuntimeStylesheet = [...packaged.matchAll(/<link\b[^>]*>/gi)].some((match) => (
    /\brel=["'][^"']*\bstylesheet\b[^"']*["']/i.test(match[0])
    && /\bhref=/i.test(match[0])
  ));
  const hasRuntimeScript = [...packaged.matchAll(/<script\b[^>]*>/gi)]
    .some((match) => /\bsrc=/i.test(match[0]));

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
    || count(packaged, 'padding-top: 66px !important') !== 1
    || count(packaged, 'padding-bottom: 58px !important') !== 1
    || count(packaged, '<header class="examplicity-download-header"') !== 1
    || count(packaged, '<footer class="examplicity-download-footer"') !== 1
    || count(packaged, '<!-- LAB_FRAME_STYLES_START -->') !== 1
    || count(packaged, '<!-- LAB_FRAME_STYLES_END -->') !== 1
    || count(packaged, '<style data-lab-frame>') !== 1
    || hasRuntimeStylesheet
    || hasRuntimeScript
    || /report a bug/i.test(packaged)
    || packaged.includes('/api/bug-reports')
    || packaged.includes('DATABASE_URL')
    || packaged.includes('BUG_REPORT_IP_SALT')
    || packaged.includes('CRON_SECRET')
    || packaged.includes('bug_report_rate_limits')
    || /postgres(?:ql)?:\/\//i.test(packaged)
  ) {
    throw new Error(`${lab.slug} produced invalid packaged HTML`);
  }
}

for (const [slug, waiver] of artifactSizeWaivers) {
  if (!waiver.reason.trim()) throw new Error(`${slug} has an undocumented artifact size waiver`);
  if (!labs.some((lab) => lab.slug === slug)) throw new Error(`${slug} has a stale artifact size waiver`);
}

console.log(`Manifest content and standalone chrome verified in ${labs.length} packaged labs.`);
