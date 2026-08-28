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

React 18 + TypeScript + Vite + Tailwind CSS + react-router. No backend, no API
key, no network call — personalisation is local, deterministic template
matching, and participant profile/drafts are stored in `localStorage` so the
full flow can be reviewed and demoed with nothing but `npm run dev`.

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
  the superseded band, strategy cards.

## Running

```sh
npm install
npm run dev
```

No environment variables or secrets are required — everything runs client-side.

A "Plan: Free/Pro (toggle)" control in the bottom-right corner switches the
paywall gate for demo purposes — clicking Match variant as Free triggers the
Upgrade Moment; as Pro it runs the real local matching. A DEV-only "Simulate"
control on the Personalisation Flow screen (hidden in production builds) forces
each of the three outcomes for review without needing real variant content.

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
