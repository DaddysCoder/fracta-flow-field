export interface Env {
  ASSETS: Fetcher;
  FIELD_KV: KVNamespace;

  /** Non-secret, set in wrangler.jsonc "vars". */
  STRIPE_PRICE_MONTHLY: string;
  STRIPE_PRICE_YEARLY: string;
  FROM_EMAIL: string;
  APP_ORIGIN: string;

  /** Secrets, set via `wrangler secret put <NAME>`. Never committed. */
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  RESEND_API_KEY: string;
  SESSION_SECRET: string;
}

export type PlanTier = 'free' | 'pro';

export interface Entitlement {
  plan: PlanTier;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'none';
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
}
