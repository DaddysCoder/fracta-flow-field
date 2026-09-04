/**
 * Schema aligned with Fracta-Flow-AI's `packages/participant-profile`
 * (`ParticipantProfile` + `EligibilityFilters`). Field-for-field parity is
 * kept where it makes sense for this thinner, standalone app — deviations
 * are called out inline.
 */

/**
 * Mirrors Fracta-Flow-AI's `EligibilityFilters` shape. Not yet read by any
 * matching logic in this app (that's future evidence-layer work) but carried
 * on every profile so a participant record ports cleanly once strategy
 * eligibility filtering lands here.
 */
export interface EligibilityFilters {
  minAge?: number;
  maxAge?: number;
  /** e.g. 'requires-interpreter', 'first-nations-informed'. */
  culturalSafetyFlags: string[];
  /** Support types this participant's plan/consent excludes from being suggested. */
  excludedSupportTypes: string[];
  requiresGuardianConsent?: boolean;
}

export function emptyEligibilityFilters(): EligibilityFilters {
  return { culturalSafetyFlags: [], excludedSupportTypes: [] };
}

/** Current schema version. Bump this and extend `migrateParticipantProfile` when the shape changes again. */
export const PARTICIPANT_PROFILE_SCHEMA_VERSION = 2;

export interface ParticipantProfile {
  id: string;
  preferredName: string;
  communicationMethod: string;
  dailyRoutineNotes: string;
  /** What the participant is into — the actual differentiator for personalised delivery wording. */
  interests: string;
  /** How much novelty/change this participant can tolerate in a given session. */
  comfortThreshold: string;
  /** ISO date. Optional — feeds `eligibilityFilters`-based age matching once that lands. */
  dateOfBirth?: string;
  /** Free-text note a practitioner can use for culturally safe delivery choices. */
  culturalSafetyNotes?: string;
  eligibilityFilters: EligibilityFilters;
  /** Present only when the profile is read-only data pulled from a connected suite (e.g. Frame). */
  source?: {
    suite: string;
    syncedAt: string;
  };
  schemaVersion: typeof PARTICIPANT_PROFILE_SCHEMA_VERSION;
  createdAt: string;
  updatedAt: string;
}

/** Fields the personalise step needs. Missing any of these triggers the "unavailable" state. */
export const REQUIRED_FOR_PERSONALISATION: (keyof ParticipantProfile)[] = [
  'communicationMethod',
  'dailyRoutineNotes',
];

const FIELD_LABELS: Record<string, string> = {
  communicationMethod: 'communication method',
  dailyRoutineNotes: 'daily routine',
};

export function missingPersonalisationFields(profile: ParticipantProfile | null): string[] {
  if (!profile) return ['daily routine', 'communication method'];
  return REQUIRED_FOR_PERSONALISATION.filter((field) => !profile[field]?.toString().trim()).map(
    (field) => FIELD_LABELS[field] ?? field,
  );
}
