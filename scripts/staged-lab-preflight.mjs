import { access, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [stagedPath] = process.argv.slice(2);
const errors = [];
let verifiedArtifact = null;

const fail = (message) => errors.push(message);
const normalizeText = (value) => value
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;/gi, "'")
  .replace(/\s+/g, ' ')
  .trim();

const readRequired = async (filePath, label) => {
  try {
    await access(filePath);
    return await readFile(filePath, 'utf8');
  } catch {
    fail(`Missing ${label}: ${filePath}`);
    return null;
  }
};

const readJson = async (filePath, label) => {
  const source = await readRequired(filePath, label);
  if (!source) return null;
  try {
    return JSON.parse(source);
  } catch {
    fail(`Invalid JSON in ${label}: ${filePath}`);
    return null;
  }
};

const checkArchitecture = async () => {
  const contracts = [
    ['app/labs.ts', [
      'export type Lab = Activity & {',
      'subject: SubjectId;',
      'topic: string;',
      'format: string;',
      'exams: ExamCode[];',
      'export const translator: Lab',
    ]],
    ['app/page.tsx', [
      'lab.subject === subject.id && lab.exams.includes(exam)',
      'createStandaloneLabHtml',
      '<iframe',
    ]],
    ['app/lab-download.ts', [
      'export const createStandaloneLabHtml',
      'data-examplicity-download-chrome',
    ]],
    ['public/labs/lab-frame.css', [
      '--lab-canvas:',
      'container-name: lab-canvas',
      'prefers-reduced-motion',
    ]],
    ['scripts/sync-lab-styles.mjs', [
      'LAB_FRAME_STYLES_START',
      "process.argv.includes('--check')",
    ]],
  ];

  for (const [relativePath, signatures] of contracts) {
    const source = await readRequired(path.join(siteRoot, relativePath), `website architecture file ${relativePath}`);
    if (!source) continue;
    for (const signature of signatures) {
      if (!source.includes(signature)) {
        fail(`Website architecture changed: ${relativePath} no longer contains ${JSON.stringify(signature)}.`);
      }
    }
  }

  const packageSource = await readRequired(path.join(siteRoot, 'package.json'), 'website package.json');
  if (!packageSource) return;
  try {
    const packageJson = JSON.parse(packageSource);
    if (!packageJson.scripts?.['labs:styles:check']) {
      fail('Website architecture changed: package.json has no labs:styles:check script.');
    }
  } catch {
    fail('Invalid JSON in website package.json.');
  }
};

if (!stagedPath || process.argv.slice(2).length !== 1) {
  fail('Usage: npm run labs:preflight -- <path-to-one-staged-lab>');
} else {
  const packageRoot = path.resolve(process.cwd(), stagedPath);
  const manifest = await readJson(path.join(packageRoot, 'manifest.json'), 'manifest.json');
  const report = await readJson(path.join(packageRoot, 'qa', 'report.json'), 'qa/report.json');

  if (manifest && report) {
    const slug = manifest.slug;
    const expectedPathSlug = path.basename(packageRoot);
    if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      fail('manifest.json slug must be lowercase kebab-case.');
    } else if (slug !== expectedPathSlug) {
      fail(`Package directory (${expectedPathSlug}) does not match manifest slug (${slug}).`);
    }
    if (typeof manifest.title !== 'string' || !manifest.title.trim()) fail('manifest.json needs a non-empty title.');
    if (typeof manifest.description !== 'string' || !manifest.description.trim()) fail('manifest.json needs a non-empty description.');
    if (manifest.subject !== 'computer-science') fail('manifest.json subject must be "computer-science".');
    if (!Array.isArray(manifest.syllabusCodes) || manifest.syllabusCodes.length === 0
      || manifest.syllabusCodes.some((code) => code !== '0478' && code !== '9618')) {
      fail('manifest.json syllabusCodes must contain only 0478 and/or 9618.');
    }
    if (!Array.isArray(manifest.syllabusPoints) || manifest.syllabusPoints.length === 0
      || manifest.syllabusPoints.some((point) => typeof point !== 'string' || !point.trim())) {
      fail('manifest.json syllabusPoints must contain at least one non-empty syllabus point.');
    }
    if (typeof manifest.topic !== 'string' || !manifest.topic.trim()) fail('manifest.json needs a non-empty topic.');
    if (typeof manifest.format !== 'string' || !manifest.format.trim()) fail('manifest.json needs a non-empty format.');
    if (report.decision !== 'pass') fail('qa/report.json decision must be "pass".');
    if (report.slug !== slug) {
      fail(`qa/report.json slug (${report.slug}) does not match manifest slug (${slug}).`);
    }
    if (typeof report.title === 'string' && report.title !== manifest.title) {
      fail(`qa/report.json title (${report.title}) does not match manifest title (${manifest.title}).`);
    }

    const artifactPath = typeof slug === 'string'
      ? path.join(packageRoot, 'dist', `${slug}.html`)
      : path.join(packageRoot, 'dist', 'invalid-slug.html');
    const artifact = await readRequired(artifactPath, 'dist artifact');
    if (artifact) {
      const actualHash = createHash('sha256').update(artifact).digest('hex');
      if (!/^[a-f0-9]{64}$/.test(report.artifactSha256 ?? '')) {
        fail('qa/report.json artifactSha256 must be a lowercase SHA-256 hash.');
      } else if (report.artifactSha256 !== actualHash) {
        fail(`Artifact SHA-256 mismatch: report has ${report.artifactSha256}, artifact is ${actualHash}.`);
      }

      if (!/^<!doctype html>/i.test(artifact) || !/<html\b/i.test(artifact) || !/<\/html>\s*$/i.test(artifact)
        || !/<head\b/i.test(artifact) || !/<\/head>/i.test(artifact) || !/<body\b/i.test(artifact) || !/<\/body>/i.test(artifact)) {
        fail('dist artifact must be a complete HTML document.');
      }
      const titleMatch = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(artifact);
      const h1Match = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(artifact);
      if (!titleMatch || normalizeText(titleMatch[1]) !== manifest.title) {
        fail('dist artifact <title> must exactly match manifest title.');
      }
      if (!h1Match || normalizeText(h1Match[1]) !== manifest.title) {
        fail('dist artifact <h1> must exactly match manifest title.');
      }
      if (!/<style\b/i.test(artifact) || !/<script\b/i.test(artifact)) {
        fail('dist artifact must keep its CSS and JavaScript in the monolithic HTML document.');
      }
      if (/<(?:script|link|img|iframe|audio|video|source)\b[^>]*(?:\bsrc|\bhref)\s*=/i.test(artifact)) {
        fail('dist artifact must not depend on external resource tags.');
      }
      verifiedArtifact = { bytes: Buffer.byteLength(artifact, 'utf8'), hash: actualHash };
    }
  }
}

await checkArchitecture();

if (errors.length > 0) {
  console.error('Staged-lab preflight failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Staged-lab preflight passed: ${path.resolve(process.cwd(), stagedPath)}`);
  console.log(`Source artifact: ${verifiedArtifact.bytes.toLocaleString('en-US')} bytes, SHA-256 ${verifiedArtifact.hash}`);
}
