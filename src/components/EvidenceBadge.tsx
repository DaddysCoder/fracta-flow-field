import type { EvidenceTier } from '../lib/strategy-library/types';

export function EvidenceBadge({ tier }: { tier: EvidenceTier }) {
  return (
    <span className="font-mono text-[11.5px] font-medium text-accent">{tier} evidence</span>
  );
}

export function FunctionTag({ label }: { label: string }) {
  return <span className="font-mono text-[11.5px] font-medium text-tertiary">{label}</span>;
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
