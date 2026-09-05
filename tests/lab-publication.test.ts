import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  compilePublicationLab,
  loadPublicationContext,
  validatePublicationLab,
} from '../tools/lab-publication/index.ts';
import { findUnresolvedRuntimeResources } from '../tools/lab-compiler/index.ts';

const execFileAsync = promisify(execFile);
const repositoryRoot = path.resolve('.');
const runLab = async (...args: string[]) => {
  try {
    const result = await execFileAsync(process.execPath, [
      '--experimental-strip-types',
      path.join(repositoryRoot, 'scripts', 'lab.mjs'),
      ...args,
    ], { cwd: repositoryRoot });
    return { code: 0, stdout: result.stdout, stderr: result.stderr };
  } catch (error) {
    const failure = error as { code?: number; stdout?: string; stderr?: string; message?: string };
    return {
      code: typeof failure.code === 'number' ? failure.code : 1,
      stdout: failure.stdout ?? '',
      stderr: failure.stderr ?? failure.message ?? '',
    };
  }
};

test('publication core compiles and validates one packaged lab in memory', async () => {
  const context = await loadPublicationContext(repositoryRoot);
  const compiled = await compilePublicationLab(context, 'fetch-decode-execute', { check: true });
  assert.equal(compiled.relativePath, path.join('computer-science', 'fetch-decode-execute.html'));
  assert.deepEqual(findUnresolvedRuntimeResources(compiled.output), []);
  assert.deepEqual(findUnresolvedRuntimeResources(compiled.standalone), []);
  assert.match(compiled.standalone, /data-examplicity-download-chrome/);

  const validation = await validatePublicationLab(context, 'fetch-decode-execute');
  assert.equal(validation.ok, true);
  assert.equal(validation.stale, false);
  assert.equal(validation.checks.contractPreserved, true);
});

test('publication and CLI core require a contract for every published lab', async () => {
  const context = await loadPublicationContext(repositoryRoot);
  const root = await mkdtemp(path.join(os.tmpdir(), 'examplicity-contract-required-'));
  try {
    const directory = path.join(root, 'labs-src', 'physics', 'diffraction-through-a-gap');
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, 'lab.html'), '<html></html>');
    await assert.rejects(
      () => compilePublicationLab({ ...context, root }, 'diffraction-through-a-gap'),
      /required \.lab\.json sidecar is missing/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('inspect exposes contract loop, hooks and validation', async () => {
  const result = await runLab('inspect', 'fetch-decode-execute');
  assert.equal(result.code, 0, result.stderr);
  assert.match(result.stdout, /Fetch–Decode–Execute/);
  assert.match(result.stdout, /Relationship:/);
  assert.match(result.stdout, /Action:/);
  assert.match(result.stdout, /Model change:/);
  assert.match(result.stdout, /Evidence:/);
  assert.match(result.stdout, /Next decision:/);
  assert.match(result.stdout, /Sidecar: lab-contracts\/computer-science\/fetch-decode-execute\.lab\.json/);
  assert.match(result.stdout, /Invariants:/);
  assert.match(result.stdout, /Safe adaptations:/);
  assert.match(result.stdout, /Non-goals:/);
  assert.match(result.stdout, /Hooks: roles=/);
  assert.match(result.stdout, /Publication validation: pass/);
  assert.match(result.stdout, /Behavioral validation: not run/);
  assert.match(result.stdout, /labs-src\/computer-science\/fetch-decode-execute\/lab\.html/);
});

test('CLI rejects unsafe and unknown slugs with usage exit 2', async () => {
  const unsafe = await runLab('validate', '../fetch-decode-execute');
  assert.equal(unsafe.code, 2);
  assert.match(unsafe.stderr, /Unsafe lab slug/);

  const unknown = await runLab('validate', 'not-a-live-lab');
  assert.equal(unknown.code, 2);
  assert.match(unknown.stderr, /Unknown or ambiguous lab slug/);
});

test('case command explicitly reports that runtime cases are unavailable', async () => {
  const result = await runLab('case', 'fetch-decode-execute', 'default');
  assert.equal(result.code, 2);
  assert.match(result.stderr, /unavailable until a runtime facade and named cases exist/);
});
