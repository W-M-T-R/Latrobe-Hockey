import crypto from 'node:crypto';
import type { AstroCookies } from 'astro';

const COOKIE_NAME = 'glhc_admin';
const SESSION_TTL_HOURS = 12;

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || 'dev-secret-change-me';
  return s;
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function makeToken(): string {
  const exp = Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000;
  const payload = `${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = sign(payload);
  if (sig !== expected) return false;
  const exp = parseInt(payload, 10);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  return true;
}

export function setSession(cookies: AstroCookies): void {
  cookies.set(COOKIE_NAME, makeToken(), {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TTL_HOURS * 60 * 60,
  });
}

export function clearSession(cookies: AstroCookies): void {
  cookies.delete(COOKIE_NAME, { path: '/' });
}

export function isAuthed(cookies: AstroCookies): boolean {
  return verifyToken(cookies.get(COOKIE_NAME)?.value);
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || 'wildcats';
  if (input.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(input), Buffer.from(expected));
}

export const COOKIE = COOKIE_NAME;
