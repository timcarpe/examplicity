import { createHmac } from 'node:crypto';

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
