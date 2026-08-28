const TOKEN_KEY = 'field.auth-token.v1';

export function getAuthToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {}

async function request<T>(path: string, options: RequestInit = {}, auth = false): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (auth) {
    const token = getAuthToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`/api${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError((body as { error?: string }).error ?? 'Something went wrong.');
  return body as T;
}

export function requestLoginCode(email: string): Promise<{ ok: true }> {
  return request('/auth/request-code', { method: 'POST', body: JSON.stringify({ email }) });
}

export function verifyLoginCode(email: string, code: string): Promise<{ token: string; email: string }> {
  return request('/auth/verify-code', { method: 'POST', body: JSON.stringify({ email, code }) });
}

export interface EntitlementResponse {
  email: string;
  plan: 'free' | 'pro';
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'none';
  currentPeriodEnd: string | null;
}

export function fetchEntitlement(): Promise<EntitlementResponse> {
  return request('/entitlement', {}, true);
}

export function startCheckout(interval: 'month' | 'year'): Promise<{ url: string }> {
  return request('/checkout', { method: 'POST', body: JSON.stringify({ interval }) }, true);
}

export function openBillingPortal(): Promise<{ url: string }> {
  return request('/billing-portal', { method: 'POST' }, true);
}
