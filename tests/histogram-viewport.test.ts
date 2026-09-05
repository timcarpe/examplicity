import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const sourcePath = 'labs-src/mathematics/histogram-area-cumulative-distribution/lab.html';

test('Enter commits rebuilt working fields without relying on blur/change', async () => {
  const html = await readFile(sourcePath, 'utf8');
  const callback = html.match(/\$\('workingPanel'\)\.addEventListener\('keydown',(e=>\{[^\n]+?\})\);/);
  assert.ok(callback);
  const commits: string[] = [];
  let prevented = 0;
  const onKey = runInNewContext(`(${callback[1]})`, {
    commitWorkInput: (event: { target: { dataset: { field: string } } }) => commits.push(event.target.dataset.field),
  });
  for (const field of ['density-0', 'total-0', 'rank-0', 'iqr']) {
    onKey({ key: 'Enter', target: { dataset: { field }, blur() {} }, preventDefault() { prevented++; } });
  }
  onKey({ key: 'ArrowUp', target: { dataset: { field: 'iqr' } } });
  onKey({ key: 'Enter', target: { dataset: {} } });
  assert.deepEqual(commits, ['density-0', 'total-0', 'rank-0', 'iqr']);
  assert.equal(prevented, 4);
});

test('Histogram completion card is outside the graph scroller', async () => {
  const html = await readFile(sourcePath, 'utf8');
  const shellStart = html.indexOf('<div id="stageShell" class="stage-shell">');
  const shellClose = html.indexOf('</div>\n        <div id="completionLayer"', shellStart);
  const completionStart = html.indexOf('<div id="completionLayer"', shellStart);

  assert.ok(shellStart >= 0, 'graph scroller should exist');
  assert.ok(shellClose > shellStart, 'graph scroller should close before the completion layer');
  assert.ok(completionStart > shellClose, 'completion layer should be a sibling after the graph scroller');
  assert.match(html, /<div class="stage-viewport">\s*<div id="stageShell"/);
  assert.match(html, /\.stage-shell\{overflow-x:auto;overflow-y:hidden\}/);
  assert.match(html, /nextPrimary'\)\.focus\(\{preventScroll:true\}\)/);
  assert.match(html, /makeDraggableDialog\(document\.getElementById\('nextCard'\),document\.querySelector\('\.stage-viewport'\)\)/);
  assert.doesNotMatch(html.slice(shellStart, completionStart), /id="completionLayer"/);

  const positionFunction = html.match(/function positionCompletion\(\)\{([\s\S]*?)\nfunction renderCompletion/);
  assert.ok(positionFunction, 'completion positioning function should remain explicit');
  assert.doesNotMatch(positionFunction[1], /stageShell|scrollLeft|scrollTop/);
  assert.doesNotMatch(html, /scrollIntoView/);
});

for (const type of ['bar', 'point', 'read']) {
  test(`Histogram ${type} drag preserves off-centre pickup and pointer ownership`, async () => {
    const html = await readFile(sourcePath, 'utf8');
    const handlers = html.slice(html.indexOf('function startDrag(e)'), html.indexOf('function keyboardStage(e)'));
    const state = { stage: type === 'read' ? 'quartile' : 'class', guide: null, drag: null, classIndex: 0, barDensities: [2], pointTotals: [0, 20], readX: 2, quartileIndex: 0 };
    const captured = new Set<number>();
    let completed = 0;
    const context = {
      state, cfg: { histBottom: 100, histTop: 0, cfBottom: 100, cfTop: 0 },
      stage: { setPointerCapture: (id: number) => captured.add(id), hasPointerCapture: (id: number) => captured.has(id), releasePointerCapture: (id: number) => captured.delete(id) },
      eventPoint: (e: { clientX: number; clientY: number }) => ({ x: e.clientX, y: e.clientY }),
      ownership: () => ({ density: 'drag', total: 'drag' }), renderAll() {},
      yDensity: (v: number) => 100 - v * 10, yCF: (v: number) => 100 - v,
      xScale: (v: number) => v * 10, xValue: (v: number) => v / 10,
      densityMax: () => 10, totalN: () => 100, widths: () => [10],
      sample: () => ({ frequencies: [50], boundaries: [0, 10] }),
      targetCumulative: () => [0, 50], barOK: () => true, quartileRankReady: () => true,
      targetModel: () => ({ evalAt: (x: number) => x * 10 }), qTargets: () => [50], expectedQuartile: () => 5,
      clamp: (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v)),
      maybeCompleteClass: () => completed++, maybeCompleteQuartile: () => completed++,
    };
    const { startDrag, moveDrag, endDrag } = runInNewContext(`${handlers};({startDrag,moveDrag,endDrag})`, context);
    const selector = type === 'bar' ? '[data-bar-handle]' : type === 'point' ? '[data-point-handle]' : '[data-read-handle]';
    const node = { dataset: { barHandle: '0', pointHandle: '0' } };
    const event = { isPrimary: true, button: 0, pointerId: 1, clientX: 27, clientY: 88, target: { closest: (s: string) => s === selector ? node : null }, preventDefault() {} };
    const value = () => type === 'bar' ? state.barDensities[0] : type === 'point' ? state.pointTotals[1] : state.readX;
    const initial = value();
    startDrag(event);
    assert.equal(captured.has(1), true);
    moveDrag(event);
    assert.equal(value(), initial, 'stationary off-centre pickup must not jump');
    moveDrag({ ...event, pointerId: 2, clientX: 37, clientY: 78 });
    assert.equal(value(), initial, 'another pointer must not move this handle');
    moveDrag({ ...event, clientX: 37, clientY: 78 });
    assert.equal(value(), type === 'point' ? 30 : 3);
    moveDrag({ ...event, clientX: 57, clientY: 58 });
    assert.equal(value(), type === 'point' ? 50 : 5, 'target snapping remains available');
    endDrag({ pointerId: 1, type: 'pointercancel' });
    assert.equal(state.drag, null);
    assert.equal(captured.size, 0);
    assert.equal(completed, 0, 'cancellation is not a completed attempt');
  });
}
