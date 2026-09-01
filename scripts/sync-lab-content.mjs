import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { applyLabManifestContent } from '../app/lab-content.ts';
import { labAppearsInSubject, labs, subjects, syllabusAlignmentIncludesLevel, syllabusRegistry, topics } from '../app/labs.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const labsDirectory = path.join(root, 'public', 'labs');
const checkOnly = process.argv.includes('--check');

const findLabFiles = async (directory, relativeDirectory = '') => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = path.join(relativeDirectory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findLabFiles(path.join(directory, entry.name), relativePath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(relativePath);
    }
  }

  return files;
};

const labFiles = (await findLabFiles(labsDirectory)).sort();
const manifestFiles = labs
  .map((lab) => path.join(lab.subject, `${lab.slug}.html`))
  .sort();

if (labFiles.join('\n') !== manifestFiles.join('\n')) {
  throw new Error('Every standalone lab HTML file must have exactly one manifest entry');
}

const seenSlugs = new Set();
const seenHrefs = new Set();
for (const lab of labs) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(lab.slug)) throw new Error(`${lab.slug} is not kebab-case`);
  if (seenSlugs.has(lab.slug)) throw new Error(`Duplicate lab slug: ${lab.slug}`);
  if (seenHrefs.has(lab.href)) throw new Error(`Duplicate lab href: ${lab.href}`);
  seenSlugs.add(lab.slug);
  seenHrefs.add(lab.href);

  if (lab.href !== `/labs/${lab.subject}/${lab.slug}.html`) {
    throw new Error(`${lab.slug} does not match its subject-scoped manifest href`);
  }
  if (!topics.includes(lab.topic)) throw new Error(`${lab.slug} has unknown topic ${lab.topic}`);
  if (!lab.title.trim() || !lab.description.trim() || !lab.metaDescription.trim()) {
    throw new Error(`${lab.slug} has incomplete manifest text`);
  }
  if (lab.layout !== undefined && lab.layout !== 'compact') {
    throw new Error(`${lab.slug} has unknown layout ${lab.layout}`);
  }

  const subject = subjects.find((entry) => entry.id === lab.subject);
  if (!subject) throw new Error(`${lab.slug} references unknown subject ${lab.subject}`);
  for (const alignment of lab.syllabuses) {
    if (!syllabusRegistry[alignment.code]?.subjects.some((subjectId) => labAppearsInSubject(lab, subjectId))) {
      throw new Error(`${lab.slug} references ${alignment.code}, which is not enabled for its catalogue subjects`);
    }
  }
}

for (const subject of subjects) {
  for (const exam of subject.exams) {
    const view = subject.views[exam];
    if (!view) throw new Error(`${subject.id} has no view for ${exam}`);
    if (!view.href || !view.metaDescription.trim()) throw new Error(`${subject.id} ${exam} has incomplete search metadata`);
  }

  for (const [level, view] of Object.entries(subject.qualificationViews)) {
    if (!subject.exams.includes(view.exam)) {
      throw new Error(`${subject.id} ${level} references unknown exam ${view.exam}`);
    }
    const alignedExams = view.alignedExams ?? [view.exam];
    for (const exam of alignedExams) {
      if (!syllabusRegistry[exam]?.subjects.includes(subject.id)) {
        throw new Error(`${subject.id} ${level} references incompatible exam ${exam}`);
      }
    }
    if (!view.headerLabel.trim() || !view.intro.trim()) {
      throw new Error(`${subject.id} ${level} has incomplete visible text`);
    }
    const visibleTopics = new Set(
      labs
        .filter((lab) => labAppearsInSubject(lab, subject.id) && lab.syllabuses.some((alignment) => (
          alignedExams.includes(alignment.code) && syllabusAlignmentIncludesLevel(alignment.qualification, level)
        )))
        .map((lab) => lab.topic),
    );
    for (const topic of visibleTopics) {
      if (!view.topicBriefings[topic]?.trim()) {
        throw new Error(`${subject.id} ${level} has no briefing for ${topic}`);
      }
    }
    for (const topic of Object.keys(view.topicBriefings)) {
      if (!topics.includes(topic)) throw new Error(`${subject.id} ${level} has unknown briefing topic ${topic}`);
    }
  }
}

const staleFiles = [];
for (const lab of labs) {
  const fileName = path.join(lab.subject, `${lab.slug}.html`);
  const filePath = path.join(labsDirectory, fileName);
  const source = await readFile(filePath, 'utf8');
  const nextSource = applyLabManifestContent(source, lab);

  if (nextSource === source) continue;
  staleFiles.push(fileName);
  if (!checkOnly) await writeFile(filePath, nextSource, 'utf8');
}

if (checkOnly && staleFiles.length > 0) {
  console.error(`Manifest-controlled lab content is stale: ${staleFiles.join(', ')}`);
  process.exitCode = 1;
} else if (checkOnly) {
  console.log(`Manifest-controlled content is current in ${labFiles.length} files.`);
} else {
  console.log(`Manifest-controlled content synchronized in ${labFiles.length} files.`);
}
