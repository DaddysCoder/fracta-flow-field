import { describe, expect, it } from 'vitest';
import { emptyEligibilityFilters, type ParticipantProfile } from '../lib/participant-profile/types';
import type { PersonalisationRecord } from '../lib/strategy-library/types';
import { PersonaliseError, matchPersonalisedVariant, scoreVariant } from './personalise';
import type { StrategyTemplate } from '../lib/strategy-library/types';

function profile(overrides: Partial<ParticipantProfile> = {}): ParticipantProfile {
  return {
    id: 'p1',
    preferredName: 'Alex',
    communicationMethod: 'AAC device',
    dailyRoutineNotes: 'Morning routine at home',
    interests: 'trains, music',
    comfortThreshold: 'medium, a couple of new things',
    eligibilityFilters: emptyEligibilityFilters(),
    schemaVersion: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function record(overrides: Partial<PersonalisationRecord> = {}): PersonalisationRecord {
  return {
    id: overrides.id ?? 'r1',
    templateId: 'strategy-1',
    template: 'During {{routine}}, offer {{interest}}-themed choices using {{communicationMethod}}.',
    tags: {},
    ...overrides,
  };
}

function strategy(personalisationRecords: PersonalisationRecord[]): StrategyTemplate {
  return {
    id: 'strategy-1',
    templateId: 'strategy-1',
    name: 'Test strategy',
    shortDescription: '',
    evidenceTier: 'Strong',
    evidenceAuthorityTier: 1,
    function: 'Communication',
    responsive: false,
    mechanism: '',
    citation: '',
    citationShort: '',
    howToUse: [],
    personalisationRecords,
    version: 1,
    approvalStatus: 'approved',
    effectiveDate: '2026-01-01',
    current: true,
  };
}

describe('scoreVariant', () => {
  it('scores 0 when nothing on the profile matches the variant tags', () => {
    const p = profile({ interests: 'swimming', communicationMethod: 'spoken words' });
    const v = record({ tags: { interests: ['trains'], communicationMethod: ['aac'] } });
    expect(scoreVariant(v, p)).toBe(0);
  });

  it('accumulates points for each satisfied tag category', () => {
    const p = profile({ interests: 'trains, music', communicationMethod: 'AAC device' });
    const v = record({ tags: { interests: ['trains'], communicationMethod: ['aac'] } });
    expect(scoreVariant(v, p)).toBe(5); // +2 interest, +3 communication
  });
});

describe('matchPersonalisedVariant', () => {
  it('throws no-variant-match when the strategy has no personalisation records at all', () => {
    expect(() => matchPersonalisedVariant(strategy([]), profile())).toThrow(PersonaliseError);
    try {
      matchPersonalisedVariant(strategy([]), profile());
    } catch (err) {
      expect((err as PersonaliseError).kind).toBe('no-variant-match');
    }
  });

  it('throws no-suitable-match when every variant scores 0, instead of returning an arbitrary winner', () => {
    const p = profile({ interests: 'swimming', communicationMethod: 'spoken words' });
    const variants = [
      record({ id: 'a', tags: { interests: ['trains'] } }),
      record({ id: 'b', tags: { communicationMethod: ['aac'] } }),
    ];
    try {
      matchPersonalisedVariant(strategy(variants), p);
      expect.unreachable('expected a PersonaliseError to be thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(PersonaliseError);
      expect((err as PersonaliseError).kind).toBe('no-suitable-match');
    }
  });

  it('throws ambiguous-match on a tied top score instead of silently picking array order', () => {
    const p = profile({ interests: 'trains', communicationMethod: 'spoken words' });
    const variants = [
      record({ id: 'first', tags: { interests: ['trains'] } }),
      record({ id: 'second', tags: { interests: ['trains'] } }),
    ];
    try {
      matchPersonalisedVariant(strategy(variants), p);
      expect.unreachable('expected a PersonaliseError to be thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(PersonaliseError);
      const perr = err as PersonaliseError;
      expect(perr.kind).toBe('ambiguous-match');
      expect(perr.candidates).toHaveLength(2);
      expect(perr.candidates?.map((c) => c.id).sort()).toEqual(['first', 'second']);
    }
  });

  it('returns the clear winner, with matched/missing fields, when one variant strictly outscores the rest', () => {
    const p = profile({ interests: 'trains, music', communicationMethod: 'AAC device' });
    const variants = [
      record({ id: 'weak', tags: { interests: ['trains'] } }),
      record({ id: 'strong', tags: { interests: ['trains'], communicationMethod: ['aac'] } }),
    ];
    const result = matchPersonalisedVariant(strategy(variants), p);
    expect(result.matchedFields.sort()).toEqual(['communicationMethod', 'interests']);
    expect(result.missingFields).toEqual([]);
    expect(result.draftText).toContain('AAC device');
  });

  it('reports missingFields for tags the profile did not satisfy on the winning variant', () => {
    const p = profile({ interests: 'trains', communicationMethod: 'spoken words', comfortThreshold: 'low, minimal change' });
    const variants = [record({ id: 'only', tags: { interests: ['trains'], comfortThreshold: 'high' } })];
    const result = matchPersonalisedVariant(strategy(variants), p);
    expect(result.matchedFields).toEqual(['interests']);
    expect(result.missingFields).toEqual(['comfortThreshold']);
  });
});
