import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const sourcePath = 'labs-src/mathematics/histogram-area-cumulative-distribution/lab.html';

type HistogramDistribution = {
  boundaries: number[];
  frequencies: number[];
  widths: number[];
  densities: number[];
  cumulative: number[];
  total: number;
};

type HistogramModel = {
  histogramDistribution(bounds: number[], frequencies: number[]): HistogramDistribution;
  histogramCumulativeAt(data: HistogramDistribution, x: number): number;
  histogramQuantile(data: HistogramDistribution, fraction: number): number | null;
  histogramNumber(value: string): number | null;
  histogramMatches(actual: number[], expected: number[], tolerance?: number): boolean;
};

const extractFunction = (source: string, name: string) => {
  const start = source.indexOf(`function ${name}`);
  assert.ok(start >= 0, `${name} should remain in the canonical source`);
  const end = source.indexOf('\n  function ', start + name.length + 9);
  return source.slice(start, end < 0 ? source.length : end).trim();
};

const loadModel = async () => {
  const source = await readFile(sourcePath, 'utf8');
  const names = ['histogramDistribution', 'histogramCumulativeAt', 'histogramQuantile', 'histogramNumber', 'histogramMatches'];
  const declarations = names.map(name => extractFunction(source, name)).join('\n');
  const model = runInNewContext(`(() => { ${declarations}; return { ${names.join(', ')} }; })()`) as HistogramModel;
  return { source, model };
};

const loadFreshReports = async () => {
  const source = await readFile(sourcePath, 'utf8');
  const start = source.indexOf('const freshReports=');
  assert.ok(start >= 0, 'bounded fresh reports should remain in the canonical source');
  const end = source.indexOf('];', start) + 2;
  assert.ok(end > start, 'fresh report list should be complete');
  return runInNewContext(source.slice(start, end).replace('const freshReports=', '')) as Array<{
    bounds: number[];
    counts: number[];
  }>;
};

test('fresh reports use unequal widths and one coherent distribution model', async () => {
  const { model } = await loadModel();
  const reports = await loadFreshReports();

  assert.equal(reports.length, 3);
  for (const report of reports) {
    const data = model.histogramDistribution(report.bounds, report.counts);
    assert.equal(data.boundaries.length, data.frequencies.length + 1);
    assert.ok(new Set(data.widths).size > 1, 'fresh practice must include unequal widths');
    const cumulative = [0];
    for (const count of report.counts) cumulative.push(cumulative.at(-1)! + count);
    assert.deepEqual(Array.from(data.cumulative), cumulative);
    data.frequencies.forEach((count: number, index: number) => {
      assert.ok(Math.abs(data.densities[index] * data.widths[index] - count) < 1e-9);
    });
  }
});

test('constant-density interpolation returns ordered quartile estimates and a usable IQR', async () => {
  const { model } = await loadModel();
  const reports = await loadFreshReports();
  const report = reports[0];
  const data = model.histogramDistribution(report.bounds, report.counts);
  const fractions = [.25, .5, .75];
  const quartiles = fractions.map(fraction => model.histogramQuantile(data, fraction));

  assert.ok(quartiles.every((value: number | null): value is number => value !== null));
  assert.ok(quartiles[0] < quartiles[1] && quartiles[1] < quartiles[2]);
  quartiles.forEach((value: number, index: number) => {
    assert.ok(Math.abs(model.histogramCumulativeAt(data, value) - data.total * fractions[index]) < 1e-9);
  });
  assert.ok(quartiles[2] - quartiles[0] > 0);
});

test('editing a fresh report invalidates prior checks and changes all later cumulative totals', async () => {
  const { source, model } = await loadModel();
  const reports = await loadFreshReports();
  const report = reports[1];
  const original = model.histogramDistribution(report.bounds, report.counts);
  const editedCounts = report.counts.slice();
  editedCounts[1] += 3;
  const edited = model.histogramDistribution(report.bounds, editedCounts);

  assert.equal(model.histogramMatches(original.cumulative, original.cumulative), true);
  assert.equal(model.histogramMatches(original.cumulative, edited.cumulative), false);
  assert.equal(edited.cumulative[2], original.cumulative[2] + 3);
  assert.equal(edited.cumulative.at(-1), original.total + 3);
  assert.match(source, /s\.densityChecked\[i\]=false/);
  assert.match(source, /s\.totalChecked\[i\]=false/);
  assert.match(source, /s\.rankChecked\[s\.qIndex\]=false/);
  assert.match(source, /s\.practiceIqrChecked=false/);
  assert.match(source, /s\.practiceIndex=\(s\.practiceIndex\+1\)%freshReports\.length/);
  assert.match(source, /s\.practiceStage==='bars'\?s\.bounds\.length-1/);
});

test('practice number entries accept decimals and fractions while rejecting unsafe values', async () => {
  const { model } = await loadModel();
  assert.equal(model.histogramNumber(' 7.5 '), 7.5);
  assert.equal(model.histogramNumber('15/2'), 7.5);
  assert.equal(model.histogramNumber('15 / 0'), null);
  assert.equal(model.histogramNumber('not a number'), null);
});
