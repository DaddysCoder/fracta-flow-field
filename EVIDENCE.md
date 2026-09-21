# Evidence library integration — QA report

Source: `FIELD_NEW.zip`, 9 supplied PDFs. This documents what the "FIELD — Evidence
Library Integration" pass changed in `src/lib/strategy-library/strategies.ts`,
following the modelling rule it specified: **strategies are canonical
intervention techniques; behavioural function is applicability/context on a
strategy, not a reason to duplicate it.**

The PDFs themselves aren't committed here (copyrighted journal articles) —
this is the full citation record the task asked for, attached in code as
`StrategyTemplate.evidenceSources` (see `src/lib/strategy-library/types.ts`).

## Supplied PDFs → citations

| File | Citation | DOI | Evidence type |
|---|---|---|---|
| `Field 1.pdf` | Haddock, J. N., & Hagopian, L. P. (2020). Competing stimulus assessments: A systematic review. *Journal of Applied Behavior Analysis, 53*(4), 1982–2001. | 10.1002/jaba.754 | Systematic review |
| `Field 2.pdf` | Rooker, G. W., Bonner, A. C., Dillon, C. M., & Zarcone, J. R. (2018). Behavioral treatment of automatically reinforced SIB: 1982–2015. *Journal of Applied Behavior Analysis, 51*(4), 974–997. | 10.1002/jaba.492 | Systematic review |
| `Field 3.pdf` | Tiger, J. H., Hanley, G. P., & Bruzek, J. (2008). Functional communication training: A review and practical guide. *Behavior Analysis in Practice, 1*(1), 16–23. | — (not found on the supplied copy) | Narrative review |
| `field 4.pdf` | Carr, J. E., Severtson, J. M., & Lepper, T. L. (2009). Noncontingent reinforcement is an empirically supported treatment for problem behavior exhibited by individuals with developmental disabilities. *Research in Developmental Disabilities, 30*(1), 44–57. | 10.1016/j.ridd.2008.03.002 | Narrative review (quantitatively coded against Task Force EST criteria) |
| `Field 5.pdf` **and** `macnaul-nguyen-2026-...pdf` | MacNaul, H., & Nguyen, A. (2026). Response interruption and redirection for stereotypy: A quality review and ethical considerations. *Behavior Modification, 50*(4), 310–356. | 10.1177/01454455261434871 | Systematic review — **duplicate file**, same content (identical last page/reference list), counted once. |
| `J of App Behav Analysis - 2020 - Ghaemmaghami...pdf` | Ghaemmaghami, M., Hanley, G. P., & Jessel, J. (2021). Functional communication training: From efficacy to effectiveness. *Journal of Applied Behavior Analysis, 54*(1), 122–143. | 10.1002/jaba.762 | Narrative review (efficacy vs. effectiveness) |
| `chezan-et-al-2017-...pdf` | Chezan, L. C., Wolfe, K., & Drasgow, E. (2018). A meta-analysis of functional communication training effects on problem behavior and alternative communicative responses. *Focus on Autism and Other Developmental Disabilities, 33*(4), 195–205. | 10.1177/1088357617741294 | Meta-analysis |
| `12555907.pdf` | Romaniuk, C., Miltenberger, R., Conyers, C., Jenner, N., Jurgens, M., & Ringenberg, C. (2002). The influence of activity choice on problem behaviors maintained by escape versus attention. *Journal of Applied Behavior Analysis, 35*(4), 349–362. | — (not found on the supplied copy; pre-dates routine DOI assignment) | Single-case experimental (N=7) |
| `s43494-024-00143-y.pdf` | Ward, R. S., Jones, S. H., Pullar, T., & Celona, C. (2025). A scoping literature review of demand fading. *Education and Treatment of Children, 48*, 93–106. | 10.1007/s43494-024-00143-y | Scoping review (n=15 studies) |

PMIDs: none were printed on any of the supplied copies, so none are recorded —
not fabricated.

## Strategies added

