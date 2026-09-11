import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

// Exercise the authored model, not a second copy of its implementation.
const html = readFileSync('labs-src/mathematics/circle-theorem-constraint-network/lab.html', 'utf8');
const script = html.match(/\/\* CIRCLE_MODEL_START[\s\S]*?\/\* CIRCLE_MODEL_END \*\//)?.[0];
assert.ok(script, 'The authored geometry model must be available.');
const M = vm.runInNewContext(`${script}\nCircleModel`, {});
const fresh = (step: number, level = 1) => ({ ...M.initial(step), level });
const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);
const answer = (s: any, step: number) => { s.answers = M.expected(s, step); s.checked = true; };

test('every guided experience starts incomplete at every working level', () => {
  for (let step = 0; step < 8; step++) for (let level = 0; level < 3; level++) {
    const s = fresh(step, level);
    assert.equal(M.complete(s, step), false);
    answer(s, step);
    assert.equal(M.complete(s, step), false, 'answers do not replace operating the model');
  }
});

test('the semicircle is a condition, not an unconditional right-angle readout', () => {
  for (let b = -60; b <= 45; b += 5) for (let c = 65; c <= 145; c += 5) {
    const s = { ...fresh(0), b, c }, v = M.values(s);
    assert.ok(M.distance(M.point(b), M.point(c)) > .3);
    near(v.alpha + v.beta + v.semicircle, 180);
    assert.equal(Math.abs(v.semicircle - 90) < 1e-8, b === 0);
  }
});

test('retained evidence needs separated constructions, not accumulated wiggling', () => {
  const s = fresh(0, 0);
  assert.equal(M.recordSample(s, 0), false);
  M.move(s, 0, 'b', 0);
  assert.equal(M.recordSample(s, 0), true);
  for (let i = 0; i < 50; i++) {
    M.move(s, 0, 'c', 90 + i % 2 * 5);
    assert.equal(M.recordSample(s, 0), false);
  }
  M.move(s, 0, 'c', 125);
  assert.equal(M.recordSample(s, 0), true);
  assert.equal(M.complete(s, 0), true);
  assert.equal(M.recordSample(s, 0), false, 'two immutable readings are sufficient');
  M.move(s, 0, 'b', 5);
  assert.equal(M.complete(s, 0), false);
  assert.equal(s.samples.length, 0);
});

test('a semicircle prediction requires the stated triangle and clears on revision', () => {
  const s = fresh(1, 2);
  s.answers = { x: 55, reason: 'semicircle' }; s.checked = true;
  assert.equal(M.complete(s, 1), false);
  M.move(s, 1, 'c', 70); answer(s, 1);
  assert.equal(M.complete(s, 1), true);
  s.answers.reason = 'centre'; assert.equal(M.complete(s, 1), false);
  s.answers.reason = ''; assert.equal(M.fields(s, 1).reason, null);
  s.answers.reason = 'semicircle';
  M.move(s, 1, 'c', 75);
  assert.equal(s.checked, false);
  assert.equal(M.complete(s, 1), false);
  assert.equal(s.answers.x, 55, 'keep the entry, not its obsolete verdict');
});

test('the chord-angle network agrees with independent vector measurements', () => {
  for (let span = 70; span <= 150; span += 5) {
    const a = M.point(210), b = M.point(210 + span), o = { x: 0, y: 0 };
    near(M.angle(a, o, b), span);
    for (let c = 40; c <= 150; c += 10) near(M.angle(a, M.point(c), b), span / 2);
    const tangent = M.point(300), t = { x: a.x + tangent.x, y: a.y + tangent.y };
    near(M.angle(b, a, t), span / 2);
    near(M.angle(o, a, t), 90);
  }
  const s = fresh(4); assert.equal(M.geometryReady(s, 4), false);
  M.move(s, 4, 'tilt', 90); answer(s, 4);
  assert.equal(M.complete(s, 4), true);
  M.move(s, 4, 'tilt', 95); assert.equal(M.complete(s, 4), false);
});

