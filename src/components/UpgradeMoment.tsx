import { usePlan } from '../state/plan';

/** Triggered at the exact point a Free user clicks Generate. Evidence is never gated. */
export function UpgradeMoment({ strategyName }: { strategyName: string }) {
  const { setPlan } = usePlan();

  return (
    <div className="bg-white rounded-card-lg p-7 shadow-card">
      <div className="flex items-center gap-3 mb-5">
        <span className="font-mono text-[11px] font-semibold text-tertiary tracking-wide">
          FREE PLAN
        </span>
        <span className="text-[14.5px] font-bold text-ink-soft">{strategyName}</span>
      </div>
      <div className="flex flex-col gap-2 mb-6 max-w-[420px]">
        <div className="h-[11px] w-[92%] bg-[#F0EEEA] rounded" />
        <div className="h-[11px] w-full bg-[#F0EEEA] rounded" />
        <div className="h-[11px] w-[70%] bg-[#F0EEEA] rounded" />
      </div>
      <div className="font-bold text-xl tracking-tight mb-2.5">
        Personalised drafting is a Pro feature
      </div>
      <p className="text-[14.5px] text-secondary leading-relaxed mb-6 max-w-[480px]">
        Free includes the full strategy library with mechanism and citation for every entry, for
        up to 2 participants. Pro adds AI-personalised drafting, using your participant&apos;s own
        profile and capacity notes.
      </p>
      <div className="flex gap-[18px] items-center flex-wrap">
        <button
          type="button"
          onClick={() => setPlan('pro')}
          className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold focus-ring hover:bg-accent-hover transition-colors duration-100"
        >
          Start 14-day free trial
        </button>
        <span className="text-[12.5px] text-secondary">
          $29/mo or $290/yr &middot; no card required for trial
        </span>
      </div>
    </div>
  );
}
