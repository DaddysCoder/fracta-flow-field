/**
 * OAuth-style "connect" scaffold for the two other WhatBit products the
 * paywall's "Pro suite" row offers to link — Frame and Vector. Neither
 * product's real OAuth app (client id/secret, authorize/token URLs) exists
 * yet, so this only builds the plumbing: a signed state token binding the
 * flow to a signed-in email, an authorize-URL builder, a code→token
 * exchange, and KV storage of the resulting connection record. Point
 * `FRAME_OAUTH_*` / `VECTOR_OAUTH_*` at the real endpoints once they exist —
 * nothing else here should need to change.
 */
import type { Env } from '../types';

export type SuiteProvider = 'frame' | 'vector';

export function isSuiteProvider(value: string): value is SuiteProvider {
  return value === 'frame' || value === 'vector';
}

export interface ProviderOAuthConfig {
  clientId: string;
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  scope: string;
}

/** Returns null when this provider's OAuth app hasn't been configured yet. */
export function getProviderConfig(env: Env, provider: SuiteProvider): ProviderOAuthConfig | null {
  const prefix = provider === 'frame' ? 'FRAME_OAUTH' : 'VECTOR_OAUTH';
  const clientId = env[`${prefix}_CLIENT_ID` as keyof Env] as string | undefined;
  const clientSecret = env[`${prefix}_CLIENT_SECRET` as keyof Env] as string | undefined;
  const authorizeUrl = env[`${prefix}_AUTHORIZE_URL` as keyof Env] as string | undefined;
  const tokenUrl = env[`${prefix}_TOKEN_URL` as keyof Env] as string | undefined;
  const scope = (env[`${prefix}_SCOPE` as keyof Env] as string | undefined) ?? 'profile.read';

  if (!clientId || !clientSecret || !authorizeUrl || !tokenUrl) return null;
  return { clientId, clientSecret, authorizeUrl, tokenUrl, scope };
}

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = '';
  for (const byte of arr) str += String.fromCharCode(byte);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const str = atob(padded);
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) arr[i] = str.charCodeAt(i);
  return arr;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

const STATE_TTL_MS = 10 * 60 * 1000; // 10 minutes — just long enough for the redirect round trip.

interface StatePayload {
  email: string;
  provider: SuiteProvider;
  exp: number;
}

/** Binds the OAuth redirect round trip to the signed-in email so the callback can't be forged or replayed against a different account. */
export async function createConnectState(email: string, provider: SuiteProvider, secret: string): Promise<string> {
  const payload: StatePayload = { email, provider, exp: Date.now() + STATE_TTL_MS };
  const payloadB64 = toBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await hmacKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64));
  return `${payloadB64}.${toBase64Url(signature)}`;
}

export async function verifyConnectState(state: string, secret: string): Promise<StatePayload | null> {
  const [payloadB64, sigB64] = state.split('.');
  if (!payloadB64 || !sigB64) return null;

  const key = await hmacKey(secret);
  const valid = await crypto.subtle.verify('HMAC', key, fromBase64Url(sigB64), new TextEncoder().encode(payloadB64));
  if (!valid) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64))) as StatePayload;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function buildAuthorizeUrl(config: ProviderOAuthConfig, redirectUri: string, state: string): string {
  const url = new URL(config.authorizeUrl);
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', config.scope);
  url.searchParams.set('state', state);
  return url.toString();
}

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

export async function exchangeCodeForToken(
  config: ProviderOAuthConfig,
  code: string,
  redirectUri: string,
): Promise<TokenResponse> {
  const res = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
  });
  if (!res.ok) throw new Error(`${config.tokenUrl} responded ${res.status}`);
  return (await res.json()) as TokenResponse;
}

export interface SuiteConnection {
  provider: SuiteProvider;
  connectedAt: string;
  expiresAt: string | null;
}

function connectionKey(provider: SuiteProvider, email: string): string {
  return `suite-connection:${provider}:${email.trim().toLowerCase()}`;
}

export async function storeConnection(
  env: Env,
  email: string,
  provider: SuiteProvider,
  token: TokenResponse,
): Promise<void> {
  const connection: SuiteConnection = {
    provider,
    connectedAt: new Date().toISOString(),
    expiresAt: token.expires_in ? new Date(Date.now() + token.expires_in * 1000).toISOString() : null,
  };
  // Access/refresh tokens are kept out of the record this endpoint returns to
  // the browser — stored server-side only, alongside the connection metadata.
  await env.FIELD_KV.put(
    connectionKey(provider, email),
    JSON.stringify({ ...connection, accessToken: token.access_token, refreshToken: token.refresh_token ?? null }),
  );
}

export async function getConnection(env: Env, email: string, provider: SuiteProvider): Promise<SuiteConnection | null> {
  const raw = await env.FIELD_KV.get(connectionKey(provider, email));
  if (!raw) return null;
  const stored = JSON.parse(raw) as SuiteConnection & { accessToken: string; refreshToken: string | null };
  return { provider: stored.provider, connectedAt: stored.connectedAt, expiresAt: stored.expiresAt };
}

export async function removeConnection(env: Env, email: string, provider: SuiteProvider): Promise<void> {
  await env.FIELD_KV.delete(connectionKey(provider, email));
}
