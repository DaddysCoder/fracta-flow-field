# Handoff: Field by WhatBit — Behaviour Strategy Decision Support

## Overview
Field is a decision-support tool for behaviour-support practitioners: a browsable, evidence-tiered library of behaviour strategies, with an optional AI-personalisation step that drafts wording for a specific participant. AI is scoped and reviewable, never final — every generated draft sits next to a permanent, unlocked mechanism + citation.

## About the Design Files
The bundled HTML files are **design references** built as interactive prototypes — not production code to copy directly. Recreate these designs in the target codebase's existing environment (React, Vue, etc.) using its established patterns and component library. If no environment exists yet, React is a good default given the componentized structure of these screens.

## Fidelity
**High-fidelity.** Colors, type, spacing, and the one signature motion moment (AI-generate reveal) are final and should be recreated pixel-for-pixel where feasible.

## Design Tokens
- **Color**: base `#FAFAF9`, secondary surface tint `#F5F4F1`, ink `#18181B`, secondary text `#6B6B70`, tertiary/placeholder text `#A3A19C`, border `#E7E5E2`, accent (deep clinical green) `#1B6E5C`, accent hover `#154F41`, accent-tint border `#D9EAE4`, superseded/dark band `#18181B` with success green `#5FD9AE` for the updated figure.
- **Accent usage rule**: `#1B6E5C` appears ONLY on the AI-generate action, the mechanism/citation unit, and active/focus states — never as general decoration. This is deliberate: the accent visually marks "the AI-touched part" of the product.
- **Type**: Instrument Sans (500/600/700) for all UI and headings; IBM Plex Mono (400/500/600) reserved for evidence-adjacent content — evidence-tier labels, citations, confidence/percentage figures. The mono face is the product's "precision" signal; don't apply it elsewhere.
- **Type scale**: headline `clamp(26px,3.4vw,34px)/700`, section eyebrow `11.5px mono/500` uppercase tracked `0.1em`, body `15–17px/1.6–1.75`, secondary `13.5px`, micro/mono labels `10–11.5px`.
- **Radius**: 12–16px on cards, 7–9px on buttons/pills, full pill (20px+) on evidence-tier tags.
- **Shadow (layered depth)**: raw evidence rows — `0 1px 2px rgba(24,24,27,.04), 0 6px 16px rgba(24,24,27,.05)`; AI draft panel — same shadow on a tinted `#F5F4F1` surface; mechanism/citation unit (the "permanent source" layer) — `1.5px solid #1B6E5C` border + `0 4px 14px rgba(27,110,92,.08)`, always visually on top of the other two.
- **Spacing**: base unit 4px; common paddings 16/20/22/24/28px; section vertical rhythm 90–120px on desktop, 28px on mobile.

## Signature element: the mechanism + citation unit
Appears on every screen that shows a strategy or a generated draft: strategy detail, personalisation review, output view, and the paywall (shown "unlocked" even for Free users). Always a distinct card with a full `1.5px` accent border (not a left-border accent — deliberately avoided as a cliché) and its own soft accent-tinted shadow, positioned so it visually sits in front of/above the draft or evidence content beside it. This is the one component practitioners should learn to recognize at a glance as "the evidence backing this."

## Motion
One deliberate moment: clicking "Generate draft" in the Personalisation Flow screen reveals the draft textarea (fade + 8px slide-up, 220ms, `cubic-bezier(0.34,1.56,0.64,1)` for a slight overshoot) **next to**, never replacing, the static mechanism/citation unit. All other interactive states (hover/focus/tab changes) are fast and undecorated — target ~100ms linear/ease, no overshoot. Respect `prefers-reduced-motion: reduce` by collapsing the reveal duration to near-instant (see the `reducedMotion` check in the component — implemented via `matchMedia('(prefers-reduced-motion: reduce)')` on mount).

## Accessibility floor
- All interactive elements (links, buttons, chips, tabs) need a visible focus ring in the accent color, `2px solid #1B6E5C` with 2–3px offset — implemented via `:focus-visible` in the prototype.
- Full keyboard navigation: chips/tabs are focusable (`tabindex="0"`) and should be operable via Enter/Space in the real implementation, not just click.
- Mobile layout is a genuinely separate flow (see `Field by WhatBit - Mobile.dc.html`), not a squeezed desktop grid — two-column layouts (draft + mechanism/citation) stack vertically with the mechanism/citation unit always following its related content.

## Screens
1. **Strategy Browser** — Function-category filter (multi-select, dark pill = selected) is fully separate from the "Responsive strategies" tab — never combine them. Evidence-tier filter is a secondary pill row (Strong/Emerging/Practice-based). A "superseded" entry gets a full-width dark band above it showing both the previous and updated figures side by side — the old figure must never appear without the new one.
2. **Strategy Detail** — Mechanism and citation are rendered in the main flow, always expanded, never in an accordion/collapsible.
3. **Personalisation Flow** — 3 steps: capacity note (free text, already filled) → AI-generate (or "AI unavailable" state when profile data is missing, styled calmly, not as an error) → review (always-editable textarea, draft label, Save/Regenerate) with the mechanism/citation unit pinned alongside.
4. **Output View** — Plan-format / session-log-format toggle (segmented control) over the same draft text; mechanism/citation stays pinned regardless of toggle state.
5. **Intake vs. Profile** — Same fields, two framings: standalone is an editable form the practitioner fills in; suite-connected is read-only with a visible "Pulled from Frame · synced [time]" marker and accent-tinted border to signal it's sourced data, not manual entry.
6. **Upgrade Moment** — Triggered at the exact point a Free user clicks Generate. Mechanism/citation stay fully visible/"unlocked" (evidence is never gated) while the draft area shows a skeleton/locked state with the Pro pitch and trial CTA inline — not a generic modal.
7. **Error States** — Three distinct copy sets: content-policy refusal (explicitly reassures the user it isn't a bug and nothing was sent elsewhere), network/connection issue (retry, data preserved), and backend service issue (retry, manual-entry fallback offered). Never conflate these three.

## State Management (for implementation)
- `revealed: boolean` — whether the AI draft has been generated in the Personalisation Flow; drives the reveal animation and swaps "Generate draft" → "Regenerate draft".
- `reducedMotion: boolean` — read once from `matchMedia` on mount; shortens the reveal transition duration.
- Real implementation will also need: selected function categories (multi-select set), active evidence-tier filter, active tab (function vs. responsive), plan-format vs. session-log toggle state, and Free/Pro plan flag gating the Generate action.

## Files
- `Field by WhatBit.dc.html` — desktop, all 7 screens
- `Field by WhatBit - Mobile.dc.html` — mobile (390px reference width), all 7 screens restacked to single-column
