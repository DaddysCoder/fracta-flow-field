import type { Env } from '../types';

const STRIPE_API = 'https://api.stripe.com/v1';

async function stripeRequest<T>(env: Env, path: string, params: Record<string, string>): Promise<T> {
  const res = await fetch(`${STRIPE_API}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': '2024-06-20',
    },
    body: new URLSearchParams(params).toString(),
  });
  const body = (await res.json()) as T & { error?: { message: string } };
  if (!res.ok) {
    throw new Error(`Stripe ${path} failed: ${(body as { error?: { message: string } }).error?.message ?? res.status}`);
  }
  return body;
}

async function stripeGet<T>(env: Env, path: string, query: Record<string, string> = {}): Promise<T> {
  const qs = new URLSearchParams(query).toString();
  const res = await fetch(`${STRIPE_API}${path}${qs ? `?${qs}` : ''}`, {
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'Stripe-Version': '2024-06-20' },
  });
  const body = (await res.json()) as T & { error?: { message: string } };
  if (!res.ok) {
    throw new Error(`Stripe ${path} failed: ${(body as { error?: { message: string } }).error?.message ?? res.status}`);
  }
  return body;
}

export interface StripeCustomer {
  id: string;
  email: string | null;
}

/** Finds an existing customer by email, or creates one. Email is the only identity we key on. */
export async function findOrCreateCustomer(env: Env, email: string): Promise<StripeCustomer> {
  const existing = await stripeGet<{ data: StripeCustomer[] }>(env, '/customers', { email, limit: '1' });
  if (existing.data[0]) return existing.data[0];
  return stripeRequest<StripeCustomer>(env, '/customers', { email });
}

export async function createCheckoutSession(
  env: Env,
  customerId: string,
  priceId: string,
): Promise<{ url: string }> {
  return stripeRequest<{ url: string }>(env, '/checkout/sessions', {
    customer: customerId,
    mode: 'subscription',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    'subscription_data[trial_period_days]': '14',
    success_url: `${env.APP_ORIGIN}/?checkout=success`,
    cancel_url: `${env.APP_ORIGIN}/?checkout=cancelled`,
  });
}

export async function createBillingPortalSession(env: Env, customerId: string): Promise<{ url: string }> {
  return stripeRequest<{ url: string }>(env, '/billing_portal/sessions', {
    customer: customerId,
    return_url: env.APP_ORIGIN,
  });
}

/**
 * Verifies Stripe's webhook signature scheme: header is `t=<ts>,v1=<hex-hmac>`,
 * signed payload is `${ts}.${rawBody}`. See https://docs.stripe.com/webhooks#verify-manually
 */
export async function verifyStripeWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  toleranceSeconds = 300,
): Promise<boolean> {
  if (!signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((part) => {
      const [key, value] = part.split('=');
      return [key, value];
    }),
  );
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (Number.isNaN(age) || age > toleranceSeconds) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const expectedBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${rawBody}`));
  const expectedHex = Array.from(new Uint8Array(expectedBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  if (expectedHex.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expectedHex.length; i++) diff |= expectedHex.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}
