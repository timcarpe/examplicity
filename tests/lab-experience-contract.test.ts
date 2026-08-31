import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const repositoryRoot = path.resolve('.');

test('shared manifest headers use the 1200px rail independently of lab workspace width', async () => {
  const frame = await readFile(path.join(repositoryRoot, 'public', 'labs', 'lab-frame.css'), 'utf8');

  assert.match(frame, /--lab-header-max-width:\s*1200px/);
  assert.match(frame, /\.lab-manifest-header\s*\{[\s\S]*?max-width:\s*var\(--lab-header-max-width\)/);
  assert.match(frame, /\.lab-manifest-header\s*\{[\s\S]*?width:\s*calc\(100vw - var\(--lab-header-gutter\) - var\(--lab-header-gutter\)\)/);
});

test('guided repeated-percentage problems start incomplete and require model interaction', async () => {
  const source = await readFile(
    path.join(repositoryRoot, 'labs-src', 'mathematics', 'repeated-percentage-change.html'),
    'utf8',
  );

  assert.match(source, /changes:Array\(c\.periods\)\.fill\(null\)/);
  assert.doesNotMatch(source, /changes:Array\(c\.periods\)\.fill\(null\)\.map/);
  assert.match(source, /operator:'',inverseFactor:level===0\?multiplierExpected\(c\):null/);
  assert.match(source, /data-apply-guided>Apply this change<\/button>/);
  assert.match(source, /function enableGuidedReverseChoice\(\)/);
});

test('the translator dedicates the remaining desktop viewport height to its workspace', async () => {
  const source = await readFile(
    path.join(repositoryRoot, 'public', 'labs', 'computer-science', 'translator.html'),
    'utf8',
  );

  assert.match(source, /\.workspace\{[\s\S]*?height:calc\(100svh - 256px\);[\s\S]*?min-height:330px/);
  assert.match(source, /@container lab-canvas \(max-width:1160px\)\{[\s\S]*?\.workspace\{height:calc\(100svh - 298px\)\}/);
});

test('the recurring-decimals manipulative fits without an internal scrollbar', async () => {
  const source = await readFile(
    path.join(repositoryRoot, 'labs-src', 'mathematics', 'recurring-decimals-fractions.html'),
    'utf8',
  );

  assert.match(source, /\.board-scroll\{overflow-x:hidden\}/);
  assert.match(source, /\.alignment-board\{width:100%;min-width:0/);
  assert.match(source, /@media\(max-width:700px\)\{[\s\S]*?\.place-row,\.tape-row,\.result-grid-row,\.subtract-gesture\{width:100%;grid-template-columns:minmax\(0,1fr\)/);
  assert.match(source, /const cellStep=\(\)=>/);
  assert.doesNotMatch(source, /CELL_STEP/);
  assert.doesNotMatch(source, /\.board-scroll[\s\S]{0,120}scrollLeft|positionBoardForCase/);
});
