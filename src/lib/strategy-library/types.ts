/**
 * Schema aligned with Fracta-Flow-AI's `packages/strategy-library`
 * (`StrategyTemplate` / `PersonalisationRecord` / `resolveCurrentTemplate`)
 * plus the governance fields `packages/evidence-layer` expects on anything
 * it will one day sit alongside: `approvalStatus`, `version`,
 * `effectiveDate`, `current`, `supersededBy`. This pass only ports the
 * shapes and a local chain-walk — no evidence-layer or retrieval-core
 * integration.
 */

export type EvidenceTier = 'Strong' | 'Emerging' | 'Practice-based';

/**
 * Fracta-Flow-AI's evidence-layer five-tier authority hierarchy (1 =
 * highest authority, e.g. systematic review/meta-analysis; 5 = lowest, e.g.
 * practice wisdom/expert opinion with no published study behind it). Kept
 * separate from `evidenceTier` (the practitioner-facing "Strong / Emerging
 * / Practice-based" label already shown in this app's UI) rather than
 * replacing it — `evidenceTier` is the plain-language summary,
 * `evidenceAuthorityTier` is the machine-comparable rank the evidence layer
 * will reason over.
 */
export type EvidenceAuthorityTier = 1 | 2 | 3 | 4 | 5;

/**
 * Six proactive strategy categories (multi-select — a strategy can sit in
 * more than one). Deliberately NOT a behavioural-function taxonomy
 * (attention/escape/tangible/sensory): function belongs to the *behaviour*,
 * determined by the FBA tool's screener + episode-triangulation logic
 * (`FunctionHypothesis`), never to the strategy. Tagging strategies by
 * function pre-empts that FBA→strategy matching (deferred to a future
 * phase, and even then resolved outside a strategy's own record) and
 * implies a clinical match this library isn't making. See the strategy
 * library planning record for the full rationale behind this correction.
 */
export type StrategyCategory =
  | 'environmental'
  | 'community'
  | 'communication'
  | 'regulating'
  | 'health_wellbeing'
  | 'learning';

/** Display-facing "figure was updated" summary — kept as-is from the pre-alignment schema; still shown by `SupersededBand`. */
export interface SupersededInfo {
  previousFigure: string;
  updatedFigure: string;
}

export type ComfortLevel = 'low' | 'medium' | 'high';

export type ApprovalStatus = 'draft' | 'pending-review' | 'approved' | 'retired';

/**
 * A pre-authored delivery-wording template for one strategy, tagged for local
 * matching against a participant profile. No model ever writes new prose here
 * — `matchPersonalisedVariant` only ever fills the slots of whichever record
 * scores highest.
 *
 * Renamed from `PersonalisedVariant` to match Fracta-Flow-AI's
 * `PersonalisationRecord`. `strategyId` is renamed `templateId` to match its
 * new target field on `StrategyTemplate`.
 */
export interface PersonalisationRecord {
  id: string;
  templateId: string;
  /**
   * Which participant this record was personalised for. Optional here (as
   * opposed to required on evidence-layer's `PersonalisationRecord`) because
   * these entries are pre-authored generic wording templates matched against
   * *any* participant profile at read time, not per-participant records —
   * see `src/ai/personalise.ts`. Set once a record is actually saved against
   * one participant (a `SavedDraft`).
   */
  participantRef?: string;
  /** e.g. "During {{routine}}, offer {{interest}}-themed choices using {{communicationMethod}}." */
  template: string;
  tags: {
    interests?: string[];
    communicationMethod?: string[];
    comfortThreshold?: ComfortLevel;
  };
}

/**
 * Renamed from `Strategy` to match Fracta-Flow-AI's `StrategyTemplate`.
 * `id` stays the stable identity used throughout this app's routing and
 * storage keys; Fracta-Flow-AI's `templateId` field is carried alongside it
 * (equal to `id` today) so a version of this template that later
 * *supersedes* this one can point back at it via `supersededBy` without
 * `id` itself having to change.
 */
export interface StrategyTemplate {
  id: string;
  templateId: string;
  name: string;
  shortDescription: string;
  evidenceTier: EvidenceTier;
  evidenceAuthorityTier: EvidenceAuthorityTier;
  /**
   * Multi-select proactive categories. Empty for a responsive strategy
   * (`responsive: true`) — responsive strategies are gated separately, not
   * tagged into this scheme (see `responsive` below).
   */
  strategyCategories: StrategyCategory[];
  /**
   * True for a responsive (reactive) strategy. This is the class the
   * evidence-base review flags as most dangerous via plain menu-selection —
   * weakest inter-rater reliability of any BSP-QEII item, closest to the
   * restrictive-practice boundary, and correct only in the context of a
   * specific formulation (e.g. strategic capitulation only works alongside
   * the proactive elements it depends on). Any UI offering a responsive
   * strategy must require an explicit practitioner acknowledgement before
   * personalising it — never just a separate browse tab.
   */
  responsive: boolean;
  mechanism: string;
  citation: string;
  citationShort: string;
  howToUse: string[];
  /** Age band this template is written for, if restricted. Absent = no age restriction. */
  ageRange?: { minAge?: number; maxAge?: number };
  /** Practitioner-facing note on culturally safe delivery of this strategy. */
  culturalSafetyNotes?: string;
  /** Display-facing summary shown by `SupersededBand` when this template has updated figures/guidance. */
  supersededInfo?: SupersededInfo;
  personalisationRecords: PersonalisationRecord[];

  // --- Governance fields (evidence-layer alignment) ---
  /** Monotonically increasing per `templateId`; starts at 1. */
  version: number;
  approvalStatus: ApprovalStatus;
  /** ISO date this version became effective. */
  effectiveDate: string;
  /** True if this is the current version in its supersession chain. */
  current: boolean;
  /** `templateId` of the version that supersedes this one, if any. */
  supersededBy?: string;
}

/**
 * Walks the supersession chain (`supersededBy`) starting from `templateId`
 * until it reaches the version marked `current`. Guards against cycles so a
 * malformed chain can never hang the caller.
 */
export function resolveCurrentTemplate(
  templateId: string,
  templates: StrategyTemplate[],
): StrategyTemplate | undefined {
  const byTemplateId = new Map(templates.map((t) => [t.templateId, t]));
  let candidate = byTemplateId.get(templateId);
  const seen = new Set<string>();

  while (candidate && !candidate.current && candidate.supersededBy) {
    if (seen.has(candidate.templateId)) break; // cycle guard
    seen.add(candidate.templateId);
    const next = byTemplateId.get(candidate.supersededBy);
    if (!next) break;
    candidate = next;
  }

  return candidate;
}
