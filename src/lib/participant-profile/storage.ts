import { migrateParticipantProfile } from './migrations';
import { emptyEligibilityFilters, PARTICIPANT_PROFILE_SCHEMA_VERSION, type ParticipantProfile } from './types';

// Bumped from `.v1` because the persisted shape gained required fields
// (`eligibilityFilters`, `schemaVersion`, timestamps). The old key is left
// untouched on disk (not deleted) and read once, on the first load after
// this upgrade, purely as a migration source — see `loadProfile`.
const STORAGE_KEY = 'field.participant-profile.v2';
const LEGACY_STORAGE_KEY = 'field.participant-profile.v1';

function now(): string {
  return new Date().toISOString();
}

const DEMO_STANDALONE: ParticipantProfile = {
  id: 'demo-participant',
  preferredName: 'Jordan',
  communicationMethod: '',
  dailyRoutineNotes: '',
  interests: '',
  comfortThreshold: '',
  eligibilityFilters: emptyEligibilityFilters(),
  schemaVersion: PARTICIPANT_PROFILE_SCHEMA_VERSION,
  createdAt: now(),
  updatedAt: now(),
};

const DEMO_SUITE_CONNECTED: ParticipantProfile = {
  id: 'demo-participant',
  preferredName: 'Jordan',
  communicationMethod: 'Key word signing + AAC device',
  dailyRoutineNotes: 'Structured morning routine, 1:1 support 8–11am',
  interests: 'Trains, fidget toys, water play',
  comfortThreshold: 'Tolerates one new routine change per week',
  eligibilityFilters: emptyEligibilityFilters(),
  schemaVersion: PARTICIPANT_PROFILE_SCHEMA_VERSION,
  createdAt: now(),
  updatedAt: now(),
  source: {
    suite: 'Frame',
    syncedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
};

/**
 * Loads the current profile, migrating in-place from the pre-alignment (v1)
 * shape if that's all that's present. Migrated data is immediately
 * re-persisted under the new key so this only runs once per browser.
 */
export function loadProfile(suiteConnected: boolean): ParticipantProfile {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const migrated = migrateParticipantProfile(JSON.parse(raw));
      if (migrated) return migrated;
    }
  } catch {
    // ignore corrupt storage, fall through
  }

  try {
    const legacyRaw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacyRaw) {
      const migrated = migrateParticipantProfile(JSON.parse(legacyRaw));
      if (migrated) {
        saveProfile(migrated);
        return migrated;
      }
    }
  } catch {
    // ignore corrupt legacy storage, fall through to demo data
  }

  return suiteConnected ? DEMO_SUITE_CONNECTED : DEMO_STANDALONE;
}

export function saveProfile(profile: ParticipantProfile): void {
  const withTimestamp: ParticipantProfile = { ...profile, updatedAt: now() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(withTimestamp));
}
