import type { ParticipantProfile } from '../lib/participant-profile/types';
import type { Strategy } from '../lib/strategy-library/types';

/**
 * Client-side stand-in for POST /api/personalize (strategy-library-server).
 * Mirrors the shipped contract: only whitelisted axes leave the client, the
 * mechanism/citation are never touched by the model, and failures are
 * classified into exactly these three buckets — never conflated.
 */
export type PersonaliseErrorKind = 'content-policy' | 'network' | 'service';

export class PersonaliseError extends Error {
  constructor(public kind: PersonaliseErrorKind, message: string) {
    super(message);
  }
}

/** The only participant-profile fields ever sent off-device for personalisation. */
const PERSONALISATION_AXIS_WHITELIST = ['communicationMethod', 'dailyRoutineNotes'] as const;

function pickWhitelistedAxes(profile: ParticipantProfile) {
  const picked: Record<string, string> = {};
  for (const key of PERSONALISATION_AXIS_WHITELIST) {
    picked[key] = profile[key];
  }
  return picked;
}

export type PersonaliseSimulation = 'success' | PersonaliseErrorKind;

export async function requestPersonalisedDraft(
  strategy: Strategy,
  capacityNote: string,
  profile: ParticipantProfile,
  simulate: PersonaliseSimulation = 'success',
): Promise<string> {
  // Whitelisting happens before anything leaves this function — the request
  // payload never carries more than these axes plus the free-text capacity note.
  const axes = pickWhitelistedAxes(profile);

  await new Promise((resolve) => setTimeout(resolve, 500));

  if (simulate === 'content-policy') {
    throw new PersonaliseError(
      'content-policy',
      "Our content policy blocked this draft, most likely from wording in the capacity note.",
    );
  }
  if (simulate === 'network') {
    throw new PersonaliseError('network', 'Your connection dropped before the draft came back.');
  }
  if (simulate === 'service') {
    throw new PersonaliseError('service', "The drafting service didn't respond.");
  }

  return draftFrom(strategy, capacityNote, axes);
}

function draftFrom(strategy: Strategy, capacityNote: string, axes: Record<string, string>): string {
  const notePhrase = capacityNote.trim()
    ? ` Given the noted capacity — "${capacityNote.trim()}" — favour the simpler tracking approach.`
    : '';
  const routine = axes.dailyRoutineNotes ? ` Fits within: ${axes.dailyRoutineNotes}.` : '';
  return `${strategy.shortDescription}${notePhrase}${routine}`.trim();
}
