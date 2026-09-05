import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');
const sourceIndex = process.argv.indexOf('--source');
const source = sourceIndex === -1 ? null : process.argv[sourceIndex + 1];
if (sourceIndex !== -1 && (!source || source.startsWith('--'))) throw new Error('--source requires the Lab Creation repository path');
if (source && check) throw new Error('Import with --source, then verify separately with --check');
const release = 'public/developer/lab-kit/0.3.0';
const documents = [
  ['examplicity-living-style-guide-v3.html', 'design-language.html'],
  ['lab-style-contract.md', 'lab-style-contract.md'],
];

async function write(relative, contents) {
  const target = path.join(root, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, contents);
}

if (source) {
  for (const [name] of documents) {
    await write(`docs/${name}`, await readFile(path.join(source, 'docs/design-language', name)));
  }
  const kit = path.join(source, 'packages/lab-kit');
  const manifestBytes = await readFile(path.join(kit, 'manifest.json'));
  const manifest = JSON.parse(manifestBytes);
  if (manifest.version !== '0.3.0') throw new Error('Expected Lab Kit 0.3.0');
  for (const file of manifest.files) await write(`${release}/${file.path}`, await readFile(path.join(kit, file.path)));
  await write(`${release}/manifest.json`, manifestBytes);
}

for (const [name, published] of documents) {
  const sourceBytes = await readFile(path.join(root, 'docs', name));
  const expected = name.endsWith('.md')
    ? Buffer.from(sourceBytes.toString('utf8').replaceAll('(examplicity-living-style-guide-v3.html)', '(design-language.html)'))
    : sourceBytes;
  const output = `public/developer/${published}`;
  if (check) {
    if (!expected.equals(await readFile(path.join(root, output)))) throw new Error(`${output} is stale; run npm run developer:sync`);
  } else await write(output, expected);
}

const guide = await readFile(path.join(root, 'docs/examplicity-living-style-guide-v3.html'), 'utf8');
const stylesheet = guide.match(/<style id="examplicity-starter-token-layer">([\s\S]*?)<\/style>/)?.[1];
if (!stylesheet) throw new Error('The guide is missing its starter stylesheet');
const cssPath = 'public/developer/design-language.css';
if (check) {
  if (await readFile(path.join(root, cssPath), 'utf8') !== stylesheet) throw new Error(`${cssPath} is stale`);
} else await write(cssPath, stylesheet);

const manifest = JSON.parse(await readFile(path.join(root, release, 'manifest.json'), 'utf8'));
for (const file of manifest.files) {
  const bytes = await readFile(path.join(root, release, file.path));
  if (bytes.length !== file.bytes || createHash('sha256').update(bytes).digest('hex') !== file.sha256) {
    throw new Error(`Lab Kit release hash mismatch: ${file.path}`);
  }
}
console.log(`Developer guide, style contract and Lab Kit ${manifest.version} ${check ? 'verified' : 'synchronized'}.`);
