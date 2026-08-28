const STORAGE_PREFIX = 'field.draft.v1.';

export interface SavedDraft {
  capacityNote: string;
  draftText: string;
  savedAt: string;
}

export function saveDraft(strategyId: string, draft: SavedDraft): void {
  window.localStorage.setItem(STORAGE_PREFIX + strategyId, JSON.stringify(draft));
}

export function loadDraft(strategyId: string): SavedDraft | null {
  const raw = window.localStorage.getItem(STORAGE_PREFIX + strategyId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SavedDraft;
  } catch {
    return null;
  }
}
