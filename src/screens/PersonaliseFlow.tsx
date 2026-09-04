import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getStrategyById } from '../lib/strategy-library/strategies';
import { MechanismCitationUnit } from '../components/MechanismCitationUnit';
import { UpgradeMoment } from '../components/UpgradeMoment';
import { PersonaliseErrorCard } from '../components/ErrorStates';
import { useAuth } from '../state/auth';
import { loadProfile } from '../lib/participant-profile/storage';
import { isSuiteConnected } from '../lib/participant-profile/suite-detection';
import { missingPersonalisationFields } from '../lib/participant-profile/types';
import {
  requestPersonalisedVariant,
  type PersonaliseErrorKind,
  type PersonaliseSimulation,
  PersonaliseError,
} from '../ai/personalise';
import { saveDraft, loadDraft } from '../lib/strategy-library/draft-storage';
import { ProfessionalToolDisclaimer } from '../components/ProfessionalToolDisclaimer';

const DEFAULT_CAPACITY_NOTE =
  'Support worker present most shifts; can deliver reinforcement on a timer but not track duration data reliably yet.';

type GenerateState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'revealed'; draftText: string }
  | { status: 'error'; kind: PersonaliseErrorKind };

export function PersonaliseFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const strategy = id ? getStrategyById(id) : undefined;
  const { plan } = useAuth();

  const profile = loadProfile(isSuiteConnected());
  const missingFields = missingPersonalisationFields(profile);

  const [capacityNote, setCapacityNote] = useState(DEFAULT_CAPACITY_NOTE);
  const [state, setState] = useState<GenerateState>({ status: 'idle' });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [simulate, setSimulate] = useState<PersonaliseSimulation>('success');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [responsiveAck, setResponsiveAck] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
  }, []);

  useEffect(() => {
    if (!id) return;
    const existing = loadDraft(id);
    if (existing) {
      setCapacityNote(existing.capacityNote);
      setState({ status: 'revealed', draftText: existing.draftText });
    }
  }, [id]);

  if (!strategy) {
    return (
      <div className="px-5 sm:px-14 pt-32 max-w-[1040px] mx-auto">
        <p className="text-secondary">Strategy not found.</p>
      </div>
    );
  }

  async function handleGenerate() {
    if (strategy!.responsive && !responsiveAck) return;
    if (plan === 'free') {
      setShowUpgrade(true);
      return;
    }
    setState({ status: 'loading' });
    try {
      const draftText = requestPersonalisedVariant(
        strategy!,
        profile,
        import.meta.env.DEV ? simulate : undefined,
      );
      setState({ status: 'revealed', draftText });
    } catch (err) {
      if (err instanceof PersonaliseError) {
        setState({ status: 'error', kind: err.kind });
      } else {
        setState({ status: 'error', kind: 'service' });
      }
    }
  }

  function handleSave() {
    if (strategy!.responsive && !responsiveAck) return;
    if (state.status !== 'revealed' || !id) return;
    saveDraft(id, {
      capacityNote,
      draftText: state.draftText,
      savedAt: new Date().toISOString(),
      templateId: strategy!.templateId,
      templateVersion: strategy!.version,
      participantRef: profile.id,
    });
    navigate(`/strategy/${id}/output`);
  }

  const generateLabel = state.status === 'revealed' ? 'Re-match variant' : 'Match variant';
  const revealDuration = reducedMotion ? '1ms' : '220ms';

  return (
    <div className="px-5 sm:px-14 py-24 max-w-[1040px] mx-auto">
      <div className="font-mono text-[11.5px] tracking-[0.1em] text-accent font-medium mb-4">
        PERSONALISATION FLOW
      </div>
      <h1 className="font-bold text-[clamp(26px,3.4vw,34px)] tracking-tight mb-2.5">
        A draft to review, never the final word.
      </h1>
      <p className="text-[15px] text-secondary mb-10 max-w-[600px] leading-relaxed">
        Capacity note, then an optional matched draft, then a review step that&apos;s always editable
        before saving &mdash; for <span className="font-semibold text-ink-soft">{strategy.name}</span>.
      </p>
      <ProfessionalToolDisclaimer className="mb-10 max-w-[600px]" />

      {strategy.responsive && !responsiveAck && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl px-5 py-4 mb-10 max-w-[600px] text-[13.5px] text-amber-900 leading-relaxed">
          <div className="font-mono text-[10.5px] tracking-[0.08em] font-semibold mb-1.5 text-amber-700">
            RESPONSIVE STRATEGY &mdash; ACKNOWLEDGEMENT REQUIRED
          </div>
          <p className="mb-3.5">
            {strategy.name} is a responsive strategy. It&apos;s correct only in the context of
            a specific formulation and is one of the least reliably judged categories of PBS
            content &mdash; menu-selecting it without reading the formulation carries real risk.
          </p>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={responsiveAck}
              onChange={(e) => setResponsiveAck(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              I&apos;ve reviewed this participant&apos;s formulation and escalation pattern and
              confirm this strategy is appropriate here.
            </span>
          </label>
        </div>
      )}

      <div
        className="grid gap-8 mb-12"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          opacity: strategy.responsive && !responsiveAck ? 0.4 : 1,
          pointerEvents: strategy.responsive && !responsiveAck ? 'none' : 'auto',
        }}>
        <div className="bg-white rounded-card p-[22px] shadow-card">
          <div className="font-mono text-[11px] font-semibold tracking-wide text-tertiary mb-2.5">
            STEP 1
          </div>
          <div className="font-bold text-[15px] mb-2.5">Capacity note</div>
          <p className="text-[13.5px] text-secondary leading-snug mb-3.5">
            What&apos;s realistic for this participant and setting?
          </p>
          <textarea
            value={capacityNote}
            onChange={(e) => setCapacityNote(e.target.value)}
            className="w-full min-h-[90px] text-[13.5px] text-ink-soft leading-snug bg-surface rounded-lg px-3.5 py-3 border-none focus-ring resize-y"
          />
        </div>

        <div className="bg-white rounded-card p-[22px] shadow-card">
          <div className="font-mono text-[11px] font-semibold tracking-wide text-tertiary mb-2.5">
            STEP 2
          </div>
          <div className="font-bold text-[15px] mb-2.5">Match variant</div>
          <p className="text-[13.5px] text-secondary leading-snug mb-4.5">
            Matches the participant&apos;s profile against pre-authored variants for this strategy
            and fills in the winning one — no model writes new text.
          </p>
          {missingFields.length === 0 ? (
            <>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={state.status === 'loading'}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-btn bg-accent text-white text-[13.5px] font-semibold focus-ring hover:bg-accent-hover active:scale-[0.97] transition-all duration-100 disabled:opacity-60"
              >
                {state.status === 'loading' ? 'Matching…' : generateLabel}
              </button>
              {import.meta.env.DEV && (
                <div className="mt-3 flex items-center gap-2 text-[11px] text-tertiary border border-dashed border-amber-400 rounded-lg px-2 py-1.5 bg-amber-50/50 w-fit">
                  <span className="font-mono text-[9px] font-bold tracking-wide text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    DEV
                  </span>
                  <span>Simulate:</span>
                  <select
                    value={simulate}
                    onChange={(e) => setSimulate(e.target.value as PersonaliseSimulation)}
                    className="border border-border rounded px-1.5 py-1 text-[11px] focus-ring bg-white"
                  >
                    <option value="success">Success (real matching)</option>
                    <option value="no-variant-match">No variant authored yet</option>
                    <option value="network">Network drop</option>
                    <option value="service">Service issue</option>
                  </select>
                </div>
              )}
            </>
          ) : (
            <div className="bg-surface rounded-lg p-3.5">
              <div className="font-bold text-[13.5px] text-muted mb-1">Can&apos;t match yet</div>
              <p className="text-[12.5px] text-secondary leading-snug">
                This participant&apos;s profile is missing information the draft needs:{' '}
                {missingFields.join(' and ')}.
              </p>
            </div>
          )}
        </div>
      </div>

      {showUpgrade && plan === 'free' ? (
        <div className="grid gap-7 items-start" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(240px,280px)' }}>
          <UpgradeMoment strategyName={strategy.name} />
          <MechanismCitationUnit mechanism={strategy.mechanism} citation={strategy.citationShort} unlocked />
        </div>
      ) : (
        <div className="grid gap-7 items-start" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(240px,300px)' }}>
          <div className="bg-surface rounded-card-lg p-[26px] shadow-card">
            <div className="font-bold text-[15px] mb-1.5">Review &mdash; always editable</div>
            <div className="font-mono text-[11px] font-medium text-muted mb-4">
              Draft &middot; review before saving
            </div>

            {state.status === 'error' && (
              <PersonaliseErrorCard kind={state.kind} onRetry={handleGenerate} />
            )}

            {state.status === 'revealed' && (
              <div
                style={{
                  animation: `field-reveal ${revealDuration} cubic-bezier(0.34,1.56,0.64,1)`,
                }}
              >
                <textarea
                  value={state.draftText}
                  onChange={(e) =>
                    setState({ status: 'revealed', draftText: e.target.value })
                  }
                  className="w-full min-h-[130px] border border-border rounded-[10px] p-3.5 text-[14.5px] leading-relaxed text-ink-soft resize-y bg-white focus-ring box-border"
                />
                <div className="flex gap-[14px] mt-4">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-[18px] py-2.5 rounded-btn bg-ink text-white text-[13.5px] font-semibold focus-ring"
                  >
                    Save to plan
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="px-[18px] py-2.5 rounded-btn bg-transparent border border-border text-muted text-[13.5px] font-semibold focus-ring"
                  >
                    Re-match
                  </button>
                </div>
              </div>
            )}

            {(state.status === 'idle' || state.status === 'loading') && (
              <div className="min-h-[130px] border-[1.5px] border-dashed border-[#D8D5D0] rounded-[10px] flex items-center justify-center text-tertiary text-[13.5px]">
                {state.status === 'loading' ? 'Matching…' : 'Matched wording will appear here'}
              </div>
            )}
          </div>
          <MechanismCitationUnit mechanism={strategy.mechanism} citation={strategy.citationShort} />
        </div>
      )}

      <div className="mt-8">
        <Link to={`/strategy/${strategy.id}`} className="text-accent font-semibold text-sm focus-ring">
          &larr; Back to strategy detail
        </Link>
      </div>
    </div>
  );
}
