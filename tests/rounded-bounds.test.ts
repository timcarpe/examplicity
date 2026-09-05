import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../labs-src/mathematics/rounded-measurements-bounds/lab.html', import.meta.url), 'utf8');
function model() {
  // Exercise the source's proof rules independently of DOM presentation.
  const logic = source.slice(source.indexOf('const BASE='), source.lastIndexOf("const dock=$('proofDock');"));
  return runInNewContext(`${logic}
    renderAll=()=>{}; renderStage=()=>{}; renderCompletion=()=>{};
    ({state,checkProof,checkFineBounds,checkFineProof,supplyWorking,setByPath});`);
}

test('coarse proof rejects the guarantee; finer proof uses the new worst-case endpoints', () => {
  const m = model();
  m.state.step = 2; m.state.workingLevel = 2;
  Object.assign(m.state.proof, { distance:'99.5', time:'12.45', speed:'7.992', verdict:'yes' });
  m.checkProof();
  assert.equal(m.state.complete[2], false);
  m.state.proof.verdict = 'no'; m.checkProof();
  assert.equal(m.state.complete[2], true);

  m.state.step = 3;
  Object.assign(m.state.fine, { dLow:'99.9', dHigh:'100.05', tLow:'12.395', tHigh:'12.405' });
  m.checkFineBounds();
  assert.equal(m.state.fine.boundsSuccess, false);
  m.state.fine.dLow = '99.95'; m.checkFineBounds();
  assert.equal(m.state.fine.boundsSuccess, true);
  assert.equal(m.state.d, 99.95);
  assert.ok(m.state.t < 12.405 && m.state.t > 12.40499);
  Object.assign(m.state.fine, { speed:'8.057', verdict:'yes' });
  m.checkFineProof();
  assert.equal(m.state.complete[3], true);
  m.setByPath('fine.speed', '7');
  assert.equal(m.state.complete[3], false);
  assert.equal(m.state.fine.success, false);
});

test('supplied finer working uses the same worst case; Some still owns the speed answer', () => {
  for (const level of [0, 1]) {
    const m = model(); m.state.step = 3; m.state.workingLevel = level;
    m.supplyWorking();
    assert.equal(m.state.fine.boundsSuccess, true);
    assert.equal(m.state.d, 99.95);
    assert.ok(m.state.t < 12.405 && m.state.t > 12.40499);
    assert.equal(m.state.fine.verdict, '');
    assert.equal(m.state.complete[3], false);
    if (level === 0) assert.ok(Number(m.state.fine.speed) > 8.05);
    else assert.equal(m.state.fine.speed, '');
  }
});
