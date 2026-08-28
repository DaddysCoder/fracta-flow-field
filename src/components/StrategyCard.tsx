import { Link } from 'react-router-dom';
import type { Strategy } from '../lib/strategy-library/types';
import { EvidenceBadge, FunctionTag } from './EvidenceBadge';

export function StrategyCard({ strategy }: { strategy: Strategy }) {
  return (
    <Link
      to={`/strategy/${strategy.id}`}
      className="bg-white rounded-card px-6 py-[22px] shadow-card flex justify-between gap-5 flex-wrap focus-ring hover:shadow-none transition-shadow duration-100"
    >
      <div className="max-w-[600px]">
        <div className="font-bold text-[17px] mb-1.5 text-ink">{strategy.name}</div>
        <div className="text-[13.5px] text-secondary leading-snug">{strategy.shortDescription}</div>
      </div>
      <div className="flex gap-2.5 items-start flex-none pt-0.5">
        <EvidenceBadge tier={strategy.evidenceTier} />
        <FunctionTag label={strategy.function} />
      </div>
    </Link>
  );
}
