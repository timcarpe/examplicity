import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  assertNoEmbeddedLabContract,
  extractEmbeddedLabContract,
  injectLabContract,
  inspectLabHooks,
  parseLabContractV1,
  renderEmbeddedLabContract,
} from '../tools/lab-contract/index.ts';
import { getLabPackagePaths, resolveLabPackage } from '../tools/lab-packages/index.ts';

const contract = {
  schemaVersion: 1 as const,
  relationship: 'Learner action changes visible evidence.',
  learnerLoop: {
    action: 'Change the model.',
    modelChange: 'The represented state changes.',
    evidence: 'The consequence becomes visible.',
    nextDecision: 'Use the evidence to decide what to try next.',
  },
  safeAdaptations: ['Invite a creative comparison containing </script>.'],
  curriculum: {
    features: {
      'compare-cases': {
        description: 'Compare two meaningful cases.',
        alignment: [{ profile: 'igcse-core', sections: ['1.1'] }],
      },
    },
    profiles: {
      'igcse-core': {
        label: 'IGCSE core',
        alignment: [{ syllabus: '0000', qualification: 'IGCSE', sections: ['1.1'] }],
        enabledFeatures: ['compare-cases'],
        parameters: { caseCount: 2 },
      },
    },
  },
};

test('parses and validates a versioned contract with optional curriculum', () => {
  assert.deepEqual(parseLabContractV1(JSON.stringify(contract)), contract);
  assert.throws(
    () => parseLabContractV1(JSON.stringify({ ...contract, schemaVersion: 2 })),
    /schemaVersion must be 1/,
  );
  const unknownFeature = structuredClone(contract);
  unknownFeature.curriculum.profiles['igcse-core'].enabledFeatures = ['missing-feature'];
  assert.throws(() => parseLabContractV1(JSON.stringify(unknownFeature)), /unknown feature/);
});

test('injects one deterministic, script-safe contract and extracts it again', () => {
  const html = '<!doctype html>\n<html><head><title>Lab</title></head><body></body></html>\n';
  const injected = injectLabContract(html, contract);
  assert.equal(injected, injectLabContract(html, contract));
  assert.doesNotMatch(injected, /containing <\/script>/);
  assert.match(injected, /containing \\u003c\/script>/);
  assert.deepEqual(extractEmbeddedLabContract(injected), contract);
  assert.throws(() => injectLabContract(injected, contract), /must not embed a Lab Contract/);
  assert.throws(() => assertNoEmbeddedLabContract(renderEmbeddedLabContract(contract)), /must not embed/);
});

test('validates the small semantic hook vocabulary', () => {
  assert.deepEqual(
    inspectLabHooks('<main data-lab-role="model" data-lab-feature="compare-cases"><button data-lab-action="reset"></button></main>'),
    { roles: ['model'], actions: ['reset'], manipulatives: [], features: ['compare-cases'] },
  );
  assert.throws(() => inspectLabHooks('<div data-lab-role="answer"></div>'), /unsupported value/);
  assert.throws(() => inspectLabHooks('<div data-lab-feature="Compare Cases"></div>'), /invalid stable ID/);
  assert.deepEqual(inspectLabHooks(`
    <!-- <div data-lab-role="answer"></div> -->
    <script>const example = '<div data-lab-role="model"></div>';</script>
    <style>[data-lab-role="working"] { color: red; }</style>
    <div title='data-lab-role="evidence"'></div>
  `), { roles: [], actions: [], manipulatives: [], features: [] });
});

test('resolves a separate contract tree while preserving the package source and flat public output', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'examplicity-lab-package-'));
  const identity = { subject: 'computer-science', slug: 'example-lab' };
  const paths = getLabPackagePaths(root, identity);
  await mkdir(paths.packageDirectory, { recursive: true });
  await writeFile(paths.packageSourcePath, '<html></html>');

  const resolved = await resolveLabPackage(root, identity);
  assert.equal(resolved.sourcePath, paths.packageSourcePath);
  assert.equal(resolved.sidecarPath, null);
  assert.equal(paths.contractPath, path.join(root, 'lab-contracts', 'computer-science', 'example-lab.lab.json'));
  await mkdir(path.dirname(paths.contractPath), { recursive: true });
  await writeFile(paths.contractPath, JSON.stringify(contract));
  assert.equal((await resolveLabPackage(root, identity)).sidecarPath, paths.contractPath);
  assert.equal(resolved.publicOutputPath, path.join(root, 'public', 'labs', 'computer-science', 'example-lab.html'));

  const legacySourcePath = path.join(root, 'labs-src', 'computer-science', 'example-lab.html');
  await writeFile(legacySourcePath, '<html></html>');
  await assert.rejects(() => resolveLabPackage(root, identity), /Duplicate lab source/);
});

test('rejects unsafe identities and orphan sidecars', async () => {
  assert.throws(
    () => getLabPackagePaths('repository', { subject: '..', slug: 'example' }),
    /lowercase kebab-case/,
  );
  const root = await mkdtemp(path.join(os.tmpdir(), 'examplicity-lab-orphan-'));
  const paths = getLabPackagePaths(root, { subject: 'mathematics', slug: 'orphan' });
  await mkdir(path.dirname(paths.contractPath), { recursive: true });
  await writeFile(paths.contractPath, JSON.stringify(contract));
  await assert.rejects(
    () => resolveLabPackage(root, { subject: 'mathematics', slug: 'orphan' }),
    /Orphan Lab Contract/,
  );

  const missingRoot = await mkdtemp(path.join(os.tmpdir(), 'examplicity-lab-missing-'));
  await assert.rejects(
    () => resolveLabPackage(missingRoot, { subject: 'mathematics', slug: 'missing' }),
    /must contain lab\.html/,
  );
});
