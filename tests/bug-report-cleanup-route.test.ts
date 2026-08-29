import assert from 'node:assert/strict';
import test from 'node:test';

import { GET } from '../app/api/cron/bug-report-cleanup/route.ts';

test('rejects cleanup calls when CRON_SECRET is missing', async () => {
  const previousSecret = process.env.CRON_SECRET;
  delete process.env.CRON_SECRET;
  try {
    const response = await GET(new Request('https://example.test/api/cron/bug-report-cleanup'));
    assert.equal(response.status, 401);
  } finally {
    if (previousSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previousSecret;
  }
});

test('rejects cleanup calls with the wrong bearer token before database access', async () => {
  const previousSecret = process.env.CRON_SECRET;
  process.env.CRON_SECRET = 'expected-secret';
  try {
    const response = await GET(new Request(
      'https://example.test/api/cron/bug-report-cleanup',
      { headers: { authorization: 'Bearer wrong-secret' } },
    ));
    assert.equal(response.status, 401);
  } finally {
    if (previousSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previousSecret;
  }
});
