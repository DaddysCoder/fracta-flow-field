import { beforeEach, describe, expect, it } from 'vitest';

/**
 * `storage.ts` reads `window.localStorage` directly (this app has no jsdom
 * dependency — it's a Cloudflare Worker + static SPA, not a component-test
 * setup) so this test provides a minimal in-memory stand-in and simulates
 * the real upgrade scenario: pre-alignment (v1) data already on disk, new
 * (v2-aware) code deployed on top of it.
 */
function makeMemoryLocalStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  } as Storage;
}

describe('participant profile storage migration (old data + new code)', () => {
  beforeEach(() => {
    (globalThis as unknown as { window: Window }).window = {
      localStorage: makeMemoryLocalStorage(),
    } as unknown as Window;
  });

  it('reads a v1 record left on disk by the pre-alignment app, upgrades it, and re-persists under the v2 key without data loss', async () => {
    const win = (globalThis as unknown as { window: Window }).window;
    const legacyProfile = {
      id: 'demo-participant',
      preferredName: 'Jordan',
      communicationMethod: 'Key word signing + AAC device',
      dailyRoutineNotes: 'Structured morning routine, 1:1 support 8–11am',
      interests: 'Trains, fidget toys, water play',
      comfortThreshold: 'Tolerates one new routine change per week',
    };
    win.localStorage.setItem('field.participant-profile.v1', JSON.stringify(legacyProfile));

    const { loadProfile } = await import('./storage');
    const profile = loadProfile(false);

    // No crash, no data loss.
    expect(profile.preferredName).toBe('Jordan');
    expect(profile.communicationMethod).toBe(legacyProfile.communicationMethod);
    expect(profile.dailyRoutineNotes).toBe(legacyProfile.dailyRoutineNotes);
    expect(profile.interests).toBe(legacyProfile.interests);
    expect(profile.comfortThreshold).toBe(legacyProfile.comfortThreshold);
    expect(profile.eligibilityFilters).toEqual({ culturalSafetyFlags: [], excludedSupportTypes: [] });
    expect(profile.schemaVersion).toBe(2);

    // Legacy key is left alone (rollback-safe); the migrated record is
    // persisted under the new key so this only runs once.
    expect(win.localStorage.getItem('field.participant-profile.v1')).not.toBeNull();
    const persisted = JSON.parse(win.localStorage.getItem('field.participant-profile.v2')!);
    expect(persisted.preferredName).toBe('Jordan');

    // Second load reads the already-migrated v2 record directly.
    const second = loadProfile(false);
    expect(second.preferredName).toBe('Jordan');
  });

  it('falls back to demo data, without crashing, when storage has no profile at all', async () => {
    const { loadProfile } = await import('./storage');
    const profile = loadProfile(false);
    expect(profile.id).toBe('demo-participant');
    expect(profile.schemaVersion).toBe(2);
  });

  it('falls back to demo data, without crashing, on corrupt storage', async () => {
    const win = (globalThis as unknown as { window: Window }).window;
    win.localStorage.setItem('field.participant-profile.v2', '{not json');
    win.localStorage.setItem('field.participant-profile.v1', '{also not json');

    const { loadProfile } = await import('./storage');
    expect(() => loadProfile(true)).not.toThrow();
    const profile = loadProfile(true);
    expect(profile.id).toBe('demo-participant');
  });
});
