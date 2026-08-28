export interface ParticipantProfile {
  id: string;
  preferredName: string;
  communicationMethod: string;
  dailyRoutineNotes: string;
  /** Present only when the profile is read-only data pulled from a connected suite (e.g. Frame). */
  source?: {
    suite: string;
    syncedAt: string;
  };
}

/** Fields the AI-personalise step needs. Missing any of these triggers the "AI unavailable" state. */
export const REQUIRED_FOR_PERSONALISATION: (keyof ParticipantProfile)[] = [
  'communicationMethod',
  'dailyRoutineNotes',
];

export function missingPersonalisationFields(profile: ParticipantProfile | null): string[] {
  if (!profile) return ['daily routine', 'communication method'];
  return REQUIRED_FOR_PERSONALISATION.filter((field) => !profile[field]?.toString().trim()).map(
    (field) => (field === 'communicationMethod' ? 'communication method' : 'daily routine'),
  );
}
