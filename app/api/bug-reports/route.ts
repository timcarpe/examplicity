import { createHmac, randomUUID } from 'node:crypto';
import { neon } from '@neondatabase/serverless';

import {
  MAX_REQUEST_BYTES,
  truncateUtf8,
  validateBugReportPayload,
} from '../../bug-report-contract.ts';
import type { BugReportPayload } from '../../bug-report-contract.ts';

type DatabaseClient = ReturnType<typeof neon>;

let databaseClient: DatabaseClient | undefined;

function getDatabaseClient(): DatabaseClient {
  if (databaseClient) return databaseClient;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not configured');

  databaseClient = neon(connectionString);
  return databaseClient;
}

class RequestTooLargeError extends Error {}
class InvalidBodyLengthError extends Error {}

function response(body: { error: string }, status: number) {
  return Response.json(body, { status });
}

function createdResponse(reportId: string) {
  return Response.json({ reportId }, { status: 201 });
}

function requestProtocol(request: Request): string | null {
  const forwardedProtocol = request.headers.get('x-forwarded-proto')
    ?.split(',')[0]
    ?.trim()
    .toLowerCase();
  if (forwardedProtocol === 'http' || forwardedProtocol === 'https') {
    return `${forwardedProtocol}:`;
  }

  try {
    return new URL(request.url).protocol;
  } catch {
    return null;
  }
}

function isSameOrigin(request: Request): boolean {
  const host = request.headers.get('host')?.trim().toLowerCase();
  if (!host || host.includes(',') || /\s/.test(host)) return false;

  const fetchSite = request.headers.get('sec-fetch-site')?.trim().toLowerCase();
  if (fetchSite && fetchSite !== 'same-origin') return false;

  const expectedProtocol = requestProtocol(request);
  if (expectedProtocol !== 'http:' && expectedProtocol !== 'https:') return false;

  const originHeader = request.headers.get('origin')?.trim();
  if (originHeader) {
    if (originHeader === 'null') return false;
    try {
      const origin = new URL(originHeader);
      return origin.protocol === expectedProtocol
        && origin.host.toLowerCase() === host
        && origin.pathname === '/'
        && origin.search === ''
        && origin.hash === ''
        && origin.username === ''
        && origin.password === '';
    } catch {
      return false;
    }
  }

  // Some same-origin clients omit Origin. Referer is an equivalent fallback,
  // while a request with neither header is rejected conservatively.
  const refererHeader = request.headers.get('referer')?.trim();
  if (!refererHeader) return false;
  try {
    const referer = new URL(refererHeader);
    return referer.protocol === expectedProtocol && referer.host.toLowerCase() === host;
  } catch {
    return false;
  }
}

async function readRequestBody(request: Request): Promise<string> {
  const contentLengthHeader = request.headers.get('content-length');
  if (contentLengthHeader !== null) {
    const contentLengthText = contentLengthHeader.trim();
    const contentLength = Number(contentLengthText);
    if (!/^\d+$/.test(contentLengthText) || !Number.isSafeInteger(contentLength)) {
      throw new InvalidBodyLengthError();
    }
    if (contentLength > MAX_REQUEST_BYTES) throw new RequestTooLargeError();
  }

  if (!request.body) return '';

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      totalBytes += chunk.value.byteLength;
      if (totalBytes > MAX_REQUEST_BYTES) throw new RequestTooLargeError();
      chunks.push(chunk.value);
    }
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    throw error;
  } finally {
    reader.releaseLock();
  }

  const bodyBytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bodyBytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bodyBytes);
}

function hasFilledHoneypot(input: unknown): boolean {
  return typeof input === 'object'
    && input !== null
    && !Array.isArray(input)
    && 'website' in input
    && typeof input.website === 'string'
    && input.website.trim().length > 0;
}

function hasValidPageUrl(request: Request, pageUrl: string | undefined): boolean {
  if (pageUrl === undefined) return true;

  const sourceUrl = request.headers.get('origin') ?? request.headers.get('referer');
  if (!sourceUrl) return false;
  try {
    const source = new URL(sourceUrl);
    const page = new URL(pageUrl);
    return page.origin === source.origin && page.username === '' && page.password === '';
  } catch {
    return false;
  }
}

