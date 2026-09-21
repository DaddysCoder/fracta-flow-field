# Handoff: Field — Behaviour Strategy App (Product UI)

## Overview
Field helps behaviour support practitioners browse evidence-based strategies by behaviour function, view mechanism/citation detail, generate a personalised draft for a participant using predictive logic (not AI), and save that wording into a plan or session log. Includes participant profile (standalone vs. suite-connected framing), a Pro upgrade/paywall moment, and honest error states.

## About the Design Files
`Field App.dc.html` is a **design reference built in HTML** — a working prototype of look and behavior, not production code to copy directly. Recreate it in the target codebase's existing environment (React, Vue, etc.) using its own components/patterns. If no frontend exists yet, choose the most suitable modern framework.

## Fidelity
**High-fidelity.** Colors, type, spacing and copy are final. Recreate pixel-accurately. Copy is product-reviewed — preserve wording exactly, including the distinction that drafting uses **predictive logic, not AI** (see Interactions & Behavior).

## Screens / Views
App shell: fixed left sidebar (236px) + top bar (56px) + scrollable content area, switching between 7 screens via client-side state. Map each to a real route on implementation.

### App shell
- **Sidebar**: green dot mark (8px) + "Field" wordmark (bold) + "by WhatBit" (small gray, inline). Grouped nav: LIBRARY (Strategy browser, Strategy detail), DRAFTING (Personalise draft, Output view), PARTICIPANT (Profile), ACCOUNT (Upgrade to Pro, Error states). Active item = light warm-gray background (`#F5F4F1`) + bold text + filled green dot; inactive = gray text + hollow gray dot. User chip pinned at the bottom (black circle initials "TK" + name + "Free plan").
- **Top bar**: current screen title (left) + search input (right, 230px, magnifier icon, placeholder "Search strategies...").
- **Content area**: `padding:36px 40px 60px`, background `#FAFAF9`, max-width 760–1000px depending on screen.

### 1. Strategy browser
- Heading + subtext. Tab row: "By function" (active, green underline) / "Responsive strategies" (inactive — strategies in this tab never mix into the function filter).
- Filter row: function chips (Attention, Escape/avoidance selected black; Sensory, Access to tangibles unselected outlined) + evidence-strength pills (Strong = filled green, Emerging = outlined).
- Strategy list: each card (white, 12px radius, soft shadow) shows name, one-line mechanism summary, evidence-strength label (green = strong, gray = emerging) and function tag. Clicking a card opens Strategy detail for that entry.

### 2. Strategy detail
- Single white card (14px radius): evidence/function tags, strategy name (22px bold), MECHANISM section (plain-language explanation), a bordered **citation callout** (1.5px green border, mono label "CITATION · PERMANENT SOURCE" + full reference), and a numbered "HOW TO USE" list.

### 3. Personalise draft
- 3-step card row: (1) Capacity note — read-only context card ("What's realistic for this participant and setting?"), (2) Generate — button labeled "Generate" with a small "LOGIC" tag chip (renamed from "AI" per product direction — this is predictive logic, not generative AI) that reveals a draft, (3) "Draft unavailable" fallback card explaining missing profile fields with a link to Profile.
- Below: two-column review area — left is the editable draft textarea (only shown after Generate; "Draft will appear here" dashed placeholder before that) with Save-to-plan / Regenerate actions; right is a pinned Mechanism + Citation reference card (green border), present regardless of draft state.

### 4. Output view
- Format toggle pill ("Plan format" active / "Session-log format"), a "Generated draft · edited" status label, the full plan wording, and the same pinned Mechanism/Citation card alongside.

### 5. Participant profile
- Two side-by-side cards contrasting **Standalone — intake form** (editable fields: preferred name, communication method, daily routine notes; "Save profile" button) against **Suite-connected — profile summary** (green-bordered card, "Pulled from Frame · synced 2h ago", same fields shown read-only, note to edit in Frame instead).

### 6. Upgrade to Pro (paywall)
- Free-plan strategy card shown with blurred/placeholder content bars, then "Personalised drafting is a Pro feature" messaging, "Start 14-day free trial" CTA (green) + pricing note, and below a divider a **Pro suite** row with "Connect Frame" and "Connect Vector" outlined buttons (cross-product integration — Frame and Vector are other WhatBit products a Pro subscriber can link). Right side: the same Mechanism/Citation card labeled "· UNLOCKED".

### 7. Error states
- Three side-by-side cards, each a distinct, honest failure mode — not generic "something went wrong" copy:
  1. **Content review, not a bug** — the draft was blocked by content policy (not a technical fault); "Edit capacity note" action.
  2. **Connection issue** — the user's connection dropped; nothing was generated or charged; "Retry" action.
  3. **Service issue, our side** — the drafting service didn't respond; explicitly reassures profile/capacity data is unaffected and the strategy library still works; "Retry" action.

