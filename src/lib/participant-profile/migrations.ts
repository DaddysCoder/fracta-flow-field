import {
  emptyEligibilityFilters,
  PARTICIPANT_PROFILE_SCHEMA_VERSION,
  type ParticipantProfile,
} from './types';

/** Shape persisted by the pre-schema-alignment app (no `schemaVersion` field at all). */
interface ParticipantProfileV1 {
  id: string;
  preferredName: string;
  communicationMethod: string;
  dailyRoutineNotes: string;
  interests: string;
  comfortThreshold: string;
  source?: { suite: string; syncedAt: string };
}

function isV1(value: unknown): value is ParticipantProfileV1 {
  return (
    !!value &&
    typeof value === 'object' &&
    'id' in value &&
    !('schemaVersion' in value)
  );
}

/**
 * Upgrades whatever shape was found in storage to the current
 * `ParticipantProfile`. Old data is never dropped — every field it had is
 * carried across, and anything new gets a safe default so existing
 * participants don't lose data or crash the app on first load post-upgrade.
 */
export function migrateParticipantProfile(raw: unknown): ParticipantProfile | null {
  if (!raw || typeof raw !== 'object') return null;

  if (isV1(raw)) {
    const now = new Date().toISOString();
    return {
      id: raw.id,
      preferredName: raw.preferredName,
      communicationMethod: raw.communicationMethod,
      dailyRoutineNotes: raw.dailyRoutineNotes,
      interests: raw.interests,
      comfortThreshold: raw.comfortThreshold,
      source: raw.source,
      eligibilityFilters: emptyEligibilityFilters(),
      schemaVersion: PARTICIPANT_PROFILE_SCHEMA_VERSION,
      createdAt: now,
      updatedAt: now,
    };
  }

  const candidate = raw as Partial<ParticipantProfile>;
  if (candidate.schemaVersion === PARTICIPANT_PROFILE_SCHEMA_VERSION) {
    // Already current, but be defensive about partially-written records
    // (e.g. a future version added a required field this app doesn't know
    // about yet, or storage was hand-edited).
    return {
      ...candidate,
      eligibilityFilters: candidate.eligibilityFilters ?? emptyEligibilityFilters(),
      createdAt: candidate.createdAt ?? new Date().toISOString(),
      updatedAt: candidate.updatedAt ?? new Date().toISOString(),
    } as ParticipantProfile;
  }

  // Unknown/future shape — refuse to guess, let the caller fall back to demo data
  // rather than silently corrupting a record we don't understand.
  return null;
}
