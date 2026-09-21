import { describe, expect, it } from 'vitest';
import { acknowledge, isAcknowledged } from './intrusive-ack';

function makeMemoryStorage(): Storage {
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
  };
}

describe('intrusive-ack', () => {
  it('is not acknowledged until acknowledge() is called', () => {
    const storage = makeMemoryStorage();
    expect(isAcknowledged(storage, 'demand-fading')).toBe(false);
  });

  it('is acknowledged after acknowledge()', () => {
    const storage = makeMemoryStorage();
    acknowledge(storage, 'demand-fading');
    expect(isAcknowledged(storage, 'demand-fading')).toBe(true);
  });

  it('acknowledging one strategy does not acknowledge another', () => {
    const storage = makeMemoryStorage();
    acknowledge(storage, 'demand-fading');
    expect(isAcknowledged(storage, 'some-other-strategy')).toBe(false);
  });
});
