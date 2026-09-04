const STORAGE_PREFIX = 'field.draft.v1.';

export interface SavedDraft {
  capacityNote: string;
  draftText: string;
  savedAt: string;
  /**
   * `templateId`/`version` of the `StrategyTemplate` this draft was matched
   * against, and the participant it was matched for. Optional and additive
   * — existing v1 drafts on disk don't have these, no migration needed, and
   * every reader treats their absence as "unknown" rather than an error.
   * Carried so a future evidence-layer `PersonalisationRecord` can be built
   * from a saved draft without re-deriving this linkage.
   */
  templateId?: string;
  templateVersion?: number;
  participantRef?: string;
}

export function saveDraft(templateId: string, draft: SavedDraft): void {
  window.localStorage.setItem(STORAGE_PREFIX + templateId, JSON.stringify(draft));
}

export function loadDraft(templateId: string): SavedDraft | null {
  const raw = window.localStorage.getItem(STORAGE_PREFIX + templateId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SavedDraft;
  } catch {
    return null;
  }
}
