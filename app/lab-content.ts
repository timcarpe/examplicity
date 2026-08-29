import { subjects, syllabusRegistry, type Lab } from './labs.ts';
import { productionSiteUrl, siteTitle } from './site.ts';

const headStart = '<!-- LAB_MANIFEST_HEAD_START -->';
const headEnd = '<!-- LAB_MANIFEST_HEAD_END -->';
const headerStart = '<!-- LAB_MANIFEST_HEADER_START -->';
const headerEnd = '<!-- LAB_MANIFEST_HEADER_END -->';
const chipsStart = '<!-- LAB_SYLLABUS_CHIPS_START -->';
const chipsEnd = '<!-- LAB_SYLLABUS_CHIPS_END -->';

const escapeHtml = (value: string) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const countMatches = (source: string, pattern: RegExp) => [...source.matchAll(pattern)].length;

const stripManagedHeadTags = (source: string) => source
  .replace(/<title\b[^>]*>[\s\S]*?<\/title>\s*/gi, '')
  .replace(/<script\b[^>]*data-lab-manifest=["']structured-data["'][^>]*>[\s\S]*?<\/script>\s*/gi, '')
  .replace(/<(?:meta|link)\b[^>]*>\s*/gi, (tag) => {
    const managesDescription = /\bname=["']description["']/i.test(tag);
    const managesCanonical = /\brel=["']canonical["']/i.test(tag);
    const managesOpenGraph = /\bproperty=["']og:(?:type|site_name|title|description|url|image|image:alt)["']/i.test(tag);
    const managesTwitter = /\bname=["']twitter:(?:card|title|description|image)["']/i.test(tag);
    return managesDescription || managesCanonical || managesOpenGraph || managesTwitter ? '' : tag;
  });

const normalizeManagedHead = (source: string) => {
  const startIndex = source.indexOf(headStart);
  const endIndex = source.indexOf(headEnd, startIndex);
  if (startIndex === -1 || endIndex === -1) throw new Error('Manifest head block is incomplete');

  const headOpenIndex = source.search(/<head\b[^>]*>/i);
  const headCloseIndex = source.search(/<\/head>/i);
  if (headOpenIndex === -1 || headCloseIndex === -1 || headCloseIndex < endIndex) {
    throw new Error('Manifest head block is outside the document head');
  }

  const blockEnd = endIndex + headEnd.length;
  return `${stripManagedHeadTags(source.slice(0, startIndex))}${source.slice(startIndex, blockEnd)}${stripManagedHeadTags(source.slice(blockEnd, headCloseIndex))}${source.slice(headCloseIndex)}`;
};

const qualificationLevels = {
  IGCSE: ['IGCSE'],
  AS: ['AS Level'],
  A: ['A Level'],
  'AS/A': ['AS Level', 'A Level'],
} as const;

const renderStructuredData = (lab: Lab, canonicalUrl: string) => {
  const subject = subjects.find((entry) => entry.id === lab.subject);
  if (!subject) throw new Error(`${lab.slug} references unknown subject ${lab.subject}`);

  const educationalLevel = [...new Set(lab.syllabuses.flatMap((alignment) => (
    qualificationLevels[alignment.qualification]
  )))];
  const educationalAlignment = lab.syllabuses.map((alignment) => {
    const syllabus = syllabusRegistry[alignment.code];
    const primarySection = alignment.sections.find((section) => section.primary);
    if (!syllabus || !primarySection) {
      throw new Error(`${lab.slug} has incomplete syllabus data for ${alignment.code}`);
    }

    return {
      '@type': 'AlignmentObject',
      alignmentType: 'educationalSubject',
      educationalFramework: syllabus.title,
      targetName: `${alignment.qualification} ${alignment.code} section ${alignment.sections.map((section) => section.id).join(', ')}`,
      targetUrl: `${syllabus.documentUrl}#page=${primarySection.page}`,
    };
  });
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    '@id': `${canonicalUrl}#learning-resource`,
    url: canonicalUrl,
    name: lab.title,
    description: lab.metaDescription,
    inLanguage: 'en-GB',
    isAccessibleForFree: true,
    interactivityType: 'active',
    learningResourceType: lab.format,
    teaches: lab.topic,
    educationalLevel,
    educationalAlignment,
    about: { '@type': 'Thing', name: subject.name },
    audience: { '@type': 'EducationalAudience', educationalRole: 'student' },
    provider: {
      '@type': 'Organization',
      name: 'Examplicity',
      url: productionSiteUrl,
    },
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${productionSiteUrl}/#website`,
      name: 'Examplicity',
      url: productionSiteUrl,
    },
  };

  return `<script type="application/ld+json" data-lab-manifest="structured-data">${JSON.stringify(structuredData).replace(/</g, '\\u003c')}</script>`;
};

const renderHead = (lab: Lab) => {
  const canonicalUrl = `${productionSiteUrl}${lab.href}`;
  const socialImage = `${productionSiteUrl}/opengraph-image`;
  const title = escapeHtml(lab.title);
  const description = escapeHtml(lab.metaDescription);

  return `${headStart}
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonicalUrl}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Examplicity">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:image" content="${socialImage}">
<meta property="og:image:alt" content="${escapeHtml(siteTitle)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${socialImage}">
${renderStructuredData(lab, canonicalUrl)}
${headEnd}`;
};

const renderSyllabusChips = (lab: Lab) => {
  if (lab.syllabuses.length === 0) throw new Error(`${lab.slug} has no syllabus alignment`);

  const seenSyllabuses = new Set<string>();
  const chips = lab.syllabuses.map((alignment) => {
    const syllabus = syllabusRegistry[alignment.code];
    if (!syllabus) throw new Error(`${lab.slug} references unknown syllabus ${alignment.code}`);
    if (syllabus.subject !== lab.subject) {
      throw new Error(`${lab.slug} belongs to ${lab.subject} but references a ${syllabus.subject} syllabus`);
    }
    if (seenSyllabuses.has(alignment.code)) throw new Error(`${lab.slug} repeats syllabus ${alignment.code}`);
    seenSyllabuses.add(alignment.code);

    const primaryCount = alignment.sections.filter((section) => section.primary).length;
    if (primaryCount !== 1) {
      throw new Error(`${lab.slug} must identify exactly one primary section for ${alignment.code}`);
    }

    const seenSections = new Set<string>();
    const sections = [...alignment.sections].sort((left, right) => Number(right.primary) - Number(left.primary));
    const primarySection = sections.find((section) => section.primary);
    if (!primarySection) throw new Error(`${lab.slug} has no primary section for ${alignment.code}`);
    const hasMultipleSections = sections.length > 1;
    const sectionLinks = sections.map((section) => {
      if (!/^\d+(?:\.\d+)?$/.test(section.id) || !Number.isInteger(section.page) || section.page < 1) {
        throw new Error(`${lab.slug} has an invalid ${alignment.code} section reference`);
      }
      if (seenSections.has(section.id)) throw new Error(`${lab.slug} repeats ${alignment.code} section ${section.id}`);
      seenSections.add(section.id);

      const primaryClass = section.primary ? ' is-primary' : '';
      if (!hasMultipleSections) {
        return `<span class="lab-syllabus-section${primaryClass}">${escapeHtml(section.id)}</span>`;
      }
      const primaryText = section.primary ? 'primary ' : '';
      return `<a class="lab-syllabus-section${primaryClass}" href="${escapeHtml(syllabus.documentUrl)}#page=${section.page}" target="_blank" rel="noopener noreferrer" aria-label="Open ${primaryText}${escapeHtml(alignment.qualification)} ${escapeHtml(alignment.code)} syllabus section ${escapeHtml(section.id)}">${escapeHtml(section.id)}</a>`;
    }).join('<span class="lab-syllabus-separator" aria-hidden="true">,</span>');

    const palette = syllabus.palette;
    const style = `--syllabus-chip-bg:${palette.background};--syllabus-chip-border:${palette.border};--syllabus-chip-text:${palette.text};--syllabus-chip-hover:${palette.hover}`;
    return `  <section class="lab-syllabus-chip" style="${style}" aria-label="${escapeHtml(alignment.qualification)} ${escapeHtml(alignment.code)} syllabus alignment">
    <a class="lab-syllabus-primary-link" href="${escapeHtml(syllabus.documentUrl)}#page=${primarySection.page}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeHtml(alignment.qualification)} ${escapeHtml(alignment.code)} syllabus section ${escapeHtml(primarySection.id)}"></a>
    <span class="lab-syllabus-name">${escapeHtml(alignment.qualification)} ${escapeHtml(alignment.code)}</span>
    <span class="lab-syllabus-divider" aria-hidden="true">·</span>
    <span class="lab-syllabus-sections">${sectionLinks}</span>
  </section>`;
  }).join('\n');

  return `${chipsStart}
<nav class="lab-syllabus-chips" aria-label="Syllabus alignment">
${chips}
</nav>
${chipsEnd}`;
};

const renderManifestHeader = (lab: Lab) => {
  const subtitle = lab.subtitle === null
    ? ''
    : `\n  <p class="lab-manifest-subtitle" data-lab-manifest="subtitle">${escapeHtml(lab.subtitle)}</p>`;

  return `${headerStart}
<header class="lab-manifest-header">
  <div class="lab-manifest-heading">
    <h1 data-lab-manifest="title">${escapeHtml(lab.title)}</h1>${subtitle}
  </div>
  ${renderSyllabusChips(lab)}
</header>
${headerEnd}`;
};

const replaceBodyLayout = (source: string, lab: Lab) => {
  const bodyPattern = /<body\b[^>]*>/gi;
  const bodyCount = countMatches(source, bodyPattern);
  if (bodyCount !== 1) throw new Error(`${lab.slug} must have exactly one body element`);

  const layout = lab.layout ?? 'standard';
  return source.replace(bodyPattern, (bodyTag) => {
    const withoutLayout = bodyTag.replace(/\sdata-lab-layout=(?:"[^"]*"|'[^']*')/i, '');
    return withoutLayout.replace(/>$/, ` data-lab-layout="${layout}">`);
  });
};

const replaceHead = (source: string, lab: Lab) => {
  const markedPattern = new RegExp(`${escapeRegExp(headStart)}[\\s\\S]*?${escapeRegExp(headEnd)}`, 'g');
  const markedCount = countMatches(source, markedPattern);
  if (markedCount > 1) throw new Error(`${lab.slug} repeats its manifest head block`);
  if (markedCount === 1) return normalizeManagedHead(source.replace(markedPattern, renderHead(lab)));

  const legacyPattern = /<title>[\s\S]*?<meta name="twitter:card" content="[^"]+">/i;
  if (!legacyPattern.test(source)) throw new Error(`${lab.slug} has no manifest or legacy metadata block`);
  return normalizeManagedHead(source.replace(legacyPattern, renderHead(lab)));
};

const replaceManifestHeader = (source: string, lab: Lab) => {
  const headerPattern = new RegExp(`${escapeRegExp(headerStart)}[\\s\\S]*?${escapeRegExp(headerEnd)}`, 'g');
  const headerCount = countMatches(source, headerPattern);
  if (headerCount > 1) throw new Error(`${lab.slug} repeats its manifest header`);

  let nextSource = source.replace(headerPattern, '');
  const chipsPattern = new RegExp(`${escapeRegExp(chipsStart)}[\\s\\S]*?${escapeRegExp(chipsEnd)}`, 'g');
  const chipsCount = countMatches(nextSource, chipsPattern);
  if (chipsCount > 1) throw new Error(`${lab.slug} repeats its syllabus chips`);
  nextSource = nextSource.replace(chipsPattern, '');

  if (!nextSource.includes('data-lab-authored-title-slot')) {
    const markedTitlePattern = /<h1\b[^>]*data-lab-manifest=["']title["'][^>]*>[\s\S]*?<\/h1>/i;
    const legacyTitlePattern = /<h1\b[^>]*>[\s\S]*?<\/h1>/i;
    const titlePattern = markedTitlePattern.test(nextSource) ? markedTitlePattern : legacyTitlePattern;
    if (!titlePattern.test(nextSource)) throw new Error(`${lab.slug} has no authored h1 slot`);
    nextSource = nextSource.replace(titlePattern, '<span class="lab-authored-title-slot" data-lab-authored-title-slot aria-hidden="true"></span>');
  }

  if (!nextSource.includes('data-lab-authored-subtitle-slot')) {
    const markedSubtitlePattern = /<(p|div)\b[^>]*data-lab-manifest=["']subtitle["'][^>]*>[\s\S]*?<\/\1>/i;
    const legacySubtitlePattern = /<(p|div)\b[^>]*class=["'][^"']*(?:\bsub\b|\bsubtitle\b)[^"']*["'][^>]*>[\s\S]*?<\/\1>/i;
    const subtitlePattern = markedSubtitlePattern.test(nextSource)
      ? markedSubtitlePattern
      : legacySubtitlePattern;
    if (subtitlePattern.test(nextSource)) {
      nextSource = nextSource.replace(subtitlePattern, '<span data-lab-authored-subtitle-slot hidden></span>');
    }
  }

  const bodyMatch = /<body\b[^>]*>/i.exec(source);
  if (!bodyMatch) throw new Error(`${lab.slug} has no body element`);
  const bodyEnd = bodyMatch.index + bodyMatch[0].length;
  const mainMatch = /<main\b[^>]*>/i.exec(nextSource.slice(bodyEnd));
  if (!mainMatch) throw new Error(`${lab.slug} has no main element after body`);
  const mainEnd = bodyEnd + mainMatch.index + mainMatch[0].length;
  return `${nextSource.slice(0, mainEnd)}\n${renderManifestHeader(lab)}\n${nextSource.slice(mainEnd).trimStart()}`;
};

export const applyLabManifestContent = (source: string, lab: Lab) => {
  if (!lab.metaDescription.trim()) throw new Error(`${lab.slug} has no meta description`);
  if (lab.subtitle !== null && !lab.subtitle.trim()) throw new Error(`${lab.slug} has an empty subtitle`);
  if (lab.layout === 'compact' && !source.includes('data-lab-workspace')) {
    throw new Error(`${lab.slug} is compact but has no marked workspace`);
  }

  return replaceManifestHeader(replaceBodyLayout(replaceHead(source, lab), lab), lab);
};
