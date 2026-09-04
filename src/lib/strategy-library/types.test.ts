import { describe, expect, it } from 'vitest';
import { resolveCurrentTemplate, type StrategyTemplate } from './types';

function template(overrides: Partial<StrategyTemplate>): StrategyTemplate {
  return {
    id: overrides.templateId ?? 'x',
    templateId: 'x',
    name: 'Test strategy',
    shortDescription: '',
    evidenceTier: 'Strong',
    evidenceAuthorityTier: 1,
    strategyCategories: ['learning'],
    responsive: false,
    mechanism: '',
    citation: '',
    citationShort: '',
    howToUse: [],
    personalisationRecords: [],
    version: 1,
    approvalStatus: 'approved',
    effectiveDate: '2026-01-01',
    current: true,
    ...overrides,
  };
}

describe('resolveCurrentTemplate', () => {
  it('returns the template itself when it is already current', () => {
    const t = template({ templateId: 'fct', current: true });
    expect(resolveCurrentTemplate('fct', [t])).toBe(t);
  });

  it('walks a supersession chain to the current version', () => {
    const v1 = template({ templateId: 'fct-v1', version: 1, current: false, supersededBy: 'fct-v2' });
    const v2 = template({ templateId: 'fct-v2', version: 2, current: false, supersededBy: 'fct-v3' });
    const v3 = template({ templateId: 'fct-v3', version: 3, current: true });

    expect(resolveCurrentTemplate('fct-v1', [v1, v2, v3])).toBe(v3);
    expect(resolveCurrentTemplate('fct-v2', [v1, v2, v3])).toBe(v3);
  });

  it('does not hang on a cyclical chain', () => {
    const a = template({ templateId: 'a', current: false, supersededBy: 'b' });
    const b = template({ templateId: 'b', current: false, supersededBy: 'a' });

    expect(resolveCurrentTemplate('a', [a, b])).toBeDefined();
  });

  it('returns undefined for an unknown templateId', () => {
    expect(resolveCurrentTemplate('missing', [])).toBeUndefined();
  });
});
