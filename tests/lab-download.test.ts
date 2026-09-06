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
  assert.match(standalone, /href="https:\/\/www\.examplicity\.org\/labs\/computer-science\/fetch-decode-execute" target="_blank"/);
  assert.doesNotMatch(standalone, /computer-science\/0478\?lab=/);
});


test('documentation links survive repeated packaging exactly once in the head', async () => {
  const lab = labs.find((candidate) => candidate.slug === 'fetch-decode-execute');
  assert.ok(lab);
  const source = await readFile(path.join('public', lab.href), 'utf8');
  const once = createStandaloneLabHtml({ source, lab });
  const twice = createStandaloneLabHtml({ source: once, lab });
  for (const html of [source, once, twice]) {
    const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
    assert.ok(head);
    for (const url of ['https://www.examplicity.org/developer', 'https://www.examplicity.org/developer/llms.txt']) {
      assert.equal(head.split('href="' + url + '"').length - 1, 1);
    }
    assert.match(head, /<link rel="help" type="text\/plain"/);
  }
});
