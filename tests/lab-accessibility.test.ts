import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const sourceRoot = path.resolve('labs-src', 'computer-science');
const readSource = (slug: string) => readFile(path.join(sourceRoot, `${slug}.html`), 'utf8');

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
  assert.match(source, /btn\.addEventListener\('click',\(\)=>\{if\(btn\.dataset\.suppress\)return;addWrapper/);
});
