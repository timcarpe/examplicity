export const MAX_REQUEST_BYTES = 100 * 1024;
export const MAX_LAB_STATE_BYTES = 64 * 1024;
export const MAX_DESCRIPTION_BYTES = 8 * 1024;
export const MAX_DIAGNOSTICS_BYTES = 16 * 1024;
export const MAX_EMAIL_BYTES = 254;
export const MAX_LAB_SLUG_BYTES = 160;
export const MAX_PAGE_URL_BYTES = 2048;
export const MAX_HONEYPOT_BYTES = 200;

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export const REPORT_CATEGORIES = {
  bug: [
    { value: 'incorrect_content', label: 'Incorrect content' },
    { value: 'broken_interaction', label: 'Broken interaction' },
    { value: 'display_issue', label: 'Display or layout issue' },
    { value: 'performance_issue', label: 'Performance issue' },
    { value: 'other', label: 'Other' },
  ],
  feedback: [
    { value: 'content_suggestion', label: 'Content suggestion' },
    { value: 'feature_request', label: 'Feature request' },
    { value: 'usability', label: 'Usability' },
    { value: 'accessibility', label: 'Accessibility' },
    { value: 'other', label: 'Other' },
  ],
} as const;

export type ReportType = keyof typeof REPORT_CATEGORIES;
export type ReportCategory = (typeof REPORT_CATEGORIES)[ReportType][number]['value'];

export type BugReportPayload = {
  reportType: ReportType;
  reportCategory: ReportCategory;
  description: string;
  email?: string;
  labSlug?: string;
  pageUrl?: string;
  diagnostics?: JsonValue;
  labState?: JsonValue;
  website?: string;
};

export type BugReportValidation =
  | { ok: true; value: BugReportPayload }
  | { ok: false; error: string };

const encoder = new TextEncoder();

export function utf8ByteLength(value: string): number {
  return encoder.encode(value).byteLength;
}

export function truncateUtf8(value: string, maxBytes: number): string {
  if (utf8ByteLength(value) <= maxBytes) return value;

  let result = '';
  let resultBytes = 0;
  for (const character of value) {
    const characterBytes = utf8ByteLength(character);
    if (resultBytes + characterBytes > maxBytes) break;
    result += character;
    resultBytes += characterBytes;
  }
  return result;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function serializedJson(value: unknown): string | null {
  try {
    const result = JSON.stringify(value);
    return result === undefined ? null : result;
  } catch {
    return null;
  }
}

function validateJsonField(
  value: unknown,
  maxBytes: number,
): string | null | undefined {
  if (value === undefined) return undefined;

  const serialized = serializedJson(value);
  if (serialized === null) return null;
  return utf8ByteLength(serialized) <= maxBytes ? serialized : null;
}

export function validateBugReportPayload(input: unknown): BugReportValidation {
  if (!isObject(input)) {
    return { ok: false, error: 'invalid_payload' };
  }

  const description = input.description;
  if (typeof description !== 'string' || description.trim().length === 0) {
    return { ok: false, error: 'description_required' };
  }
  if (utf8ByteLength(description) > MAX_DESCRIPTION_BYTES) {
    return { ok: false, error: 'description_too_long' };
  }

  const reportType = input.reportType;
  if (reportType !== 'bug' && reportType !== 'feedback') {
    return { ok: false, error: 'report_type_invalid' };
  }

  const reportCategory = input.reportCategory;
  if (
    typeof reportCategory !== 'string'
    || !REPORT_CATEGORIES[reportType].some(({ value }) => value === reportCategory)
  ) {
    return { ok: false, error: 'report_category_invalid' };
  }

  const email = input.email;
  if (email !== undefined && (
    typeof email !== 'string' || utf8ByteLength(email) > MAX_EMAIL_BYTES
  )) {
    return { ok: false, error: 'email_too_long' };
  }

  const labSlug = input.labSlug;
  if (labSlug !== undefined && (
    typeof labSlug !== 'string'
    || utf8ByteLength(labSlug) > MAX_LAB_SLUG_BYTES
    || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(labSlug)
  )) {
    return { ok: false, error: 'labSlug_invalid' };
  }

  const pageUrl = input.pageUrl;
  if (pageUrl !== undefined && (
    typeof pageUrl !== 'string' || utf8ByteLength(pageUrl) > MAX_PAGE_URL_BYTES
  )) {
    return { ok: false, error: 'pageUrl_invalid' };
  }

  const website = input.website;
  if (website !== undefined && (
    typeof website !== 'string' || utf8ByteLength(website) > MAX_HONEYPOT_BYTES
  )) {
    return { ok: false, error: 'website_invalid' };
  }

  const diagnostics = validateJsonField(input.diagnostics, MAX_DIAGNOSTICS_BYTES);
  if (input.diagnostics !== undefined && diagnostics === null) {
    return { ok: false, error: 'diagnostics_too_large' };
  }

  const labState = validateJsonField(input.labState, MAX_LAB_STATE_BYTES);
  if (input.labState !== undefined && labState === null) {
    return { ok: false, error: 'lab_state_too_large' };
  }

  return {
    ok: true,
    value: {
      reportType,
      reportCategory: reportCategory as ReportCategory,
      description: description.trim(),
      ...(email !== undefined ? { email: email.trim() } : {}),
      ...(labSlug !== undefined ? { labSlug } : {}),
      ...(pageUrl !== undefined ? { pageUrl } : {}),
      ...(input.diagnostics !== undefined ? { diagnostics: input.diagnostics as JsonValue } : {}),
      ...(input.labState !== undefined ? { labState: input.labState as JsonValue } : {}),
      ...(website !== undefined ? { website } : {}),
    },
  };
}
