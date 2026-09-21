/**
 * Session-scoped acknowledgement for `IntrusiveProcedureGate` — a
 * practitioner confirms once per browser session (cleared on tab close,
 * unlike `localStorage`) that less intrusive options were tried and this
 * is authorised, rather than re-confirming on every navigation within the
 * same visit. Takes a `Storage`-like param (not `window.sessionStorage`
 * directly) so it can be tested with an in-memory stand-in, same pattern as
 * `participant-profile/storage.ts`.
 */
const PREFIX = 'field.intrusive-ack.v1.';

export function isAcknowledged(storage: Pick<Storage, 'getItem'>, strategyId: string): boolean {
  return storage.getItem(PREFIX + strategyId) === 'true';
}

export function acknowledge(storage: Pick<Storage, 'setItem'>, strategyId: string): void {
  storage.setItem(PREFIX + strategyId, 'true');
}
