import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  compileLabResources,
  findUnresolvedRuntimeResources,
} from '../tools/lab-compiler/index.ts';

const resources = [
  { id: 'lab-kit.css', type: 'stylesheet' as const, content: '.lab-kit-panel { display: grid; }' },
  { id: 'lab-kit.js', type: 'script' as const, content: 'globalThis.LabKit = Object.freeze({ version: "test" });' },
];
const compilerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'tools', 'lab-compiler');

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
