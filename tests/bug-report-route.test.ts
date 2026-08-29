import assert from 'node:assert/strict';
import test from 'node:test';

import { MAX_REQUEST_BYTES } from '../app/bug-report-contract.ts';
import { clientIp, ipFingerprint, POST } from '../app/api/bug-reports/route.ts';

const endpoint = 'https://example.test/api/bug-reports';

function request(body: string, headers: Record<string, string> = {}) {
  return new Request(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      host: 'example.test',
      origin: 'https://example.test',
      'sec-fetch-site': 'same-origin',
      ...headers,
    },
    body,
  });
}

test('rejects cross-origin submissions before reading the body', async () => {
  const response = await POST(request('{}', { origin: 'https://attacker.test' }));
  assert.equal(response.status, 403);
});

test('rejects unsupported content types', async () => {
  const response = await POST(request('{}', { 'content-type': 'text/plain' }));
  assert.equal(response.status, 415);
});

test('rejects request bodies over 100 KiB', async () => {
  const response = await POST(request('x'.repeat(MAX_REQUEST_BYTES + 1)));
  assert.equal(response.status, 413);
});

test('silently accepts a filled honeypot without requiring a database', async () => {
  const response = await POST(request(JSON.stringify({
    description: 'Automated submission',
    website: 'https://spam.test',
  })));
  const result = await response.json() as { reportId?: string };

  assert.equal(response.status, 201);
  assert.match(result.reportId ?? '', /^[0-9a-f-]{36}$/);
});

test('rejects a report page URL from another origin', async () => {
  const response = await POST(request(JSON.stringify({
    description: 'A valid description',
    pageUrl: 'https://attacker.test/fake-page',
  })));

  assert.equal(response.status, 400);
});

test('uses a normalized Vercel client IP without retaining it in the fingerprint', () => {
  const ip = clientIp(request('{}', {
    'x-vercel-forwarded-for': '2001:DB8::1, 10.0.0.1',
  }));
  const fingerprint = ipFingerprint(ip, 'test-only-secret');

  assert.equal(ip, '2001:db8::1');
  assert.match(fingerprint, /^[0-9a-f]{64}$/);
  assert.equal(fingerprint.includes(ip), false);
  assert.notEqual(fingerprint, ipFingerprint(ip, 'different-secret'));
});

test('does not trust malformed forwarding values', () => {
  assert.equal(clientIp(request('{}', {
    'x-forwarded-for': 'not-an-ip',
  })), 'unknown');
});

test('does not accept the generic forwarded header as authoritative on Vercel', () => {
  assert.equal(clientIp(request('{}', {
    'x-forwarded-for': '203.0.113.20',
  }), true), 'unknown');
});

test('fails closed when Vercel does not provide a client IP', async () => {
  const previousVercel = process.env.VERCEL;
  const previousSalt = process.env.BUG_REPORT_IP_SALT;
  process.env.VERCEL = '1';
  process.env.BUG_REPORT_IP_SALT = 'test-only-secret';
  try {
    const response = await POST(request(JSON.stringify({
      description: 'A valid description',
    })));
    assert.equal(response.status, 500);
  } finally {
    if (previousVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previousVercel;
    if (previousSalt === undefined) delete process.env.BUG_REPORT_IP_SALT;
    else process.env.BUG_REPORT_IP_SALT = previousSalt;
  }
});
