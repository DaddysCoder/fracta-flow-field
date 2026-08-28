import type { Entitlement, Env } from '../types';

function entitlementKey(email: string): string {
  return `entitlement:${email.trim().toLowerCase()}`;
}

function customerKey(email: string): string {
  return `customer:${email.trim().toLowerCase()}`;
}

export async function getEntitlement(env: Env, email: string): Promise<Entitlement> {
  const raw = await env.FIELD_KV.get(entitlementKey(email));
  if (!raw) return { plan: 'free', status: 'none', currentPeriodEnd: null, stripeCustomerId: null };
  return JSON.parse(raw) as Entitlement;
}

export async function setEntitlement(env: Env, email: string, entitlement: Entitlement): Promise<void> {
  await env.FIELD_KV.put(entitlementKey(email), JSON.stringify(entitlement));
}

export async function getStoredCustomerId(env: Env, email: string): Promise<string | null> {
  return env.FIELD_KV.get(customerKey(email));
}

/** Stores the email <-> Stripe customer ID link both ways (webhook events only carry the customer ID). */
export async function storeCustomerId(env: Env, email: string, customerId: string): Promise<void> {
  await Promise.all([
    env.FIELD_KV.put(customerKey(email), customerId),
    env.FIELD_KV.put(`customer-owner:${customerId}`, email.trim().toLowerCase()),
  ]);
}

export async function findEmailByCustomerId(env: Env, customerId: string): Promise<string | null> {
  return env.FIELD_KV.get(`customer-owner:${customerId}`);
}
