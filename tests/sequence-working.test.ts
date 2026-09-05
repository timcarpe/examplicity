import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Sequence stage evidence records submitted working with learner-facing labels', async () => {
  const html = await readFile('labs-src/mathematics/sequence-patterns-differences/lab.html', 'utf8');
  const evidence = html.match(/function currentStageEvidence\(\)\{[^\n]+/)?.[0];
  const labels = html.match(/function fieldLabel\(keyName\)\{[^\n]+/)?.[0];
  assert.ok(evidence && labels);
  const state = { work: { d2const: '2', formula: 'n^2', use: '100', unearned: '999' }, futures: [] as number[] };
  let required = ['d2const', 'formula', 'use'];
  let family = { id: 'quadratic', useN: 10, formulaLabel: 'n²' };
  let constructed = false;
  const record = new Function('state', 'family', 'stageTerms', 'requiredWorkKeys', 'constructionComplete', 'allDifferenceKeys', 'expectedFor',
    `${labels}\n${evidence}\nreturn currentStageEvidence;`,
  )(state, () => family, () => [1, 4, 9, 16], () => required, () => constructed,
    () => ['d2const'], (key: string) => key === 'use' ? 100 : 2) as () => string;

  assert.match(record(), /T1 = 1 · T2 = 4 · T3 = 9 · T4 = 16/);
  assert.match(record(), /constant second difference: 2/);
  assert.match(record(), /nth-term rule: n\^2/);
  assert.match(record(), /T10: 100/);
  assert.doesNotMatch(record(), /d2const|999|unearned/);

  state.work.formula = '';
  assert.doesNotMatch(record(), /nth-term rule/, 'an unanswered field cannot expose its answer');
  required = [];
  assert.equal(record(), 'T1 = 1 · T2 = 4 · T3 = 9 · T4 = 16', 'None records only available model evidence');
  constructed = true;
  assert.match(record(), /constant second difference: 2\nnth-term rule: n²\nT10: 100/,
    'a completed None stage retains the working that was shown');
  required = ['formula'];
  assert.doesNotMatch(record(), /nth-term rule/, 'a required, unanswered formula stays hidden after construction');

  family = { id: 'ambiguity', useN: 0, formulaLabel: '' };
  state.futures.push(8, 9);
  assert.equal(record(), 'Future A: T₄ = 8\nFuture B: T₄ = 9');
});