function serializedField(value: BugReportPayload[keyof BugReportPayload] | undefined): string | null {
  if (value === undefined) return null;
  return JSON.stringify(value) ?? null;
}

export function clientIp(request: Request, isVercel = process.env.VERCEL === '1'): string {
  const forwarded = isVercel
    ? request.headers.get('x-vercel-forwarded-for')
    : request.headers.get('x-vercel-forwarded-for') ?? request.headers.get('x-forwarded-for');
  const candidate = forwarded?.split(',')[0]?.trim();
  if (!candidate || candidate.length > 64 || !/^[0-9a-f:.]+$/i.test(candidate)) {
    return 'unknown';
  }
  return candidate.toLowerCase();
}

export function ipFingerprint(ip: string, salt: string): string {
  return createHmac('sha256', salt).update(`bug-report:v1\0${ip}`).digest('hex');
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return response({ error: 'Invalid request.' }, 403);
  }

  const contentType = request.headers.get('content-type')
    ?.split(';')[0]
    .trim()
    .toLowerCase();
  if (contentType !== 'application/json') {
    return response({ error: 'Invalid request.' }, 415);
  }

  let bodyText: string;
  try {
    bodyText = await readRequestBody(request);
  } catch (error) {
    if (error instanceof RequestTooLargeError) {
      return response({ error: 'Request too large.' }, 413);
    }
    return response({ error: 'Invalid request.' }, 400);
  }

  let input: unknown;
  try {
    input = JSON.parse(bodyText);
  } catch {
    return response({ error: 'Invalid request.' }, 400);
  }

  // Return the same success shape for automated submissions, but do not store
  // their contents or disclose that the honeypot was detected.
  if (hasFilledHoneypot(input)) return createdResponse(randomUUID());

  const validation = validateBugReportPayload(input);
  if (!validation.ok) return response({ error: 'Invalid report.' }, 400);

  const payload = validation.value;
  if (!hasValidPageUrl(request, payload.pageUrl)) {
    return response({ error: 'Invalid report.' }, 400);
  }
  const reportId = randomUUID();

  try {
    const salt = process.env.BUG_REPORT_IP_SALT;
    if (!salt) throw new Error('BUG_REPORT_IP_SALT is not configured');
    const ip = clientIp(request);
    if (process.env.VERCEL === '1' && ip === 'unknown') {
      throw new Error('Client IP is unavailable');
    }
    const fingerprint = ipFingerprint(ip, salt);
    const rows = await getDatabaseClient()`
      WITH claimed AS (
        INSERT INTO bug_report_rate_limits (ip_hash, last_submitted_at)
        VALUES (${fingerprint}, now())
        ON CONFLICT (ip_hash) DO UPDATE
          SET last_submitted_at = EXCLUDED.last_submitted_at
          WHERE bug_report_rate_limits.last_submitted_at <= now() - interval '24 hours'
        RETURNING 1
      )
      INSERT INTO bug_reports (
        id, description, contact_email, lab_slug, page_url, deployment_sha,
        user_agent, diagnostics, lab_state
      )
      SELECT
        ${reportId},
        ${payload.description},
        ${payload.email ?? null},
        ${payload.labSlug ?? null},
        ${payload.pageUrl ?? null},
        ${process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA
          ? truncateUtf8(process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || '', 128)
          : null},
        ${request.headers.get('user-agent')
          ? truncateUtf8(request.headers.get('user-agent') || '', 1024)
          : null},
        ${serializedField(payload.diagnostics)}::jsonb,
        ${serializedField(payload.labState)}::jsonb
      FROM claimed
      RETURNING id
    `;
    const insertedId = (rows as unknown as Array<{ id?: unknown }>)[0]?.id;
    if (typeof insertedId !== 'string') {
      return Response.json(
        { error: 'You can submit one bug report every 24 hours.' },
        { status: 429, headers: { 'Retry-After': '86400' } },
      );
    }
    return createdResponse(insertedId);
  } catch {
    return response({ error: 'Unable to submit report.' }, 500);
  }
}
