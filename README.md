# Field by WhatBit

Field is a decision-support tool for behaviour-support practitioners: a browsable,
evidence-tiered library of behaviour strategies, with an optional AI-personalisation
step that drafts wording for a specific participant. AI is scoped and reviewable,
never final — every generated draft sits next to a permanent, unlocked mechanism +
citation.

This app implements the seven screens from the `design_handoff_field` design
package pixel-for-pixel where feasible, using the design tokens (color, type,
spacing, motion) documented there.

## Stack

React 18 + TypeScript + Vite + Tailwind CSS + react-router. No backend is wired up
yet — the AI-personalise call, participant profile, and drafts are all local/mock
so the full flow can be reviewed and demoed without external services.

## Structure

- `src/lib/strategy-library` — strategy types, seed data (evidence tier, function,
  mechanism, citation, "how to use", superseded chain), and `assembleExportText()`.
- `src/lib/participant-profile` — profile types, local storage, and the
  suite-connection detection boundary (`suite-detection.ts` — a placeholder for
  wiring into whatever cross-tool-read mechanism Frame's "Vector instrument
  import" already uses).
- `src/ai/personalise.ts` — client-side stand-in for `POST /api/personalize`.
  Enforces the axis whitelist (only `communicationMethod` and
  `dailyRoutineNotes` ever leave the client) and the three-way error
  classification (content-policy / network / service) — do not simplify these.
- `src/screens` — the seven design screens: Strategy Browser, Strategy Detail,
  Personalisation Flow (capacity note → AI-generate → review, with the
  Upgrade Moment and the three error states as sub-states of this screen),
  Output View, and Intake/Profile.
- `src/components` — shared UI: the mechanism + citation unit, evidence badges,
  the superseded band, strategy cards.

## Running

```sh
npm install
npm run dev
```

A "Plan: Free/Pro (toggle)" control in the bottom-right corner switches the
paywall gate for demo purposes — clicking Generate as Free triggers the
Upgrade Moment; as Pro it calls the mock personalise function. A "Simulate"
dropdown on the Personalisation Flow screen forces each of the three error
states for review.

## Not in this pass

Per the product brief, this pass is UI + local data only. Still to do before a
standalone launch: deploying `/api/personalize` as a Cloudflare Worker, Stripe
subscription + customer portal, a lightweight account model gating the
AI-personalise button, wiring `suite-detection.ts` to the real Frame
cross-tool-read mechanism, and the Anthropic enterprise API migration for the
paid tier. None of those require touching the mechanism-lock, axis-whitelist,
or citation-pairing rules encoded here — those are intentional constraints,
not gaps.
