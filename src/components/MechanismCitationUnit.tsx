export function MechanismCitationUnit({
  mechanism,
  citation,
  unlocked,
  className = '',
}: {
  mechanism: string;
  citation: string;
  /** Paywall context: shown "unlocked" even for Free users — evidence is never gated. */
  unlocked?: boolean;
  className?: string;
}) {
  const suffix = unlocked ? ' · UNLOCKED' : '';
  return (
    <div
      className={`bg-white border-[1.5px] border-accent rounded-card px-[22px] py-5 shadow-mech ${className}`}
    >
      <div className="font-mono text-[10.5px] tracking-[0.08em] text-accent font-semibold mb-2.5">
        MECHANISM{suffix}
      </div>
      <div className="text-[13px] text-ink-soft leading-relaxed mb-4">{mechanism}</div>
      <div className="font-mono text-[10.5px] tracking-[0.08em] text-accent font-semibold mb-2">
        CITATION{suffix}
      </div>
      <div className="font-mono text-[11.5px] text-ink-soft leading-snug">{citation}</div>
    </div>
  );
}
