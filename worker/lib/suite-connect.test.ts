import { describe, expect, it } from 'vitest';
import { buildAuthorizeUrl, createConnectState, verifyConnectState, type ProviderOAuthConfig } from './suite-connect';

const CONFIG: ProviderOAuthConfig = {
  clientId: 'client-123',
  clientSecret: 'shh',
  authorizeUrl: 'https://frame.example/oauth/authorize',
  tokenUrl: 'https://frame.example/oauth/token',
  scope: 'profile.read',
};

describe('connect state token', () => {
  it('round-trips a valid state', async () => {
    const state = await createConnectState('jordan@example.com', 'frame', 'test-secret');
    const payload = await verifyConnectState(state, 'test-secret');
    expect(payload).toEqual({ email: 'jordan@example.com', provider: 'frame', exp: payload!.exp });
  });

  it('rejects a state signed with a different secret', async () => {
    const state = await createConnectState('jordan@example.com', 'frame', 'test-secret');
    expect(await verifyConnectState(state, 'wrong-secret')).toBeNull();
  });

  it('rejects malformed state', async () => {
    expect(await verifyConnectState('not-a-token', 'test-secret')).toBeNull();
  });
});

describe('buildAuthorizeUrl', () => {
  it('includes client id, redirect uri, state and scope', () => {
    const url = new URL(buildAuthorizeUrl(CONFIG, 'https://field.whatbit.dev/api/connect/frame/callback', 'the-state'));
    expect(url.origin + url.pathname).toBe('https://frame.example/oauth/authorize');
    expect(url.searchParams.get('client_id')).toBe('client-123');
    expect(url.searchParams.get('redirect_uri')).toBe('https://field.whatbit.dev/api/connect/frame/callback');
    expect(url.searchParams.get('state')).toBe('the-state');
    expect(url.searchParams.get('scope')).toBe('profile.read');
    expect(url.searchParams.get('response_type')).toBe('code');
  });
});
