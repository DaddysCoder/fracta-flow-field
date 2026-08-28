# Field by WhatBit

Field is a decision-support tool for behaviour-support practitioners: a browsable,
evidence-tiered library of behaviour strategies, with an optional personalisation
step that matches pre-authored delivery wording to a specific participant. There
is no model call in this flow — every word a practitioner reads was written by a
person ahead of time. Every match sits next to a permanent, unlocked mechanism +
citation.

This app implements the seven screens from the `design_handoff_field` design
package pixel-for-pixel where feasible, using the design tokens (color, type,
spacing, motion) documented there.

## Stack

React 18 + TypeScript + Vite + Tailwind CSS + react-router, deployed as a
Cloudflare Worker (static assets + a small API). Personalisation itself is
still local, deterministic template matching — no model call, no network
dependency for that part. Participant profile/drafts stay in `localStorage`.
The Worker only handles account/billing: email sign-in and the Stripe Pro
subscription (see "Auth & billing" below).

## Structure

- `src/lib/strategy-library` — strategy types, seed data (evidence tier, function,
  mechanism, citation, "how to use", superseded chain), each strategy's
  `variants: PersonalisedVariant[]` (placeholder content — see the note at the
  top of `strategies.ts`), and `assembleExportText()`.
- `src/lib/participant-profile` — profile types (including `interests` and
  `comfortThreshold`, the fields personalisation matches against), local
  storage, and the suite-connection detection boundary (`suite-detection.ts` —
  a placeholder for wiring into whatever cross-tool-read mechanism Frame's
  "Vector instrument import" already uses).
- `src/ai/personalise.ts` — `matchPersonalisedVariant()` scores a strategy's
  variants against the participant profile (interest overlap, communication
  method match, comfort threshold match) and fills the winning template's
  `{{slots}}`. Throws `PersonaliseError('no-variant-match', ...)` when a
  strategy has no authored variants yet — a real, expected state early on, not
  a bug. `network` / `service` error kinds exist for a possible future
  constrained "smart match" worker (see below) but nothing in this app
  currently produces them outside of dev simulation.
- `src/screens` — the seven design screens: Strategy Browser, Strategy Detail,
  Personalisation Flow (capacity note → match variant → review, with the
  Upgrade Moment and the three error states as sub-states of this screen),
  Output View, and Intake/Profile.
- `src/components` — shared UI: the mechanism + citation unit, evidence badges,
  the superseded band, strategy cards, `AuthModal` (email + one-time code).
- `src/state/auth.tsx` — `useAuth()`: sign-in state, the Pro/Free `plan` (from
  the Worker's `/api/entitlement`, not a local flag), `checkout()` /
  `manageBilling()` (redirect to Stripe Checkout / Billing Portal).
- `worker/` — the Cloudflare Worker: email one-time-code auth (signed,
  stateless session tokens — no session store), Stripe Checkout/Billing Portal
  session creation, and the Stripe webhook that keeps entitlement state in KV.
  See `worker/index.ts` for the route list.

## Running

```sh
npm install
npm run dev          # frontend only, http://localhost:5173
npm run worker:dev    # Worker, http://localhost:8787 — vite proxies /api to it
```

The frontend runs standalone with `npm run dev` — sign-in/checkout calls will
just fail gracefully (they hit `/api/...`, which 404s with no Worker running).
For local auth/billing testing, run `worker:dev` alongside `dev` in a second
terminal, with the secrets below set in `.dev.vars` (gitignored).

A "Dev preview: Force Pro/Free" control in the bottom-right corner (DEV builds
only) previews the Pro-gated UI without a running Worker or a real
subscription — it does not touch real entitlement state. A DEV-only
"Simulate" control on the Personalisation Flow screen still forces each of the
three *matching* outcomes for review, independent of plan.

## Auth & billing setup

Email sign-in issues a 6-digit one-time code via Resend and a signed session
token (HMAC, `SESSION_SECRET`) — no passwords, no session database. Stripe
Checkout/Billing Portal sessions are created server-side; the webhook updates
each email's entitlement record in KV. Participant data never touches this —
it's `localStorage`-only, same as before.

**Non-secret config** — edit directly in `wrangler.jsonc` → `vars`:

- `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY` — the two Price IDs for Field
  Pro (A$29/mo, A$290/yr, both with a 14-day trial baked into the Worker's
  Checkout Session call).
- `FROM_EMAIL` — the Resend-verified sender for login codes.
- `APP_ORIGIN` — the deployed app's URL (used for Checkout/Portal redirects).

**Secrets** — set with `wrangler secret put <NAME>` (prompts for the value,
never echoes or logs it), or via the Cloudflare dashboard once the Worker has
deployed at least once with `main` set (Workers & Pages → fracta-flow-field →
Settings → Variables and Secrets → encrypt):

```sh
wrangler secret put STRIPE_SECRET_KEY       # Stripe secret key
wrangler secret put STRIPE_WEBHOOK_SECRET   # from the Stripe webhook endpoint you create below
wrangler secret put RESEND_API_KEY          # Resend API key
wrangler secret put SESSION_SECRET          # any long random string, e.g. `openssl rand -hex 32`
```

Also register a Stripe webhook endpoint pointing at
`https://<your-worker-domain>/api/webhook/stripe`, subscribed to
`customer.subscription.created`, `customer.subscription.updated`, and
`customer.subscription.deleted` — its signing secret is
`STRIPE_WEBHOOK_SECRET` above.

If a secret is ever pasted somewhere it could be logged (chat, a shared
terminal, a committed file), rotate it in the provider's dashboard before
using it — treat it as already compromised.

## Not in this pass

- **Variant content.** `strategies.ts` ships two placeholder variants per
  strategy so the matching logic has something real to score — the actual
  wording is a content-authoring task, not a coding one.
- **Optional "smart match" worker.** If a strategy ends up with many
  overlapping variants and local scoring can't confidently pick one, a
  Cloudflare Worker using Anthropic strictly as a *classifier* (forced
  `tool_choice` over an enum of the candidate variant IDs — it can only pick
  one of the IDs given, never write new text) is worth adding. Not built
  because local scoring hasn't shown a need for it yet.
- Stripe subscription + customer portal, a lightweight account model gating
  the personalise button, wiring `suite-detection.ts` to the real Frame
  cross-tool-read mechanism, and (only if the optional worker above is ever
  built) the Anthropic enterprise API migration for moderation tuning. None of
  these touch the mechanism-lock or citation-pairing rules encoded here —
  those are intentional constraints, not gaps.
