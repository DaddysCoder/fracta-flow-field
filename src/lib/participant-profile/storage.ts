import type { ParticipantProfile } from './types';

const STORAGE_KEY = 'field.participant-profile.v1';

const DEMO_STANDALONE: ParticipantProfile = {
  id: 'demo-participant',
  preferredName: 'Jordan',
  communicationMethod: '',
  dailyRoutineNotes: '',
};

const DEMO_SUITE_CONNECTED: ParticipantProfile = {
  id: 'demo-participant',
  preferredName: 'Jordan',
  communicationMethod: 'Key word signing + AAC device',
  dailyRoutineNotes: 'Structured morning routine, 1:1 support 8–11am',
  source: {
    suite: 'Frame',
    syncedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
};

export function loadProfile(suiteConnected: boolean): ParticipantProfile {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ParticipantProfile;
  } catch {
    // ignore corrupt storage, fall through to demo data
  }
  return suiteConnected ? DEMO_SUITE_CONNECTED : DEMO_STANDALONE;
}

export function saveProfile(profile: ParticipantProfile): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}