## Interactions & Behavior
- **Sidebar nav**: click any item to switch screens instantly (no transition/animation — the app is deliberately calm, not flashy).
- **Strategy browser → detail**: clicking any strategy card opens Strategy detail (in the prototype it always shows the NCR example; wire to the clicked strategy's real data on implementation).
- **Generate flow**: clicking "Generate" (with the "LOGIC" tag) reveals the draft textarea pre-filled with sample personalised wording and switches the button label to "Regenerate". This is **predictive logic, explicitly not AI/generative** — do not reintroduce "AI" language in the implementation; keep the "LOGIC" framing and the copy distinguishing it from AI drafting.
- **"Add these to the profile →"** link (in the AI-unavailable/fallback card) navigates to the Profile screen.
- **Save to plan** button (in Personalise draft) navigates to Output view in the prototype — in the real product this should persist the draft and then show the output.
- **Format toggle** (Output view): switches between Plan format and Session-log format wording (static in the prototype — wire to real content variants).
- **Hover states**: strategy cards lift shadow slightly; primary buttons darken (`#1B6E5C` → `#154F41`); outlined buttons (e.g. "Connect Frame/Vector") get a green border on hover.
- **Accessibility note carried from the original design**: interactive elements should show a visible focus ring (2px solid `#1B6E5C`, 2–3px offset) — this was present in the original spec sheet version of these screens and should be preserved when implementing real interactive elements (buttons, tabs, chips, links).

## State Management
- `screen`: which of the 7 views is active.
- `revealed`: whether the personalised draft has been generated (controls draft textarea vs. placeholder, and the Generate/Regenerate button label).
- All strategy, citation, profile and draft content is static sample data in this prototype — wire to real strategy library, participant profile, and drafting-logic data on implementation. No network calls exist in the prototype; the drafting mechanism should be implemented as the product's actual predictive-logic service (not a call to a generative AI model).

## Design Tokens

**Colors**
- Brand accent: `#1B6E5C` (primary green — links, active tab underline, primary buttons, citation card borders, evidence-strong labels).
- Button hover: `#154F41`.
- Ink/text: `#18181B` (primary), `#33322E` (body copy in cards), `#57554F` (secondary), `#6B6B70` (tertiary/descriptions), `#A3A19C` (labels/placeholders), `#D8D5D0`/`#C7C4BE` (placeholder/disabled).
- Borders/dividers: `#ECEAE6` (structural), `#E7E5E2` (input/card borders).
- Surfaces: `#FFFFFF` (cards/sidebar/topbar), `#FAFAF9` (app canvas), `#F5F4F1` (subtle section tint, active nav, chip tracks).
- Suite-connected accent tint: `#D9EAE4` (border on the "pulled from Frame" card).
- Selection highlight: `#D9EAE4`.

**Typography**
- UI/body: **Instrument Sans** (500/600/700).
- Mono labels/citations/eyebrows: **IBM Plex Mono** (400/500/600), used for all-caps micro-labels (letter-spacing ~0.05–0.08em), evidence-strength tags, and citation text.
- Sizes: page headings 22–24px (700), card titles 14–17px (700), body 13–15.5px, micro-labels 10–11.5px mono.

**Spacing / shape**
- Card radius: 12–14px (detail/personalise cards slightly larger at 14px).
- Buttons/pills: 7–9px radius; evidence pills fully rounded (20px).
- Card shadow: soft two-layer (`0 1px 2px rgba(24,24,27,.04), 0 4-8px 12-20px rgba(24,24,27,.04-.05)`); citation cards get a green-tinted shadow (`rgba(27,110,92,.08)`) plus a 1.5px green border instead of a shadow-only treatment.
- Content max-widths: 760–840px (single-column screens), 1000px (two-column screens).

**Motion**
- Minimal: hover-only transitions (~100ms) on buttons/borders. No looping/ambient animation in the app (contrast with more decorative marketing pages) — keep the app feel efficient and clinical.

## Assets
- **Favicon/logo mark**: `assets/field-favicon.svg` — a 32×32 rounded-square (7px radius) in brand green `#1B6E5C` with a white "F" monogram. Use as the app favicon and as the basis for any app-icon exports (add PNG/ICO renditions at required sizes for production — 16/32/180/512px etc.).
- No custom icon library used elsewhere — the only inline icon is the search magnifier (hand-drawn SVG); consider adopting a proper icon set (e.g. Lucide) at implementation for consistency.
- Google Fonts: Instrument Sans (500/600/700), IBM Plex Mono (400/500/600).

## Notes for the developer
- "Vector" and "Frame" (referenced in the Pro-suite connect buttons) are other WhatBit products — implement as real OAuth/connect flows to those products' APIs, not placeholder buttons.
- Do not use the word "AI" anywhere in the drafting UI or copy — the product intentionally frames this feature as **predictive logic**, distinct from generative AI, per explicit product direction.
- Sample participant name ("Jordan"), practitioner name ("Tia K."), and strategy content (NCR, FCT, high-probability sequences) are illustrative — replace with real data model on integration.

## Files
- `Field App.dc.html` — full app shell + all 7 screens + interaction logic in one file (the `<script type="text/x-dc">` block is the state/handler spec, not code to paste as-is).
- `support.js` — internal preview runtime only; not needed in the target codebase.
- `assets/field-favicon.svg` — the favicon/logo mark described above.
