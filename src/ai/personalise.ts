import type { ParticipantProfile } from '../lib/participant-profile/types';
import type { ComfortLevel, PersonalisationRecord, StrategyTemplate } from '../lib/strategy-library/types';

/**
 * Local, deterministic personalisation: scores this strategy's pre-authored
 * variants against the participant profile and fills the winning template's
 * slots. No network call, no model, no cost — every word a practitioner reads
 * was written by a person ahead of time.
 */
export type PersonaliseErrorKind =
  | 'no-variant-match'
  | 'no-suitable-match'
  | 'ambiguous-match'
  | 'network'
  | 'service';

/** One tied top-scoring variant, offered to the practitioner to choose between. */
export interface AmbiguousCandidate {
  id: string;
  score: number;
  /** Slots already filled against this profile, so the practitioner can preview before picking. */
  draftText: string;
}

export class PersonaliseError extends Error {
  constructor(
    public kind: PersonaliseErrorKind,
    message: string,
    public candidates?: AmbiguousCandidate[],
  ) {
    super(message);
  }
}

function splitList(value: string): string[] {
  return value
    .split(/[,;]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

/** Crude heuristic — real content will tag comfort level directly once authored per-participant. */
function deriveComfortLevel(comfortThreshold: string): ComfortLevel {
  const text = comfortThreshold.toLowerCase();
  if (/\blow\b|minimal|one new|rarely/.test(text)) return 'low';
  if (/\bhigh\b|lots of|frequent|very adaptable/.test(text)) return 'high';
  return 'medium';
}

export function scoreVariant(variant: PersonalisationRecord, profile: ParticipantProfile): number {
  let score = 0;

  const profileInterests = splitList(profile.interests);
  for (const tag of variant.tags.interests ?? []) {
    if (profileInterests.some((interest) => interest.includes(tag.toLowerCase()))) {
      score += 2;
    }
  }

  const method = profile.communicationMethod.toLowerCase();
  for (const tag of variant.tags.communicationMethod ?? []) {
    if (method.includes(tag.toLowerCase())) {
      score += 3;
    }
  }

  if (variant.tags.comfortThreshold && profile.comfortThreshold) {
    if (variant.tags.comfortThreshold === deriveComfortLevel(profile.comfortThreshold)) {
      score += 1;
    }
  }

  return score;
}

/**
 * Which of the fields this variant is tagged on were actually satisfied by
 * the profile, and which were considered but absent — surfaced to the
 * practitioner so a match isn't a black box. Kept separate from
 * `scoreVariant` so the point totals above are untouched.
 */
function fieldMatch(
  variant: PersonalisationRecord,
  profile: ParticipantProfile,
): { matchedFields: string[]; missingFields: string[] } {
  const matchedFields: string[] = [];
  const consideredFields: string[] = [];

  if ((variant.tags.interests ?? []).length > 0) {
    consideredFields.push('interests');
    const profileInterests = splitList(profile.interests);
    const hit = (variant.tags.interests ?? []).some((tag) =>
      profileInterests.some((interest) => interest.includes(tag.toLowerCase())),
    );
    if (hit) matchedFields.push('interests');
  }

  if ((variant.tags.communicationMethod ?? []).length > 0) {
    consideredFields.push('communicationMethod');
    const method = profile.communicationMethod.toLowerCase();
    const hit = (variant.tags.communicationMethod ?? []).some((tag) => method.includes(tag.toLowerCase()));
    if (hit) matchedFields.push('communicationMethod');
  }

  if (variant.tags.comfortThreshold) {
    consideredFields.push('comfortThreshold');
    if (profile.comfortThreshold && variant.tags.comfortThreshold === deriveComfortLevel(profile.comfortThreshold)) {
      matchedFields.push('comfortThreshold');
    }
  }

  return {
    matchedFields,
    missingFields: consideredFields.filter((field) => !matchedFields.includes(field)),
  };
}

export function fillTemplate(template: string, profile: ParticipantProfile): string {
  const firstInterest = splitList(profile.interests)[0];
  const slots: Record<string, string> = {
    communicationMethod: profile.communicationMethod || 'their usual communication method',
    routine: profile.dailyRoutineNotes || 'their usual routine',
    interest: firstInterest || 'a preferred activity',
    comfortThreshold: profile.comfortThreshold || 'their usual pace',
  };
  return template.replace(/{{\s*(\w+)\s*}}/g, (match, key: string) => slots[key] ?? match);
}

export interface PersonalisedMatch {
  draftText: string;
  matchedFields: string[];
  missingFields: string[];
}

export function matchPersonalisedVariant(strategy: StrategyTemplate, profile: ParticipantProfile): PersonalisedMatch {
  const variants = strategy.personalisationRecords ?? [];
  if (variants.length === 0) {
    throw new PersonaliseError(
      'no-variant-match',
      'No pre-authored variant exists for this strategy yet.',
    );
  }

  const scored = variants.map((variant) => ({ variant, score: scoreVariant(variant, profile) }));
  const maxScore = Math.max(...scored.map((s) => s.score));

  // A score of 0 means nothing about this profile matched any variant's tags
  // — picking one anyway would silently hand back an arbitrary, unvetted
  // suggestion. Abstain instead.
  if (maxScore === 0) {
    throw new PersonaliseError(
      'no-suitable-match',
      "None of this strategy's pre-authored variants fit this participant's profile well enough to suggest one.",
    );
  }

  const topCandidates = scored.filter((s) => s.score === maxScore);
  // A tie used to silently resolve to array order. Now it's the
  // practitioner's call, not the library's.
  if (topCandidates.length > 1) {
    throw new PersonaliseError(
      'ambiguous-match',
      'Multiple variants matched this profile equally well.',
      topCandidates.map((c) => ({
        id: c.variant.id,
        score: c.score,
        draftText: fillTemplate(c.variant.template, profile),
      })),
    );
  }

  const best = topCandidates[0].variant;
  const { matchedFields, missingFields } = fieldMatch(best, profile);
  return { draftText: fillTemplate(best.template, profile), matchedFields, missingFields };
}

/**
 * Dev-only outcomes for exercising all three states without needing real
 * variant content in place. Only ever read when `import.meta.env.DEV` is
 * true — see `PersonaliseFlow`'s DEV-gated "Simulate" control.
 */
export type PersonaliseSimulation = 'success' | PersonaliseErrorKind;

export function requestPersonalisedVariant(
  strategy: StrategyTemplate,
  profile: ParticipantProfile,
  simulate?: PersonaliseSimulation,
): PersonalisedMatch {
  if (import.meta.env.DEV && simulate && simulate !== 'success') {
    if (simulate === 'no-variant-match') {
      throw new PersonaliseError(
        'no-variant-match',
        'No pre-authored variant exists for this strategy yet.',
      );
    }
    if (simulate === 'no-suitable-match') {
      throw new PersonaliseError(
        'no-suitable-match',
        "None of this strategy's pre-authored variants fit this participant's profile well enough to suggest one.",
      );
    }
    if (simulate === 'ambiguous-match') {
      throw new PersonaliseError('ambiguous-match', 'Multiple variants matched this profile equally well.', [
        { id: 'sim-a', score: 3, draftText: fillTemplate('During {{routine}}, offer {{interest}}-themed choices.', profile) },
        { id: 'sim-b', score: 3, draftText: fillTemplate('Use {{communicationMethod}} to introduce {{interest}} during {{routine}}.', profile) },
      ]);
    }
    if (simulate === 'network') {
      throw new PersonaliseError('network', 'Your connection dropped before the match came back.');
    }
    throw new PersonaliseError('service', "The matching step didn't respond.");
  }
  return matchPersonalisedVariant(strategy, profile);
}