- **`competing-stimulus-access`** — Assessment-informed competing stimulus
  access. Function: `Automatic` (new — see "Schema changes" below). Tier:
  **Strong**. Sources: Haddock & Hagopian (2020, systematic review, primary);
  Rooker et al. (2018, systematic review, secondary — its specific finding
  that NCR was more effective when informed by a CSA than a preference
  assessment is what ties this strategy to NCR's `howToUse`). Kept explicitly
  distinct from `sensory-diet` in both directions: `sensory-diet`'s mechanism
  now says it isn't a treatment claim for automatic reinforcement, and this
  strategy's mechanism says it isn't a generic sensory activity.
- **`choice-task-adaptation`** — Choice and task adaptation. Function:
  `Escape/avoidance` only. Tier: **Emerging** (single-case study, not a
  review/meta-analysis). Source: Romaniuk et al. (2002). Scoped to
  escape/avoidance specifically because that paper found the choice
  intervention reduced escape-maintained problem behaviour but had **no
  effect** on attention-maintained problem behaviour in the same participants
  — that's encoded in the mechanism text as an explicit boundary, not
  generalised into an all-functions choice strategy.
- **`demand-fading`** — Demand fading. Function: `Escape/avoidance`. Tier:
  **Emerging**, exactly as the task specified, and independently justified by
  reading the source: Ward et al. (2025) is a scoping review (not a
  meta-analysis) of 15 studies, with "demand fading procedures were
  inconsistent" and "generally embedded in a treatment package with other
  interventions" as its own stated conclusion. `howToUse` explicitly says the
  evidence is for the package, not the isolated component, per the task's
  instruction not to claim isolated-component efficacy from package studies.

## Strategies modified

- **`fct`** (Functional communication training) — stayed **one canonical
  strategy**. Added `applicableFunctions: ['Attention', 'Escape/avoidance',
  'Access to tangibles']` instead of splitting into "FCT — Escape" /
  "FCT — Tangible" strategies. Replaced its 2 generic variants with 6
  function-tagged variants (2 communication-modality options × 3 functions —
  attention/escape/tangible, each with an AAC/device/PECS option and a
  verbal/gesture/sign option). Added `evidenceSources`: kept Carr & Durand
  (1985) as the primary/permanent citation, added Tiger et al. (2008),
  Chezan et al. (2018, meta-analysis) and Ghaemmaghami et al. (2021) as
  supporting sources. Tier stays **Strong** — already was, and the added
  meta-analysis plus decades of single-case replication support that; the
  `howToUse` now also flags Ghaemmaghami et al.'s specific finding that
  generalisation/maintenance evidence is weaker than efficacy evidence,
  rather than treating "Strong" as blanket certainty on every dimension.
- **`ncr`** (Non-contingent reinforcement) — added `applicableFunctions:
  ['Attention', 'Access to tangibles']`. Added Carr, Severtson & Lepper
  (2009) and Rooker et al. (2018) to `evidenceSources` alongside the existing
  Tucker et al. (1998) primary citation. Tier stays **Strong**. Rewrote
  `howToUse` to state the prerequisites/boundaries the task asked for
  explicitly: identify the actual maintaining reinforcer (don't substitute an
  arbitrary preferred item), confirm the schedule is feasible, monitor the
  actual effect rather than assuming the schedule alone works, thin based on
  data not a fixed timeline, and a cross-reference to
  `competing-stimulus-access` for the CSA-informed case.
- **`sensory-diet`** (Scheduled sensory input) — **not** treated as
  equivalent to `competing-stimulus-access`, per the task's explicit
  instruction. Watling & Hauer (2015) stays as its only source, now
  captured in `evidenceSources` too, with the mechanism text stating plainly
  that this is general sensory support, not a treatment claim for
  automatically reinforced challenging behaviour.

## Duplicate strategies avoided/merged

- FCT: one strategy, not three (`FCT — Attention` / `FCT — Escape` /
  `FCT — Tangible` never created).
- `choice-task-adaptation` is a different canonical technique from the
  existing `choice-tangibles` (Kern et al., 1998 — offering a choice
  *between preferred tangible items* to reduce access conflict,
  `Access to tangibles`) and from `high-prob` (behavioural momentum,
  `Escape/avoidance`). All three involve "choice" or "escape" in some form
  but are genuinely different interventions, not the same technique
  re-labelled by function — kept as three separate strategies deliberately,
  not merged and not flagged as a duplicate.
- `demand-fading` is likewise distinct from `high-prob` and
  `choice-task-adaptation` (different mechanism: altering the establishing
  operation via demand removal/reintroduction, not momentum or choice).

## Function mappings added

`BehaviourFunction` gained `'Automatic'`. `StrategyTemplate.applicableFunctions`
added to `fct` and `ncr` (see above). `StrategyBrowser`'s function-filter chips
now include "Automatic", and match against `applicableFunctionsOf(strategy)`
(any-of) rather than the single `.function` field, so `fct` correctly surfaces
under Attention, Escape/avoidance, and Access to tangibles without being
triplicated.

## Variants added

- `fct`: 2 → 6 (see above).
- `competing-stimulus-access`: 2 new (comfort-threshold based, matching the
  existing convention used by every other strategy's placeholder variants).
- `choice-task-adaptation`: 2 new.
- `demand-fading`: 2 new.

All other strategies (`sensory-diet`, `choice-tangibles`, `aac-request`,
`redirect`, `debrief`, `high-prob`) were left at their existing 2 variants —
the task's "expand variants only where meaningful implementation differences
exist" scoped this pass to FCT and the three new strategies. They're still
thin (2 each); that's unchanged from before this pass, not newly introduced.

## Evidence tier for each (new/changed strategies only)

| Strategy | Tier | Authority tier | Why |
|---|---|---|---|
| `competing-stimulus-access` | Strong | 1 | Two systematic reviews (Haddock & Hagopian 2020; Rooker et al. 2018) |
| `fct` | Strong | 1 | Unchanged — meta-analysis + decades of single-case replication |
| `ncr` | Strong | 1 | Unchanged — narrative review against EST criteria + 2 systematic reviews |
| `choice-task-adaptation` | Emerging | 3 | One single-case study (N=7), not a review/meta-analysis |
| `demand-fading` | Emerging | 3 | Scoping review; procedural variability; mostly package evidence |
| `sensory-diet` | Practice-based | 5 | Unchanged — general sensory-support review, not specific to this claim |

No tier was raised purely because multiple citations now exist on a strategy
(`fct`/`ncr` went from 1 source to 3–4, tier unchanged) — the task explicitly
warned against that, and it wasn't done.

## Literature that did not support the intended claim as written

None of the 9 supplied sources conflicted with the task's own tier/scope
instructions once read directly — each was checked against its actual
abstract/discussion (see the per-strategy notes above), not assumed from the
task description. The one thing worth flagging as a **near-miss**, not a
conflict: the task's phrasing for demand fading ("promising effects but
substantial procedural variability and frequent use within multicomponent
packages") matches Ward et al. (2025)'s own discussion closely enough that no
correction was needed — confirmed by reading the source, not just trusted.

## Safety/practice boundary — no new strategy added for this

MacNaul & Nguyen (2026) reviews response interruption and redirection (RIRD)
for stereotypy and finds real quality/ethical problems in that literature
(only 9% of cases met WWC standards without reservations; 47% didn't meet
standards at all). The task's "Safety/practice boundary" section (don't
default to reducing harmless stimming, don't elevate escape extinction to
first-line, keep intrusive procedures gated) reads as a constraint grounded
in this paper, not a request to add RIRD as a strategy — and the task's own
numbered "Changes to make" list (1–5) doesn't ask for one. **No RIRD/escape-
extinction strategy was added.** MacNaul & Nguyen is cited here as the
grounding for that boundary rather than attached to any strategy record.

## Schema changes made

- `BehaviourFunction`: added `'Automatic'`.
- `StrategyTemplate.applicableFunctions?: BehaviourFunction[]` — every
  function a strategy is genuinely applicable to; optional, defaults to
  `[function]` via the new `applicableFunctionsOf()` helper. Additive, not
  breaking.
- `StrategyTemplate.evidenceSources?: EvidenceSource[]` — full citation +
  DOI/PMID + evidence-type record, additive alongside the existing single
  `citation`/`citationShort` "permanent source" fields (unchanged, still used
  by `MechanismCitationUnit`/export text).
- `PersonalisationRecord.tags.function?: BehaviourFunction` — which function
  context a variant's wording was authored for. `matchPersonalisedVariant`
  treats this as a hard pre-filter (not a scored preference): a variant
  written for the wrong function is excluded before scoring, never merely
  scored lower. `matchPersonalisedVariant`/`requestPersonalisedVariant` both
  gained an optional `targetFunction` parameter.
- UI: `PersonaliseFlow` now shows a function picker ("Which function is this
  for, for this participant?") when a strategy's `applicableFunctions` has
  more than one entry, and disables matching until one is chosen.
  `StrategyBrowser`'s filter, `StrategyCard` and `StrategyDetail`'s function
  tag now read `applicableFunctionsOf()` instead of `.function` directly.

## Schema change flagged, not made

The task says to "keep more intrusive procedures behind the existing FIELD
gating model." Reading the actual code: `approvalStatus` (draft/pending-
review/approved/retired) and `EligibilityFilters.excludedSupportTypes` exist
on the schema, but **nothing in this app currently reads or enforces either
one** — every strategy, old and new, is seeded `approvalStatus: 'approved'`
and nothing filters on it. There is no working "gating model" to keep new
strategies behind yet; it's schema-only. Building real enforcement wasn't
attempted here — that's a genuine "redesign FIELD's methodology"-scale change
the task asked this pass *not* to do, so it's flagged rather than silently
built or silently assumed to already work.

## Tests run and what they tested

- `npm run build` (`tsc -b && vite build`) — the added/changed types and
  screens compile and the production bundle builds.
- `npm test` (vitest, 30 tests, up from 25):
  - Existing 25: unchanged behaviour (profile storage/migrations, evidence-
    tier scoring, template supersession) still passes with the schema
    additions in place (all new fields are optional).
  - `applicableFunctionsOf` (2 new): falls back to `[function]` when
    `applicableFunctions` is unset; returns the full list when set.
  - Function-tagged matching (3 new, in `src/ai/personalise.ts`'s test
    suite): a variant tagged for one function is excluded when a different
    function is requested; requesting a function with no tagged variant at
    all throws `no-variant-match` rather than returning something wrong;
    requesting a function on a strategy with no function-tagged variants at
    all still matches normally (the filter is a no-op, not a hard failure).
- `npm run worker:typecheck` — unaffected (this pass didn't touch `worker/`).
- Manual: ran the app in a browser and drove the FCT personalise flow
  end-to-end with the suite-connected demo profile — picked "Escape/avoidance"
  in the new function selector, matched, and got the escape-tagged AAC
  variant's wording (not the attention or tangible wording); confirmed the
  Strategy Browser's new "Automatic" filter chip shows only
  `competing-stimulus-access`, and its "Escape/avoidance" chip shows `fct`
  alongside `high-prob`, `choice-task-adaptation` and `demand-fading` as four
  separate cards (no duplication).
