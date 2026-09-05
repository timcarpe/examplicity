import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Coordinate working follows the endpoints while the drawn line remains independently operated', async () => {
  const html = await readFile('labs-src/mathematics/coordinate-distance-midpoint-perpendicular/lab.html', 'utf8');
  const script = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .map((match) => match[1]).find((source) => source.includes('window.__labTest'));
  assert.ok(script);
  const elements = new Map([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => {
    const classes = new Set<string>();
    return [match[1], {
      textContent: '', innerHTML: '', value: '', hidden: false, className: '', style: {},
      setAttribute() {}, addEventListener() {},
      classList: {
        toggle(name: string, on: boolean) { if (on) classes.add(name); else classes.delete(name); },
        contains(name: string) { return classes.has(name); },
      },
    }];
  }));
  const window = { matchMedia: () => ({ matches: true }), __labTest: undefined as unknown };
  new Function('LabKit', 'window', 'document', 'requestAnimationFrame', 'ResizeObserver', script)(
    { dom: { byId: (id: string) => elements.get(id) }, numeric: { clamp: (n: number, min: number, max: number) => Math.max(min, Math.min(max, n)) } },
    window, { querySelectorAll: () => [] }, () => {}, class { observe() {} },
  );
  const lab = window.__labTest as {
    getState(): { phaseComplete: boolean; pending: string[]; answers: Record<string, string> };
    expected(): { equation: string; midpoint: { x: number; y: number } };
    setWorkLevel(level: number): void;
    answer(key: string, value: string): void;
    solve(): void;
    setPhase(phase: number): void;
  };
  const text = (id: string) => elements.get(id)!.textContent;

  assert.equal(text('equationReadout'), lab.expected().equation);
  assert.notEqual(text('boundaryEquation'), text('equationReadout'));
  lab.setWorkLevel(2);
  assert.match(text('stageWork0'), /Bisector: not entered/);
  assert.equal(text('stageWork1'), '', 'upcoming stages must not reveal their working');
  assert.equal(elements.get('equationBox')!.classList.contains('owned'), true);
  assert.equal(text('equationFormula'), 'through midpoint M');
  for (const [key, value] of Object.entries({ length: '10', gradient: '3/4', midpoint: '(0, 2)', equation: 'y=-4/3x+2' })) {
    lab.answer(key, value);
  }
  assert.deepEqual(lab.getState().pending, []);
  assert.equal(lab.getState().phaseComplete, false, 'answers alone cannot complete the construction');
  lab.solve();
  assert.equal(lab.getState().phaseComplete, true);
  assert.equal(text('stageDot0'), '✓');
  assert.match(text('stageWork0'), /Bisector: ✓ y=-4\/3x\+2/);

  lab.setPhase(1);
  assert.equal(lab.getState().phaseComplete, false);
  assert.deepEqual(Object.values(lab.getState().answers), ['', '', '', '']);
  assert.equal(text('equationReadout'), lab.expected().equation);
  assert.deepEqual(lab.expected().midpoint, { x: 3, y: 3 });
  assert.equal(text('gradientFormula'), '-10 ÷ +12');
  assert.equal(text('equationFormula'), 'through midpoint M', 'working must not reveal an unanswered midpoint');
  assert.match(text('stageWork0'), /Working: All\nLength AB:.*10/, 'completed stage retains its actual working');
  assert.match(text('stageWork1'), /Gradient AB: -10 ÷ \+12 = not entered/, 'current stage follows new endpoints and required inputs');
  assert.equal(text('stageWork2'), '');
});
