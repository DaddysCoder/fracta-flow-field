import { useState } from 'react';
import { useAuth } from '../state/auth';
import { AuthModal } from './AuthModal';

/** Triggered at the exact point a Free user clicks Generate. Evidence is never gated. */
export function UpgradeMoment({ strategyName }: { strategyName: string }) {
  const { status, checkout } = useAuth();
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStartTrial() {
    if (status !== 'signed-in') {
      setAuthModalOpen(true);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await checkout(interval);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start checkout. Try again.');
      setBusy(false);
    }
  }

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
        up to 2 participants. Pro adds personalised drafting, matched from your participant&apos;s own
        profile and capacity notes.
      </p>
      <div className="flex gap-[18px] items-center flex-wrap mb-3">
        <button
          type="button"
          onClick={() => void handleStartTrial()}
          disabled={busy}
          className="px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-semibold focus-ring hover:bg-accent-hover transition-colors duration-100 disabled:opacity-60"
        >
          {busy ? 'Starting…' : 'Start 14-day free trial'}
        </button>
        <label className="flex items-center gap-1.5 text-[12.5px] text-secondary">
          <input
            type="checkbox"
            checked={interval === 'year'}
            onChange={(e) => setInterval(e.target.checked ? 'year' : 'month')}
            className="focus-ring"
          />
          Bill yearly (save A$58)
        </label>
        <span className="text-[12.5px] text-secondary">
          {interval === 'year' ? '$290/yr' : '$29/mo'} &middot; no card required for trial
        </span>
      </div>
      {error && <p className="text-[12.5px] text-red-600">{error}</p>}
      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
    </div>
  );
}
