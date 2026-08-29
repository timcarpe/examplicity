import { syllabusRegistry, type Lab } from './labs.ts';
import { productionSiteUrl, siteTitle } from './site.ts';

const headStart = '<!-- LAB_MANIFEST_HEAD_START -->';
const headEnd = '<!-- LAB_MANIFEST_HEAD_END -->';
const chipsStart = '<!-- LAB_SYLLABUS_CHIPS_START -->';
const chipsEnd = '<!-- LAB_SYLLABUS_CHIPS_END -->';

const escapeHtml = (value: string) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const countMatches = (source: string, pattern: RegExp) => [...source.matchAll(pattern)].length;

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
    const sectionLinks = sections.map((section) => {
      if (!/^\d+\.\d+$/.test(section.id) || !Number.isInteger(section.page) || section.page < 1) {
        throw new Error(`${lab.slug} has an invalid ${alignment.code} section reference`);
      }
      if (seenSections.has(section.id)) throw new Error(`${lab.slug} repeats ${alignment.code} section ${section.id}`);
      seenSections.add(section.id);

      const primaryClass = section.primary ? ' is-primary' : '';
      const primaryText = section.primary ? 'primary ' : '';
      return `<a class="lab-syllabus-section${primaryClass}" href="${escapeHtml(syllabus.documentUrl)}#page=${section.page}" target="_blank" rel="noopener noreferrer" aria-label="Open ${primaryText}${escapeHtml(alignment.qualification)} ${escapeHtml(alignment.code)} syllabus section ${escapeHtml(section.id)}">${escapeHtml(section.id)}</a>`;
    }).join('<span class="lab-syllabus-separator" aria-hidden="true">,</span>');

    const palette = syllabus.palette;
    const style = `--syllabus-chip-bg:${palette.background};--syllabus-chip-border:${palette.border};--syllabus-chip-text:${palette.text};--syllabus-chip-hover:${palette.hover}`;
    return `  <section class="lab-syllabus-chip" style="${style}" aria-label="${escapeHtml(alignment.qualification)} ${escapeHtml(alignment.code)} syllabus alignment">
    <a class="lab-syllabus-name" href="${escapeHtml(syllabus.officialPage)}" target="_blank" rel="noopener noreferrer" aria-label="Open the official Cambridge ${escapeHtml(alignment.qualification)} ${escapeHtml(alignment.code)} syllabus page">${escapeHtml(alignment.qualification)} <strong>${escapeHtml(alignment.code)}</strong></a>
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

const replaceHead = (source: string, lab: Lab) => {
  const markedPattern = new RegExp(`${escapeRegExp(headStart)}[\\s\\S]*?${escapeRegExp(headEnd)}`, 'g');
  const markedCount = countMatches(source, markedPattern);
  if (markedCount > 1) throw new Error(`${lab.slug} repeats its manifest head block`);
  if (markedCount === 1) return source.replace(markedPattern, renderHead(lab));

  const legacyPattern = /<title>[\s\S]*?<meta name="twitter:card" content="[^"]+">/i;
  if (!legacyPattern.test(source)) throw new Error(`${lab.slug} has no manifest or legacy metadata block`);
  return source.replace(legacyPattern, renderHead(lab));
};

const replaceTitle = (source: string, lab: Lab) => {
  const markedPattern = /<h1\b([^>]*data-lab-manifest=["']title["'][^>]*)>[\s\S]*?<\/h1>/gi;
  const markedCount = countMatches(source, markedPattern);
  if (markedCount > 1) throw new Error(`${lab.slug} repeats its manifest title`);
  if (markedCount === 1) {
    return source.replace(markedPattern, `<h1$1>${escapeHtml(lab.title)}</h1>`);
  }

  const legacyPattern = /<h1\b([^>]*)>[\s\S]*?<\/h1>/i;
  if (!legacyPattern.test(source)) throw new Error(`${lab.slug} has no h1 for its manifest title`);
  return source.replace(legacyPattern, `<h1$1 data-lab-manifest="title">${escapeHtml(lab.title)}</h1>`);
};

const replaceSubtitle = (source: string, lab: Lab) => {
  const markedPattern = /<(p|div)\b([^>]*data-lab-manifest=["']subtitle["'][^>]*)>[\s\S]*?<\/\1>/gi;
  const markedCount = countMatches(source, markedPattern);
  if (markedCount > 1) throw new Error(`${lab.slug} repeats its manifest subtitle`);

  if (lab.subtitle === null) {
    if (markedCount > 0) throw new Error(`${lab.slug} has a subtitle marker but its manifest subtitle is null`);
    return source;
  }

  if (markedCount === 1) {
    return source.replace(markedPattern, `<$1$2>${escapeHtml(lab.subtitle)}</$1>`);
  }

  const legacyPattern = /<(p|div)\b([^>]*class=["'][^"']*(?:\bsub\b|\bsubtitle\b)[^"']*["'][^>]*)>[\s\S]*?<\/\1>/i;
  if (!legacyPattern.test(source)) throw new Error(`${lab.slug} has no existing subtitle slot`);
  return source.replace(legacyPattern, `<$1$2 data-lab-manifest="subtitle">${escapeHtml(lab.subtitle)}</$1>`);
};

const replaceSyllabusChips = (source: string, lab: Lab) => {
  const markedPattern = new RegExp(`${escapeRegExp(chipsStart)}[\\s\\S]*?${escapeRegExp(chipsEnd)}`, 'g');
  const markedCount = countMatches(source, markedPattern);
  if (markedCount > 1) throw new Error(`${lab.slug} repeats its syllabus chips`);
  if (markedCount === 1) return source.replace(markedPattern, renderSyllabusChips(lab));

  const bodyMatch = /<body\b[^>]*>/i.exec(source);
  if (!bodyMatch) throw new Error(`${lab.slug} has no body element`);
  const bodyEnd = bodyMatch.index + bodyMatch[0].length;
  const mainMatch = /<main\b[^>]*>/i.exec(source.slice(bodyEnd));
  if (!mainMatch) throw new Error(`${lab.slug} has no main element after body`);
  const mainEnd = bodyEnd + mainMatch.index + mainMatch[0].length;
  return `${source.slice(0, mainEnd)}\n${renderSyllabusChips(lab)}${source.slice(mainEnd)}`;
};

export const applyLabManifestContent = (source: string, lab: Lab) => {
  if (!lab.metaDescription.trim()) throw new Error(`${lab.slug} has no meta description`);
  if (lab.subtitle !== null && !lab.subtitle.trim()) throw new Error(`${lab.slug} has an empty subtitle`);

  let nextSource = replaceHead(source, lab);
  nextSource = replaceTitle(nextSource, lab);
  nextSource = replaceSubtitle(nextSource, lab);
  return replaceSyllabusChips(nextSource, lab);
};
