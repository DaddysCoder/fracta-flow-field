import type { EvidenceTier, StrategyCategory } from '../lib/strategy-library/types';

export function EvidenceBadge({ tier }: { tier: EvidenceTier }) {
  return (
    <span className="font-mono text-[11.5px] font-medium text-accent">{tier} evidence</span>
  );
}

export const CATEGORY_LABELS: Record<StrategyCategory, string> = {
  environmental: 'Environmental',
  community: 'Community',
  communication: 'Communication',
  regulating: 'Regulating',
  health_wellbeing: 'Health & wellbeing',
  learning: 'Learning',
};

export function CategoryTags({ categories }: { categories: StrategyCategory[] }) {
  if (categories.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {categories.map((c) => (
        <span key={c} className="font-mono text-[11.5px] font-medium text-tertiary">
          {CATEGORY_LABELS[c]}
        </span>
      ))}
    </div>
  );
}

export function ResponsiveTag() {
  return (
    <span className="font-mono text-[11.5px] font-semibold text-amber-700">Responsive</span>
  );
}

const TIER_ORDER: EvidenceTier[] = ['Strong', 'Emerging', 'Practice-based'];

export function EvidenceTierFilter({
  active,
  onChange,
}: {
  active: EvidenceTier | null;
  onChange: (tier: EvidenceTier | null) => void;
}) {
  return (
    <div className="flex gap-1.5 items-center">
      <span className="font-mono text-[10.5px] text-tertiary font-medium tracking-wider mr-0.5">
        EVIDENCE
      </span>
      {TIER_ORDER.map((tier) => {
        const selected = active === tier;
        return (
          <button
            key={tier}
            type="button"
            onClick={() => onChange(selected ? null : tier)}
            className={`px-3 py-[5px] rounded-full font-mono text-[11.5px] font-medium focus-ring transition-colors duration-100 ${
              selected ? 'bg-accent text-white' : 'text-muted hover:text-ink'
            }`}
          >
            {tier}
          </button>
        );
      })}
    </div>
  );
}
