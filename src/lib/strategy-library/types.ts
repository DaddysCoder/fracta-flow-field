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

export type BehaviourFunction =
  | 'Attention'
  | 'Escape/avoidance'
  | 'Sensory'
  | 'Access to tangibles'
  | 'Communication'
  /**
   * Automatic (non-socially-mediated) reinforcement — the behaviour's
   * consequence is produced by the behaviour itself, not by another
   * person. Kept distinct from 'Sensory': a generic sensory activity
   * (`sensory-diet`) is not equivalent to an individually validated
   * competing stimulus for automatically reinforced challenging
   * behaviour (`competing-stimulus-access`) — see EVIDENCE.md.
   */
  | 'Automatic';

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
    /**
     * Which behavioural-function context this wording was authored for, on
     * a canonical strategy that applies across more than one function (see
     * `StrategyTemplate.applicableFunctions`) — e.g. FCT's "request break"
     * wording is tagged `'Escape/avoidance'`, "request item" tagged
     * `'Access to tangibles'`. `matchPersonalisedVariant` treats this as a
     * hard filter, not a soft-scored preference like the fields above: a
     * variant written for the wrong function is never an acceptable match,
     * so it's excluded before scoring rather than merely scored lower.
     * Absent on strategies with only one applicable function.
     */
    function?: BehaviourFunction;
  };
}

export type EvidenceType =
  | 'systematic-review'
  | 'meta-analysis'
  | 'narrative-review'
  | 'scoping-review'
  | 'single-case'
  | 'treatment-package';

/**
 * One source backing a strategy's evidence claim, with enough metadata to
 * tell reviewers what kind of evidence it is — a systematic review/meta-
 * analysis is not interchangeable with a single-case study or a component
 * evaluated only inside a multicomponent treatment package. `citation`/
 * `citationShort` on `StrategyTemplate` stay the single "permanent source"
 * shown by `MechanismCitationUnit`; `evidenceSources` is the fuller record
 * for strategies backed by more than one source (see EVIDENCE.md).
 */
export interface EvidenceSource {
  citation: string;
  citationShort: string;
  evidenceType: EvidenceType;
  doi?: string;
  pmid?: string;
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
  /** Primary/historical behavioural function this strategy is filed under. */
  function: BehaviourFunction;
  /**
   * Every function this canonical strategy is genuinely applicable to,
   * including `function`. Absent means "just `function`" — most strategies
   * don't need this. Set it on a strategy whose intervention is the same
   * technique across functions (e.g. FCT) so it surfaces under every
   * relevant function filter instead of being duplicated as separate
   * strategies per function. Read via `applicableFunctionsOf()`, never
   * `.function` directly, anywhere this matters (filtering, display).
   */
  applicableFunctions?: BehaviourFunction[];
  /** True when this is a responsive strategy rather than a function-based one. */
  responsive: boolean;
  mechanism: string;
  citation: string;
  citationShort: string;
  /** Full evidence record when more than one source backs this strategy — see `EvidenceSource`. */
  evidenceSources?: EvidenceSource[];
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

/** Every function a strategy is applicable to — `applicableFunctions` when set, else just `function`. */
export function applicableFunctionsOf(strategy: StrategyTemplate): BehaviourFunction[] {
  return strategy.applicableFunctions ?? [strategy.function];
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