test('blank and non-finite answers cannot complete same-segment working', () => {
  const s = fresh(3, 2); M.move(s, 3, 'd', 95); s.checked = true;
  for (const value of ['', ' ', 'Infinity', 'NaN', '1/0', 'alert(1)']) {
    s.answers = { x: value, reason: 'segment' };
    assert.equal(M.complete(s, 3), false);
    assert.equal(M.fields(s, 3).x, value.trim() ? false : null);
  }
  s.answers = { x: '50', reason: 'segment' };
  assert.equal(M.complete(s, 3), true);
});

test('paired tangents use distinct perpendicular contacts and correct lengths', () => {
  for (const radius of [5, 8, 13]) for (const ratio of [1.1, 1.25, 1.9]) for (const p of [-30, 0, 30]) {
    const s = { ...fresh(5), radius, ratio, p }, v = M.values(s);
    s.a = v.contact; s.z = -v.contact;
    const a = M.point(p + s.a, radius), b = M.point(p + s.z, radius);
    const ext = M.point(p, radius * ratio), o = { x: 0, y: 0 };
    near(M.angle(o, a, ext), 90); near(M.angle(o, b, ext), 90);
    near(M.distance(ext, a), v.tangent); near(M.distance(ext, b), v.tangent);
    near(v.oAngle + v.pAngle, 90);
    assert.equal(M.geometryReady(s, 5), true);
    s.z = s.a; assert.equal(M.geometryReady(s, 5), false);
  }
});

test('paired-tangent completion requires construction, comparison and owned working', () => {
  const s = fresh(5, 2), v = M.values(s);
  M.move(s, 5, 'a', v.contact); M.move(s, 5, 'z', -v.contact);
  assert.equal(s.locked, true);
  M.recordSample(s, 5); M.move(s, 5, 'p', 30); M.recordSample(s, 5);
  answer(s, 5); assert.equal(M.complete(s, 5), true);
  s.answers.first = 8; assert.equal(M.complete(s, 5), false);
  s.level = 1; assert.equal(M.complete(s, 5), true, 'Some owns PB, not the supplied intermediate');
  s.answers.x = 8; assert.equal(M.complete(s, 5), false);
  M.move(s, 5, 'p', 15); assert.equal(s.checked, false);
  s.level = 0; assert.equal(M.complete(s, 5), false, 'None still requires Test');
});

test('a chord, its midpoint and its perpendicular distance use one valid circle', () => {
  for (const radius of [5, 13]) for (const half of [1, 3, 4.5]) for (const mid of [215, 270, 325]) {
    const s = { ...fresh(6), radius, half, mid }, v = M.values(s);
    const ha = Math.asin(half / radius) / M.rad;
    const c = M.point(mid - ha, radius), d = M.point(mid + ha, radius);
    const n = { x: (c.x + d.x) / 2, y: (c.y + d.y) / 2 }, o = { x: 0, y: 0 };
    near(M.distance(c, d), v.chord); near(M.distance(o, n), v.centreDistance);
    near(M.angle(o, n, c), 90); near(M.distance(c, n), half);
  }
  const s = fresh(7, 2); M.move(s, 7, 'mid', 300); answer(s, 7);
  assert.equal(M.complete(s, 7), true); near(s.answers.x, 12);
  s.answers.first = 10; assert.equal(M.complete(s, 7), false, 'the full chord is not its half-chord');
});

test('the experiment distinguishes broken diameters and independent chord calculations', () => {
  const s = { ...fresh(8, 2), optional: true, freeType: 'diameter' };
  M.move(s, 8, 'b', 15); answer(s, 8);
  assert.equal(M.predictionReady(s, 8), false); assert.equal(M.complete(s, 8), false);
  M.move(s, 8, 'b', 0); answer(s, 8); assert.equal(M.complete(s, 8), true);
  s.freeType = 'chords'; s.half = 3.5;
  assert.equal(M.expected(s, 8).reason, 'bisector', 'an unequal chord does not justify equal-distance transfer');
});
