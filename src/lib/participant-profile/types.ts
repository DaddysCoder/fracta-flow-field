export interface ParticipantProfile {
  id: string;
  preferredName: string;
  communicationMethod: string;
  dailyRoutineNotes: string;
  /** What the participant is into — the actual differentiator for personalised delivery wording. */
  interests: string;
  /** How much novelty/change this participant can tolerate in a given session. */
  comfortThreshold: string;
  /** Present only when the profile is read-only data pulled from a connected suite (e.g. Frame). */
  source?: {
    suite: string;
    syncedAt: string;
  };
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
