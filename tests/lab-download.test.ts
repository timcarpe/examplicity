import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { createStandaloneLabHtml } from '../app/lab-download.ts';
import { labs } from '../app/labs.ts';

test('standalone downloads use canonical home and live-lab links', async () => {
  const repositoryRoot = path.resolve('.');
  const lab = labs.find((candidate) => candidate.slug === 'fetch-decode-execute');
  assert.ok(lab);
  const source = await readFile(
    path.join(repositoryRoot, 'public', 'labs', lab.subject, `${lab.slug}.html`),
    'utf8',
  );

  const standalone = createStandaloneLabHtml({ source, lab });

  assert.match(standalone, /href="https:\/\/www\.examplicity\.org\/"/);
  assert.match(standalone, /href="https:\/\/www\.examplicity\.org\/labs\/computer-science\/fetch-decode-execute\.html"/);
  assert.doesNotMatch(standalone, /computer-science\/0478\?lab=/);
});
