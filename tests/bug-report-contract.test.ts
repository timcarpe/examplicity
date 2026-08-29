import assert from 'node:assert/strict';
import test from 'node:test';

import {
  MAX_DESCRIPTION_BYTES,
  MAX_DIAGNOSTICS_BYTES,
  MAX_EMAIL_BYTES,
  MAX_LAB_SLUG_BYTES,
  MAX_LAB_STATE_BYTES,
  MAX_PAGE_URL_BYTES,
  MAX_REQUEST_BYTES,
  truncateUtf8,
  utf8ByteLength,
  validateBugReportPayload,
} from '../app/bug-report-contract.ts';

function payload(overrides: Record<string, unknown> = {}) {
  return {
    reportType: 'bug',
    reportCategory: 'broken_interaction',
    description: 'The control stopped responding.',
    ...overrides,
  };
}

function jsonStringOfBytes(bytes: number): string {
  return 'x'.repeat(bytes - 2);
}

test('exports the agreed request and field caps', () => {
  assert.equal(MAX_REQUEST_BYTES, 100 * 1024);
  assert.equal(MAX_LAB_STATE_BYTES, 64 * 1024);
  assert.equal(MAX_DESCRIPTION_BYTES, 8 * 1024);
  assert.equal(MAX_DIAGNOSTICS_BYTES, 16 * 1024);
});

test('accepts a valid report and trims the description and email', () => {
  const result = validateBugReportPayload(payload({
    description: '  A reproducible issue.  ',
    email: ' reporter@example.com ',
    diagnostics: { browser: 'Chrome' },
    labState: { step: 3 },
  }));

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.description, 'A reproducible issue.');
    assert.equal(result.value.email, 'reporter@example.com');
    assert.equal(result.value.reportType, 'bug');
    assert.equal(result.value.reportCategory, 'broken_interaction');
  }
});

test('validates report types and their dependent categories', () => {
  const feedback = validateBugReportPayload(payload({
    reportType: 'feedback',
    reportCategory: 'feature_request',
  }));
  assert.equal(feedback.ok, true);

  assert.equal(validateBugReportPayload({ description: 'Missing selectors.' }).ok, false);
  assert.equal(validateBugReportPayload(payload({ reportType: 'question' })).ok, false);
  assert.equal(validateBugReportPayload(payload({
    reportType: 'feedback',
    reportCategory: 'broken_interaction',
  })).ok, false);
});

test('requires a non-empty description and rejects a non-string description', () => {
  assert.equal(validateBugReportPayload(payload({ description: '   ' })).ok, false);
  assert.equal(validateBugReportPayload(payload({ description: 42 })).ok, false);
});

test('enforces the description cap in UTF-8 bytes at the boundary', () => {
  const exact = 'x'.repeat(MAX_DESCRIPTION_BYTES);
  const tooLarge = `${exact}x`;

  assert.equal(validateBugReportPayload(payload({ description: exact })).ok, true);
  assert.equal(validateBugReportPayload(payload({ description: tooLarge })).ok, false);
  assert.equal(
    utf8ByteLength('é'.repeat(MAX_DESCRIPTION_BYTES / 2)),
    MAX_DESCRIPTION_BYTES,
  );
});

test('enforces the optional email cap in UTF-8 bytes', () => {
  const exact = 'é'.repeat(MAX_EMAIL_BYTES / 2);
  assert.equal(validateBugReportPayload(payload({ email: exact })).ok, true);
  assert.equal(validateBugReportPayload(payload({ email: `${exact}é` })).ok, false);
});

test('enforces the serialized diagnostics cap', () => {
  const exact = jsonStringOfBytes(MAX_DIAGNOSTICS_BYTES);
  const tooLarge = `${exact}x`;

  assert.equal(validateBugReportPayload(payload({ diagnostics: exact })).ok, true);
  assert.equal(validateBugReportPayload(payload({ diagnostics: tooLarge })).ok, false);
});

test('enforces the serialized lab-state cap', () => {
  const exact = jsonStringOfBytes(MAX_LAB_STATE_BYTES);
  const tooLarge = `${exact}x`;

  assert.equal(validateBugReportPayload(payload({ labState: exact })).ok, true);
  assert.equal(validateBugReportPayload(payload({ labState: tooLarge })).ok, false);
});

test('rejects payloads that are not JSON objects', () => {
  assert.equal(validateBugReportPayload(null).ok, false);
  assert.equal(validateBugReportPayload([]).ok, false);
  assert.equal(validateBugReportPayload('report').ok, false);
});

test('validates bounded lab slugs and page URLs', () => {
  assert.equal(validateBugReportPayload(payload({ labSlug: 'packet-switching' })).ok, true);
  assert.equal(validateBugReportPayload(payload({ labSlug: '../private' })).ok, false);
  assert.equal(
    validateBugReportPayload(payload({ labSlug: 'x'.repeat(MAX_LAB_SLUG_BYTES + 1) })).ok,
    false,
  );
  assert.equal(
    validateBugReportPayload(payload({ pageUrl: 'x'.repeat(MAX_PAGE_URL_BYTES + 1) })).ok,
    false,
  );
});

test('truncates server metadata at a UTF-8 byte boundary', () => {
  const value = `${'x'.repeat(1023)}é`;
  const truncated = truncateUtf8(value, 1024);

  assert.equal(truncated, 'x'.repeat(1023));
  assert.equal(utf8ByteLength(truncated), 1023);
  assert.equal(truncateUtf8('\uFFFDa', 3), '\uFFFD');
});
