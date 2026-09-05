import type { AmbiguousCandidate, PersonaliseErrorKind } from '../ai/personalise';

const COPY: Record<
  Exclude<PersonaliseErrorKind, 'ambiguous-match'>,
  { eyebrow: string; title: string; body: string; retryLabel: string; solid: boolean }
> = {
  'no-variant-match': {
    eyebrow: 'NOT WRITTEN YET — NOT A BUG',
    title: 'No personalised variant for this strategy yet',
    body:
      "No pre-authored variant exists for this strategy yet — this is expected while content is still being written, not a technical fault. The mechanism and citation are unaffected; you can write this entry manually in the meantime.",
    retryLabel: 'Write manually',
    solid: false,
  },
  'no-suitable-match': {
    eyebrow: 'NO SUITABLE MATCH — NOT A BUG',
    title: "None of the variants fit this profile",
    body:
      "This strategy has pre-authored variants, but none of them matched anything in this participant's profile — so nothing is being suggested. The mechanism and citation are unaffected; write this entry manually.",
    retryLabel: 'Write manually',
    solid: false,
  },
  network: {
    eyebrow: 'CONNECTION ISSUE',
    title: "Couldn't reach Field",
    body:
      'Your connection dropped before the match came back. Nothing was changed or charged. Your capacity note is still here — check your connection and try again.',
    retryLabel: 'Retry',
    solid: true,
  },
  service: {
    eyebrow: 'SERVICE ISSUE, OUR SIDE',
    title: 'Something went wrong on our end',
    body:
      "The matching step didn't respond. Your capacity note and profile data are unaffected. If this keeps happening, the strategy library and citations still work — you can write the entry manually in the meantime.",
    retryLabel: 'Retry',
    solid: true,
  },
};

export function AmbiguousMatchCard({
  candidates,
  onChoose,
}: {
  candidates: AmbiguousCandidate[];
  onChoose: (candidate: AmbiguousCandidate) => void;
}) {
  return (
    <div className="bg-white rounded-card p-6 shadow-card">
      <div className="font-mono text-[10.5px] font-medium tracking-wide text-tertiary mb-3">
        TIE — YOUR CALL
      </div>
      <div className="font-bold text-base mb-2.5">{candidates.length} variants matched equally well</div>
      <p className="text-[13.5px] text-ink-soft leading-relaxed mb-[18px]">
        The library couldn&apos;t pick a clear winner, so it isn&apos;t guessing. Choose the wording that
        best fits this participant.
      </p>
      <div className="flex flex-col gap-2.5">
        {candidates.map((candidate) => (
          <button
            key={candidate.id}
            type="button"
            onClick={() => onChoose(candidate)}
            className="text-left px-3.5 py-3 rounded-lg border border-border text-[13px] text-ink-soft leading-snug focus-ring hover:border-accent hover:bg-surface transition-colors"
          >
            {candidate.draftText}
          </button>
        ))}
      </div>
    </div>
  );
}

export function PersonaliseErrorCard({
  kind,
  onRetry,
}: {
  kind: Exclude<PersonaliseErrorKind, 'ambiguous-match'>;
  onRetry: () => void;
}) {
  const copy = COPY[kind];
  return (
    <div className="bg-white rounded-card p-6 shadow-card">
      <div className="font-mono text-[10.5px] font-medium tracking-wide text-tertiary mb-3">
        {copy.eyebrow}
      </div>
      <div className="font-bold text-base mb-2.5">{copy.title}</div>
      <p className="text-[13.5px] text-ink-soft leading-relaxed mb-[18px]">{copy.body}</p>
      <button
        type="button"
        onClick={onRetry}
        className={`px-3.5 py-2 rounded-lg text-[13px] font-semibold focus-ring ${
          copy.solid
            ? 'bg-ink text-white'
            : 'bg-transparent border border-border text-ink'
        }`}
      >
        {copy.retryLabel}
      </button>
    </div>
  );
}
