import type { Env } from '../types';

const OTP_TTL_SECONDS = 10 * 60;
const OTP_MAX_ATTEMPTS = 5;
const RATE_LIMIT_SECONDS = 60;

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

function otpKey(email: string): string {
  return `otp:${normaliseEmail(email)}`;
}

function rateLimitKey(email: string): string {
  return `otp-rate:${normaliseEmail(email)}`;
}

export function generateCode(): string {
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  return String(bytes[0] % 1_000_000).padStart(6, '0');
}

/** Returns false if a code was requested for this email in the last minute. */
export async function checkAndSetRateLimit(env: Env, email: string): Promise<boolean> {
  const key = rateLimitKey(email);
  const existing = await env.FIELD_KV.get(key);
  if (existing) return false;
  await env.FIELD_KV.put(key, '1', { expirationTtl: RATE_LIMIT_SECONDS });
  return true;
}

export async function storeCode(env: Env, email: string, code: string): Promise<void> {
  await env.FIELD_KV.put(otpKey(email), JSON.stringify({ code, attempts: 0 }), {
    expirationTtl: OTP_TTL_SECONDS,
  });
}

export async function verifyCode(env: Env, email: string, submitted: string): Promise<boolean> {
  const key = otpKey(email);
  const raw = await env.FIELD_KV.get(key);
  if (!raw) return false;

  const record = JSON.parse(raw) as { code: string; attempts: number };
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    await env.FIELD_KV.delete(key);
    return false;
  }

  if (record.code !== submitted.trim()) {
    record.attempts += 1;
    await env.FIELD_KV.put(key, JSON.stringify(record), { expirationTtl: OTP_TTL_SECONDS });
    return false;
  }

  await env.FIELD_KV.delete(key);
  return true;
}
