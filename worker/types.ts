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

  /**
   * "Connect Frame" / "Connect Vector" OAuth scaffold — all optional. Unset
   * until each product's real OAuth app exists; `getProviderConfig` in
   * `worker/lib/suite-connect.ts` treats a provider as unconfigured until
   * every one of its four fields below is set. `_CLIENT_ID`/`_AUTHORIZE_URL`/
   * `_TOKEN_URL`/`_SCOPE` are non-secret (wrangler.jsonc `vars`); `_CLIENT_SECRET`
   * is a secret (`wrangler secret put`).
   */
  FRAME_OAUTH_CLIENT_ID?: string;
  FRAME_OAUTH_CLIENT_SECRET?: string;
  FRAME_OAUTH_AUTHORIZE_URL?: string;
  FRAME_OAUTH_TOKEN_URL?: string;
  FRAME_OAUTH_SCOPE?: string;
  VECTOR_OAUTH_CLIENT_ID?: string;
  VECTOR_OAUTH_CLIENT_SECRET?: string;
  VECTOR_OAUTH_AUTHORIZE_URL?: string;
  VECTOR_OAUTH_TOKEN_URL?: string;
  VECTOR_OAUTH_SCOPE?: string;
}

export type PlanTier = 'free' | 'pro';

export interface Entitlement {
  plan: PlanTier;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'none';
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
}
