import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { labs } from '../app/labs.ts';
import {
  compileLabResources,
  findUnresolvedRuntimeResources,
} from '../tools/lab-compiler/index.ts';

const resources = [
  { id: 'lab-kit.css', type: 'stylesheet' as const, content: '.lab-kit-panel { display: grid; }' },
  { id: 'lab-kit.js', type: 'script' as const, content: 'globalThis.LabKit = Object.freeze({ version: "test" });' },
];
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const compilerRoot = path.join(repositoryRoot, 'tools', 'lab-compiler');
const profileRoot = path.join(repositoryRoot, 'tools', 'lab-publication-profile');
const publicationManifestPath = path.join(repositoryRoot, 'labs-src', 'manifest.json');

const manifestKey = (entry: { subject: string; slug: string }) => `${entry.subject}/${entry.slug}`;
const resourceDeclarationPattern = /<(?:link|script)\b[^>]*\bdata-lab-resource\s*=\s*["']([^"']+)["'][^>]*>/gi;
const cssDeclarationPattern = /<link\b(?=[^>]*\brel\s*=\s*["']stylesheet["'])(?=[^>]*\bhref\s*=\s*["']\.\/lab-kit\.css["'])(?=[^>]*\bdata-lab-resource\s*=\s*["']lab-kit\.css["'])[^>]*>/gi;
const scriptDeclarationPattern = /<script\b(?=[^>]*\bsrc\s*=\s*["']\.\/lab-kit\.js["'])(?=[^>]*\bdata-lab-resource\s*=\s*["']lab-kit\.js["'])[^>]*>/gi;
const count = (source: string, expression: RegExp) => [...source.matchAll(expression)].length;

const source = `<!doctype html>
<html>
<head><link rel="stylesheet" href="./lab-kit.css" data-lab-resource="lab-kit.css"></head>
<body><script src="./lab-kit.js" data-lab-resource="lab-kit.js"></script></body>
</html>
`;

test('inlines declared resources into a self-contained deterministic document', () => {
  const first = compileLabResources(source, resources);
  assert.equal(first.resources.join(','), 'lab-kit.css,lab-kit.js');
  assert.match(first.source, /LAB_RESOURCE_START id="lab-kit\.css" type="stylesheet"/);
  assert.match(first.source, /<style data-lab-resource="lab-kit\.css"/);
  assert.match(first.source, /<script data-lab-resource="lab-kit\.js"/);
  assert.doesNotMatch(first.source, /href="\.\/lab-kit\.css"|src="\.\/lab-kit\.js"/);
  assert.deepEqual(findUnresolvedRuntimeResources(first.source), []);

  const second = compileLabResources(first.source, resources, { check: true });
  assert.equal(second.changed, false);
  assert.equal(second.source, first.source);
});

test('rejects undeclared and duplicated resource references', () => {
  assert.throws(
    () => compileLabResources(source.replace('data-lab-resource="lab-kit.css"', 'data-lab-resource="unknown.css"'), resources),
    /Unknown lab resource reference/,
  );
  assert.throws(
    () => compileLabResources(source.replace('</head>', `${source.match(/<link[^>]+>/)?.[0]}</head>`), resources),
    /Duplicate lab resource reference/,
  );
});

test('rejects unresolved runtime stylesheets and scripts', () => {
  const external = source.replace(
    '</head>',
    '<link rel="stylesheet" href="https://example.test/runtime.css"></head>',
  );
  assert.throws(() => compileLabResources(external, resources), /Unresolved external runtime CSS\/JS/);

  const remoteScript = source.replace(
    '</body>',
    '<script src="https://example.test/runtime.js"></script></body>',
  );
  assert.throws(() => compileLabResources(remoteScript, resources), /Unresolved external runtime CSS\/JS/);
});

test('requires a documented waiver for oversized shared resources', () => {
  const large = [{ id: 'lab-kit.js', type: 'script' as const, content: 'x'.repeat(65) }];
  const scriptOnly = '<script src="./lab-kit.js" data-lab-resource="lab-kit.js"></script>';
  assert.throws(
    () => compileLabResources(scriptOnly, large, { maxResourceBytes: 64 }),
    /add an explicit size waiver/,
  );
  assert.doesNotThrow(() => compileLabResources(scriptOnly, large, {
    maxResourceBytes: 64,
    sizeWaivers: { 'lab-kit.js': { reason: 'Reviewed test fixture.', maxBytes: 65 } },
  }));
});

test('release manifest pins the canonical compiler source', async () => {
  const manifest = JSON.parse(await readFile(path.join(compilerRoot, 'manifest.json'), 'utf8'));
  const source = await readFile(path.join(compilerRoot, 'index.ts'));
  assert.equal(manifest.name, '@examplicity/lab-compiler');
  assert.equal(manifest.version, '0.1.0');
  assert.equal(manifest.files[0].bytes, source.byteLength);
  assert.equal(manifest.files[0].sha256, createHash('sha256').update(source).digest('hex'));
});

test('publication profile is hash-pinned and matches its canonical release', async () => {
  const publicationManifest = JSON.parse(await readFile(publicationManifestPath, 'utf8'));
  const manifestContent = await readFile(path.join(profileRoot, 'manifest.json'));
  const manifest = JSON.parse(manifestContent.toString('utf8'));
  const profile = await readFile(path.join(profileRoot, 'profile.json'));
  const kitManifest = JSON.parse(await readFile(path.join(
    repositoryRoot,
    publicationManifest.kit.vendorDirectory,
    'manifest.json',
  ), 'utf8'));

  assert.equal(publicationManifest.publicationProfile.name, manifest.name);
  assert.equal(publicationManifest.publicationProfile.version, manifest.version);
  assert.equal(publicationManifest.kit.version, kitManifest.version);
  assert.equal(
    publicationManifest.publicationProfile.manifestSha256,
    createHash('sha256').update(manifestContent).digest('hex'),
  );
  assert.equal(manifest.files[0].bytes, profile.byteLength);
  assert.equal(manifest.files[0].sha256, createHash('sha256').update(profile).digest('hex'));
});

test('publication manifest owns every live lab in stable order', async () => {
  const manifest = JSON.parse(await readFile(publicationManifestPath, 'utf8'));
  const keys = manifest.labs.map(manifestKey);
  const expected = labs.map(manifestKey).sort();

  assert.equal(keys.length, labs.length);
  assert.equal(new Set(keys).size, keys.length);
  assert.deepEqual(keys, expected);
});

test('publication manifest records every catalogue curriculum mapping', async () => {
  const manifest = JSON.parse(await readFile(publicationManifestPath, 'utf8'));
  const manifestLabs = new Map(manifest.labs.map((entry: {
    subject: string;
    slug: string;
    syllabuses: unknown;
  }) => [manifestKey(entry), entry]));

  for (const lab of labs) {
    const entry = manifestLabs.get(manifestKey(lab));
    assert.ok(entry, `${lab.slug} is missing from the publication manifest`);
    assert.deepEqual(entry.syllabuses, lab.syllabuses, `${lab.slug} curriculum mapping has drifted`);
  }
});

test('registered sources and generated outputs satisfy the compiler-owned contract', async () => {
  const manifest = JSON.parse(await readFile(publicationManifestPath, 'utf8'));
  const sourceRoot = path.join(repositoryRoot, 'labs-src');
  const publicRoot = path.join(repositoryRoot, 'public', 'labs');
  const vendorRoot = path.join(repositoryRoot, manifest.kit.vendorDirectory);
  const kitResources = await Promise.all(manifest.kit.resources.map(async (resource: {
    id: string;
    type: 'stylesheet' | 'script';
    path: string;
  }) => ({
    id: resource.id,
    type: resource.type,
    content: await readFile(path.join(vendorRoot, resource.path), 'utf8'),
  })));
  const failures: string[] = [];

  for (const entry of manifest.labs) {
    const key = manifestKey(entry);
    const relativePath = path.join(entry.subject, `${entry.slug}.html`);
    const sourcePath = path.join(sourceRoot, relativePath);
    const outputPath = path.join(publicRoot, relativePath);
    let source: string;
    try {
      source = await readFile(sourcePath, 'utf8');
    } catch (error) {
      failures.push(`${key}: source is unavailable (${error instanceof Error ? error.message : String(error)})`);
      continue;
    }

    const declarations = [...source.matchAll(resourceDeclarationPattern)].map((match) => match[1]);
    const cssDeclarations = [...source.matchAll(cssDeclarationPattern)];
    const scriptDeclarations = [...source.matchAll(scriptDeclarationPattern)];
    if (declarations.join(',') !== 'lab-kit.css,lab-kit.js') {
      failures.push(`${key}: expected exactly lab-kit.css then lab-kit.js declarations, received ${declarations.join(',') || '(none)'}`);
      continue;
    }
    if (cssDeclarations.length !== 1 || scriptDeclarations.length !== 1) {
      failures.push(`${key}: expected one canonical CSS and one canonical JS declaration`);
      continue;
    }
    if ((cssDeclarations[0].index ?? 0) >= (scriptDeclarations[0].index ?? 0)) {
      failures.push(`${key}: CSS declaration must precede JS declaration`);
      continue;
    }

    try {
      const compiled = compileLabResources(source, kitResources);
      assert.deepEqual(compiled.resources, ['lab-kit.css', 'lab-kit.js']);
      assert.deepEqual(findUnresolvedRuntimeResources(compiled.source), []);
      const checked = compileLabResources(compiled.source, kitResources, { check: true });
      assert.equal(checked.changed, false);
      assert.equal(checked.source, compiled.source);
    } catch (error) {
      failures.push(`${key}: compiler validation failed (${error instanceof Error ? error.message : String(error)})`);
      continue;
    }

    try {
      const output = await readFile(outputPath, 'utf8');
      if (findUnresolvedRuntimeResources(output).length > 0) {
        failures.push(`${key}: generated output retains an external runtime CSS/JS resource`);
      }
      if (count(output, /<!-- LAB_FRAME_STYLES_START -->/g) !== 1 || count(output, /<!-- LAB_FRAME_STYLES_END -->/g) !== 1) {
        failures.push(`${key}: generated output does not contain exactly one frame marker pair`);
      }
      for (const resource of kitResources) {
        const start = `<!-- LAB_RESOURCE_START id="${resource.id}" type="${resource.type}" -->`;
        const end = `<!-- LAB_RESOURCE_END id="${resource.id}" type="${resource.type}" -->`;
        if (count(output, new RegExp(start.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) !== 1
          || count(output, new RegExp(end.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) !== 1) {
          failures.push(`${key}: generated output does not contain exactly one ${resource.id} compiler block`);
        }
      }
    } catch (error) {
      failures.push(`${key}: generated output is unavailable (${error instanceof Error ? error.message : String(error)})`);
    }
  }

  assert.deepEqual(failures, [], failures.join('\n'));
});

test('every registered inline executable script parses', async () => {
  const manifest = JSON.parse(await readFile(publicationManifestPath, 'utf8'));
  const sourceRoot = path.join(repositoryRoot, 'labs-src');
  const failures: string[] = [];

  for (const entry of manifest.labs) {
    const key = manifestKey(entry);
    const source = await readFile(path.join(sourceRoot, entry.subject, `${entry.slug}.html`), 'utf8');
    const scripts = [...source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
      .filter((match) => !/\bsrc\s*=/i.test(match[1]) && !/\btype\s*=/i.test(match[1]));

    scripts.forEach((script, index) => {
      try {
        Function(script[2]);
      } catch (error) {
        failures.push(`${key}: executable script ${index + 1} does not parse (${error instanceof Error ? error.message : String(error)})`);
      }
    });
  }

  assert.deepEqual(failures, [], failures.join('\n'));
});
