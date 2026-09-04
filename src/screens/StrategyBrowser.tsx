import { useMemo, useState } from 'react';
import { STRATEGIES } from '../lib/strategy-library/strategies';
import type { BehaviourFunction, EvidenceTier } from '../lib/strategy-library/types';
import { StrategyCard } from '../components/StrategyCard';
import { SupersededBand } from '../components/SupersededBand';
import { EvidenceTierFilter } from '../components/EvidenceBadge';

const FUNCTIONS: BehaviourFunction[] = [
  'Attention',
  'Escape/avoidance',
  'Sensory',
  'Access to tangibles',
  'Communication',
];

export function StrategyBrowser() {
  const [tab, setTab] = useState<'function' | 'responsive'>('function');
  const [selectedFunctions, setSelectedFunctions] = useState<Set<BehaviourFunction>>(
    () => new Set(),
  );
  const [tier, setTier] = useState<EvidenceTier | null>(null);

  function toggleFunction(fn: BehaviourFunction) {
    setSelectedFunctions((prev) => {
      const next = new Set(prev);
      if (next.has(fn)) next.delete(fn);
      else next.add(fn);
      return next;
    });
  }

  const visible = useMemo(() => {
    return STRATEGIES.filter((s) => {
      if (tab === 'responsive' && !s.responsive) return false;
      if (tab === 'function' && s.responsive) return false;
      if (selectedFunctions.size > 0 && !selectedFunctions.has(s.function)) return false;
      if (tier && s.evidenceTier !== tier) return false;
      return true;
    });
  }, [tab, selectedFunctions, tier]);

  const superseded = visible.filter((s) => s.supersededInfo);
  const rest = visible.filter((s) => !s.supersededInfo);

  return (
    <div className="px-5 sm:px-14 pt-32 pb-24 max-w-[1040px] mx-auto">
      <div className="font-mono text-[11.5px] tracking-[0.1em] text-accent font-medium mb-4">
        STRATEGY LIBRARY
      </div>
      <h1 className="font-bold text-[clamp(26px,3.4vw,34px)] tracking-tight mb-2.5 leading-tight">
        Browse by behaviour function.
      </h1>
      <p className="text-[15px] text-secondary mb-10 max-w-[560px] leading-relaxed">
        Responsive strategies live in their own tab &mdash; they never mix into the function
        filter.
      </p>

      <div className="flex gap-7 border-b border-border-soft mb-7">
        <button
          type="button"
          onClick={() => setTab('function')}
          className={`pb-3 text-[14.5px] font-bold focus-ring ${
            tab === 'function' ? 'text-ink border-b-2 border-accent' : 'text-tertiary'
          }`}
        >
          By function
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
        {tab === 'function' ? (
          <div className="flex flex-wrap gap-2">
            {FUNCTIONS.map((fn) => {
              const selected = selectedFunctions.has(fn);
              return (
                <button
                  key={fn}
                  type="button"
                  onClick={() => toggleFunction(fn)}
                  className={`px-[13px] py-1.5 rounded-lg text-[12.5px] font-semibold focus-ring ${
                    selected
                      ? 'bg-ink text-white'
                      : 'bg-white border border-border text-muted hover:text-ink'
                  }`}
                >
                  {fn}
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
