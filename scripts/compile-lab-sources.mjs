import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyLabManifestContent } from '../app/lab-content.ts';
import { labs } from '../app/labs.ts';
import { compileLabResources } from '../tools/lab-compiler/index.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoot = path.join(root, 'labs-src');
const publicRoot = path.join(root, 'public', 'labs');
const checkOnly = process.argv.includes('--check');
const sha256 = (content) => createHash('sha256').update(content).digest('hex');

const manifest = JSON.parse(await readFile(path.join(sourceRoot, 'manifest.json'), 'utf8'));
if (manifest.schemaVersion !== 1) throw new Error('Unsupported lab publication manifest schema.');
if (!manifest.publicationProfile?.manifestPath || !manifest.publicationProfile?.manifestSha256) {
  throw new Error('Lab publication manifest has no pinned publication profile.');
}
if (!manifest.kit?.version || !Array.isArray(manifest.kit.resources)) {
  throw new Error('Lab publication manifest has no pinned kit release.');
}

const profileManifestPath = path.resolve(root, manifest.publicationProfile.manifestPath);
const profileRoot = path.join(root, 'tools', 'lab-publication-profile');
if (!profileManifestPath.startsWith(`${profileRoot}${path.sep}`)) {
  throw new Error('Publication profile manifest must resolve inside tools/lab-publication-profile/.');
}
const profileManifestContent = await readFile(profileManifestPath);
if (sha256(profileManifestContent) !== manifest.publicationProfile.manifestSha256) {
  throw new Error('Pinned publication profile manifest hash mismatch.');
}
const profileManifest = JSON.parse(profileManifestContent.toString('utf8'));
if (
  profileManifest.schemaVersion !== 1
  || profileManifest.name !== manifest.publicationProfile.name
  || profileManifest.version !== manifest.publicationProfile.version
) {
  throw new Error('Publication profile manifest does not match the pinned release.');
}
const profileEntry = profileManifest.files?.find((entry) => entry.path === 'profile.json');
const profilePath = path.resolve(root, profileManifest.canonicalPath);
if (!profileEntry || !profilePath.startsWith(`${profileRoot}${path.sep}`)) {
  throw new Error('Publication profile release has no canonical profile.json.');
}
const profileContent = await readFile(profilePath);
if (
  profileEntry.bytes !== profileContent.byteLength
  || profileEntry.sha256 !== sha256(profileContent)
) {
  throw new Error('Publication profile does not match its release manifest.');
}
const profile = JSON.parse(profileContent.toString('utf8'));
if (profile.name !== profileManifest.name || profile.version !== profileManifest.version) {
  throw new Error('Publication profile content does not match its release manifest.');
}

const vendorRoot = path.resolve(root, manifest.kit.vendorDirectory);
if (!vendorRoot.startsWith(`${path.join(root, 'vendor')}${path.sep}`)) {
  throw new Error('Kit vendor directory must resolve inside vendor/.');
}
const vendorManifest = JSON.parse(await readFile(path.join(vendorRoot, 'manifest.json'), 'utf8'));
if (
  vendorManifest.schemaVersion !== 1
  || vendorManifest.name !== manifest.kit.name
  || vendorManifest.version !== manifest.kit.version
) {
  throw new Error('Vendored kit manifest does not match the pinned publication release.');
}

const resources = [];
for (const resource of manifest.kit.resources) {
  const filePath = path.resolve(vendorRoot, resource.path);
  if (!filePath.startsWith(`${vendorRoot}${path.sep}`)) {
    throw new Error(`Resource ${resource.id} resolves outside the pinned kit release.`);
  }
  const content = await readFile(filePath, 'utf8');
  const actualHash = sha256(content);
  if (actualHash !== resource.sha256) {
    throw new Error(`Resource ${resource.id} hash mismatch: expected ${resource.sha256}, received ${actualHash}.`);
  }
  const vendored = vendorManifest.resources?.find((candidate) => candidate.id === resource.id);
  if (
    !vendored
    || vendored.type !== resource.type
    || vendored.path !== resource.path
    || vendored.sha256 !== resource.sha256
    || vendored.bytes !== Buffer.byteLength(content, 'utf8')
  ) {
    throw new Error(`Resource ${resource.id} does not match the vendored release manifest.`);
  }
  resources.push({ id: resource.id, type: resource.type, content });
}

const frameStyles = (await readFile(path.join(publicRoot, 'lab-frame.css'), 'utf8')).trim();
const frameStart = '<!-- LAB_FRAME_STYLES_START -->';
const frameEnd = '<!-- LAB_FRAME_STYLES_END -->';
const embeddedFrame = `${frameStart}\n<style data-lab-frame>\n${frameStyles}\n</style>\n${frameEnd}`;
const framePattern = new RegExp(`${frameStart}[\\s\\S]*?${frameEnd}`);
const stale = [];

for (const entry of manifest.labs) {
  const lab = labs.find((candidate) => candidate.subject === entry.subject && candidate.slug === entry.slug);
  if (!lab) throw new Error(`Unknown publication lab: ${entry.subject}/${entry.slug}.`);

  const relativePath = path.join(entry.subject, `${entry.slug}.html`);
  const sourcePath = path.join(sourceRoot, relativePath);
  const outputPath = path.join(publicRoot, relativePath);
  const source = await readFile(sourcePath, 'utf8');
  const compiled = compileLabResources(source, resources).source;
  const withManifest = applyLabManifestContent(compiled, lab);
  if (!framePattern.test(withManifest)) throw new Error(`${relativePath} has no marked lab frame.`);
  const expected = withManifest.replace(framePattern, embeddedFrame);
  const current = await readFile(outputPath, 'utf8');

  if (current === expected) continue;
  stale.push(relativePath);
  if (!checkOnly) await writeFile(outputPath, expected, 'utf8');
}

if (checkOnly && stale.length > 0) {
  console.error(`Compiled publication labs are stale: ${stale.join(', ')}`);
  process.exitCode = 1;
} else if (checkOnly) {
  console.log(`Compiled publication sources are current in ${manifest.labs.length} labs.`);
} else {
  console.log(`Compiled ${manifest.labs.length} publication sources with lab kit ${manifest.kit.version}.`);
}
