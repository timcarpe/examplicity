import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  compilePublicationLab,
  loadPublicationContext,
  resolvePublicationLab,
  writePublicationLab,
} from '../tools/lab-publication/index.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');
const slugOptionIndex = process.argv.indexOf('--slug');
const requestedSlug = slugOptionIndex === -1 ? null : process.argv[slugOptionIndex + 1];
if (slugOptionIndex !== -1 && (!requestedSlug || requestedSlug.startsWith('--'))) {
  throw new Error('--slug requires a lab slug');
}
const context = await loadPublicationContext(root);
const selectedEntries = requestedSlug
  ? [resolvePublicationLab(context, requestedSlug).entry]
  : context.manifest.labs;
const stale = [];

for (const entry of selectedEntries) {
  const compiled = await compilePublicationLab(context, entry, { check: checkOnly });
  let current = null;
  try {
    current = await readFile(compiled.package.publicOutputPath, 'utf8');
  } catch (error) {
    if ((error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
      current = null;
    } else {
      throw error;
    }
  }

  if (current === compiled.output) continue;
  stale.push(compiled.relativePath);
  if (!checkOnly) await writePublicationLab(compiled);
}

if (checkOnly && stale.length > 0) {
  console.error(`Compiled publication labs are stale: ${stale.join(', ')}`);
  process.exitCode = 1;
} else if (checkOnly) {
  console.log(`Compiled publication sources are current in ${selectedEntries.length} labs.`);
} else {
  console.log(`Compiled ${selectedEntries.length} publication sources with lab kit ${context.kit.version}.`);
}
