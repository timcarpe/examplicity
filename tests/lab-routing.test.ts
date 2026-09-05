import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import sitemap from '../app/sitemap.ts';
import { labEmbedHref, labPageHref, labs } from '../app/labs.ts';
import { siteUrl } from '../app/site.ts';
import nextConfig from '../next.config.ts';

const sampleLab = labs.find((lab) => lab.slug === 'binary-numbers')!;

test('labs expose separate canonical page and embed-only document URLs', () => {
  assert.equal(labPageHref(sampleLab), '/labs/computer-science/binary-numbers');
  assert.equal(
    labEmbedHref(sampleLab),
    '/labs/computer-science/binary-numbers.html?embed=1',
  );
});

test('raw and legacy lab URLs permanently redirect to the framed page', async () => {
  const redirects = await nextConfig.redirects?.() ?? [];
  const destination = labPageHref(sampleLab);

  assert.ok(redirects.some((redirect) => (
    redirect.source === '/labs/binary-numbers.html'
    && redirect.destination === destination
    && redirect.permanent === true
  )));
  assert.ok(redirects.some((redirect) => (
    redirect.source === sampleLab.href
    && redirect.destination === destination
    && redirect.permanent === true
    && redirect.missing?.some((condition) => (
      condition.type === 'query' && condition.key === 'embed'
    ))
  )));
});

test('embed documents are noindex and canonical lab pages are in the sitemap', async () => {
  const headers = await nextConfig.headers?.() ?? [];
  assert.ok(headers.some((route) => (
    route.source === sampleLab.href
    && route.has?.some((condition) => (
      condition.type === 'query' && condition.key === 'embed' && condition.value === '1'
    ))
    && route.headers.some((header) => (
      header.key === 'X-Robots-Tag' && header.value === 'noindex, follow'
    ))
  )));

  const urls = sitemap().map((entry) => entry.url);
  assert.ok(urls.includes(`${siteUrl}${labPageHref(sampleLab)}`));
  assert.ok(!urls.includes(`${siteUrl}${sampleLab.href}`));

  const document = await readFile(
    path.join('public', 'labs', sampleLab.subject, `${sampleLab.slug}.html`),
    'utf8',
  );
  assert.match(
    document,
    /<link rel="canonical" href="https:\/\/www\.examplicity\.org\/labs\/computer-science\/binary-numbers">/,
  );
});
