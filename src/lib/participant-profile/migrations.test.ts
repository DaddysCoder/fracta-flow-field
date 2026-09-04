import { describe, expect, it } from 'vitest';
import { migrateParticipantProfile } from './migrations';
import { PARTICIPANT_PROFILE_SCHEMA_VERSION } from './types';

describe('migrateParticipantProfile', () => {
  it('upgrades a pre-alignment (v1, no schemaVersion) record without losing any of its data', () => {
    const v1 = {
      id: 'p1',
      preferredName: 'Jordan',
      communicationMethod: 'AAC device',
      dailyRoutineNotes: 'Morning routine',
      interests: 'Trains',
      comfortThreshold: 'low',
      source: { suite: 'Frame', syncedAt: '2026-01-01T00:00:00.000Z' },
    };

    const migrated = migrateParticipantProfile(v1);

    expect(migrated).not.toBeNull();
    expect(migrated).toMatchObject({
      id: 'p1',
      preferredName: 'Jordan',
      communicationMethod: 'AAC device',
      dailyRoutineNotes: 'Morning routine',
      interests: 'Trains',
      comfortThreshold: 'low',
      source: { suite: 'Frame', syncedAt: '2026-01-01T00:00:00.000Z' },
      schemaVersion: PARTICIPANT_PROFILE_SCHEMA_VERSION,
    });
    expect(migrated!.eligibilityFilters).toEqual({ culturalSafetyFlags: [], excludedSupportTypes: [] });
    expect(typeof migrated!.createdAt).toBe('string');
    expect(typeof migrated!.updatedAt).toBe('string');
  });

  it('leaves a current-shape record intact', () => {
    const v2 = {
      id: 'p2',
      preferredName: 'Alex',
      communicationMethod: 'Verbal',
      dailyRoutineNotes: 'Afternoon routine',
      interests: 'Music',
      comfortThreshold: 'high',
      eligibilityFilters: { culturalSafetyFlags: ['first-nations-informed'], excludedSupportTypes: [] },
      schemaVersion: PARTICIPANT_PROFILE_SCHEMA_VERSION,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-02-01T00:00:00.000Z',
    };

    const migrated = migrateParticipantProfile(v2);
    expect(migrated).toEqual(v2);
  });

  it('returns null for garbage input instead of guessing', () => {
    expect(migrateParticipantProfile(null)).toBeNull();
    expect(migrateParticipantProfile('not an object')).toBeNull();
    expect(migrateParticipantProfile({ schemaVersion: 999 })).toBeNull();
  });
});
