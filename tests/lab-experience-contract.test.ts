import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const repositoryRoot = path.resolve('.');
const readAuthoredLab = (subject: string, slug: string) => readFile(
  path.join(repositoryRoot, 'labs-src', subject, slug, 'lab.html'),
  'utf8',
);

test('shared manifest headers use the 1200px rail independently of lab workspace width', async () => {
  const frame = await readFile(path.join(repositoryRoot, 'public', 'labs', 'lab-frame.css'), 'utf8');

  assert.match(frame, /--lab-header-max-width:\s*1200px/);
  assert.match(frame, /\.lab-manifest-header\s*\{[\s\S]*?max-width:\s*var\(--lab-header-max-width\)/);
  assert.match(frame, /\.lab-manifest-header\s*\{[\s\S]*?width:\s*calc\(100vw - var\(--lab-header-gutter\) - var\(--lab-header-gutter\)\)/);
  assert.match(frame, /\.lab-manifest-header\s*\{[\s\S]*?border-bottom:\s*0\s*!important/);
});

test('guided repeated-percentage problems start incomplete and require model interaction', async () => {
  const source = await readAuthoredLab('mathematics', 'repeated-percentage-change');

  assert.match(source, /changes:Array\(c\.periods\)\.fill\(null\)/);
  assert.doesNotMatch(source, /changes:Array\(c\.periods\)\.fill\(null\)\.map/);
  assert.match(source, /operator:'',inverseFactor:level===0\?multiplierExpected\(c\):null/);
  assert.match(source, /data-apply-guided>Apply this change<\/button>/);
  assert.match(source, /function enableGuidedReverseChoice\(\)/);
});

test('prime-factor pairing hands some-working learners to the required calculation', async () => {
  const source = await readAuthoredLab('mathematics', 'prime-factors-hcf-lcm');

  assert.match(source, /if\(answersRequired\(\)\)requestAnimationFrame/);
  assert.match(source, /const input=\$\("hcfAnswer"\)/);
  assert.match(source, /input\.focus\(\{preventScroll:true\}\)/);
  assert.match(source, /input\.scrollIntoView\(/);
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
  const source = await readAuthoredLab('mathematics', 'recurring-decimals-fractions');

  assert.match(source, /\.board-scroll\{overflow-x:hidden\}/);
  assert.match(source, /\.alignment-board\{width:100%;min-width:0/);
  assert.match(source, /@media\(max-width:700px\)\{[\s\S]*?\.place-row,\.tape-row,\.result-grid-row,\.subtract-gesture\{width:100%;grid-template-columns:minmax\(0,1fr\)/);
  assert.match(source, /const cellStep=\(\)=>/);
  assert.doesNotMatch(source, /CELL_STEP/);
  assert.doesNotMatch(source, /\.board-scroll[\s\S]{0,120}scrollLeft|positionBoardForCase/);
});

test('generic computer-science operated surfaces use the shared light canvas primitive', async () => {
  const slugs = [
    'combinational-logic-circuit-design',
    'csma-cd',
    'data-transmission-methods',
    'encryption-in-data-transmission',
    'ipv4-subnetting',
    'network-topology',
    'packet-switching',
    'tcp-ip-encapsulation',
  ];

  for (const slug of slugs) {
    const source = await readAuthoredLab('computer-science', slug);

    assert.match(source, /class="[^"]*lab-kit-canvas[^"]*"/, slug);
    assert.doesNotMatch(
      source,
      /--(?:board|canvas|network):#(?:101821|101b25|111a22|13212b|18242d|22313d)/,
      slug,
    );
  }
});

test('fixed CS construction canvases retain their authored width under the kit primitive', async () => {
  const dataTransmission = await readAuthoredLab('computer-science', 'data-transmission-methods');
  const csma = await readAuthoredLab('computer-science', 'csma-cd');

  assert.match(dataTransmission, /\.canvas\.lab-kit-canvas\{[\s\S]*?min-width:850px/);
  assert.match(csma, /\.canvas\.lab-kit-canvas\{[\s\S]*?min-width:930px/);
});

test('TCP/IP receiver layers occupy one meaningful station frame', async () => {
  const source = await readAuthoredLab('computer-science', 'tcp-ip-encapsulation');

  assert.match(source, /class="station receiver-station lab-kit-panel"/);
  assert.match(source, /id="receiverMap" class="receiver-map"/);
  assert.match(source, /\.receiver-map\{position:relative;min-height:548px;margin:10px;overflow:hidden\}/);
  assert.doesNotMatch(source, /id="receiverMap" class="[^"]*lab-kit-(?:canvas|panel)/);
});

test('DNS web servers populate the lab field without a decorative rack frame', async () => {
  const source = await readAuthoredLab('computer-science', 'dns-web-page-retrieval');

  assert.match(source, /\.rack-shell\{height:218px;padding:0;background:transparent\}/);
  assert.match(source, /@media\(max-width:820px\)\{[\s\S]*?\.rack-shell\{height:230px\}/);
  assert.doesNotMatch(source, /\.rack-shell\{[^}]*background:linear-gradient/);
  assert.doesNotMatch(source, /\.rack-shell\{[^}]*box-shadow:inset/);
});

test('primary visual histories do not gain incidental overflow', async () => {
  const automated = await readAuthoredLab('computer-science', 'automated-system-control-flowcharts');
  const processStates = await readAuthoredLab('computer-science', 'process-states-scheduling');

  assert.match(automated, /\.run-popup\{display:none;/);
  assert.match(automated, /\.run-popup\.show\{display:block;/);
  assert.match(automated, /shell\.scrollTop\+shell\.clientHeight-el\.offsetHeight-inset/);

  assert.match(processStates, /\.timeline-scroll\{overflow:hidden;/);
  assert.match(processStates, /\.timeline\{min-width:0;width:100%;/);
  assert.match(processStates, /repeat\(24,minmax\(0,1fr\)\)/);
  assert.doesNotMatch(processStates, /\.timeline\{[^}]*min-width:(?:990|1000)px/);
  assert.match(processStates, /@media\(max-width:1120px\)\{\.state-board\{grid-template-columns:minmax\(0,1fr\)\}\}/);
  assert.match(processStates, /class="state-lane cpu-lane lab-kit-canvas"/);
  assert.doesNotMatch(processStates, /--cpu:#1b2730|--cpu2:#2c3a45/);
});

test('circle theorem uses neutral toolkit surfaces without decorative blue rails', async () => {
  const source = await readAuthoredLab('mathematics', 'circle-theorem-constraint-network');

  assert.match(source, /\.method-node\.current\{[^}]*box-shadow:none/);
  assert.match(source, /\.calc-step\.current\{[^}]*box-shadow:none/);
  assert.match(source, /\.ownership-note\{[^}]*border:1px solid var\(--lab-kit-line\)/);
  assert.match(source, /class="stage-shell lab-kit-panel"/);
  assert.doesNotMatch(source, /\.method-node\.current\{[^}]*inset|\.calc-step\.current\{[^}]*inset/);
});
