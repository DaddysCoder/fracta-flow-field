import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getStrategyById } from '../lib/strategy-library/strategies';
import { loadDraft } from '../lib/strategy-library/draft-storage';
import { assembleExportText, type ExportFormat } from '../lib/strategy-library/export';
import { MechanismCitationUnit } from '../components/MechanismCitationUnit';

export function OutputView() {
  const { id } = useParams();
  const strategy = id ? getStrategyById(id) : undefined;
  const draft = id ? loadDraft(id) : null;
  const [format, setFormat] = useState<ExportFormat>('plan');

  if (!strategy || !draft) {
    return (
      <div className="px-5 sm:px-14 pt-32 max-w-[1040px] mx-auto">
        <p className="text-secondary mb-4">
          No saved draft yet for this strategy.
        </p>
        {strategy && (
          <Link
            to={`/strategy/${strategy.id}/personalise`}
            className="text-accent font-semibold text-sm focus-ring"
          >
            Go create one &rarr;
          </Link>
        )}
      </div>
    );
  }

  const text = assembleExportText(strategy, draft.draftText, format);
  const bodyText =
    format === 'plan'
      ? draft.draftText
      : `Session log — ${new Date(draft.savedAt).toLocaleDateString()}: ${draft.draftText}`;

  return (
    <div className="px-5 sm:px-14 py-24 max-w-[1040px] mx-auto bg-surface">
      <div className="font-mono text-[11.5px] tracking-[0.1em] text-accent font-medium mb-4">
        OUTPUT VIEW
      </div>
      <h1 className="font-bold text-[clamp(26px,3.4vw,34px)] tracking-tight mb-2.5">
        Plan wording, or session-log wording.
      </h1>
      <p className="text-[15px] text-secondary mb-10 max-w-[600px] leading-relaxed">
        Mechanism and citation stay pinned alongside either way.
      </p>

      <div className="grid gap-7 items-start" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(240px,280px)' }}>
        <div className="bg-white rounded-card-lg p-7 shadow-card">
          <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
            <div className="inline-flex bg-surface rounded-lg p-1">
              <button
                type="button"
                onClick={() => setFormat('plan')}
                className={`px-3.5 py-1.5 text-[13px] font-semibold rounded-md focus-ring ${
                  format === 'plan' ? 'bg-ink text-white' : 'text-muted'
                }`}
              >
                Plan format
              </button>
              <button
                type="button"
                onClick={() => setFormat('session-log')}
                className={`px-3.5 py-1.5 text-[13px] font-semibold rounded-md focus-ring ${
                  format === 'session-log' ? 'bg-ink text-white' : 'text-muted'
                }`}
              >
                Session-log format
              </button>
            </div>
            <span className="font-mono text-[11px] font-medium text-accent">
              Generated draft &middot; edited
            </span>
          </div>
          <div className="text-base text-ink-soft leading-relaxed">{bodyText}</div>
        </div>
        <MechanismCitationUnit mechanism={strategy.mechanism} citation={strategy.citationShort} />
      </div>

      <details className="mt-6 text-sm text-secondary">
        <summary className="cursor-pointer font-semibold text-ink-soft">Full export text</summary>
        <pre className="whitespace-pre-wrap mt-3 bg-white rounded-card p-4 text-[13px] leading-relaxed">
          {text}
        </pre>
      </details>
    </div>
  );
}
