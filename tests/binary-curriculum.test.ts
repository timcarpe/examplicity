import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runInNewContext } from 'node:vm';
import { labs } from '../app/labs.ts';
import { parseLabContractV1 } from '../tools/lab-contract/index.ts';
import { validateLabCurriculum } from '../tools/lab-publication/index.ts';

const loadContract = async () => parseLabContractV1(await readFile(
  'lab-contracts/computer-science/binary-numbers.lab.json', 'utf8',
));
const igcse = 'cambridge-0478-igcse';
const as = 'cambridge-9618-as';
const igcsePool = ['denary-binary', 'binary-denary', 'binary-addition', 'overflow',
  'shift-left', 'shift-right', 'denary-twos', 'denary-twos', 'twos-denary', 'twos-denary', 'negate-binary'];
const asOnlyPool = ['denary-ones', 'ones-denary', 'ones-to-twos', 'twos-to-ones',
  'denary-bcd', 'bcd-denary', 'prefix-conversion', 'signed-addition', 'signed-subtraction',
  'signed-overflow', 'arithmetic-left', 'arithmetic-right', 'cyclic-left', 'cyclic-right',
  'bitwise-and', 'bitwise-or', 'bitwise-xor', 'set-bit', 'test-bit'];
const hexPool = ['denary-hex', 'hex-denary', 'binary-hex', 'hex-binary'];

test('contract profiles preserve both existing question pools and sampling weights', async () => {
  const contract = await loadContract();
  const html = await readFile('labs-src/computer-science/binary-numbers/lab.html', 'utf8');
  const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1]).find((body) => body.includes('const featureTemplates='))!;
  // Execute the actual lab's model/generators, stopping before DOM event wiring.
  // Browser verification covers the real toggle and rendering separately.
  const boot = script.indexOf('  $("answerForm").addEventListener');
  assert.ok(boot > 0);
  const runtime = runInNewContext(`${script.slice(0, boot)}
    return {state, profiles, activePool, generateQuestion, featureTemplates};
  })();`, {
    LabKit: { dom: { byId: () => { throw new Error('Unexpected rendering in model test'); } } },
    document: { querySelector: () => ({ textContent: JSON.stringify(contract) }) },
  });
  assert.equal(runtime.state.curriculumProfile, igcse);
  assert.equal(runtime.state.range, 'binary');
  assert.deepEqual(Object.keys(runtime.featureTemplates).sort(), Object.keys(contract.curriculum!.features).sort());

  for (const [profile, basePool] of [[igcse, igcsePool], [as, [...igcsePool, ...asOnlyPool]]] as const) {
    runtime.state.curriculumProfile = profile;
    for (const range of ['binary', 'hex']) {
      runtime.state.range = range;
      const expected = range === 'hex' ? [...basePool, ...hexPool] : [...basePool];
      assert.deepEqual(Array.from(runtime.activePool()).sort(), [...expected].sort());
      for (const key of new Set(expected)) {
        assert.equal(runtime.generateQuestion(key).key, key);
      }
    }
  }
  runtime.state.curriculumProfile = as;
  runtime.profiles[as].enabledFeatures = runtime.profiles[as].enabledFeatures
    .filter((id: string) => id !== 'bitwise-operations');
  assert.ok(!runtime.activePool().includes('bitwise-and'), 'feature removal must change the generated pool');
});

test('publication rejects curriculum and feature references outside registered alignment', async () => {
  const contract = await loadContract();
  const lab = labs.find((item) => item.slug === 'binary-numbers')!;
  const hooks = { roles: ['working'], actions: [], manipulatives: [], features: [] };
  assert.doesNotThrow(() => validateLabCurriculum(contract, lab, hooks));
  assert.throws(() => validateLabCurriculum(contract, lab, { ...hooks, features: ['not-declared'] }), /unknown curriculum feature/);

  const wrongSyllabus = structuredClone(contract);
  wrongSyllabus.curriculum!.profiles[igcse].alignment[0].syllabus = '0580';
  assert.throws(() => validateLabCurriculum(wrongSyllabus, lab, hooks), /unregistered syllabus/);
  const wrongSection = structuredClone(contract);
  wrongSection.curriculum!.features['ones-complement'].alignment![0].sections = ['13.3'];
  assert.throws(() => validateLabCurriculum(wrongSection, lab, hooks), /sections outside profile/);
});
