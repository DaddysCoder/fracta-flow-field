import { useState, type ReactNode } from 'react';
import { acknowledge, isAcknowledged } from '../lib/strategy-library/intrusive-ack';

/**
 * The FIELD gating model's intrusiveness gate — wraps a strategy's
 * mechanism/citation/personalisation content when
 * `requiresIntrusiveGate(strategy)` is true (see `types.ts`). Nothing in
 * `strategies.ts` sets `intrusivenessTier: 'more-intrusive'` today, so this
 * never fires yet — it's here so a future more-intrusive strategy (escape
 * extinction, RIRD) is never shown as a default, first-line suggestion
 * without an explicit per-session confirmation.
 */
export function IntrusiveProcedureGate({
  strategyId,
  strategyName,
  children,
}: {
  strategyId: string;
  strategyName: string;
  children: ReactNode;
}) {
  const [acknowledged, setAcknowledged] = useState(() => isAcknowledged(window.sessionStorage, strategyId));

  if (acknowledged) return <>{children}</>;

  return (
    <div className="bg-white border-[1.5px] border-amber-500 rounded-card-lg p-7 shadow-card max-w-[560px]">
      <div className="font-mono text-[10.5px] font-semibold tracking-wide text-amber-700 mb-3">
        MORE INTRUSIVE PROCEDURE
      </div>
      <p className="text-[14px] text-ink-soft leading-relaxed mb-5">
        {strategyName} is a more intrusive procedure. Before viewing it, confirm that less
        intrusive options — environmental adjustment, communication, choice/support, skill-building
        or tolerance work — have genuinely been tried first, and that this is authorised in the
        participant&apos;s behaviour support plan or by a supervisor. This isn&apos;t a default,
        first-line suggestion.
      </p>
      <button
        type="button"
        onClick={() => {
          acknowledge(window.sessionStorage, strategyId);
          setAcknowledged(true);
        }}
        className="px-4 py-2.5 rounded-btn bg-ink text-white text-[13.5px] font-semibold focus-ring"
      >
        Confirm and continue
      </button>
    </div>
  );
}
