/**
 * Detects whether this session has a connected suite profile (e.g. Frame) vs.
 * standalone. This is a placeholder boundary — production should call the same
 * cross-tool-read mechanism Frame's "Vector instrument import" already uses,
 * not a bespoke check. Swap this implementation once that shared mechanism is
 * identified; nothing else in the app should need to change.
 */
const FLAG_KEY = 'field.suite-connected.v1';

export function isSuiteConnected(): boolean {
  const params = new URLSearchParams(window.location.search);
  if (params.has('suite')) {
    const value = params.get('suite') === 'frame';
    window.localStorage.setItem(FLAG_KEY, String(value));
    return value;
  }
  return window.localStorage.getItem(FLAG_KEY) === 'true';
}

export function setSuiteConnected(connected: boolean): void {
  window.localStorage.setItem(FLAG_KEY, String(connected));
}
