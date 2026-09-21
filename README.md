# Field by WhatBit

Field is a decision-support tool for behaviour-support practitioners: a browsable,
evidence-tiered library of behaviour strategies, with an optional personalisation
step that matches pre-authored delivery wording to a specific participant. There
is no model call in this flow — every word a practitioner reads was written by a
person ahead of time. Every match sits next to a permanent, unlocked mechanism +
citation.

This app implements the seven screens from the `design_handoff_field` /
`design_handoff_field_app` design packages pixel-for-pixel where feasible,
using the design tokens (color, type, spacing, motion) documented there —
including the fixed 236px left sidebar (grouped LIBRARY / PARTICIPANT /
ACCOUNT nav + account chip) and top search bar from the later
`design_handoff_field_app` handoff. Screens reachable only with a strategy
id (Strategy detail, Personalise draft, Output view) aren't top-level
sidebar destinations, unlike the flat nav list in that handoff's prototype —
they're reached from strategy cards and the in-page links between screens,
same as before.

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
- `src/components` — shared UI: `Sidebar` (the fixed 236px nav + account chip)
  and `TopBar` (screen title + the "Search strategies..." box — only the
  Strategy Browser reads it, via `useSearch()`), the mechanism + citation
  unit, evidence badges, the superseded band, strategy cards, `AuthModal`
  (email + one-time code), `SuiteConnectRow` (the paywall's "Connect Frame" /
  "Connect Vector" buttons).
- `src/state/auth.tsx` — `useAuth()`: sign-in state, the Pro/Free `plan` (from
  the Worker's `/api/entitlement`, not a local flag), `checkout()` /
  `manageBilling()` (redirect to Stripe Checkout / Billing Portal).
- `worker/` — the Cloudflare Worker: email one-time-code auth (signed,
  stateless session tokens — no session store), Stripe Checkout/Billing Portal
  session creation, the Stripe webhook that keeps entitlement state in KV, and
  the Frame/Vector "connect" OAuth scaffold (`worker/lib/suite-connect.ts` —
  see "Connecting Frame/Vector" below). See `worker/index.ts` for the route
  list.

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

## Connecting Frame/Vector

The paywall's "Connect Frame" / "Connect Vector" buttons (`SuiteConnectRow`)
call a real OAuth-redirect scaffold, not a placeholder — `POST
/api/connect/:provider/start` (`worker/index.ts`) builds the authorize URL,
a signed state token binds the flow to the signed-in email
(`worker/lib/suite-connect.ts`), and `GET /api/connect/:provider/callback`
exchanges the code and stores the connection in KV. What's missing is each
product's actual OAuth app — set `FRAME_OAUTH_CLIENT_ID` /
`_AUTHORIZE_URL` / `_TOKEN_URL` / `_SCOPE` (non-secret, `wrangler.jsonc`
`vars`) and `FRAME_OAUTH_CLIENT_SECRET` (`wrangler secret put`), same for
`VECTOR_OAUTH_*`, once Frame/Vector have one to point at. Until then,
`getProviderConfig()` treats the provider as unconfigured and `/start`
returns a 501 the button surfaces inline rather than pretending to connect.

## Not in this pass

- **Variant content is the real gap right now, not the matching logic.**
  Every strategy in `strategies.ts` ships exactly two placeholder
  `personalisationRecords` — enough for `matchPersonalisedVariant()` to have
  something real to score, not real coverage. The scoring/abstain/tie-break
  logic in `src/ai/personalise.ts` doesn't need rework; it needs more
  variants to work with (more comfort-threshold and communication-method
  combinations per strategy) and more literature, particularly for the
  thinner Sensory and Access-to-tangibles strategies — both currently
  Practice-based/Emerging tier with a single source each. This is a
  content-authoring task, not a coding one.
- **Optional "smart match" worker.** If a strategy ends up with many
  overlapping variants and local scoring can't confidently pick one, a
  Cloudflare Worker using Anthropic strictly as a *classifier* (forced
  `tool_choice` over an enum of the candidate variant IDs — it can only pick
  one of the IDs given, never write new text) is worth adding. Not built
  because local scoring hasn't shown a need for it yet.
- Wiring `suite-detection.ts` to the real Frame cross-tool-read mechanism,
  and giving the Frame/Vector connect scaffold above real OAuth apps to
  point at, and (only if the optional worker above is ever built) the
  Anthropic enterprise API migration for moderation tuning. None of these
  touch the mechanism-lock or citation-pairing rules encoded here — those
  are intentional constraints, not gaps.
