import { describe, expect, it } from 'vitest';
import {
  applicableFunctionsOf,
  isApprovedCurrent,
  requiresIntrusiveGate,
  resolveCurrentTemplate,
  type StrategyTemplate,
} from './types';

function template(overrides: Partial<StrategyTemplate>): StrategyTemplate {
  return {
    id: overrides.templateId ?? 'x',
    templateId: 'x',
    name: 'Test strategy',
    shortDescription: '',
    evidenceTier: 'Strong',
    evidenceAuthorityTier: 1,
    function: 'Attention',
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

describe('applicableFunctionsOf', () => {
  it("falls back to just `function` when `applicableFunctions` isn't set", () => {
    const t = template({ function: 'Attention' });
    expect(applicableFunctionsOf(t)).toEqual(['Attention']);
  });

  it('returns `applicableFunctions` when a strategy spans more than one function', () => {
    const t = template({ function: 'Attention', applicableFunctions: ['Attention', 'Escape/avoidance'] });
    expect(applicableFunctionsOf(t)).toEqual(['Attention', 'Escape/avoidance']);
  });
});

describe('isApprovedCurrent — the FIELD gating model approval gate', () => {
  it('is true for an approved, current strategy', () => {
    expect(isApprovedCurrent(template({ approvalStatus: 'approved', current: true }))).toBe(true);
  });

  it.each(['draft', 'pending-review', 'retired'] as const)(
    'is false for a %s strategy even when current',
    (approvalStatus) => {
      expect(isApprovedCurrent(template({ approvalStatus, current: true }))).toBe(false);
    },
  );

  it('is false for an approved strategy that is not the current version', () => {
    expect(isApprovedCurrent(template({ approvalStatus: 'approved', current: false }))).toBe(false);
  });
});

describe('requiresIntrusiveGate — the FIELD gating model intrusiveness gate', () => {
  it('is false when unset (the default for every strategy today)', () => {
    expect(requiresIntrusiveGate(template({}))).toBe(false);
  });

  it("is false for 'standard'", () => {
    expect(requiresIntrusiveGate(template({ intrusivenessTier: 'standard' }))).toBe(false);
  });

  it("is true for 'more-intrusive'", () => {
    expect(requiresIntrusiveGate(template({ intrusivenessTier: 'more-intrusive' }))).toBe(true);
  });
});
