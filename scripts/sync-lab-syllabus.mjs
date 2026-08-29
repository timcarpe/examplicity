import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { labs, syllabusRegistry } from '../app/labs.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const labsDirectory = path.join(root, 'public', 'labs');
const startMarker = '<!-- LAB_SYLLABUS_CHIPS_START -->';
const endMarker = '<!-- LAB_SYLLABUS_CHIPS_END -->';
const checkOnly = process.argv.includes('--check');

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

function renderSyllabusChips(lab) {
  if (lab.syllabuses.length === 0) throw new Error(`${lab.slug} has no syllabus alignment`);

  const seenSyllabuses = new Set();
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

    const seenSections = new Set();
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
    return `  <section class="lab-syllabus-chip" style="${style}" aria-label="${escapeHtml(alignment.qualification)} ${escapeHtml(alignment.code)} syllabus alignment">\n    <span class="lab-syllabus-prefix">Aligns to</span>\n    <a class="lab-syllabus-name" href="${escapeHtml(syllabus.officialPage)}" target="_blank" rel="noopener noreferrer" aria-label="Open the official Cambridge ${escapeHtml(alignment.qualification)} ${escapeHtml(alignment.code)} syllabus page">${escapeHtml(alignment.qualification)} <strong>${escapeHtml(alignment.code)}</strong></a>\n    <span class="lab-syllabus-divider" aria-hidden="true">·</span>\n    <span class="lab-syllabus-sections">${sectionLinks}</span>\n  </section>`;
  }).join('\n');

  return `${startMarker}\n<nav class="lab-syllabus-chips" aria-label="Syllabus alignment">\n${chips}\n</nav>\n${endMarker}`;
}

function insertAfterMain(source, markup, fileName) {
  const bodyMatch = /<body\b[^>]*>/i.exec(source);
  if (!bodyMatch) throw new Error(`${fileName} has no body element`);

  const bodyEnd = bodyMatch.index + bodyMatch[0].length;
  const mainMatch = /<main\b[^>]*>/i.exec(source.slice(bodyEnd));
  if (!mainMatch) throw new Error(`${fileName} has no main element after body`);

  const mainEnd = bodyEnd + mainMatch.index + mainMatch[0].length;
  return `${source.slice(0, mainEnd)}\n${markup}${source.slice(mainEnd)}`;
}

const entries = await readdir(labsDirectory, { withFileTypes: true });
const labFiles = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
  .map((entry) => entry.name)
  .sort();
const manifestFiles = labs.map((lab) => `${lab.slug}.html`).sort();

if (labFiles.join('\n') !== manifestFiles.join('\n')) {
  throw new Error('Every standalone lab HTML file must have exactly one manifest entry');
}

const staleFiles = [];
for (const lab of labs) {
  const fileName = `${lab.slug}.html`;
  if (lab.href !== `/labs/${fileName}`) throw new Error(`${lab.slug} does not match its manifest href`);

  const filePath = path.join(labsDirectory, fileName);
  const source = await readFile(filePath, 'utf8');
  const syllabusChips = renderSyllabusChips(lab);
  const markerPattern = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);
  const nextSource = markerPattern.test(source)
    ? source.replace(markerPattern, syllabusChips)
    : insertAfterMain(source, syllabusChips, fileName);

  if (nextSource === source) continue;
  staleFiles.push(fileName);
  if (!checkOnly) await writeFile(filePath, nextSource, 'utf8');
}

if (checkOnly && staleFiles.length > 0) {
  console.error(`Embedded syllabus chips are stale: ${staleFiles.join(', ')}`);
  process.exitCode = 1;
} else if (checkOnly) {
  console.log(`Embedded syllabus chips are current in ${labFiles.length} files.`);
} else {
  console.log(`Embedded syllabus chips synchronized in ${labFiles.length} files.`);
}
