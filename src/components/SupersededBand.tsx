import type { SupersededInfo } from '../lib/strategy-library/types';

/** Full-width dark band; the old figure must never appear without the new one. */
export function SupersededBand({ info }: { info: SupersededInfo }) {
  return (
    <div className="bg-ink text-white rounded-card px-[22px] py-4 flex flex-wrap items-center gap-4 mb-3.5">
      <div className="font-mono text-xs font-medium tracking-wide">
        SUPERSEDED &mdash; UPDATED GUIDANCE AVAILABLE
      </div>
      <div className="flex gap-5 ml-auto font-mono text-xs">
        <span className="opacity-50 line-through">{info.previousFigure}</span>
        <span className="font-semibold text-success">{info.updatedFigure}</span>
      </div>
    </div>
  );
}
