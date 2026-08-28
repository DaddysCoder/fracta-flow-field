import type { ParticipantProfile } from '../lib/participant-profile/types';
import type { ComfortLevel, PersonalisedVariant, Strategy } from '../lib/strategy-library/types';

/**
 * Local, deterministic personalisation: scores this strategy's pre-authored
 * variants against the participant profile and fills the winning template's
 * slots. No network call, no model, no cost — every word a practitioner reads
 * was written by a person ahead of time.
 */
export type PersonaliseErrorKind = 'no-variant-match' | 'network' | 'service';

export class PersonaliseError extends Error {
  constructor(public kind: PersonaliseErrorKind, message: string) {
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

export function scoreVariant(variant: PersonalisedVariant, profile: ParticipantProfile): number {
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

export function matchPersonalisedVariant(strategy: Strategy, profile: ParticipantProfile): string {
  const variants = strategy.variants ?? [];
  if (variants.length === 0) {
    throw new PersonaliseError(
      'no-variant-match',
      'No pre-authored variant exists for this strategy yet.',
    );
  }
  const best = variants.reduce((a, b) => (scoreVariant(b, profile) > scoreVariant(a, profile) ? b : a));
  return fillTemplate(best.template, profile);
}

/**
 * Dev-only outcomes for exercising all three states without needing real
 * variant content in place. Only ever read when `import.meta.env.DEV` is
 * true — see `PersonaliseFlow`'s DEV-gated "Simulate" control.
 */
export type PersonaliseSimulation = 'success' | PersonaliseErrorKind;

export function requestPersonalisedVariant(
  strategy: Strategy,
  profile: ParticipantProfile,
  simulate?: PersonaliseSimulation,
): string {
  if (import.meta.env.DEV && simulate && simulate !== 'success') {
    if (simulate === 'no-variant-match') {
      throw new PersonaliseError(
        'no-variant-match',
        'No pre-authored variant exists for this strategy yet.',
      );
    }
    if (simulate === 'network') {
      throw new PersonaliseError('network', 'Your connection dropped before the match came back.');
    }
    throw new PersonaliseError('service', "The matching step didn't respond.");
  }
  return matchPersonalisedVariant(strategy, profile);
}
