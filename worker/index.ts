import type { Entitlement, Env, PlanTier } from './types';
import { checkAndSetRateLimit, generateCode, storeCode, verifyCode } from './lib/otp';
import { sendLoginCodeEmail } from './lib/resend';
import { bearerToken, createSessionToken, verifySessionToken } from './lib/session';
import {
  createBillingPortalSession,
  createCheckoutSession,
  findOrCreateCustomer,
  verifyStripeWebhookSignature,
} from './lib/stripe';
import { findEmailByCustomerId, getEntitlement, getStoredCustomerId, setEntitlement, storeCustomerId } from './lib/entitlement';

function json(data: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function requireEmail(request: Request, env: Env): Promise<string | null> {
  const token = bearerToken(request);
  if (!token) return null;
  return verifySessionToken(token, env.SESSION_SECRET);
}

async function handleRequestCode(request: Request, env: Env): Promise<Response> {
  const { email } = (await request.json()) as { email?: string };
  if (!email || !EMAIL_RE.test(email)) return json({ error: 'Enter a valid email address.' }, { status: 400 });

  const allowed = await checkAndSetRateLimit(env, email);
  if (!allowed) return json({ error: 'A code was already sent. Check your email, or wait a minute to resend.' }, { status: 429 });

  const code = generateCode();
  await storeCode(env, email, code);
  await sendLoginCodeEmail(env, email, code);
  return json({ ok: true });
}

async function handleVerifyCode(request: Request, env: Env): Promise<Response> {
  const { email, code } = (await request.json()) as { email?: string; code?: string };
  if (!email || !code) return json({ error: 'Email and code are required.' }, { status: 400 });

  const valid = await verifyCode(env, email, code);
  if (!valid) return json({ error: 'That code is incorrect or has expired.' }, { status: 401 });

  const token = await createSessionToken(email, env.SESSION_SECRET);
  return json({ token, email });
}

async function handleEntitlement(request: Request, env: Env): Promise<Response> {
  const email = await requireEmail(request, env);
  if (!email) return json({ error: 'Sign in required.' }, { status: 401 });

  const entitlement = await getEntitlement(env, email);
  return json({ email, ...entitlement });
}

async function handleCheckout(request: Request, env: Env): Promise<Response> {
  const email = await requireEmail(request, env);
  if (!email) return json({ error: 'Sign in required.' }, { status: 401 });

  const { interval } = (await request.json()) as { interval?: 'month' | 'year' };
  const priceId = interval === 'year' ? env.STRIPE_PRICE_YEARLY : env.STRIPE_PRICE_MONTHLY;

  const customer = await findOrCreateCustomer(env, email);
  await storeCustomerId(env, email, customer.id);

  const session = await createCheckoutSession(env, customer.id, priceId);
  return json({ url: session.url });
}

async function handleBillingPortal(request: Request, env: Env): Promise<Response> {
  const email = await requireEmail(request, env);
  if (!email) return json({ error: 'Sign in required.' }, { status: 401 });

  const customerId = await getStoredCustomerId(env, email);
  if (!customerId) return json({ error: 'No billing account yet — start a Pro trial first.' }, { status: 404 });

  const session = await createBillingPortalSession(env, customerId);
  return json({ url: session.url });
}

interface StripeSubscription {
  id: string;
  customer: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid';
  current_period_end: number;
}

interface StripeEvent {
  type: string;
  data: { object: { customer?: string; id?: string } & Partial<StripeSubscription> };
}

const ACTIVE_STATUSES = new Set(['active', 'trialing']);

async function handleStripeWebhook(request: Request, env: Env): Promise<Response> {
  const rawBody = await request.text();
  const valid = await verifyStripeWebhookSignature(rawBody, request.headers.get('Stripe-Signature'), env.STRIPE_WEBHOOK_SECRET);
  if (!valid) return json({ error: 'Invalid signature.' }, { status: 400 });

  const event = JSON.parse(rawBody) as StripeEvent;

  if (
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.deleted'
  ) {
    const sub = event.data.object as StripeSubscription;
    const email = await findEmailByCustomerId(env, sub.customer);
    if (email) {
      const plan: PlanTier = ACTIVE_STATUSES.has(sub.status) ? 'pro' : 'free';
      const entitlement: Entitlement = {
        plan,
        status: sub.status === 'incomplete' || sub.status === 'incomplete_expired' || sub.status === 'unpaid' ? 'past_due' : (sub.status as Entitlement['status']),
        currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
        stripeCustomerId: sub.customer,
      };
      await setEntitlement(env, email, entitlement);
    }
  }

  return json({ received: true });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
      try {
        if (request.method === 'POST' && url.pathname === '/api/auth/request-code') return await handleRequestCode(request, env);
        if (request.method === 'POST' && url.pathname === '/api/auth/verify-code') return await handleVerifyCode(request, env);
        if (request.method === 'GET' && url.pathname === '/api/entitlement') return await handleEntitlement(request, env);
        if (request.method === 'POST' && url.pathname === '/api/checkout') return await handleCheckout(request, env);
        if (request.method === 'POST' && url.pathname === '/api/billing-portal') return await handleBillingPortal(request, env);
        if (request.method === 'POST' && url.pathname === '/api/webhook/stripe') return await handleStripeWebhook(request, env);
      } catch (err) {
        console.error(err);
        return json({ error: 'Something went wrong. Try again shortly.' }, { status: 500 });
      }
      return json({ error: 'Not found.' }, { status: 404 });
    }

    return env.ASSETS.fetch(request);
  },
};
