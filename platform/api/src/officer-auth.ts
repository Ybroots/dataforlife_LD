import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export interface OfficerCredential {
  username: string;
  password: string;
  actorId: string;
}

interface OfficerSessionPayload {
  actorId: string;
  expiresAt: number;
  nonce: string;
}

const SESSION_COOKIE = 'cskv_officer_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60;

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function sign(encodedPayload: string, secret: string): string {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

export function authenticateOfficer(
  credentials: readonly OfficerCredential[],
  username: string,
  password: string,
): OfficerCredential | null {
  const normalizedUsername = username.trim().toLocaleLowerCase('vi-VN');
  const credential = credentials.find((candidate) => candidate.username.toLocaleLowerCase('vi-VN') === normalizedUsername);
  if (!credential || !safeEqual(password, credential.password)) return null;
  return credential;
}

export function createOfficerSession(actorId: string, secret: string, now = Date.now()): string {
  const payload: OfficerSessionPayload = {
    actorId,
    expiresAt: now + SESSION_TTL_SECONDS * 1_000,
    nonce: randomBytes(16).toString('base64url'),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encodedPayload}.${sign(encodedPayload, secret)}`;
}

export function verifyOfficerSession(token: string | undefined, secret: string, now = Date.now()): string | null {
  if (!token) return null;
  const [encodedPayload, signature, extra] = token.split('.');
  if (!encodedPayload || !signature || extra || !safeEqual(signature, sign(encodedPayload, secret))) return null;
  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as Partial<OfficerSessionPayload>;
    if (
      typeof payload.actorId !== 'string'
      || !/^[a-zA-Z0-9][a-zA-Z0-9._-]{2,79}$/.test(payload.actorId)
      || typeof payload.expiresAt !== 'number'
      || payload.expiresAt <= now
      || typeof payload.nonce !== 'string'
    ) return null;
    return payload.actorId;
  } catch {
    return null;
  }
}

export function readOfficerSessionCookie(cookieHeader: string | undefined): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(';')) {
    const [rawName, ...rawValue] = part.trim().split('=');
    if (rawName === SESSION_COOKIE) return decodeURIComponent(rawValue.join('='));
  }
  return undefined;
}

export function officerSessionCookie(token: string, secure: boolean): string {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure ? '; Secure' : ''}`;
}

export function clearOfficerSessionCookie(secure: boolean): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`;
}
