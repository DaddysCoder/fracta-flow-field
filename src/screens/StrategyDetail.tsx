import { Link, useParams } from 'react-router-dom';
import { getStrategyById } from '../lib/strategy-library/strategies';
import { EvidenceBadge, FunctionTag } from '../components/EvidenceBadge';

export function StrategyDetail() {
  const { id } = useParams();
  const strategy = id ? getStrategyById(id) : undefined;

  if (!strategy) {
    return (
      <div className="px-5 sm:px-14 pt-32 max-w-[1040px] mx-auto">
        <p className="text-secondary">Strategy not found.</p>
        <Link to="/" className="text-accent font-semibold text-sm">
          &larr; Back to browser
        </Link>
      </div>
    );
  }

  return (
    <div className="px-5 sm:px-14 py-24 max-w-[1040px] mx-auto bg-surface">
      <div className="font-mono text-[11.5px] tracking-[0.1em] text-accent font-medium mb-4">
        STRATEGY DETAIL
      </div>
      <h1 className="font-bold text-[clamp(26px,3.4vw,34px)] tracking-tight mb-2.5">
        Mechanism and citation, always in view.
      </h1>
      <p className="text-[15px] text-secondary mb-10 max-w-[560px] leading-relaxed">
        Never behind a collapsed section.
      </p>

      <div className="bg-white rounded-card-lg p-6 sm:p-9 max-w-[760px] shadow-card">
        <div className="flex gap-3 mb-4">
          <EvidenceBadge tier={strategy.evidenceTier} />
          <FunctionTag label={strategy.function} />
        </div>
        <h2 className="font-bold text-2xl tracking-tight mb-6">{strategy.name}</h2>

        <div className="mb-5">
          <div className="font-mono text-[11px] tracking-[0.08em] text-tertiary font-medium mb-2">
            MECHANISM
          </div>
          <div className="text-[15px] text-ink-soft leading-relaxed">{strategy.mechanism}</div>
        </div>

        <div className="bg-white border-[1.5px] border-accent rounded-xl px-5 py-[18px] my-6 shadow-mech">
          <div className="font-mono text-[10.5px] tracking-[0.08em] text-accent font-semibold mb-2">
            CITATION &middot; PERMANENT SOURCE
          </div>
          <div className="font-mono text-[12.5px] text-ink-soft leading-snug">
            {strategy.citation}
          </div>
        </div>

        <div className="mb-6">
          <div className="font-mono text-[11px] tracking-[0.08em] text-tertiary font-medium mb-2.5">
            HOW TO USE
          </div>
          <div className="flex flex-col gap-2 text-[14.5px] text-ink-soft leading-relaxed">
            {strategy.howToUse.map((step, i) => (
              <div key={i}>
                {i + 1}. {step}
              </div>
            ))}
          </div>
        </div>

        <Link
          to={`/strategy/${strategy.id}/personalise`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-btn bg-accent text-white text-[13.5px] font-semibold focus-ring hover:bg-accent-hover transition-colors duration-100"
        >
          Personalise for a participant
        </Link>
      </div>
    </div>
  );
}
