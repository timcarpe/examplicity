import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const sourceRoot = path.resolve('labs-src', 'computer-science');
const readSource = (slug: string) => readFile(path.join(sourceRoot, slug, 'lab.html'), 'utf8');
const readMathSource = (slug: string) => readFile(path.resolve('labs-src', 'mathematics', slug, 'lab.html'), 'utf8');

test('W1 bitmap painting uses one keyboard grid stop and the existing paint state', async () => {
  const source = await readSource('bitmap-compression');

  assert.match(source, /id="bitmap" role="grid" tabindex="0"/);
  assert.match(source, /aria-activedescendant/);
  assert.match(source, /role", "gridcell"/);
  assert.match(source, /e\.key === "Enter" \|\| e\.key === " "/);
  assert.doesNotMatch(source, /cell\.tabIndex\s*=\s*0/);
});

test('W1 scheduler arrival controls retain focus while using the shared arrival path', async () => {
  const source = await readSource('process-states-scheduling');

  assert.match(source, /m\.setAttribute\("role","slider"\)/);
  assert.match(source, /setArrival\(p\.id,next,true\)/);
  assert.match(source, /function setArrival\(id,next,restoreFocus=false\)/);
  assert.match(source, /arrival-marker\[data-process=.*?\.focus\(\)/);
});

test('W1 sound overview exposes synchronized slider value and keyboard navigation', async () => {
  const source = await readSource('sound-sampling');

  assert.match(source, /id="overview"[^>]*role="slider"[^>]*tabindex="0"/);
  assert.match(source, /canvas\.setAttribute\("aria-valuetext"/);
  assert.match(source, /e\.key==="ArrowLeft"/);
  assert.match(source, /e\.key==="ArrowRight"/);
});

test('W1 TCP\/IP drag tools retain their native button activation path', async () => {
  const source = await readSource('tcp-ip-encapsulation');
  const buttons = source.match(/<button class="wrapper-tool [^"]+"[^>]*type="button"/g) ?? [];

  assert.equal(buttons.length, 3);
  const handler = source.match(/btn\.addEventListener\('click',(e=>\{[^\n]+?\})\);/);
  assert.ok(handler, 'wrapper buttons retain a native click handler');
  const added: string[] = [];
  const btn = { dataset: { wrapper: 'tcp', suppress: '1' } as Record<string, string> };
  const activate = runInNewContext(`(${handler[1]})`, { btn, addWrapper: (value: string) => added.push(value) });
  activate({ detail: 0 }); // Keyboard activation is independent of a previous pointer drag.
  assert.deepEqual(added, ['tcp']);
  activate({ detail: 1 }); // Consume the synthetic click after dragging.
  assert.deepEqual(added, ['tcp']);
  activate({ detail: 1 }); // A subsequent deliberate click works again.
  assert.deepEqual(added, ['tcp', 'tcp']);
});

test('circle construction delegates pointer and keyboard motion to the same shared SVG handle', async () => {
  const source = await readMathSource('circle-theorem-constraint-network');
  const shared = await readFile(new URL('../public/developer/lab-kit/0.3.0/src/lab-design.js', import.meta.url), 'utf8');
  assert.match(source, /return handle\(id,p\.x,p\.y/);
  assert.match(source, /set:v=>move\(key,transform\(Math\.round\(v\*10\)\/10\)\)/);
  assert.match(shared, /role: 'slider'/);
  assert.match(shared, /config\.set\(clamp\(value, config\.min, config\.max\)\)/);
  assert.match(source, /\.lab-discovery\.circle-lab \.stage\{touch-action:none\}/);
});

test('network construction nodes support keyboard placement and tool activation', async () => {
  const topology = await readSource('network-topology');
  const switching = await readSource('packet-switching');

  for (const source of [topology, switching]) {
    assert.match(source, /element\.tabIndex=0/);
    assert.match(source, /aria-keyshortcuts","ArrowLeft ArrowRight ArrowUp ArrowDown/);
    assert.match(source, /element\.addEventListener\("keydown"/);
    assert.match(source, /event\.key==="ArrowLeft"/);
  }
});

test('data transmission visual surfaces retain keyboard equivalents for routing', async () => {
  const source = await readSource('data-transmission-methods');

  assert.match(source, /id="noiseSource"[^>]*tabindex="0"[^>]*aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown"/);
  assert.match(source, /data-drag-node="\$\{node\.id\}" tabindex="0"/);
  assert.match(source, /function bindWireHit\(hit,connection\)/);
  assert.match(source, /data-bend-index':index,tabindex:0,role:"button"/);
  assert.match(source, /event\.key==="Delete"\|\|event\.key==="Backspace"/);
});

test('3D line-plane perspective check is operable without pointer input', async () => {
  const source = await readMathSource('three-dimensional-line-plane-trigonometry');

  assert.match(source, /viewActive=state\.perspectiveMode/);
  assert.match(source, /view\.setAttribute\('tabindex',viewActive\?'0':'-1'\)/);
  assert.match(source, /d==='view'.*?ArrowLeft.*?ArrowRight.*?ArrowUp.*?ArrowDown/);
  assert.match(source, /Math\.abs\(currentScreenOpening\(\)-state\.viewReferenceScreen\)>=2\.5/);
});
