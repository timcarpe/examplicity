import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const labsDirectory = path.join(root, 'public', 'labs');
const sharedStylesPath = path.join(labsDirectory, 'lab-frame.css');
const startMarker = '<!-- LAB_FRAME_STYLES_START -->';
const endMarker = '<!-- LAB_FRAME_STYLES_END -->';
const externalLink = '<link rel="stylesheet" href="/labs/lab-frame.css">';
const checkOnly = process.argv.includes('--check');

const sharedStyles = (await readFile(sharedStylesPath, 'utf8')).trim();
const embeddedStyles = `${startMarker}\n<style data-lab-frame>\n${sharedStyles}\n</style>\n${endMarker}`;
const entries = await readdir(labsDirectory, { withFileTypes: true });
const labFiles = entries
  .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
  .map((entry) => entry.name)
  .sort();

const staleFiles = [];

for (const fileName of labFiles) {
  const filePath = path.join(labsDirectory, fileName);
  const source = await readFile(filePath, 'utf8');
  const markerPattern = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);
  const nextSource = markerPattern.test(source)
    ? source.replace(markerPattern, embeddedStyles)
    : source.replace(externalLink, embeddedStyles);

  if (nextSource === source) {
    if (!source.includes(embeddedStyles)) {
      throw new Error(`${fileName} has no lab-frame stylesheet marker or external link`);
    }
    continue;
  }

  staleFiles.push(fileName);
  if (!checkOnly) {
    await writeFile(filePath, nextSource, 'utf8');
  }
}

if (checkOnly && staleFiles.length > 0) {
  console.error(`Embedded lab styles are stale: ${staleFiles.join(', ')}`);
  process.exitCode = 1;
} else if (checkOnly) {
  console.log(`Embedded lab styles are current in ${labFiles.length} files.`);
} else {
  console.log(`Embedded lab styles synchronized in ${labFiles.length} files.`);
}
