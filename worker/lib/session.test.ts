import { describe, expect, it } from 'vitest';
import { createSessionToken, verifySessionToken } from './session';

describe('session tokens', () => {
  it('round-trips a valid token', async () => {
    const token = await createSessionToken('jordan@example.com', 'test-secret');
    const email = await verifySessionToken(token, 'test-secret');
    expect(email).toBe('jordan@example.com');
  });

  it('rejects a token signed with a different secret', async () => {
    const token = await createSessionToken('jordan@example.com', 'test-secret');
    const email = await verifySessionToken(token, 'wrong-secret');
    expect(email).toBeNull();
  });

  it('rejects a tampered payload', async () => {
    const token = await createSessionToken('jordan@example.com', 'test-secret');
    const [, sig] = token.split('.');
    const tampered = `${btoa(JSON.stringify({ email: 'attacker@example.com', exp: Date.now() + 1e9 }))}.${sig}`;
    const email = await verifySessionToken(tampered, 'test-secret');
    expect(email).toBeNull();
  });

  it('rejects malformed tokens', async () => {
    expect(await verifySessionToken('not-a-token', 'test-secret')).toBeNull();
    expect(await verifySessionToken('', 'test-secret')).toBeNull();
  });
});
