import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  loadPublicationContext,
  resolvePublicationLab,
  validatePublicationLab,
} from '../tools/lab-publication/index.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const slugOptionIndex = process.argv.indexOf('--slug');
const requestedSlug = slugOptionIndex === -1 ? null : process.argv[slugOptionIndex + 1];
if (slugOptionIndex !== -1 && (!requestedSlug || requestedSlug.startsWith('--'))) {
  throw new Error('--slug requires a lab slug');
}

const context = await loadPublicationContext(root);
const selectedEntries = requestedSlug
  ? [resolvePublicationLab(context, requestedSlug).entry]
  : context.manifest.labs;

for (const entry of selectedEntries) {
  const result = await validatePublicationLab(context, entry);
  if (!result.ok) {
    throw new Error(`${entry.slug}: publication validation failed${result.stale ? ' (public output is stale)' : ''}`);
  }
}

console.log(`Verified ${selectedEntries.length} Lab Contract sidecars and their published and standalone HTML.`);
