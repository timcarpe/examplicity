import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createStandaloneLabHtml } from '../app/lab-download.ts';
import { labs } from '../app/labs.ts';
import {
  assertNoEmbeddedLabContract,
  extractEmbeddedLabContract,
  inspectLabHooks,
  parseLabContractV1,
  serializeLabContractV1,
} from '../tools/lab-contract/index.ts';
import { resolveLabPackage } from '../tools/lab-packages/index.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const requiredPilotSlugs = new Set([
  'fetch-decode-execute',
  'straight-line-coordinates-equations',
]);
const slugOptionIndex = process.argv.indexOf('--slug');
const requestedSlug = slugOptionIndex === -1 ? null : process.argv[slugOptionIndex + 1];
if (slugOptionIndex !== -1 && (!requestedSlug || requestedSlug.startsWith('--'))) {
  throw new Error('--slug requires a lab slug');
}

const selectedLabs = requestedSlug ? labs.filter((lab) => lab.slug === requestedSlug) : labs;
if (requestedSlug && selectedLabs.length !== 1) throw new Error(`Unknown or ambiguous lab slug: ${requestedSlug}`);

let checkedContracts = 0;
for (const lab of selectedLabs) {
  const labPackage = await resolveLabPackage(root, lab);
  const authored = await readFile(labPackage.sourcePath, 'utf8');
  assertNoEmbeddedLabContract(authored);

  if (!labPackage.sidecarPath) {
    if (requiredPilotSlugs.has(lab.slug)) throw new Error(`${lab.slug}: required contract.json is missing`);
    continue;
  }

  const contract = parseLabContractV1(
    await readFile(labPackage.sidecarPath, 'utf8'),
    `${lab.subject}/${lab.slug}/contract.json`,
  );
  const hooks = inspectLabHooks(authored);
  if (hooks.roles.length + hooks.actions.length + hooks.manipulatives.length + hooks.features.length === 0) {
    throw new Error(`${lab.slug}: contract-enabled source has no semantic data-lab-* locators`);
  }

  const published = await readFile(labPackage.publicOutputPath, 'utf8');
  const publishedContract = extractEmbeddedLabContract(published);
  if (!publishedContract) throw new Error(`${lab.slug}: compiled HTML has no embedded Lab Contract`);
  if (serializeLabContractV1(publishedContract) !== serializeLabContractV1(contract)) {
    throw new Error(`${lab.slug}: compiled HTML does not preserve contract.json`);
  }

  const packaged = createStandaloneLabHtml({
    source: published,
    lab,
    siteHomeUrl: 'https://www.examplicity.org/',
    liveLabUrl: `https://www.examplicity.org${lab.href}`,
  });
  const packagedContract = extractEmbeddedLabContract(packaged);
  if (!packagedContract) throw new Error(`${lab.slug}: standalone HTML has no embedded Lab Contract`);
  if (serializeLabContractV1(packagedContract) !== serializeLabContractV1(contract)) {
    throw new Error(`${lab.slug}: standalone HTML does not preserve contract.json`);
  }

  checkedContracts += 1;
}

if (!requestedSlug) {
  for (const slug of requiredPilotSlugs) {
    if (!selectedLabs.some((lab) => lab.slug === slug)) throw new Error(`Required pilot is missing: ${slug}`);
  }
}

console.log(`Verified ${checkedContracts} Lab Contract sidecar${checkedContracts === 1 ? '' : 's'}.`);
