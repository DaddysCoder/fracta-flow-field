import { useMemo, useState } from 'react';
import { STRATEGIES } from '../lib/strategy-library/strategies';
import type { EvidenceTier, StrategyCategory } from '../lib/strategy-library/types';
import { StrategyCard } from '../components/StrategyCard';
import { SupersededBand } from '../components/SupersededBand';
import { CATEGORY_LABELS, EvidenceTierFilter } from '../components/EvidenceBadge';

const CATEGORIES: StrategyCategory[] = [
  'environmental',
  'community',
  'communication',
  'regulating',
  'health_wellbeing',
  'learning',
];

export function StrategyBrowser() {
  const [tab, setTab] = useState<'category' | 'responsive'>('category');
  const [selectedCategories, setSelectedCategories] = useState<Set<StrategyCategory>>(
    () => new Set(),
  );
  const [tier, setTier] = useState<EvidenceTier | null>(null);

  function toggleCategory(cat: StrategyCategory) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const visible = useMemo(() => {
    return STRATEGIES.filter((s) => {
      if (tab === 'responsive' && !s.responsive) return false;
      if (tab === 'category' && s.responsive) return false;
      if (
        selectedCategories.size > 0 &&
        !s.strategyCategories.some((c) => selectedCategories.has(c))
      )
        return false;
      if (tier && s.evidenceTier !== tier) return false;
      return true;
    });
  }, [tab, selectedCategories, tier]);

  const superseded = visible.filter((s) => s.supersededInfo);
  const rest = visible.filter((s) => !s.supersededInfo);

  return (
    <div className="px-5 sm:px-14 pt-32 pb-24 max-w-[1040px] mx-auto">
      <div className="font-mono text-[11.5px] tracking-[0.1em] text-accent font-medium mb-4">
        STRATEGY LIBRARY
      </div>
      <h1 className="font-bold text-[clamp(26px,3.4vw,34px)] tracking-tight mb-2.5 leading-tight">
        Browse by strategy category.
      </h1>
      <p className="text-[15px] text-secondary mb-10 max-w-[560px] leading-relaxed">
        Responsive strategies live in their own tab &mdash; they never mix into the category
        filter, and personalising one requires an explicit acknowledgement first.
      </p>

      <div className="flex gap-7 border-b border-border-soft mb-7">
        <button
          type="button"
          onClick={() => setTab('category')}
          className={`pb-3 text-[14.5px] font-bold focus-ring ${
            tab === 'category' ? 'text-ink border-b-2 border-accent' : 'text-tertiary'
          }`}
        >
          By category
        </button>
        <button
          type="button"
          onClick={() => setTab('responsive')}
          className={`pb-3 text-[14.5px] font-semibold focus-ring ${
            tab === 'responsive' ? 'text-ink border-b-2 border-accent' : 'text-tertiary'
          }`}
        >
          Responsive strategies
        </button>
      </div>

      <div className="flex flex-wrap justify-between gap-4 mb-7">
        {tab === 'category' ? (
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const selected = selectedCategories.has(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-[13px] py-1.5 rounded-lg text-[12.5px] font-semibold focus-ring ${
                    selected
                      ? 'bg-ink text-white'
                      : 'bg-white border border-border text-muted hover:text-ink'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              );
            })}
          </div>
        ) : (
          <div />
        )}
        <EvidenceTierFilter active={tier} onChange={setTier} />
      </div>

      {superseded.map((s) => (
        <SupersededBand key={s.id} info={s.supersededInfo!} />
      ))}

      <div className="flex flex-col gap-3">
        {rest.map((s) => (
          <StrategyCard key={s.id} strategy={s} />
        ))}
        {superseded.map((s) => (
          <StrategyCard key={s.id} strategy={s} />
        ))}
        {visible.length === 0 && (
          <div className="text-secondary text-sm py-10 text-center">
            No strategies match these filters.
          </div>
        )}
      </div>
    </div>
  );
}
