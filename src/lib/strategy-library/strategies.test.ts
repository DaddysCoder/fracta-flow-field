import { describe, expect, it } from 'vitest';
import { getStrategyById, listVisibleStrategies, STRATEGIES } from './strategies';

describe('the FIELD gating model approval gate, applied to real seed data', () => {
  it('every seeded strategy is approved and current today, so the gate is currently a no-op', () => {
    for (const s of STRATEGIES) {
      expect(s.approvalStatus).toBe('approved');
      expect(s.current).toBe(true);
    }
  });

  it('listVisibleStrategies returns every seeded strategy while all are approved+current', () => {
    expect(listVisibleStrategies()).toHaveLength(STRATEGIES.length);
  });

  it('getStrategyById returns undefined for an unknown id', () => {
    expect(getStrategyById('not-a-real-strategy')).toBeUndefined();
  });

  it('getStrategyById returns every seeded id (all are approved+current)', () => {
    for (const s of STRATEGIES) {
      expect(getStrategyById(s.id)?.id).toBe(s.id);
    }
  });
});
