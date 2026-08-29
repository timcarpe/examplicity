import assert from 'node:assert/strict';
import test from 'node:test';

import { MAX_REQUEST_BYTES } from '../app/bug-report-contract.ts';
import { POST } from '../app/api/bug-reports/route.ts';

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
