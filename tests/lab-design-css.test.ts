import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { packageDesignCss } from '../tools/lab-publication/design-css.ts';
import { compilePublicationLab, loadPublicationContext } from '../tools/lab-publication/index.ts';
import { findUnresolvedRuntimeResources } from '../tools/lab-compiler/index.ts';

const policy = JSON.parse(await readFile('public/developer/lab-kit/0.3.0/src/lab-design-purge.json', 'utf8'));

test('packaging retains runtime states and remix primitives without retaining unrelated adapters', async () => {
  const css = `
    :root { --lab-blue: blue; }
    .unused { color: red; }
    :is(input,textarea,select):focus { border-color: gray; }
    :where(.absent):hover { color: red; }
    button:where(:not(.counter,.person-card)) { padding: 8px 14px; }
    .lab-checkpoint:is(:hover,:focus-within) .lab-checkpoint-detail { display: block; }
    .runtime-field[data-state="complete"] { color: green; }
    [data-lab-setting="exam"] { color: black; }
    .lab-adopt-v3 .lab-work-card .future-child:focus-visible { border-color: blue; }
    .unrelated-adapter .lab-work-card { padding: 99px; }
    .lab-work-card:has(input) { background: yellow; }
    .lab-toggle :is(button, input):disabled { opacity: .5; }
    @media (max-width: 700px) { .lab-toggle button { padding: 4px; } }
    @media (prefers-reduced-motion: reduce) { .lab-work-card { animation: none; } }
    .lab-work-card { animation: pulse 2s infinite; }
    @keyframes pulse { to { opacity: .5; } }
    @keyframes local-animation { to { opacity: .2; } }
    @keyframes unused-animation { to { opacity: .1; } }
  `;
  const html = `<style data-lab-design>${css}</style>
    <style>.local { animation: local-animation 1s; }</style>
    <script>element.innerHTML = '<input class="runtime-field">'; element.dataset.labSetting = 'exam';</script>`;
  const result = await packageDesignCss(css, html, policy);
  assert.doesNotMatch(result, /\.unused|\.absent|unrelated-adapter|unused-animation/);
  assert.match(result, /:is\(input,textarea,select\):focus/);
  assert.match(result, /button:where\(:not\(\.counter,\.person-card\)\)/);
  assert.match(result, /:is\(:hover,:focus-within\)/);
  for (const token of ['data-lab-setting', 'runtime-field', 'future-child', ':has(input)', ':is(button, input)', ':disabled', 'max-width', 'prefers-reduced-motion', '@keyframes pulse', '@keyframes local-animation', '--lab-blue']) {
    assert.ok(result.includes(token), token);
  }
  assert.equal(await packageDesignCss(css, html, policy), result);
});

test('publication downloads use reduced CSS with shared remix primitives', async () => {
  const context = await loadPublicationContext(process.cwd());
  const css = await readFile('public/developer/lab-kit/0.3.0/src/lab-design.css', 'utf8');
  for (const slug of ['binary-numbers', 'recursive-call-stack', 'gas-compression-at-constant-temperature', 'sequence-patterns-differences', 'translator']) {
    const lab = await compilePublicationLab(context, slug, { check: true });
    const packaged = lab.output.match(/<style data-lab-design>\n([\s\S]*?)\n<\/style>/)![1];
    assert.ok(Buffer.byteLength(packaged) < Buffer.byteLength(css) * .8, slug);
    assert.ok(lab.standalone.includes(packaged));
    for (const primitive of ['lab-toggle', 'lab-work-card', 'lab-field-control', 'lab-math-surface', 'lab-chip', 'lab-checkpoint', 'lab-intro-card', 'next-card']) {
      assert.ok(packaged.includes(primitive), `${slug}: ${primitive}`);
    }
    assert.deepEqual(findUnresolvedRuntimeResources(lab.standalone), []);
  }
});
