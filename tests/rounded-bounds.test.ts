import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../labs-src/mathematics/rounded-measurements-bounds/lab.html', import.meta.url), 'utf8');
const contract = JSON.parse(readFileSync(new URL('../lab-contracts/mathematics/rounded-measurements-bounds.lab.json', import.meta.url), 'utf8'));
function model() {
  // Exercise the source's proof rules independently of DOM presentation.
  const logic = source.slice(source.indexOf('const BASE='), source.lastIndexOf("const dock=$('proofDock');"));
  return runInNewContext(`${logic}
    renderAll=()=>{}; renderVisuals=()=>{}; renderStage=()=>{}; renderCompletion=()=>{};
    ({state,profiles,activeSteps,setProfile,selectStep,setValue,intervalDisplay,intervalExpected,checkIntervals,checkProof,checkFineBounds,checkFineProof,supplyWorking,setByPath});`, {
      document: { querySelector: () => ({ textContent: JSON.stringify(contract) }) },
    });
}

test('Core needs discovery and interval answers; assistance never enables calculated bounds', () => {
  for (const level of [0, 1, 2]) {
    const m = model();
    assert.equal(m.state.curriculumProfile, 'cambridge-0580-extended');
    assert.equal(m.activeSteps().length, 4);
    m.state.workingLevel = level;
    m.setProfile('cambridge-0580-core');
    assert.equal(m.state.workingLevel, level);
    assert.equal(m.activeSteps().length, 1);
    m.checkIntervals();
    assert.equal(m.state.complete[0], false, 'fresh states require model interaction even with no working');
    // Cross each boundary using the actual model operation.
    for (const [kind, values] of [['distance', [99.4, 100.6]], ['time', [12.34, 12.46]]] as const) {
      values.forEach(value => m.setValue(kind, value));
    }
    assert.equal(m.state.complete[0], false, 'discovery alone does not skip the interval check');
    assert.equal(m.intervalDisplay('dHigh', 100.5), level ? '?' : '100.5');
    Object.assign(m.state.interval, {dLow:'99.5',dHigh:'100.5',tLow:'12.35',tHigh:'12.45'});
    if (level) {
      m.state.interval.tHigh = '12.35'; m.checkIntervals();
      assert.equal(m.state.complete[0], false, 'reversed endpoints must not pass');
      m.state.interval.tHigh = '12.45';
    }
    m.checkIntervals();
    assert.equal(m.state.complete[0], true);
    assert.equal(m.intervalDisplay('dHigh', 100.5), '100.5');
    m.selectStep(1);
    assert.equal(m.state.step, 0, 'Core cannot enter speed stages');
    m.setProfile('cambridge-0580-extended');
    assert.equal(m.state.complete.some(Boolean), false);
    assert.equal(m.state.interval.dHigh, '');
    assert.equal(m.activeSteps().length, 4);
    assert.equal(m.state.workingLevel, level);
    m.profiles['cambridge-0580-extended'].enabledFeatures = ['rounded-data-intervals'];
    assert.equal(m.activeSteps().length, 1, 'sidecar features control the actual stage set');
  }
});

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
