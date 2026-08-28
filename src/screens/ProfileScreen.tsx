import { useState } from 'react';
import { loadProfile, saveProfile } from '../lib/participant-profile/storage';
import { isSuiteConnected, setSuiteConnected } from '../lib/participant-profile/suite-detection';
import type { ParticipantProfile } from '../lib/participant-profile/types';

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const hours = Math.round(ms / (1000 * 60 * 60));
  return hours <= 0 ? 'just now' : `${hours}h ago`;
}

export function ProfileScreen() {
  const [suiteConnected, setSuiteConnectedState] = useState(isSuiteConnected());
  const [profile, setProfile] = useState<ParticipantProfile>(() => loadProfile(suiteConnected));

  function toggleSuite() {
    const next = !suiteConnected;
    setSuiteConnected(next);
    setSuiteConnectedState(next);
    setProfile(loadProfile(next));
  }

  function updateField(field: keyof ParticipantProfile, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    saveProfile(profile);
  }

  return (
    <div className="px-5 sm:px-14 py-24 max-w-[1040px] mx-auto">
      <div className="font-mono text-[11.5px] tracking-[0.1em] text-accent font-medium mb-4">
        INTAKE VS. PROFILE
      </div>
      <h1 className="font-bold text-[clamp(26px,3.4vw,34px)] tracking-tight mb-2.5">
        Same data, two framings.
      </h1>
      <p className="text-[15px] text-secondary mb-6 max-w-[640px] leading-relaxed">
        Standalone practitioners fill this in by hand. Suite-connected practitioners see it as
        pulled data, not a form.
      </p>

      <label className="flex items-center gap-2 text-[13px] text-muted mb-10">
        <input type="checkbox" checked={suiteConnected} onChange={toggleSuite} />
        Simulate suite-connected (Frame) profile
      </label>

      {!suiteConnected ? (
        <div className="bg-white rounded-card-lg p-[26px] shadow-[0_1px_2px_rgba(24,24,27,0.03),0_4px_10px_rgba(24,24,27,0.03)] max-w-[440px]">
          <div className="font-mono text-[11px] font-semibold tracking-wide text-tertiary mb-5">
            STANDALONE &mdash; INTAKE FORM
          </div>
          <div className="flex flex-col gap-4">
            <Field label="Preferred name" value={profile.preferredName} onChange={(v) => updateField('preferredName', v)} />
            <Field
              label="Communication method"
              value={profile.communicationMethod}
              placeholder="Add communication method…"
              onChange={(v) => updateField('communicationMethod', v)}
            />
            <Field
              label="Daily routine notes"
              value={profile.dailyRoutineNotes}
              placeholder="Add routine details…"
              onChange={(v) => updateField('dailyRoutineNotes', v)}
            />
            <Field
              label="Interests"
              value={profile.interests}
              placeholder="What is this participant into?"
              onChange={(v) => updateField('interests', v)}
            />
            <Field
              label="Comfort threshold"
              value={profile.comfortThreshold}
              placeholder="How much change/novelty can they tolerate?"
              onChange={(v) => updateField('comfortThreshold', v)}
            />
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="mt-5 px-[18px] py-2.5 rounded-btn bg-ink text-white text-[13.5px] font-semibold focus-ring"
          >
            Save profile
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-card-lg p-[26px] border border-accent-tint shadow-mech max-w-[440px]">
          <div className="flex items-baseline justify-between mb-5 flex-wrap gap-2.5">
            <div className="font-mono text-[11px] font-semibold tracking-wide text-accent">
              SUITE-CONNECTED &mdash; PROFILE SUMMARY
            </div>
            <div className="font-mono text-[10.5px] font-medium text-accent">
              Pulled from {profile.source?.suite} &middot; synced {profile.source ? timeAgo(profile.source.syncedAt) : ''}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <ReadOnlyField label="Preferred name" value={profile.preferredName} />
            <ReadOnlyField label="Communication method" value={profile.communicationMethod} />
            <ReadOnlyField label="Daily routine notes" value={profile.dailyRoutineNotes} />
            <ReadOnlyField label="Interests" value={profile.interests} />
            <ReadOnlyField label="Comfort threshold" value={profile.comfortThreshold} />
          </div>
          <div className="mt-5 text-[13px] text-secondary">
            Read-only here &mdash; edit this in Frame to update everywhere.
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="text-xs text-tertiary font-semibold mb-1.5">{label}</div>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-border rounded-lg px-3 py-2.5 text-[14.5px] focus-ring"
      />
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-tertiary font-semibold mb-1.5">{label}</div>
      <div className="text-[14.5px] text-ink-soft">{value}</div>
    </div>
  );
}
